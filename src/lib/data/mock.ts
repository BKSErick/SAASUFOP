/* =========================================================
   Mock data — PPGCC UFOP (port tipado de _prototype/data.js)
   Usado pela camada de dados enquanto o Supabase real não
   tem schema estendido + dados. Ver src/lib/data/index.ts.
   ========================================================= */

import type {
  Aluno,
  Banca,
  Disciplina,
  Docente,
  Nivel,
  Producao,
  ProdSeriesPoint,
  StatusAluno,
} from "@/types/domain";

export const LINHAS = [
  "Bancos de Dados & IA",
  "Engenharia de Software",
  "Sistemas Distribuídos",
  "Visão Computacional",
  "Otimização & Teoria",
] as const;

export const DOCENTES: Docente[] = [
  { id: "d01", nome: "Ana L. Tavares", titulo: "Profa. Dra.", linha: 0, orientandos: 6, h: 18, capes: "1A", lattes: "2025-04-12", producao: 12 },
  { id: "d02", nome: "Bruno Sá Carvalho", titulo: "Prof. Dr.", linha: 1, orientandos: 5, h: 14, capes: "1B", lattes: "2025-03-28", producao: 8 },
  { id: "d03", nome: "Carla Mendes Reis", titulo: "Profa. Dra.", linha: 2, orientandos: 4, h: 22, capes: "1A", lattes: "2025-04-30", producao: 15 },
  { id: "d04", nome: "Diego F. Oliveira", titulo: "Prof. Dr.", linha: 0, orientandos: 7, h: 11, capes: "2", lattes: "2025-02-04", producao: 6 },
  { id: "d05", nome: "Eduarda V. Pinheiro", titulo: "Profa. Dra.", linha: 3, orientandos: 3, h: 19, capes: "1B", lattes: "2025-05-02", producao: 9 },
  { id: "d06", nome: "Felipe Aragão", titulo: "Prof. Dr.", linha: 4, orientandos: 2, h: 9, capes: "2", lattes: "2024-12-18", producao: 4 },
  { id: "d07", nome: "Gabriela Nunes", titulo: "Profa. Dra.", linha: 1, orientandos: 5, h: 16, capes: "1B", lattes: "2025-04-05", producao: 10 },
  { id: "d08", nome: "Henrique L. Costa", titulo: "Prof. Dr.", linha: 2, orientandos: 6, h: 24, capes: "1A", lattes: "2025-04-22", producao: 14 },
  { id: "d09", nome: "Isabela R. Furtado", titulo: "Profa. Dra.", linha: 3, orientandos: 4, h: 13, capes: "1B", lattes: "2025-03-11", producao: 7 },
  { id: "d10", nome: "João V. Marcondes", titulo: "Prof. Dr.", linha: 0, orientandos: 5, h: 17, capes: "1A", lattes: "2025-04-18", producao: 11 },
  { id: "d11", nome: "Karina B. Saldanha", titulo: "Profa. Dra.", linha: 4, orientandos: 3, h: 12, capes: "2", lattes: "2025-01-09", producao: 5 },
  { id: "d12", nome: "Luiz Otávio Resende", titulo: "Prof. Dr.", linha: 1, orientandos: 4, h: 20, capes: "1A", lattes: "2025-04-27", producao: 13 },
];

const NOMES_ALUNOS = [
  "Amanda Soares Vilela", "Bernardo Quintas Lacerda", "Camila R. Botelho", "Daniel F. Aquino", "Eloá Rabelo Pires",
  "Fernanda Vieira Lima", "Gustavo M. Couto", "Helena P. Andrade", "Igor S. Bittencourt", "Júlia A. Nascimento",
  "Kauê T. Bessa", "Larissa D. Penna", "Mateus C. Drumond", "Natália S. Vargas", "Otávio L. Martins",
  "Paula F. Belmonte", "Quésia R. Almeida", "Rafael P. Toledo", "Sofia E. Brandão", "Thiago A. Madureira",
  "Ursula G. Lemos", "Vinícius A. Capanema", "Wesley B. Sant'Ana", "Ximena F. Resende", "Yasmin O. Carvalho",
  "Zacarias B. Lustosa", "Arthur S. Henriques", "Bianca L. Toledo", "Caio R. Magalhães", "Débora T. Versiani",
  "Estevão R. Bonfim", "Flávia M. Rosado", "Geraldo J. Cabral", "Heloísa C. Pacheco", "Ícaro V. Sampaio",
  "Joana P. Ribeiro", "Karla B. Toledo", "Lucas V. Drumond", "Mariana E. Cordeiro", "Nicolas R. Felício",
  "Olívia S. Vieira", "Pedro H. Ramalho", "Raissa B. Quaresma", "Sávio J. Domingues", "Tatiana L. Brito",
  "Vitor M. Ferraz", "Wagner H. Lustosa", "Yara C. Brandão", "Henrique T. Sá", "Beatriz F. Calixto",
];

const BOLSAS_AG = ["CAPES", "CNPq", "FAPEMIG", "PROPP"];
const NIVEIS: Nivel[] = ["Mestrado", "Mestrado", "Mestrado", "Doutorado", "Doutorado"];
const STATUS: StatusAluno[] = ["Cursando", "Cursando", "Cursando", "Qualificado", "Defesa marcada", "Aguard. documentação"];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}
function rand(seed: number): number {
  return ((Math.sin(seed * 9301 + 49297) * 233280) % 1 + 1) % 1;
}

export const ALUNOS: Aluno[] = NOMES_ALUNOS.map((nome, i) => {
  const r = rand(i + 1);
  const nivel = pick(NIVEIS, i + 3);
  const ingressoY = 2021 + (i % 4);
  const ingresso = `${ingressoY}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`;
  const limiteAnos = nivel === "Mestrado" ? 2 : 4;
  const prazo = new Date(ingressoY + limiteAnos, (i + 2) % 12, ((i + 1) % 27) + 1);
  const bolsa = r < 0.6 ? pick(BOLSAS_AG, i + 1) : "Nenhuma";
  const status = pick(STATUS, i + 5);
  const orientador = DOCENTES[i % DOCENTES.length];
  return {
    id: "a" + String(i + 1).padStart(3, "0"),
    nome,
    matricula: "20" + ingressoY.toString().slice(-2) + String(2000 + i),
    nivel,
    ingresso,
    prazo_jubilamento: prazo.toISOString().slice(0, 10),
    status_bolsa: bolsa,
    status,
    orientador: orientador.nome,
    orientador_id: orientador.id,
    linha: orientador.linha,
    producoes: Math.floor(r * 5),
    creditos: Math.floor(r * 24) + (nivel === "Mestrado" ? 12 : 24),
    avatar_hue: Math.floor(r * 360),
  };
});

export const PRODUCOES: Producao[] = [
  { id: "p1", titulo: "Federated learning under non-IID partitions for medical imaging", venue: "IEEE TMI", qualis: "A1", ano: 2025, autores: ["Tavares A.L.", "Marcondes J.V."] },
  { id: "p2", titulo: "Static analysis of concurrent Go programs with happens-before refinement", venue: "ICSE", qualis: "A1", ano: 2025, autores: ["Sá Carvalho B.", "Nunes G."] },
  { id: "p3", titulo: "Edge replication strategies for mobile-first social graphs", venue: "Middleware", qualis: "A2", ano: 2024, autores: ["Mendes Reis C.", "Costa H.L."] },
  { id: "p4", titulo: "Self-supervised retrieval for low-resource Portuguese", venue: "EMNLP", qualis: "A1", ano: 2025, autores: ["Oliveira D.F."] },
  { id: "p5", titulo: "Sparse depth completion under specular lighting", venue: "CVPR-W", qualis: "A2", ano: 2024, autores: ["Pinheiro E.V.", "Furtado I.R."] },
  { id: "p6", titulo: "Convex hull approximations for street-network sketching", venue: "GeoInformatica", qualis: "B1", ano: 2024, autores: ["Aragão F."] },
  { id: "p7", titulo: "Causal reasoning with latent confounders in observational EHR", venue: "AAAI", qualis: "A1", ano: 2025, autores: ["Nunes G.", "Sá Carvalho B."] },
  { id: "p8", titulo: "Adversarial calibration for surgical phase recognition", venue: "MICCAI", qualis: "A1", ano: 2025, autores: ["Costa H.L."] },
  { id: "p9", titulo: "Embedding-based code search over monorepos", venue: "FSE", qualis: "A1", ano: 2024, autores: ["Marcondes J.V."] },
  { id: "p10", titulo: "Topology-aware sharding for blockchain consensus", venue: "OSDI", qualis: "A1", ano: 2025, autores: ["Resende L.O."] },
];

export const BANCAS: Banca[] = [
  { id: "b1", aluno: "Daniel F. Aquino", tipo: "Defesa", titulo: "Modelos de difusão para super-resolução em imagens de satélite", data: "2026-05-21T14:00", presidente: "Ana L. Tavares", local: "ICEB-2 sala 201" },
  { id: "b2", aluno: "Mariana E. Cordeiro", tipo: "Qualificação", titulo: "Inferência causal aplicada a EHR longitudinal", data: "2026-05-23T10:00", presidente: "Gabriela Nunes", local: "ICEB-3 sala 105" },
  { id: "b3", aluno: "Lucas V. Drumond", tipo: "Defesa", titulo: "Sharding adaptativo em consenso blockchain", data: "2026-05-28T16:00", presidente: "Luiz Otávio Resende", local: "Online · Meet" },
  { id: "b4", aluno: "Helena P. Andrade", tipo: "Qualificação", titulo: "Recomendação semi-supervisionada com grafos heterogêneos", data: "2026-06-04T09:00", presidente: "Carla Mendes Reis", local: "ICEB-2 sala 309" },
  { id: "b5", aluno: "Vitor M. Ferraz", tipo: "Defesa", titulo: "Análise estática de programas Go concorrentes", data: "2026-06-11T15:30", presidente: "Bruno Sá Carvalho", local: "ICEB-2 sala 201" },
  { id: "b6", aluno: "Eloá Rabelo Pires", tipo: "Qualificação", titulo: "Calibração adversarial em reconhecimento cirúrgico", data: "2026-06-18T11:00", presidente: "Henrique L. Costa", local: "ICEB-3 sala 105" },
];

export const DISCIPLINAS: Disciplina[] = [
  { id: "dc1", codigo: "PPGCC-501", nome: "Aprendizado de Máquina Estatístico", creditos: 4, professor: "Ana L. Tavares", periodo: "2026/1", matriculados: 18 },
  { id: "dc2", codigo: "PPGCC-512", nome: "Sistemas Distribuídos Avançados", creditos: 4, professor: "Carla Mendes Reis", periodo: "2026/1", matriculados: 14 },
  { id: "dc3", codigo: "PPGCC-528", nome: "Visão Computacional", creditos: 4, professor: "Eduarda V. Pinheiro", periodo: "2026/1", matriculados: 11 },
  { id: "dc4", codigo: "PPGCC-540", nome: "Otimização Combinatória", creditos: 4, professor: "Felipe Aragão", periodo: "2026/1", matriculados: 9 },
  { id: "dc5", codigo: "PPGCC-555", nome: "Engenharia de Software Empírica", creditos: 4, professor: "Bruno Sá Carvalho", periodo: "2026/1", matriculados: 12 },
  { id: "dc6", codigo: "PPGCC-602", nome: "Tópicos Especiais — LLMs em Saúde", creditos: 4, professor: "Gabriela Nunes", periodo: "2026/1", matriculados: 16 },
];

export const PROD_SERIES: ProdSeriesPoint[] = [
  { m: "Jun/25", a1: 2, a2: 3, b: 1 },
  { m: "Jul/25", a1: 3, a2: 2, b: 2 },
  { m: "Ago/25", a1: 1, a2: 4, b: 1 },
  { m: "Set/25", a1: 4, a2: 3, b: 2 },
  { m: "Out/25", a1: 2, a2: 2, b: 3 },
  { m: "Nov/25", a1: 5, a2: 3, b: 1 },
  { m: "Dez/25", a1: 3, a2: 4, b: 2 },
  { m: "Jan/26", a1: 2, a2: 1, b: 1 },
  { m: "Fev/26", a1: 4, a2: 3, b: 2 },
  { m: "Mar/26", a1: 5, a2: 4, b: 1 },
  { m: "Abr/26", a1: 6, a2: 3, b: 2 },
  { m: "Mai/26", a1: 4, a2: 2, b: 1 },
];

/**
 * Label da linha de pesquisa. Retorna "—" quando linha = -1 (sem fonte real)
 * ou índice fora do range. As linhas reais do PPGEP virão de fonte futura.
 */
export function linhaLabel(linha: number): string {
  return linha >= 0 && linha < LINHAS.length ? LINHAS[linha] : "—";
}

/** Data de referência usada pelos cálculos de prazo/jubilamento. */
export const HOJE = new Date("2026-05-14");

export function mesesEntre(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
