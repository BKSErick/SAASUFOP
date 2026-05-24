/* =========================================================
   Gerador de seed determinístico — PPGCC UFOP (UFOP-MIG-001)
   Reproduz src/lib/data/mock.ts e emite uma migration de seed
   idempotente. UUIDs derivados via md5('ufop-<tipo>-<mockId>')
   → FKs resolvem sem lookup e re-rodar é seguro (ON CONFLICT).

   Uso: node supabase/generate-seed.cjs
   ========================================================= */
const fs = require("fs");
const path = require("path");

// ----- Dados do mock (espelho de src/lib/data/mock.ts) -----
const LINHAS = [
  "Bancos de Dados & IA", "Engenharia de Software", "Sistemas Distribuídos",
  "Visão Computacional", "Otimização & Teoria",
];

const DOCENTES = [
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
const NIVEIS = ["Mestrado", "Mestrado", "Mestrado", "Doutorado", "Doutorado"];
const STATUS = ["Cursando", "Cursando", "Cursando", "Qualificado", "Defesa marcada", "Aguard. documentação"];

const pick = (arr, i) => arr[i % arr.length];
const rand = (seed) => ((Math.sin(seed * 9301 + 49297) * 233280) % 1 + 1) % 1;

const ALUNOS = NOMES_ALUNOS.map((nome, i) => {
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
    nome, nivel,
    matricula: "20" + ingressoY.toString().slice(-2) + String(2000 + i),
    ingresso,
    prazo_jubilamento: prazo.toISOString().slice(0, 10),
    status_bolsa: bolsa, status,
    orientador_id: orientador.id,
    linha: orientador.linha,
    producoes: Math.floor(r * 5),
    creditos: Math.floor(r * 24) + (nivel === "Mestrado" ? 12 : 24),
    avatar_hue: Math.floor(r * 360),
  };
});

const PRODUCOES = [
  { id: "p1", titulo: "Federated learning under non-IID partitions for medical imaging", venue: "IEEE TMI", qualis: "A1", ano: 2025 },
  { id: "p2", titulo: "Static analysis of concurrent Go programs with happens-before refinement", venue: "ICSE", qualis: "A1", ano: 2025 },
  { id: "p3", titulo: "Edge replication strategies for mobile-first social graphs", venue: "Middleware", qualis: "A2", ano: 2024 },
  { id: "p4", titulo: "Self-supervised retrieval for low-resource Portuguese", venue: "EMNLP", qualis: "A1", ano: 2025 },
  { id: "p5", titulo: "Sparse depth completion under specular lighting", venue: "CVPR-W", qualis: "A2", ano: 2024 },
  { id: "p6", titulo: "Convex hull approximations for street-network sketching", venue: "GeoInformatica", qualis: "B1", ano: 2024 },
  { id: "p7", titulo: "Causal reasoning with latent confounders in observational EHR", venue: "AAAI", qualis: "A1", ano: 2025 },
  { id: "p8", titulo: "Adversarial calibration for surgical phase recognition", venue: "MICCAI", qualis: "A1", ano: 2025 },
  { id: "p9", titulo: "Embedding-based code search over monorepos", venue: "FSE", qualis: "A1", ano: 2024 },
  { id: "p10", titulo: "Topology-aware sharding for blockchain consensus", venue: "OSDI", qualis: "A1", ano: 2025 },
];

const BANCAS = [
  { id: "b1", aluno: "Daniel F. Aquino", tipo: "Defesa", titulo: "Modelos de difusão para super-resolução em imagens de satélite", data: "2026-05-21T14:00", local: "ICEB-2 sala 201" },
  { id: "b2", aluno: "Mariana E. Cordeiro", tipo: "Qualificação", titulo: "Inferência causal aplicada a EHR longitudinal", data: "2026-05-23T10:00", local: "ICEB-3 sala 105" },
  { id: "b3", aluno: "Lucas V. Drumond", tipo: "Defesa", titulo: "Sharding adaptativo em consenso blockchain", data: "2026-05-28T16:00", local: "Online · Meet" },
  { id: "b4", aluno: "Helena P. Andrade", tipo: "Qualificação", titulo: "Recomendação semi-supervisionada com grafos heterogêneos", data: "2026-06-04T09:00", local: "ICEB-2 sala 309" },
  { id: "b5", aluno: "Vitor M. Ferraz", tipo: "Defesa", titulo: "Análise estática de programas Go concorrentes", data: "2026-06-11T15:30", local: "ICEB-2 sala 201" },
  { id: "b6", aluno: "Eloá Rabelo Pires", tipo: "Qualificação", titulo: "Calibração adversarial em reconhecimento cirúrgico", data: "2026-06-18T11:00", local: "ICEB-3 sala 105" },
];

const DISCIPLINAS = [
  { codigo: "PPGCC-501", nome: "Aprendizado de Máquina Estatístico", creditos: 4, professor: "Ana L. Tavares", periodo: "2026/1", matriculados: 18 },
  { codigo: "PPGCC-512", nome: "Sistemas Distribuídos Avançados", creditos: 4, professor: "Carla Mendes Reis", periodo: "2026/1", matriculados: 14 },
  { codigo: "PPGCC-528", nome: "Visão Computacional", creditos: 4, professor: "Eduarda V. Pinheiro", periodo: "2026/1", matriculados: 11 },
  { codigo: "PPGCC-540", nome: "Otimização Combinatória", creditos: 4, professor: "Felipe Aragão", periodo: "2026/1", matriculados: 9 },
  { codigo: "PPGCC-555", nome: "Engenharia de Software Empírica", creditos: 4, professor: "Bruno Sá Carvalho", periodo: "2026/1", matriculados: 12 },
  { codigo: "PPGCC-602", nome: "Tópicos Especiais — LLMs em Saúde", creditos: 4, professor: "Gabriela Nunes", periodo: "2026/1", matriculados: 16 },
];

// ----- Helpers -----
const q = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const profUuid = (mockId) => `md5('ufop-prof-${mockId}')::uuid`;
const alunoUuid = (mockId) => `md5('ufop-aluno-${mockId}')::uuid`;

const stripAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const emailFor = (nome) => {
  const parts = stripAccents(nome).toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
  return `${parts[0]}.${parts[parts.length - 1]}@ufop.br`;
};
const nomeToMockId = (nome) => (DOCENTES.find((d) => d.nome === nome) || {}).id;
const alunoNomeToId = (nome) => {
  const idx = NOMES_ALUNOS.indexOf(nome);
  return idx >= 0 ? "a" + String(idx + 1).padStart(3, "0") : null;
};

// ----- Geração SQL -----
let sql = `-- Seed determinístico — PPGCC UFOP (UFOP-MIG-001)
-- GERADO por supabase/generate-seed.cjs — NÃO editar à mão.
-- Idempotente (ON CONFLICT DO NOTHING). UUIDs via md5('ufop-<tipo>-<id>').

`;

// professores
sql += "-- ── Professores (12) ──\n";
sql += "INSERT INTO professores (id, nome, titulo, email, link_lattes, linha_pesquisa_id, kpi_h, capes_rating, orientandos_count, producao_count, lattes_updated_at) VALUES\n";
sql += DOCENTES.map((d) =>
  `  (${profUuid(d.id)}, ${q(d.nome)}, ${q(d.titulo)}, ${q(emailFor(d.nome))}, ${q("http://lattes.cnpq.br/" + d.id)}, ${d.linha}, ${d.h}, ${q(d.capes)}, ${d.orientandos}, ${d.producao}, ${q(d.lattes)})`
).join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// alunos
sql += "-- ── Alunos (50) ──\n";
sql += "INSERT INTO alunos (id, nome, matricula, email, data_ingresso, status_bolsa, status, prazo_jubilamento, professor_orientador_id, nivel, creditos, linha_pesquisa_id, producoes_count, avatar_hue) VALUES\n";
sql += ALUNOS.map((a) =>
  `  (${alunoUuid(a.id)}, ${q(a.nome)}, ${q(a.matricula)}, ${q(emailFor(a.nome))}, ${q(a.ingresso)}, ${q(a.status_bolsa)}, ${q(a.status)}, ${q(a.prazo_jubilamento)}, ${profUuid(a.orientador_id)}, ${q(a.nivel)}, ${a.creditos}, ${a.linha}, ${a.producoes}, ${a.avatar_hue})`
).join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// disciplinas
sql += "-- ── Disciplinas (6) ──\n";
sql += "INSERT INTO disciplinas (id, codigo, nome, creditos, professor_id, periodo, matriculados) VALUES\n";
sql += DISCIPLINAS.map((d) => {
  const mid = nomeToMockId(d.professor);
  return `  (md5('ufop-disc-${d.codigo}')::uuid, ${q(d.codigo)}, ${q(d.nome)}, ${d.creditos}, ${mid ? profUuid(mid) : "NULL"}, ${q(d.periodo)}, ${d.matriculados})`;
}).join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// producoes (professor_id determinístico por índice)
sql += "-- ── Produções (10) ──\n";
sql += "INSERT INTO producoes (id, professor_id, titulo, journal, qualis, data_publicacao, tipo) VALUES\n";
sql += PRODUCOES.map((p, i) => {
  const d = DOCENTES[i % DOCENTES.length];
  return `  (md5('ufop-prod-${p.id}')::uuid, ${profUuid(d.id)}, ${q(p.titulo)}, ${q(p.venue)}, ${q(p.qualis)}, ${q(p.ano + "-01-01")}, 'ARTIGO')`;
}).join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// bancas
sql += "-- ── Bancas (6) ──\n";
sql += "INSERT INTO bancas (id, aluno_id, titulo_trabalho, tipo, data_hora, local, status_publicacao_site) VALUES\n";
sql += BANCAS.map((b) => {
  const aid = alunoNomeToId(b.aluno);
  return `  (md5('ufop-banca-${b.id}')::uuid, ${aid ? alunoUuid(aid) : "NULL"}, ${q(b.titulo)}, ${q(b.tipo)}, ${q(b.data.replace("T", " "))}, ${q(b.local)}, true)`;
}).join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n";

const out = path.join(__dirname, "migrations", "20260523000001_seed_redesign_data.sql");
fs.writeFileSync(out, sql, "utf8");
console.log("Seed migration gerada:", out);
console.log(`  professores=${DOCENTES.length} alunos=${ALUNOS.length} disciplinas=${DISCIPLINAS.length} producoes=${PRODUCOES.length} bancas=${BANCAS.length}`);
