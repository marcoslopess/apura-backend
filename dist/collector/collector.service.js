"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CollectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const cache_service_1 = require("../cache/cache.service");
const tse_types_1 = require("../tse/tse.types");
const normalize_1 = require("./normalize");
const parseBr = (s) => {
    const [d, m, y] = (s || '').split('/');
    return y ? `${y}-${m}-${d}` : '';
};
let CollectorService = CollectorService_1 = class CollectorService {
    cache;
    logger = new common_1.Logger(CollectorService_1.name);
    updates$ = new rxjs_1.Subject();
    cfg = {
        base: process.env.TSE_BASE_URL || 'https://resultados-sim.tse.jus.br/simulado',
        env: process.env.TSE_ENV || 'simulado2026',
        cycle: process.env.TSE_CYCLE || 'ele2026',
        target: process.env.TSE_TARGET_DATE || '2026-10-04',
        interval: Number(process.env.TSE_POLL_INTERVAL_MS || 30000),
        timeout: Number(process.env.TSE_REQUEST_TIMEOUT_MS || 10000),
        retries: Number(process.env.TSE_MAX_RETRIES || 3),
    };
    timer = null;
    polling = false;
    bootstrapping = null;
    eleDirTemplate = '';
    cmDirTemplate = '';
    ftDirTemplate = '';
    cargoEleicao = new Map();
    pleitos = [];
    targets = [];
    meta = new Map();
    munCache = new Map();
    st = {
        bootstrapped: false,
        lastBootstrapAt: null,
        lastPollStartedAt: null,
        lastPollFinishedAt: null,
        lastPollDurationMs: 0,
        lastPollOk: 0,
        lastPollNotFound: 0,
        lastPollErrors: 0,
        lastPollChanges: 0,
        totalPolls: 0,
        totalChanges: 0,
        lastErrors: [],
    };
    onModuleInit() {
        if (process.env.COLLECTOR_DISABLED === 'true')
            return;
        void this.ensureBootstrap().then(() => this.pollOnce());
        this.timer = setInterval(() => void this.pollOnce(), this.cfg.interval);
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    async fetchJson(url, etag) {
        let lastErr = null;
        for (let attempt = 0; attempt <= this.cfg.retries; attempt++) {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), this.cfg.timeout);
            try {
                const headers = { Accept: 'application/json' };
                if (etag)
                    headers['If-None-Match'] = etag;
                const res = await fetch(url, { headers, signal: ctrl.signal });
                if (res.status === 304)
                    return { status: 304 };
                if (res.status === 404 || res.status === 403)
                    return { status: res.status };
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const body = await res.json();
                return {
                    status: res.status,
                    body,
                    etag: res.headers.get('etag') || undefined,
                    lastModified: res.headers.get('last-modified') || undefined,
                };
            }
            catch (e) {
                lastErr = e;
                if (attempt < this.cfg.retries)
                    await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
            }
            finally {
                clearTimeout(t);
            }
        }
        throw lastErr ?? new Error('falha desconhecida');
    }
    recordError(url, error) {
        this.st.lastErrors.unshift({ at: new Date().toISOString(), url, error });
        this.st.lastErrors = this.st.lastErrors.slice(0, 20);
    }
    ensureBootstrap() {
        if (this.st.bootstrapped)
            return Promise.resolve();
        if (!this.bootstrapping) {
            this.bootstrapping = this.bootstrap().finally(() => (this.bootstrapping = null));
        }
        return this.bootstrapping;
    }
    fill(tpl, vars) {
        return Object.entries(vars).reduce((s, [k, v]) => s.split(`<${k}>`).join(v), tpl);
    }
    async bootstrap() {
        const url = `${this.cfg.base}/${this.cfg.env}/comum/config/ele-c.json`;
        try {
            this.logger.log(`Bootstrap: baixando ${url}`);
            const r = await this.fetchJson(url);
            if (!r.body)
                throw new Error(`ele-c.json HTTP ${r.status}`);
            const arq = r.body.arq || [];
            this.eleDirTemplate = arq.find((a) => a.tp === 'u')?.dir || '';
            this.cmDirTemplate = arq.find((a) => a.tp === 'cm')?.dir || '';
            this.ftDirTemplate = arq.find((a) => a.tp === 'ft')?.dir || '';
            if (!this.eleDirTemplate)
                throw new Error('template de diretório "u" ausente no ele-c.json');
            this.pleitos = (r.body.pl || []).filter((p) => {
                if (p.c !== this.cfg.cycle)
                    return false;
                const ini = parseBr(p.dt);
                const fim = parseBr(p.dtlim) || ini;
                return ini <= this.cfg.target && this.cfg.target <= fim;
            });
            this.cargoEleicao.clear();
            for (const p of this.pleitos) {
                for (const e of p.e || []) {
                    if (String(e.t) !== '1')
                        continue;
                    for (const abr of e.abr || []) {
                        for (const cp of abr.cp || []) {
                            const cd = String(cp.cd);
                            if (tse_types_1.CARGOS.includes(cd) && !this.cargoEleicao.has(cd))
                                this.cargoEleicao.set(cd, String(e.cd));
                        }
                    }
                }
            }
            this.targets = [];
            const add = (scope, cargo) => {
                const u = this.resultUrl(scope, cargo);
                if (u)
                    this.targets.push({ scope, cargo, url: u });
            };
            add('br', '1');
            for (const uf of tse_types_1.UFS) {
                add(uf, '3');
                add(uf, '5');
                add(uf, '6');
                add(uf, uf === 'df' ? '8' : '7');
            }
            this.st.bootstrapped = true;
            this.st.lastBootstrapAt = new Date().toISOString();
            this.logger.log(`Bootstrap OK: ${this.pleitos.length} pleito(s), cargos→eleição ${JSON.stringify(Object.fromEntries(this.cargoEleicao))}, ${this.targets.length} arquivos`);
        }
        catch (e) {
            this.logger.error(`Bootstrap falhou: ${e.message}`);
            this.recordError(url, e.message);
        }
    }
    resultUrl(scope, cargo) {
        const ele = this.cargoEleicao.get(cargo);
        if (!ele || !this.eleDirTemplate)
            return null;
        const uf = scope.slice(0, 2);
        const dir = this.fill(this.eleDirTemplate, {
            base: this.cfg.base,
            ambiente: this.cfg.env,
            ciclo: this.cfg.cycle,
            cd_eleicao: ele,
            uf,
        });
        return `${dir}/${scope}-c${cargo.padStart(4, '0')}-e${ele.padStart(6, '0')}-u.json`;
    }
    fotoDir(scope, cargo) {
        const ele = this.cargoEleicao.get(cargo);
        if (!ele || !this.ftDirTemplate)
            return '';
        return this.fill(this.ftDirTemplate, {
            base: this.cfg.base,
            ambiente: this.cfg.env,
            ciclo: this.cfg.cycle,
            cd_eleicao: ele,
            uf: cargo === '1' ? 'br' : scope.slice(0, 2),
        });
    }
    async collect(t) {
        const key = `${t.scope}:${t.cargo}`;
        const prev = this.meta.get(key);
        const r = await this.fetchJson(t.url, prev?.etag);
        if (r.status === 304)
            return 'same';
        if (!r.body)
            return 'notfound';
        const idg = r.body.idg !== undefined ? String(r.body.idg) : undefined;
        this.meta.set(key, { idg, etag: r.etag });
        if (prev?.idg && prev.idg === idg)
            return 'same';
        const env = {
            sourceUrl: t.url,
            fetchedAt: new Date().toISOString(),
            idg,
            etag: r.etag,
            lastModified: r.lastModified,
            payload: (0, normalize_1.normalizeEa20)(r.body, this.fotoDir(t.scope, t.cargo)),
        };
        await this.cache.set(this.cache.key(t.scope, t.cargo), env);
        this.updates$.next({ scope: t.scope, cargo: t.cargo, data: env });
        return 'changed';
    }
    async pollOnce() {
        await this.ensureBootstrap();
        if (this.polling || !this.st.bootstrapped)
            return;
        this.polling = true;
        const start = Date.now();
        this.st.lastPollStartedAt = new Date().toISOString();
        let ok = 0, nf = 0, err = 0, ch = 0;
        try {
            const queue = [...this.targets];
            const worker = async () => {
                while (queue.length) {
                    const t = queue.shift();
                    try {
                        const r = await this.collect(t);
                        if (r === 'notfound')
                            nf++;
                        else
                            ok++;
                        if (r === 'changed')
                            ch++;
                    }
                    catch (e) {
                        err++;
                        this.recordError(t.url, e.message);
                    }
                }
            };
            await Promise.all(Array.from({ length: 8 }, worker));
        }
        finally {
            this.polling = false;
            Object.assign(this.st, {
                lastPollFinishedAt: new Date().toISOString(),
                lastPollDurationMs: Date.now() - start,
                lastPollOk: ok,
                lastPollNotFound: nf,
                lastPollErrors: err,
                lastPollChanges: ch,
            });
            this.st.totalPolls++;
            this.st.totalChanges += ch;
            this.logger.log(`Polling: ${ok} ok, ${ch} alterados, ${nf} não encontrados, ${err} erros (${Date.now() - start}ms)`);
        }
    }
    kickIfStale() {
        const last = this.st.lastPollFinishedAt ? Date.parse(this.st.lastPollFinishedAt) : 0;
        if (Date.now() - last > this.cfg.interval * 2)
            void this.pollOnce();
    }
    async getResult(scope, cargo) {
        scope = scope.toLowerCase();
        cargo = String(cargo);
        if (!tse_types_1.CARGOS.includes(cargo))
            throw new common_1.NotFoundException(`Cargo inválido: ${cargo}. Use ${tse_types_1.CARGOS.join(', ')}`);
        this.kickIfStale();
        const cached = await this.cache.get(this.cache.key(scope, cargo));
        if (cached)
            return cached;
        await this.ensureBootstrap();
        if (!this.st.bootstrapped)
            throw new common_1.ServiceUnavailableException('Coletor ainda não inicializado (ele-c.json indisponível)');
        const url = this.resultUrl(scope, cargo);
        if (!url)
            throw new common_1.NotFoundException(`Cargo ${cargo} não encontrado nos pleitos configurados`);
        try {
            const r = await this.collect({ scope, cargo, url });
            if (r === 'notfound')
                throw new common_1.NotFoundException(`Arquivo de resultado não disponível no TSE: ${url}`);
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException)
                throw e;
            throw new common_1.ServiceUnavailableException(`Falha ao consultar TSE: ${e.message}`);
        }
        const fresh = await this.cache.get(this.cache.key(scope, cargo));
        if (!fresh)
            throw new common_1.NotFoundException('Resultado indisponível');
        return fresh;
    }
    async getMunicipalities(uf) {
        await this.ensureBootstrap();
        const ele = this.cargoEleicao.get('3') || this.cargoEleicao.get('1');
        if (!ele || !this.cmDirTemplate)
            throw new common_1.ServiceUnavailableException('Coletor ainda não inicializado');
        if (!this.munCache.has(ele)) {
            const dir = this.fill(this.cmDirTemplate, { base: this.cfg.base, ambiente: this.cfg.env, ciclo: this.cfg.cycle, cd_eleicao: ele });
            const url = `${dir}/mun-e${ele.padStart(6, '0')}-cm.json`;
            const r = await this.fetchJson(url);
            if (!r.body)
                throw new common_1.ServiceUnavailableException(`Lista de municípios indisponível (HTTP ${r.status})`);
            const list = [];
            for (const a of r.body.abr || []) {
                for (const m of a.mu || []) {
                    list.push({ codigo: String(m.cd), codigoIbge: String(m.cdi ?? ''), nome: String(m.nm), uf: String(a.cd).toUpperCase(), capital: m.c === 's', zonas: m.z || [] });
                }
            }
            this.munCache.set(ele, list);
        }
        const all = this.munCache.get(ele);
        return uf ? all.filter((m) => m.uf === uf.toUpperCase()) : all;
    }
    async getMunicipalityResult(codigo, cargo) {
        const mun = (await this.getMunicipalities()).find((m) => m.codigo === codigo || m.codigoIbge === codigo);
        if (!mun)
            throw new common_1.NotFoundException(`Município ${codigo} não encontrado`);
        if (cargo === '7' && mun.uf === 'DF')
            cargo = '8';
        return this.getResult(`${mun.uf.toLowerCase()}${mun.codigo}`, cargo);
    }
    getStatus() {
        return {
            ...this.st,
            polling: this.polling,
            cacheBackend: this.cache.backend(),
            config: { ...this.cfg },
            pleitos: this.pleitos.map((p) => ({ cd: p.cd, ciclo: p.c, dt: p.dt, dtlim: p.dtlim })),
            cargoEleicao: Object.fromEntries(this.cargoEleicao),
            totalTargets: this.targets.length,
        };
    }
    constructor(cache) {
        this.cache = cache;
    }
};
exports.CollectorService = CollectorService;
exports.CollectorService = CollectorService = CollectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], CollectorService);
//# sourceMappingURL=collector.service.js.map