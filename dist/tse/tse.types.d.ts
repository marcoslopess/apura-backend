export interface CacheEnvelope<T> {
    sourceUrl: string;
    fetchedAt: string;
    idg?: string;
    etag?: string;
    lastModified?: string;
    payload: T;
}
export interface CandidateResult {
    numero: string;
    sequencialCandidato: string;
    nome: string;
    nomeUrna: string;
    partidoSigla: string;
    partidoNome: string;
    federacaoOuColigacaoNome: string;
    federacaoOuColigacaoTipo: string;
    situacao: string;
    votos: number;
    votosTexto: string;
    percentual: number;
    percentualTexto: string;
    fotoUrl: string;
}
export interface NormalizedEa20Result {
    escopo: {
        eleicao: string;
        turno: string;
        abrangenciaTipo: string;
        abrangenciaCodigo: string;
        cargoCodigo: string;
        cargoNome: string;
    };
    atualizacao: {
        dataGeracao: string;
        horaGeracao: string;
        idg: string;
        dataApuracao: string;
        horaApuracao: string;
    };
    secoes: Record<string, number | string>;
    eleitores: Record<string, number | string>;
    votos: Record<string, number | string>;
    candidatos: CandidateResult[];
}
export type ResultEnvelope = CacheEnvelope<NormalizedEa20Result>;
export interface ResultUpdateEvent {
    scope: string;
    cargo: string;
    data: ResultEnvelope;
}
export interface MunicipalityLookup {
    codigo: string;
    codigoIbge: string;
    nome: string;
    uf: string;
    capital: boolean;
    zonas: string[];
}
export declare const UFS: string[];
export declare const CARGOS: string[];
