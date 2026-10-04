import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class VisitsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private pool?;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    registrar(visitanteId: string, pagina: string): Promise<void>;
    resumo(): Promise<{
        total: number;
        visitantesUnicos: number;
        hoje: number;
        visitantesHoje: number;
        online: number;
    }>;
}
