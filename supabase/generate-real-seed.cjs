/* =========================================================
   Gerador de SEED REAL — PPGEP Engenharia de Produção UFOP
   (UFOP-MIG-001). Lê aluno_regular-2.xls e emite uma migration
   que LIMPA o mock e insere os dados reais (89 alunos + N
   orientadores). UUID determinístico (md5 em JS) → idempotente.

   Uso: node supabase/generate-real-seed.cjs
   ========================================================= */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const XLSX = require("xlsx");

const XLS = "D:/001Gravity/aios-core/aluno_regular-2.xls";

// ----- Helpers -----
const uuidFrom = (s) => {
  const h = crypto.createHash("md5").update(s).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const q = (s) => (s == null || s === "" ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const norm = (s) => String(s).trim().replace(/\s+/g, " ").toUpperCase();

// Parse data BR (DD/MM/YYYY) ou serial Excel → ISO YYYY-MM-DD
function toISO(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const m = String(v).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}
function addMonthsISO(iso, months) {
  if (!iso) return null;
  const [y, mo, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1 + months, d));
  return dt.toISOString().slice(0, 10);
}
function mapBolsa(desc) {
  const s = norm(desc || "");
  if (!s) return "Nenhuma";
  if (/FAPEMIG|AMPARO.*PESQUISA.*MG|AMPARO.*MG/.test(s)) return "FAPEMIG";
  if (/CAPES|APERFEICOAMENTO/.test(s)) return "CAPES";
  if (/CNPQ|CONSELHO NACIONAL/.test(s)) return "CNPq";
  return "Outra";
}
function mapStatus(situacaoDesc, dataDefesa, exameQualif) {
  if (toISO(dataDefesa)) return "Defesa marcada";
  const eq = norm(exameQualif || "");
  if (eq && !/^N[ÃA]O$/.test(eq) && !/INGL|ESPANHOL|FRANC/.test(eq)) return "Qualificado";
  const sd = norm(situacaoDesc || "");
  if (sd === "ATIVO") return "Cursando";
  if (!sd) return "Cursando";
  return sd.charAt(0) + sd.slice(1).toLowerCase(); // preserva (ex: Trancado)
}
const hueFrom = (s) => {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};

// ----- Ler XLS por índice de coluna (header tem DESCRICAO duplicado) -----
const wb = XLSX.readFile(XLS);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });
const header = rows[0].map((h) => norm(h));
const idx = (name) => header.indexOf(norm(name));

const I = {
  matricula: idx("MATRICULA"),
  nome: idx("NOME"),
  emailInst: idx("E_MAIL_INSTITUCIONAL"),
  emailPess: idx("E_MAIL_PESSOAL"),
  email: idx("EMAIL"),
  nivel: idx("NIVEL"),
  dataIngresso: idx("DATA INGRESSO"),
  situacaoAluno: idx("SITUACAO ALUNO"),
  bolsaDesc: idx("DESCRICAO BOLSA"),
  orientador: idx("ORIENTADOR"),
  dataDefesa: idx("DATA DEFESA"),
  exameQualif: idx("EXAME DE QUALIFICAÇÃO"),
  creditosInteg: idx("CRÉDITOS INTEGRALIZADOS"),
};
// situacao descricao = coluna logo após SITUACAO ALUNO (DESCRICAO duplicada)
I.situacaoDesc = I.situacaoAluno + 1;

// Asserts de formato (falha alto se o export mudar)
const must = ["matricula", "nome", "nivel", "dataIngresso", "orientador"];
for (const k of must) {
  if (I[k] < 0) throw new Error(`Coluna não encontrada: ${k} — header mudou?`);
}

const data = rows.slice(1).filter((r) => String(r[I.matricula]).trim());

// ----- Agregar orientadores -----
const orientadores = new Map(); // nomeNorm → { nomeRaw, count }
const alunos = [];
for (const r of data) {
  const orientadorRaw = String(r[I.orientador]).trim();
  const oNorm = norm(orientadorRaw);
  if (oNorm) {
    if (!orientadores.has(oNorm)) orientadores.set(oNorm, { nome: orientadorRaw, count: 0 });
    orientadores.get(oNorm).count++;
  }
  const ingresso = toISO(r[I.dataIngresso]);
  const emailInst = String(r[I.emailInst] || "").trim();
  const emailFallback = String(r[I.email] || r[I.emailPess] || "").trim();
  alunos.push({
    matricula: String(r[I.matricula]).trim(),
    nome: String(r[I.nome]).trim(),
    email: emailInst || emailFallback || null,
    nivel: /MESTRADO/.test(norm(r[I.nivel])) ? "Mestrado" : /DOUTORADO/.test(norm(r[I.nivel])) ? "Doutorado" : "Mestrado",
    ingresso,
    prazo: addMonthsISO(ingresso, 30),
    bolsa: mapBolsa(r[I.bolsaDesc]),
    status: mapStatus(r[I.situacaoDesc], r[I.dataDefesa], r[I.exameQualif]),
    creditos: parseInt(String(r[I.creditosInteg]).replace(/\D/g, "") || "0", 10),
    orientadorNorm: oNorm || null,
    hue: hueFrom(String(r[I.nome])),
  });
}

// ----- SQL -----
let sql = `-- SEED REAL — PPGEP Engenharia de Produção UFOP (UFOP-MIG-001)
-- GERADO por supabase/generate-real-seed.cjs — NÃO editar à mão.
-- Fonte: aluno_regular-2.xls (${data.length} alunos, ${orientadores.size} orientadores).
-- Substitui o seed mock (20260523000001). Idempotente.
-- Campos sem fonte real (linha_pesquisa, capes, h-index, produções) = NULL/0.

BEGIN;

-- 1) Limpar dados (mock + qualquer anterior). Ordem respeita FKs.
DELETE FROM bancas;
DELETE FROM producoes;
DELETE FROM disciplinas;
DELETE FROM alunos;
DELETE FROM professores;

-- 2) Professores reais (orientadores do export; campos Lattes/CAPES pendentes)
INSERT INTO professores (id, nome, orientandos_count, producao_count, kpi_h) VALUES
`;
const profRows = [...orientadores.values()].sort((a, b) => a.nome.localeCompare(b.nome));
sql += profRows
  .map((p) => `  ('${uuidFrom("ufop-prof-" + norm(p.nome))}', ${q(p.nome)}, ${p.count}, 0, 0)`)
  .join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

sql += "-- 3) Alunos reais\n";
sql += "INSERT INTO alunos (id, nome, matricula, email, data_ingresso, status_bolsa, status, prazo_jubilamento, professor_orientador_id, nivel, creditos, linha_pesquisa_id, producoes_count, avatar_hue) VALUES\n";
sql += alunos
  .map((a) => {
    const fk = a.orientadorNorm ? `'${uuidFrom("ufop-prof-" + a.orientadorNorm)}'` : "NULL";
    return `  ('${uuidFrom("ufop-aluno-" + a.matricula)}', ${q(a.nome)}, ${q(a.matricula)}, ${q(a.email)}, ${a.ingresso ? q(a.ingresso) : "NULL"}, ${q(a.bolsa)}, ${q(a.status)}, ${a.prazo ? q(a.prazo) : "NULL"}, ${fk}, ${q(a.nivel)}, ${a.creditos}, NULL, 0, ${a.hue})`;
  })
  .join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\nCOMMIT;\n";

const out = path.join(__dirname, "migrations", "20260523000002_seed_real_ppgep.sql");
fs.writeFileSync(out, sql, "utf8");

// Resumo
const byBolsa = {};
const byStatus = {};
alunos.forEach((a) => {
  byBolsa[a.bolsa] = (byBolsa[a.bolsa] || 0) + 1;
  byStatus[a.status] = (byStatus[a.status] || 0) + 1;
});
console.log("Seed real gerada:", out);
console.log(`alunos=${alunos.length} orientadores=${orientadores.size}`);
console.log("bolsas:", JSON.stringify(byBolsa));
console.log("status:", JSON.stringify(byStatus));
console.log("sample aluno:", JSON.stringify(alunos[0]));
