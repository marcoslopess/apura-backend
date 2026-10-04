import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CollectorService } from '../collector/collector.service';
export declare class ElectionsController {
    private readonly collector;
    constructor(collector: CollectorService);
    president(): Promise<import("../tse/tse.types").ResultEnvelope>;
    governor(uf: string): Promise<import("../tse/tse.types").ResultEnvelope>;
    senator(uf: string): Promise<import("../tse/tse.types").ResultEnvelope>;
    state(uf: string, cargo?: string): Promise<import("../tse/tse.types").ResultEnvelope>;
    municipality(codigo: string, cargo?: string): Promise<import("../tse/tse.types").ResultEnvelope>;
    municipalities(uf?: string): Promise<import("../tse/tse.types").MunicipalityLookup[]>;
    status(): {
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
    stream(scopes?: string): Observable<MessageEvent>;
}
