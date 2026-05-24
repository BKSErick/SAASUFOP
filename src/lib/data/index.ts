/* =========================================================
   Data access layer — PPGCC UFOP
   ÚNICO ponto de acoplamento com a fonte de dados.

   Religado ao Supabase (projeto sunxvcbdelmtvmgnkrti) via
   createSupabaseServer() → RLS aplicada com o usuário autenticado.
   Estes getters SÓ rodam server-side (cookies()/server-only).

   Mapping DB ↔ domain.ts documentado na story UFOP-MIG-001
   (Data Engineer Record).
   ========================================================= */

import { createSupabaseServer } from "@/lib/supabase-server";
import { PROD_SERIES, LINHAS as LINHAS_MOCK, HOJE } from "@/lib/data/mock";
import type {
  Aluno,
  Banca,
  CapesRating,
  Disciplina,
  Docente,
  Nivel,
  Producao,
  ProdSeriesPoint,
  Qualis,
  StatusAluno,
  TipoBanca,
} from "@/types/domain";

// LINHAS: labels de referência (linhas_pesquisa.id 0-4 espelha este índice).
export const LINHAS = LINHAS_MOCK;
export { HOJE, mesesEntre } from "@/lib/data/mock";

// ----- Row types (DB shapes) -----
interface ProfRow {
  id: string;
  nome: string;
  titulo: string | null;
  linha_pesquisa_id: number | null;
  orientandos_count: number;
  kpi_h: number;
  capes_rating: string | null;
  producao_count: number;
  lattes_updated_at: string | null;
}

interface AlunoRow {
  id: string;
  nome: string;
  matricula: string;
  nivel: string | null;
  data_ingresso: string | null;
  prazo_jubilamento: string | null;
  status_bolsa: string | null;
  status: string | null;
  professor_orientador_id: string | null;
  linha_pesquisa_id: number | null;
  producoes_count: number;
  creditos: number;
  avatar_hue: number | null;
  professores: { nome: string } | null;
}

interface ProducaoRow {
  id: string;
  titulo: string;
  journal: string | null;
  qualis: string | null;
  data_publicacao: string | null;
  professores: { nome: string } | null;
}

interface BancaRow {
  id: string;
  titulo_trabalho: string;
  tipo: string | null;
  data_hora: string | null;
  local: string | null;
  alunos: { nome: string; professores: { nome: string } | null } | null;
}

interface DisciplinaRow {
  id: string;
  codigo: string;
  nome: string;
  creditos: number;
  periodo: string | null;
  matriculados: number;
  professores: { nome: string } | null;
}

// ----- Mappers DB → domain -----
function mapDocente(r: ProfRow): Docente {
  return {
    id: r.id,
    nome: r.nome,
    titulo: r.titulo ?? "",
    linha: r.linha_pesquisa_id ?? -1, // -1 = sem linha registrada
    orientandos: r.orientandos_count,
    h: r.kpi_h,
    capes: (r.capes_rating ?? "") as CapesRating | "", // "" = sem fonte
    lattes: r.lattes_updated_at ?? "",
    producao: r.producao_count,
  };
}

function mapAluno(r: AlunoRow): Aluno {
  return {
    id: r.id,
    nome: r.nome,
    matricula: r.matricula,
    nivel: (r.nivel ?? "Mestrado") as Nivel,
    ingresso: r.data_ingresso ?? "",
    prazo_jubilamento: r.prazo_jubilamento ?? "",
    status_bolsa: r.status_bolsa ?? "Nenhuma",
    status: (r.status ?? "Cursando") as StatusAluno,
    orientador: r.professores?.nome ?? "—",
    orientador_id: r.professor_orientador_id ?? "",
    linha: r.linha_pesquisa_id ?? -1, // -1 = sem linha registrada
    producoes: r.producoes_count,
    creditos: r.creditos,
    avatar_hue: r.avatar_hue ?? 0,
  };
}

function mapProducao(r: ProducaoRow): Producao {
  return {
    id: r.id,
    titulo: r.titulo,
    venue: r.journal ?? "",
    qualis: (r.qualis ?? "B1") as Qualis,
    ano: r.data_publicacao ? new Date(r.data_publicacao).getFullYear() : 0,
    autores: r.professores?.nome ? [r.professores.nome] : [],
  };
}

function mapBanca(r: BancaRow): Banca {
  return {
    id: r.id,
    aluno: r.alunos?.nome ?? "—",
    tipo: (r.tipo ?? "Defesa") as TipoBanca,
    titulo: r.titulo_trabalho,
    data: r.data_hora ?? "",
    presidente: r.alunos?.professores?.nome ?? "—",
    local: r.local ?? "",
  };
}

function mapDisciplina(r: DisciplinaRow): Disciplina {
  return {
    id: r.id,
    codigo: r.codigo,
    nome: r.nome,
    creditos: r.creditos,
    professor: r.professores?.nome ?? "—",
    periodo: r.periodo ?? "",
    matriculados: r.matriculados,
  };
}

// ----- Coleções -----
export async function getDocentes(): Promise<Docente[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("professores")
    .select("id, nome, titulo, linha_pesquisa_id, orientandos_count, kpi_h, capes_rating, producao_count, lattes_updated_at")
    .order("nome")
    .returns<ProfRow[]>();
  if (error) throw new Error(`getDocentes failed: ${error.message}`);
  return (data ?? []).map(mapDocente);
}

const ALUNO_SELECT =
  "id, nome, matricula, nivel, data_ingresso, prazo_jubilamento, status_bolsa, status, professor_orientador_id, linha_pesquisa_id, producoes_count, creditos, avatar_hue, professores(nome)";

export async function getAlunos(): Promise<Aluno[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("alunos")
    .select(ALUNO_SELECT)
    .order("nome")
    .returns<AlunoRow[]>();
  if (error) throw new Error(`getAlunos failed: ${error.message}`);
  return (data ?? []).map(mapAluno);
}

export async function getAluno(id: string): Promise<Aluno | undefined> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("alunos")
    .select(ALUNO_SELECT)
    .eq("id", id)
    .maybeSingle()
    .returns<AlunoRow | null>();
  if (error) throw new Error(`getAluno failed: ${error.message}`);
  return data ? mapAluno(data) : undefined;
}

export async function getProducoes(): Promise<Producao[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("producoes")
    .select("id, titulo, journal, qualis, data_publicacao, professores(nome)")
    .order("data_publicacao", { ascending: false })
    .returns<ProducaoRow[]>();
  if (error) throw new Error(`getProducoes failed: ${error.message}`);
  return (data ?? []).map(mapProducao);
}

export async function getBancas(): Promise<Banca[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("bancas")
    .select("id, titulo_trabalho, tipo, data_hora, local, alunos(nome, professores(nome))")
    .order("data_hora")
    .returns<BancaRow[]>();
  if (error) throw new Error(`getBancas failed: ${error.message}`);
  return (data ?? []).map(mapBanca);
}

export async function getDisciplinas(): Promise<Disciplina[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("disciplinas")
    .select("id, codigo, nome, creditos, periodo, matriculados, professores(nome)")
    .order("codigo")
    .returns<DisciplinaRow[]>();
  if (error) throw new Error(`getDisciplinas failed: ${error.message}`);
  return (data ?? []).map(mapDisciplina);
}

/**
 * Série mensal de produção qualificada (12 meses).
 * Mantida como dado de referência: o schema não tem granularidade
 * mensal de produção; revisitar quando houver coluna de mês/agregação.
 */
export async function getProdSeries(): Promise<ProdSeriesPoint[]> {
  return PROD_SERIES;
}

// ----- KPIs derivados (dos dados reais) -----
export interface DashboardKpis {
  totalAlunos: number;
  totalBolsas: number;
  bolsasPorAgencia: Record<string, number>;
  totalA1A2: number;
  totalDocentes: number;
  proximasDefesas: number;
  bancasAgendadas: number;
  alertaPerto: Aluno[];
  alertaVencido: Aluno[];
  aguardandoDoc: Aluno[];
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [alunos, producoes, bancas, docentes] = await Promise.all([
    getAlunos(),
    getProducoes(),
    getBancas(),
    getDocentes(),
  ]);

  const seisMeses = new Date(HOJE);
  seisMeses.setMonth(seisMeses.getMonth() + 6);

  const totalBolsas = alunos.filter((a) => a.status_bolsa !== "Nenhuma").length;
  const bolsasPorAgencia = alunos.reduce<Record<string, number>>((acc, a) => {
    if (a.status_bolsa !== "Nenhuma") acc[a.status_bolsa] = (acc[a.status_bolsa] || 0) + 1;
    return acc;
  }, {});

  const alertaPerto = alunos
    .filter((a) => {
      const p = new Date(a.prazo_jubilamento);
      return p >= HOJE && p <= seisMeses;
    })
    .sort((a, b) => new Date(a.prazo_jubilamento).getTime() - new Date(b.prazo_jubilamento).getTime());

  const alertaVencido = alunos.filter((a) => new Date(a.prazo_jubilamento) < HOJE);
  const aguardandoDoc = alunos.filter((a) => a.status.toLowerCase().includes("aguard"));

  return {
    totalAlunos: alunos.length,
    totalBolsas,
    bolsasPorAgencia,
    totalA1A2: producoes.filter((p) => p.qualis === "A1" || p.qualis === "A2").length,
    totalDocentes: docentes.length,
    proximasDefesas: bancas.filter((b) => b.tipo === "Defesa" && new Date(b.data) >= HOJE && new Date(b.data) <= seisMeses).length,
    bancasAgendadas: bancas.filter((b) => new Date(b.data) >= HOJE && new Date(b.data) <= seisMeses).length,
    alertaPerto,
    alertaVencido,
    aguardandoDoc,
  };
}
