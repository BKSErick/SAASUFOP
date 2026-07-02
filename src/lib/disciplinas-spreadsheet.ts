import * as XLSX from "xlsx";

export type DisciplinaImportRow = {
  codigo: string;
  nome: string;
  creditos: number;
  periodo: string;
  matriculados: number;
  professor_nome: string | null;
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

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getValue(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row).map((key) => ({ key, normalized: normalize(key) }));
  const match = keys.find(({ normalized }) =>
    aliases.some((alias) => normalized.includes(normalize(alias))),
  );
  return match ? row[match.key] : undefined;
}

export function parseDisciplinasSpreadsheet(buffer: Buffer): DisciplinaImportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Planilha sem abas.");

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
  });

  return rows
    .map((row) => {
      const codigo = clean(getValue(row, ["codigo", "código", "cod", "disciplina codigo"]));
      const nome = clean(getValue(row, ["disciplina", "nome", "componente curricular", "materia"]));
      if (!codigo || !nome) return null;

      return {
        codigo,
        nome,
        creditos: numberValue(getValue(row, ["creditos", "créditos", "credito", "crédito"]), 4),
        periodo: clean(getValue(row, ["periodo", "período", "semestre", "oferta"])) ?? "",
        matriculados: numberValue(getValue(row, ["matriculados", "alunos", "inscritos", "vagas ocupadas"]), 0),
        professor_nome: clean(getValue(row, ["professor", "docente", "responsavel", "responsável"])),
      } satisfies DisciplinaImportRow;
    })
    .filter((row): row is DisciplinaImportRow => row != null);
}

export function normalizeDisciplinaProfessor(value: unknown) {
  return normalize(value).toUpperCase();
}
