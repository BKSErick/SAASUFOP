import * as XLSX from "xlsx";

export type BancaImportRow = {
  aluno_nome: string | null;
  matricula: string | null;
  titulo_trabalho: string;
  tipo: "Defesa" | "Qualificação";
  data_hora: string | null;
  local: string | null;
  link_transmissao: string | null;
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function getValue(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row).map((key) => ({ key, normalized: normalize(key) }));
  const match = keys.find(({ normalized }) =>
    aliases.some((alias) => normalized.includes(normalize(alias))),
  );
  return match ? row[match.key] : undefined;
}

function parseDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();

  const text = String(value).trim();
  const brDateTime = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (brDateTime) {
    const year = brDateTime[3].length === 2 ? `20${brDateTime[3]}` : brDateTime[3];
    const hour = brDateTime[4]?.padStart(2, "0") ?? "00";
    const minute = brDateTime[5] ?? "00";
    return `${year}-${brDateTime[2].padStart(2, "0")}-${brDateTime[1].padStart(2, "0")}T${hour}:${minute}:00`;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeTipo(value: unknown): "Defesa" | "Qualificação" {
  const text = normalize(value);
  return text.includes("qualific") ? "Qualificação" : "Defesa";
}

export function parseBancasSpreadsheet(buffer: Buffer): BancaImportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Planilha sem abas.");

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
  });

  return rows
    .map((row) => {
      const titulo = clean(getValue(row, ["titulo", "título", "trabalho", "dissertacao", "dissertação", "tese"]));
      const data = parseDate(getValue(row, ["data hora", "data_hora", "data", "defesa", "agendamento"]));
      if (!titulo || !data) return null;

      const parsed: BancaImportRow = {
        aluno_nome: clean(getValue(row, ["aluno", "discente", "nome do aluno"])),
        matricula: clean(getValue(row, ["matricula", "matrícula", "registro"])),
        titulo_trabalho: titulo,
        tipo: normalizeTipo(getValue(row, ["tipo", "banca", "evento"])),
        data_hora: data,
        local: clean(getValue(row, ["local", "sala", "link sala"])),
        link_transmissao: clean(getValue(row, ["link", "transmissao", "transmissão", "meet", "teams"])),
      };

      return parsed;
    })
    .filter((row): row is BancaImportRow => row != null);
}

export function normalizeBancaLookup(value: unknown) {
  return normalize(value).toUpperCase();
}
