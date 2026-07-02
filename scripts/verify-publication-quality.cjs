#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

function usage() {
  console.log([
    "Uso:",
    "  node scripts/verify-publication-quality.cjs --input publicacoes.xlsx [--qualis qualis.xlsx] [--jcr jcr.xlsx] [--out report.json]",
    "",
    "Colunas aceitas na planilha de publicacoes:",
    "  titulo/title, journal/periodico/revista, issn/eissn, doi, qualis/extrato, jcr/quartil, scopus, ano/data",
    "",
    "Colunas aceitas nas bases de referencia:",
    "  Qualis: journal/periodico/revista, issn/eissn, qualis/extrato, area, ano",
    "  JCR: journal/journal name, issn/eissn, jcr/quartile, impact factor, ano",
  ].join("\n"));
}

const input = getArg("--input");
if (!input || args.includes("--help")) {
  usage();
  process.exit(input ? 0 : 1);
}

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeIssn(value) {
  const cleaned = String(value || "").replace(/[^0-9xX]/g, "").toUpperCase();
  return cleaned.length >= 8 ? cleaned.slice(0, 8) : "";
}

function readRows(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Arquivo nao encontrado: ${filePath}`);
  const workbook = XLSX.readFile(filePath, { cellDates: true, raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function findValue(row, keys) {
  const columns = Object.keys(row).map((key) => ({ key, normalized: normalizeHeader(key) }));
  const match = columns.find(({ normalized }) =>
    keys.some((candidate) => normalized.includes(normalizeHeader(candidate))),
  );
  return match ? String(row[match.key] || "").trim() : "";
}

function normalizeQualis(value) {
  const match = String(value || "").toUpperCase().replace(/\s/g, "").match(/\b(A1|A2|A3|A4|B1|B2|B3|B4|C)\b/);
  return match ? match[1] : "";
}

function normalizeJcr(value) {
  const match = String(value || "").toUpperCase().replace(/\s/g, "").match(/\bQ([1-4])\b/);
  return match ? `Q${match[1]}` : "";
}

function buildReference(filePath, type) {
  if (!filePath) return { byIssn: new Map(), byJournal: new Map(), count: 0 };
  const rows = readRows(filePath);
  const byIssn = new Map();
  const byJournal = new Map();

  for (const row of rows) {
    const journal = findValue(row, ["journal", "journal name", "periodico", "periódico", "revista"]);
    const issn = normalizeIssn(findValue(row, ["issn", "eissn", "e-issn"]));
    const value = type === "qualis"
      ? normalizeQualis(findValue(row, ["qualis", "extrato", "estrato"]))
      : normalizeJcr(findValue(row, ["jcr", "quartile", "quartil"]));
    if (!value) continue;

    const record = { journal, issn, value };
    if (issn) byIssn.set(issn, record);
    if (journal) byJournal.set(normalizeText(journal), record);
  }

  return { byIssn, byJournal, count: rows.length };
}

const qualisRef = buildReference(getArg("--qualis"), "qualis");
const jcrRef = buildReference(getArg("--jcr"), "jcr");
const publicationRows = readRows(input);

const publications = publicationRows.map((row, index) => {
  const title = findValue(row, ["titulo", "título", "title", "artigo", "publicacao", "publicação"]);
  const journal = findValue(row, ["journal", "periodico", "periódico", "revista", "venue"]);
  const issn = normalizeIssn(findValue(row, ["issn", "eissn", "e-issn"]));
  const inlineQualis = normalizeQualis(findValue(row, ["qualis", "extrato", "estrato"]));
  const inlineJcr = normalizeJcr(findValue(row, ["jcr", "quartile", "quartil"]));
  const qualisMatch = inlineQualis || qualisRef.byIssn.get(issn)?.value || qualisRef.byJournal.get(normalizeText(journal))?.value || "";
  const jcrMatch = inlineJcr || jcrRef.byIssn.get(issn)?.value || jcrRef.byJournal.get(normalizeText(journal))?.value || "";

  return {
    row: index + 2,
    title,
    journal,
    issn,
    doi: findValue(row, ["doi"]),
    qualis: qualisMatch,
    jcr: jcrMatch,
    missingTitle: !title,
    missingJournal: !journal,
    missingIssn: !issn,
    missingQualis: !qualisMatch,
    missingJcr: !jcrMatch,
  };
});

const seen = new Map();
const duplicates = [];
for (const item of publications) {
  const key = normalizeText(`${item.title} ${item.issn || item.journal}`);
  if (!key) continue;
  if (seen.has(key)) duplicates.push({ firstRow: seen.get(key), row: item.row, title: item.title });
  else seen.set(key, item.row);
}

function countBy(field) {
  return publications.reduce((acc, item) => {
    const value = item[field] || "SEM_VALOR";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

const report = {
  input: path.resolve(input),
  references: {
    qualisRows: qualisRef.count,
    jcrRows: jcrRef.count,
  },
  totals: {
    rows: publicationRows.length,
    validPublications: publications.filter((item) => item.title).length,
    duplicates: duplicates.length,
    missingJournal: publications.filter((item) => item.title && item.missingJournal).length,
    missingIssn: publications.filter((item) => item.title && item.missingIssn).length,
    missingQualis: publications.filter((item) => item.title && item.missingQualis).length,
    missingJcr: publications.filter((item) => item.title && item.missingJcr).length,
  },
  qualisCounts: countBy("qualis"),
  jcrCounts: countBy("jcr"),
  duplicates,
  pending: publications
    .filter((item) => item.title && (item.missingQualis || item.missingJcr || item.missingIssn || item.missingJournal))
    .slice(0, 100),
};

const out = getArg("--out");
if (out) {
  fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
}

console.log(JSON.stringify(report, null, 2));
