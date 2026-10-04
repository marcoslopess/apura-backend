import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject } from 'rxjs';
import { CacheService } from '../cache/cache.service';
import { MunicipalityLookup, ResultEnvelope, ResultUpdateEvent } from '../tse/tse.types';
export declare class CollectorService implements OnModuleInit, OnModuleDestroy {
    private readonly cache;
    private readonly logger;
    readonly updates$: Subject<ResultUpdateEvent>;
    private cfg;
    private timer;
    private polling;
    private bootstrapping;
    private eleDirTemplate;
    private cmDirTemplate;
    private ftDirTemplate;
    private cargoEleicao;
    private pleitos;
    private targets;
    private meta;
    private munCache;
    private st;
    onModuleInit(): void;
    onModuleDestroy(): void;
    private fetchJson;
    private recordError;
    ensureBootstrap(): Promise<void>;
    private fill;
    private bootstrap;
    private resultUrl;
    private fotoDir;
    private collect;
    pollOnce(): Promise<void>;
    private kickIfStale;
    getResult(scope: string, cargo: string): Promise<ResultEnvelope>;
    getMunicipalities(uf?: string): Promise<MunicipalityLookup[]>;
    getMunicipalityResult(codigo: string, cargo: string): Promise<ResultEnvelope>;
    getStatus(): {
        polling: boolean;
        cacheBackend: "redis" | "memory";
        config: {
            base: string;
            env: string;
            cycle: string;
            target: string;
            interval: number;
            timeout: number;
            retries: number;
        };
        pleitos: {
            cd: any;
            ciclo: any;
            dt: any;
            dtlim: any;
        }[];
        cargoEleicao: {
            [k: string]: string;
        };
        totalTargets: number;
        bootstrapped: boolean;
        lastBootstrapAt: string | null;
        lastPollStartedAt: string | null;
        lastPollFinishedAt: string | null;
        lastPollDurationMs: number;
        lastPollOk: number;
        lastPollNotFound: number;
        lastPollErrors: number;
        lastPollChanges: number;
        totalPolls: number;
        totalChanges: number;
        lastErrors: {
            at: string;
            url: string;
            error: string;
        }[];
    };
    constructor(cache: CacheService);
}
