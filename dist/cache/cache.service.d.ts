import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class CacheService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private redis;
    private redisOk;
    private mem;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    backend(): 'redis' | 'memory';
    key(scope: string, cargo: string): string;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
}
