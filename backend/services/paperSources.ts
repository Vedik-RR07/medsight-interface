import axios from "axios";
import type { NormalizedPaper } from "../types.js";

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const OPENALEX_BASE = "https://api.openalex.org";

const DEFAULT_PAPER_LIMIT = 8;

function inferStudyTypeFromText(text: string): string {
  const lower = (text || "").toLowerCase();
  if (lower.includes("randomized") || lower.includes("rct") || lower.includes("randomised")) return "RCT";
  if (lower.includes("meta-analysis") || lower.includes("systematic review")) return "Meta-analysis";
  if (lower.includes("observational") || lower.includes("cohort") || lower.includes("case-control")) return "Observational";
  if (lower.includes("case series") || lower.includes("case report")) return "Case study";
  return "Other";
}

/**
 * Query PubMed: esearch for PMIDs, then efetch for abstracts and metadata.
 * Returns 5–10 papers for demo use.
 */
export async function fetchFromPubMed(query: string, limit: number = DEFAULT_PAPER_LIMIT): Promise<NormalizedPaper[]> {
  const apiKey = process.env.PUBMED_API_KEY;
  const params: Record<string, string> = { term: query, retmax: String(limit), retmode: "json" };
  if (apiKey) params.api_key = apiKey;

  const searchRes = await axios.get(`${PUBMED_BASE}/esearch.fcgi`, { params });
  const idList: string[] = searchRes.data?.esearchresult?.idlist ?? [];
  if (idList.length === 0) return [];

  const fetchRes = await axios.get(`${PUBMED_BASE}/efetch.fcgi`, {
    params: { id: idList.join(","), db: "pubmed", retmode: "json", ...(apiKey ? { api_key: apiKey } : {}) },
  });

  const articles = fetchRes.data?.pubmed_articles?.pubmed_article ?? [];
  const papers: NormalizedPaper[] = [];

  for (const art of articles) {
    const med = art.medline_citation?.article ?? art.pubmed_article_set?.article;
    if (!med) continue;
    const pmid = art.medline_citation?.pmid ?? art.pubmed_article_set?.pmid;
    const id = pmid?.["#text"] ?? med.pmid ?? "unknown";
    const title = (med.article_title ?? "")?.replace(/<[^>]+>/g, "").trim() || "No title";
    let abstract = "";
    const absBlock = med.abstract?.abstract_text;
    if (Array.isArray(absBlock)) {
      abstract = absBlock.map((t: { "#text"?: string } | string) => (typeof t === "string" ? t : t?.["#text"] ?? "")).join(" ");
    } else if (typeof absBlock === "string") {
      abstract = absBlock;
    }
    const journal = med.journal?.title ?? med.journal?.iso_abbreviation ?? null;
    const pubDate = med.journal?.journal_issue?.pub_date ?? med.article_date;
    let year: number | null = null;
    if (pubDate?.year) year = parseInt(String(pubDate.year), 10);
    else if (pubDate?.medlinedate) {
      const m = String(pubDate.medlinedate).match(/\d{4}/);
      if (m) year = parseInt(m[0], 10);
    }
    const combined = `${title} ${abstract}`;
    papers.push({
      id: `pubmed-${id}`,
      title,
      abstract,
      year,
      journal,
      studyType: inferStudyTypeFromText(combined),
      source: "pubmed",
      pmid: String(id),
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    });
  }

  return papers;
}

/**
 * Query OpenAlex works endpoint; normalize to same internal format.
 */
export async function fetchFromOpenAlex(query: string, limit: number = 5): Promise<NormalizedPaper[]> {
  const params: Record<string, string> = {
    search: query,
    per_page: String(limit),
    filter: "is_oa:true", // optional: open access only for demo
  };
  const mailto = process.env.OPENALEX_EMAIL;
  if (mailto) params.mailto = mailto;

  const res = await axios.get(`${OPENALEX_BASE}/works`, { params });
  const results = res.data?.results ?? [];
  const papers: NormalizedPaper[] = [];

  for (const w of results) {
    const id = w.id?.replace("https://openalex.org/", "") ?? w.id ?? `oa-${papers.length}`;
    const title = w.title ?? "No title";
    const abstract = w.abstract_inverted_index
      ? invertAbstract(w.abstract_inverted_index)
      : (w.abstract ?? "");
    const year = w.publication_year ? parseInt(String(w.publication_year), 10) : null;
    const journal = w.primary_location?.source?.display_name ?? w.source?.display_name ?? null;
    const doi = w.doi ? (w.doi.startsWith("http") ? w.doi : `https://doi.org/${w.doi}`) : undefined;
    const combined = `${title} ${abstract}`;
    papers.push({
      id: `openalex-${id}`,
      title,
      abstract,
      year,
      journal,
      studyType: inferStudyTypeFromText(combined),
      source: "openalex",
      doi,
      url: w.id ?? undefined,
    });
  }

  return papers;
}

function invertAbstract(inverted: Record<string, number[]>): string {
  const pairs: { word: string; index: number }[] = [];
  for (const [word, indices] of Object.entries(inverted)) {
    for (const index of indices) {
      pairs.push({ word, index });
    }
  }
  pairs.sort((a, b) => a.index - b.index);
  return pairs.map((p) => p.word).join(" ");
}

/**
 * Fetch from both PubMed and OpenAlex; normalize and dedupe by title similarity.
 * Returns combined list, capped for demo (e.g. 5–10 papers).
 */
export async function fetchPapers(query: string, limitPerSource: number = 5): Promise<NormalizedPaper[]> {
  const [pubmedPapers, openalexPapers] = await Promise.all([
    fetchFromPubMed(query, limitPerSource),
    fetchFromOpenAlex(query, Math.min(limitPerSource, 5)),
  ]);

  const byTitle = new Map<string, NormalizedPaper>();
  for (const p of [...pubmedPapers, ...openalexPapers]) {
    const key = p.title.trim().toLowerCase().slice(0, 80);
    if (!byTitle.has(key)) byTitle.set(key, p);
  }
  return Array.from(byTitle.values()).slice(0, 10);
}
