import * as XLSX from "xlsx";

export type SraStudentRow = {
  nome: string;
  matricula: string;
  email: string | null;
  data_ingresso: string | null;
  status_bolsa: string;
  status: string;
  prazo_jubilamento: string | null;
  data_defesa: string | null;
  nivel: "Mestrado" | "Doutorado";
  creditos: number;
  avatar_hue: number;
  orientador_nome: string | null;
};

export type SraParseResult = {
  rows: SraStudentRow[];
  totalRows: number;
  headerRowIndex: number;
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const compact = (value: unknown) => normalize(value).replace(/[^A-Z0-9]/g, "");

function parseDateCell(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }

  const text = String(value).trim();
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (br) {
    const year = br[3].length === 2 ? `20${br[3]}` : br[3];
    return `${year}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  }
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  return null;
}

function addMonths(iso: string | null, months: number) {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().slice(0, 10);
}

function hueFrom(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

function parseInteger(value: unknown) {
  const text = String(value ?? "").replace(/\D/g, "");
  return text ? Number.parseInt(text, 10) : 0;
}

function mapNivel(value: unknown): "Mestrado" | "Doutorado" {
  return /DOUT/.test(normalize(value)) ? "Doutorado" : "Mestrado";
}

function mapBolsa(...values: unknown[]) {
  const text = normalize(values.find((value) => normalize(value)) ?? "");
  if (!text || /^NAO$/.test(text) || /NENHUMA|SEM BOLSA/.test(text)) return "Nenhuma";
  if (/FAPEMIG|AMPARO.*PESQUISA.*MG|AMPARO.*MG/.test(text)) return "FAPEMIG";
  if (/CAPES|APERFEICOAMENTO/.test(text)) return "CAPES";
  if (/CNPQ|CONSELHO NACIONAL/.test(text)) return "CNPq";
  return String(values.find((value) => String(value ?? "").trim()) ?? "Outra").trim();
}

function mapStatus(situacao: unknown, dataDefesa: unknown, exameQualificacao: unknown) {
  if (parseDateCell(dataDefesa)) return "Defesa marcada";

  const exame = normalize(exameQualificacao);
  if (exame && !/^NAO$/.test(exame) && !/INGLES|ESPANHOL|FRANCES/.test(exame)) return "Qualificado";

  const status = normalize(situacao);
  if (!status || status === "A" || status === "ATIVO" || status === "CURSANDO") return "Cursando";
  if (/AGUARD/.test(status)) return "Aguard. documentacao";
  if (/QUALIFIC/.test(status)) return "Qualificado";
  if (/DEFESA/.test(status)) return "Defesa marcada";
  if (/TRANC/.test(status)) return "Trancado";
  if (/DESLIG|CANCEL|EVAS/.test(status)) return "Desligado";
  return String(situacao ?? "").trim() || "Cursando";
}

function findHeaderRow(rows: unknown[][]) {
  for (let i = 0; i < rows.length; i += 1) {
    const headers = rows[i]?.map(compact) ?? [];
    const hasName = headers.some((header) => ["NOME", "ALUNO", "NOMEDOALUNO", "DISCENTE"].includes(header));
    const hasRegistration = headers.some((header) => ["MATRICULA", "REGISTRO"].includes(header));
    if (hasName && hasRegistration) return i;
  }
  return -1;
}

function findCol(headers: string[], aliases: string[]) {
  const normalizedAliases = aliases.map(compact);
  for (const alias of normalizedAliases) {
    const idx = headers.indexOf(alias);
    if (idx >= 0) return idx;
  }
  return -1;
}

function get(row: unknown[], idx: number) {
  return idx >= 0 ? row[idx] : undefined;
}

function stringOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function parseSraSpreadsheet(buffer: Buffer, fileName = "sra.xlsx"): SraParseResult {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
    raw: false,
    WTF: false,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Planilha sem abas.");

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const headerRowIndex = findHeaderRow(rawRows);
  if (headerRowIndex < 0) {
    throw new Error(`Nao foi possivel encontrar cabecalho com NOME e MATRICULA em ${fileName}.`);
  }

  const headers = rawRows[headerRowIndex].map(compact);
  const col = {
    matricula: findCol(headers, ["MATRICULA", "REGISTRO"]),
    nome: findCol(headers, ["NOME", "NOME DO ALUNO", "ALUNO", "DISCENTE"]),
    emailInst: findCol(headers, ["E_MAIL_INSTITUCIONAL", "EMAIL INSTITUCIONAL", "EMAIL INSTITUCIONAL"]),
    emailPessoal: findCol(headers, ["E_MAIL_PESSOAL", "EMAIL PESSOAL"]),
    email: findCol(headers, ["EMAIL", "E-MAIL"]),
    dataIngresso: findCol(headers, ["DATA INGRESSO", "DATA DE INGRESSO", "INGRESSO"]),
    nivel: findCol(headers, ["NIVEL", "NIVEL DO CURSO", "CURSO"]),
    bolsa: findCol(headers, ["BOLSA", "AGENCIA", "AGENCIA BOLSA"]),
    bolsaDesc: findCol(headers, ["DESCRICAO BOLSA", "TIPO BOLSA"]),
    orientador: findCol(headers, ["ORIENTADOR", "PROFESSOR ORIENTADOR", "NOME DO ORIENTADOR", "DOCENTE ORIENTADOR", "ORIENTADOR(A)"]),
    situacaoAluno: findCol(headers, ["SITUACAO ALUNO", "SITUACAO DISCENTE", "SITUACAO DO DISCENTE", "STATUS DISCENTE", "STATUS"]),
    dataDefesa: findCol(headers, ["DATA DEFESA", "DATA DE DEFESA", "PRAZO", "PRAZO FINAL", "PRAZO DE DEFESA", "DATA PRAZO", "PRAZO DEFESA"]),
    exameQualificacao: findCol(headers, ["EXAME DE QUALIFICACAO", "QUALIFICACAO"]),
    creditos: findCol(headers, ["CREDITOS INTEGRALIZADOS", "CREDITOS", "CREDITOS INTEGRALIZADOS "]),
  };

  const situacaoDescricao =
    col.situacaoAluno >= 0 && headers[col.situacaoAluno + 1] === "DESCRICAO"
      ? col.situacaoAluno + 1
      : col.situacaoAluno;

  if (col.matricula < 0 || col.nome < 0) {
    throw new Error("Colunas obrigatorias ausentes: NOME e MATRICULA.");
  }

  const rows = rawRows
    .slice(headerRowIndex + 1)
    .map((row) => {
      const matricula = stringOrNull(get(row, col.matricula));
      if (!matricula) return null;

      const nome = stringOrNull(get(row, col.nome)) ?? `Aluno ${matricula}`;
      const dataIngresso = parseDateCell(get(row, col.dataIngresso));
      const nivel = mapNivel(get(row, col.nivel));
      const dataDefesa = parseDateCell(get(row, col.dataDefesa));
      const prazoCalculado = addMonths(dataIngresso, nivel === "Doutorado" ? 48 : 30);

      return {
        nome,
        matricula,
        email:
          stringOrNull(get(row, col.emailInst)) ??
          stringOrNull(get(row, col.email)) ??
          stringOrNull(get(row, col.emailPessoal)),
        data_ingresso: dataIngresso,
        status_bolsa: mapBolsa(get(row, col.bolsa), get(row, col.bolsaDesc)),
        status: mapStatus(get(row, situacaoDescricao), get(row, col.dataDefesa), get(row, col.exameQualificacao)),
        prazo_jubilamento: dataDefesa ?? prazoCalculado,
        data_defesa: dataDefesa,
        nivel,
        creditos: parseInteger(get(row, col.creditos)),
        avatar_hue: hueFrom(nome),
        orientador_nome: stringOrNull(get(row, col.orientador)),
      } satisfies SraStudentRow;
    })
    .filter((row): row is SraStudentRow => row != null);

  if (rows.length === 0) {
    throw new Error("Nenhum aluno valido encontrado na planilha.");
  }

  return { rows, totalRows: rawRows.length - headerRowIndex - 1, headerRowIndex };
}

export function normalizeSraName(value: unknown) {
  return normalize(value);
}
