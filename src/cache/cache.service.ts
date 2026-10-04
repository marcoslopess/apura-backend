import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private redisOk = false;
  private mem = new Map<string, string>();

  async onModuleInit() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('REDIS_URL não definido — usando cache em memória');
      return;
    }
    try {
      this.redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 5000 });
      this.redis.on('error', (e) => {
        if (this.redisOk) this.logger.error(`Redis erro: ${e.message} — fallback memória`);
        this.redisOk = false;
      });
      this.redis.on('ready', () => (this.redisOk = true));
      await this.redis.connect();
      this.redisOk = true;
      this.logger.log('Redis conectado');
    } catch (e) {
      this.logger.warn(`Redis indisponível (${(e as Error).message}) — usando memória`);
      this.redisOk = false;
    }
  }

  async onModuleDestroy() {
    if (this.redis) this.redis.disconnect();
  }

  backend(): 'redis' | 'memory' {
    return this.redisOk ? 'redis' : 'memory';
  }

  key(scope: string, cargo: string) {
    return `apura:result:${scope.toLowerCase()}:${cargo}`;
  }

  async get<T>(key: string): Promise<T | null> {
    let raw: string | null | undefined;
    if (this.redisOk && this.redis) {
      try {
        raw = await this.redis.get(key);
      } catch {
        raw = this.mem.get(key);
      }
    } else raw = this.mem.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown): Promise<void> {
    const raw = JSON.stringify(value);
    this.mem.set(key, raw);
    if (this.redisOk && this.redis) {
      try {
        await this.redis.set(key, raw);
      } catch (e) {
        this.logger.warn(`Falha ao gravar no Redis: ${(e as Error).message}`);
      }
    }
  }
}
