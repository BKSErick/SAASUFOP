/* =========================================================
   Domain types — PPGCC UFOP
   Modelos consumidos pela UI (redesign). Mais ricos que o
   schema atual do Supabase; ver src/lib/data/README sobre
   a estratégia de religamento (mock → Supabase).
   ========================================================= */

export type Nivel = "Mestrado" | "Doutorado";

export type StatusAluno =
  | "Cursando"
  | "Qualificado"
  | "Defesa marcada"
  | "Aguard. documentação";

export type CapesRating = "1A" | "1B" | "2";

export type Qualis = "A1" | "A2" | "B1" | "B2";

export type TipoBanca = "Defesa" | "Qualificação";

export interface Docente {
  id: string;
  nome: string;
  titulo: string; // "" quando sem fonte (Lattes pendente)
  linha: number; // índice em LINHAS; -1 = sem linha de pesquisa registrada
  orientandos: number;
  h: number; // h-index (0 quando sem fonte Lattes)
  capes: CapesRating | ""; // "" quando sem fonte
  lattes: string; // data ISO da última atualização Lattes ("" quando sem fonte)
  producao: number; // contagem de produções (0 quando sem fonte)
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  nivel: Nivel;
  ingresso: string; // ISO date
  prazo_jubilamento: string; // ISO date
  status_bolsa: string; // CAPES | CNPq | FAPEMIG | PROPP | Nenhuma
  status: StatusAluno;
  orientador: string;
  orientador_id: string;
  linha: number;
  producoes: number;
  creditos: number;
  avatar_hue: number;
}

export interface Producao {
  id: string;
  titulo: string;
  venue: string;
  qualis: Qualis;
  ano: number;
  autores: string[];
}

export interface Banca {
  id: string;
  aluno: string;
  tipo: TipoBanca;
  titulo: string;
  data: string; // ISO datetime
  presidente: string;
  local: string;
}

export interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  creditos: number;
  professor: string;
  periodo: string;
  matriculados: number;
}

export interface ProdSeriesPoint {
  m: string; // mês rótulo
  a1: number;
  a2: number;
  b: number;
}
