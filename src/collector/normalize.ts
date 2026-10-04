import { CandidateResult, NormalizedEa20Result } from '../tse/tse.types';

const SECOES = ['ts', 'st', 'pst', 'pstn', 'snt', 'psnt', 'si', 'psi', 'psin', 'sni', 'psni', 'sa', 'psa', 'psan', 'sna', 'psna'];
const ELEITORES = ['te', 'est', 'pest', 'c', 'pc', 'a', 'pa'];
const VOTOS = ['tv', 'vvc', 'pvvc', 'vv', 'pvv', 'vnom', 'pvnom', 'van', 'pvan', 'vansj', 'pvansj', 'vb', 'pvb', 'tvn', 'ptvn', 'vn', 'pvn', 'vnt', 'vsan', 'vscv'];

function pick(src: any, keys: string[]): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  if (!src) return out;
  for (const k of keys) if (src[k] !== undefined) out[k] = src[k];
  return out;
}

const str = (v: any) => (v === undefined || v === null ? '' : String(v));
const num = (v: any) => {
  const n = parseFloat(str(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

/** Normaliza (sem alterar valores) um arquivo EA20 do TSE. */
export function normalizeEa20(d: any, fotoDir = ''): NormalizedEa20Result {
  const carg = (d.carg && d.carg[0]) || {};
  const feds: any[] = carg.fed || [];
  const candidatos: CandidateResult[] = [];
  for (const agr of carg.agr || []) {
    for (const par of agr.par || []) {
      const fed = par.nfed ? feds.find((f) => str(f.n) === str(par.nfed)) : undefined;
      for (const c of par.cand || []) {
        candidatos.push({
          numero: str(c.n),
          sequencialCandidato: str(c.sqcand),
          nome: str(c.nm),
          nomeUrna: str(c.nmu),
          partidoSigla: str(par.sg),
          partidoNome: str(par.nm),
          federacaoOuColigacaoNome: fed ? str(fed.nm) : str(agr.nm),
          federacaoOuColigacaoTipo: str(agr.tp),
          situacao: str(c.st),
          votos: num(c.vap),
          votosTexto: str(c.vap),
          percentual: c.pvapn !== undefined ? num(c.pvapn) : num(c.pvap),
          percentualTexto: str(c.pvap),
          fotoUrl: fotoDir && c.sqcand ? `${fotoDir}/${str(c.sqcand)}.jpeg` : '',
        });
      }
    }
  }
  candidatos.sort((a, b) => b.votos - a.votos);
  return {
    escopo: {
      eleicao: str(d.ele),
      turno: str(d.t),
      abrangenciaTipo: str(d.tpabr),
      abrangenciaCodigo: str(d.cdabr),
      cargoCodigo: str(carg.cd),
      cargoNome: str(carg.nmn),
    },
    atualizacao: {
      dataGeracao: str(d.dg),
      horaGeracao: str(d.hg),
      idg: str(d.idg),
      dataApuracao: str(d.dt),
      horaApuracao: str(d.ht),
    },
    secoes: pick(d.s, SECOES),
    eleitores: pick(d.e, ELEITORES),
    votos: pick(d.v, VOTOS),
    candidatos,
  };
}
