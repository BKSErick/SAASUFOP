import "server-only";

export type ScopusMatch = {
  found: boolean;
  query: string;
  eid: string | null;
  doi: string | null;
  title: string | null;
  journal: string | null;
  coverDate: string | null;
  citedByCount: number | null;
  link: string | null;
};

type ScopusSearchEntry = {
  eid?: string;
  "dc:identifier"?: string;
  "dc:title"?: string;
  "prism:doi"?: string;
  "prism:publicationName"?: string;
  "prism:coverDate"?: string;
  "citedby-count"?: string;
  link?: Array<{ "@ref"?: string; "@href"?: string }>;
};

type ScopusSearchResponse = {
  "search-results"?: {
    entry?: ScopusSearchEntry[];
  };
};

const SCOPUS_SEARCH_URL = "https://api.elsevier.com/content/search/scopus";

function getApiKey() {
  return process.env.ELSEVIER_API_KEY ?? process.env.SCOPUS_API_KEY ?? "";
}

function escapeQueryValue(value: string) {
  return value.replace(/"/g, '\\"').trim();
}

function scopusLink(entry: ScopusSearchEntry) {
  const direct = entry.link?.find((link) => link["@ref"] === "scopus")?.["@href"];
  if (direct) return direct;
  if (entry.eid) return `https://www.scopus.com/record/display.uri?eid=${encodeURIComponent(entry.eid)}&origin=resultslist`;
  return null;
}

function mapEntry(query: string, entry: ScopusSearchEntry | undefined): ScopusMatch {
  if (!entry) {
    return {
      found: false,
      query,
      eid: null,
      doi: null,
      title: null,
      journal: null,
      coverDate: null,
      citedByCount: null,
      link: null,
    };
  }

  const citedByCount = Number.parseInt(entry["citedby-count"] ?? "", 10);

  return {
    found: true,
    query,
    eid: entry.eid ?? entry["dc:identifier"] ?? null,
    doi: entry["prism:doi"] ?? null,
    title: entry["dc:title"] ?? null,
    journal: entry["prism:publicationName"] ?? null,
    coverDate: entry["prism:coverDate"] ?? null,
    citedByCount: Number.isFinite(citedByCount) ? citedByCount : null,
    link: scopusLink(entry),
  };
}

export function hasScopusConfig() {
  return Boolean(getApiKey());
}

export async function searchScopus(query: string): Promise<ScopusMatch> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("ELSEVIER_API_KEY nao configurada.");

  const url = new URL(SCOPUS_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("field", "eid,dc:identifier,dc:title,prism:doi,prism:publicationName,prism:coverDate,citedby-count,link");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-ELS-APIKey": apiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Scopus respondeu ${response.status}: ${text.slice(0, 240) || response.statusText}`);
  }

  const payload = await response.json() as ScopusSearchResponse;
  return mapEntry(query, payload["search-results"]?.entry?.[0]);
}

export async function findScopusPublication(input: {
  doi?: string | null;
  title?: string | null;
  journal?: string | null;
}) {
  const doi = input.doi?.trim();
  if (doi) {
    const byDoi = await searchScopus(`DOI(${doi})`);
    if (byDoi.found) return byDoi;
  }

  const title = input.title?.trim();
  if (!title) return null;

  const titleQuery = `TITLE("${escapeQueryValue(title)}")`;
  const journal = input.journal?.trim();
  const query = journal
    ? `${titleQuery} AND SRCTITLE("${escapeQueryValue(journal)}")`
    : titleQuery;

  const byTitle = await searchScopus(query);
  return byTitle.found ? byTitle : byTitle;
}
