import { VisitsService } from './visits.service';
export declare class VisitsController {
    private readonly visits;
    constructor(visits: VisitsService);
    registrar(body: {
        visitanteId?: string;
        pagina?: string;
    }): Promise<{
        total: number;
        visitantesUnicos: number;
        hoje: number;
        visitantesHoje: number;
        online: number;
    }>;
    resumo(): Promise<{
        total: number;
        visitantesUnicos: number;
        hoje: number;
        visitantesHoje: number;
        online: number;
    }>;
}
