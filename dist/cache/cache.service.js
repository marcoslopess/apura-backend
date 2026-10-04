"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let CacheService = CacheService_1 = class CacheService {
    logger = new common_1.Logger(CacheService_1.name);
    redis = null;
    redisOk = false;
    mem = new Map();
    async onModuleInit() {
        const url = process.env.REDIS_URL;
        if (!url) {
            this.logger.warn('REDIS_URL não definido — usando cache em memória');
            return;
        }
        try {
            this.redis = new ioredis_1.default(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 5000 });
            this.redis.on('error', (e) => {
                if (this.redisOk)
                    this.logger.error(`Redis erro: ${e.message} — fallback memória`);
                this.redisOk = false;
            });
            this.redis.on('ready', () => (this.redisOk = true));
            await this.redis.connect();
            this.redisOk = true;
            this.logger.log('Redis conectado');
        }
        catch (e) {
            this.logger.warn(`Redis indisponível (${e.message}) — usando memória`);
            this.redisOk = false;
        }
    }
    async onModuleDestroy() {
        if (this.redis)
            this.redis.disconnect();
    }
    backend() {
        return this.redisOk ? 'redis' : 'memory';
    }
    key(scope, cargo) {
        return `apura:result:${scope.toLowerCase()}:${cargo}`;
    }
    async get(key) {
        let raw;
        if (this.redisOk && this.redis) {
            try {
                raw = await this.redis.get(key);
            }
            catch {
                raw = this.mem.get(key);
            }
        }
        else
            raw = this.mem.get(key);
        return raw ? JSON.parse(raw) : null;
    }
    async set(key, value) {
        const raw = JSON.stringify(value);
        this.mem.set(key, raw);
        if (this.redisOk && this.redis) {
            try {
                await this.redis.set(key, raw);
            }
            catch (e) {
                this.logger.warn(`Falha ao gravar no Redis: ${e.message}`);
            }
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map