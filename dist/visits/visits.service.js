"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VisitsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const promise_1 = require("mysql2/promise");
let VisitsService = VisitsService_1 = class VisitsService {
    logger = new common_1.Logger(VisitsService_1.name);
    pool;
    async onModuleInit() {
        const url = process.env.DATABASE_URL;
        if (!url)
            return this.logger.warn('DATABASE_URL ausente: contador de acessos desativado');
        this.pool = (0, promise_1.createPool)({ uri: url, connectionLimit: 5 });
        await this.pool.query(`CREATE TABLE IF NOT EXISTS acessos (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      visitante_id VARCHAR(64) NOT NULL,
      pagina VARCHAR(255) NOT NULL DEFAULT '/',
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_criado (criado_em), INDEX idx_visitante (visitante_id)
    )`);
        this.logger.log('Contador de acessos pronto (tabela acessos)');
    }
    async onModuleDestroy() {
        await this.pool?.end();
    }
    async registrar(visitanteId, pagina) {
        if (!this.pool)
            return;
        await this.pool.execute('INSERT INTO acessos (visitante_id, pagina) VALUES (?, ?)', [
            visitanteId.slice(0, 64),
            (pagina || '/').slice(0, 255),
        ]);
    }
    async resumo() {
        if (!this.pool)
            return { total: 0, visitantesUnicos: 0, hoje: 0, visitantesHoje: 0, online: 0 };
        const [r] = await this.pool.query(`SELECT
      COUNT(*) total,
      COUNT(DISTINCT visitante_id) visitantesUnicos,
      SUM(criado_em >= CURDATE()) hoje,
      COUNT(DISTINCT CASE WHEN criado_em >= CURDATE() THEN visitante_id END) visitantesHoje,
      COUNT(DISTINCT CASE WHEN criado_em >= NOW() - INTERVAL 5 MINUTE THEN visitante_id END) online
      FROM acessos`);
        const x = r[0];
        return {
            total: Number(x.total),
            visitantesUnicos: Number(x.visitantesUnicos),
            hoje: Number(x.hoje || 0),
            visitantesHoje: Number(x.visitantesHoje),
            online: Number(x.online),
        };
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = VisitsService_1 = __decorate([
    (0, common_1.Injectable)()
], VisitsService);
//# sourceMappingURL=visits.service.js.map