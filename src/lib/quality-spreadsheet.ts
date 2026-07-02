import * as XLSX from "xlsx";

export interface QualityPublicationRow {
  titulo: string;
  journal: string | null;
  issn: string | null;
  doi: string | null;
  qualis: string | null;
  jcrQuartile: string | null;
  linkScopus: string | null;
  dataPublicacao: string | null;
  raw: Record<string, unknown>;
}

export interface QualitySpreadsheetSummary {
  totalRows: number;
  validRows: number;
  missingTitle: number;
  missingJournal: number;
  missingIssn: number;
  missingQualis: number;
  qualisCounts: Record<string, number>;
  jcrCounts: Record<string, number>;
}

const TITLE_KEYS = ["titulo", "título", "title", "artigo", "publicacao", "publicação"];
const JOURNAL_KEYS = ["journal", "periodico", "periódico", "revista", "venue", "nome do periódico"];
const ISSN_KEYS = ["issn", "eissn", "e-issn"];
const DOI_KEYS = ["doi"];
const QUALIS_KEYS = ["qualis", "extrato", "estrato"];
const JCR_KEYS = ["jcr", "quartil", "quartile"];
const SCOPUS_KEYS = ["scopus", "link scopus"];
const DATE_KEYS = ["ano", "year", "data", "publicacao", "publicação"];

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeIssn(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = String(value).replace(/[^0-9xX]/g, "").toUpperCase();
  return normalized.length >= 8 ? normalized.slice(0, 8) : null;
}

function cleanString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function getValue(row: Record<string, unknown>, keys: string[]): string | null {
  const normalizedKeys = Object.keys(row).map((key) => ({ key, normalized: normalizeHeader(key) }));
  const match = normalizedKeys.find(({ normalized }) =>
    keys.some((candidate) => normalized.includes(normalizeHeader(candidate))),
  );
  return match ? cleanString(row[match.key]) : null;
}

function normalizeQualis(value: string | null): string | null {
  if (!value) return null;
  const upper = value.toUpperCase().replace(/\s/g, "");
  const match = upper.match(/\b(A1|A2|A3|A4|B1|B2|B3|B4|C)\b/);
  return match?.[1] ?? null;
}

function normalizeJcr(value: string | null): string | null {
  if (!value) return null;
  const upper = value.toUpperCase().replace(/\s/g, "");
  const match = upper.match(/\bQ([1-4])\b/);
  return match ? `Q${match[1]}` : null;
}

function parseDate(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export function parseQualitySpreadsheet(buffer: Buffer, fileName: string): QualityPublicationRow[] {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
    raw: false,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
  });

  return rows.map((row) => {
    const doi = getValue(row, DOI_KEYS);
    return {
      titulo: getValue(row, TITLE_KEYS) ?? "",
      journal: getValue(row, JOURNAL_KEYS),
      issn: normalizeIssn(getValue(row, ISSN_KEYS)),
      doi,
      qualis: normalizeQualis(getValue(row, QUALIS_KEYS)),
      jcrQuartile: normalizeJcr(getValue(row, JCR_KEYS)),
      linkScopus: getValue(row, SCOPUS_KEYS) ?? (doi ? `https://doi.org/${doi}` : null),
      dataPublicacao: parseDate(getValue(row, DATE_KEYS)),
      raw: { ...row, __source_file: fileName },
    };
  });
}

export function summarizeQualityRows(rows: QualityPublicationRow[]): QualitySpreadsheetSummary {
  const validRows = rows.filter((row) => row.titulo.trim().length > 0);
  const qualisCounts: Record<string, number> = {};
  const jcrCounts: Record<string, number> = {};

  for (const row of validRows) {
    if (row.qualis) qualisCounts[row.qualis] = (qualisCounts[row.qualis] ?? 0) + 1;
    if (row.jcrQuartile) jcrCounts[row.jcrQuartile] = (jcrCounts[row.jcrQuartile] ?? 0) + 1;
  }

  return {
    totalRows: rows.length,
    validRows: validRows.length,
    missingTitle: rows.length - validRows.length,
    missingJournal: validRows.filter((row) => !row.journal).length,
    missingIssn: validRows.filter((row) => !row.issn).length,
    missingQualis: validRows.filter((row) => !row.qualis).length,
    qualisCounts,
    jcrCounts,
  };
}
