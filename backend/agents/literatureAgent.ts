import type { NormalizedPaper } from "../types.js";
import type { LiteratureAgentOutput } from "../types.js";

const HIGH_REPUTATION_JOURNALS = new Set([
  "lancet", "jama", "nejm", "bmj", "nature", "science", "annals of internal medicine",
  "plos medicine", "jama oncology", "nature medicine", "the lancet digital health",
]);

function keywordOverlap(query: string, text: string): number {
  const qWords = new Set(query.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const tLower = text.toLowerCase();
  let hits = 0;
  for (const w of qWords) {
    if (tLower.includes(w)) hits++;
  }
  return qWords.size > 0 ? hits / qWords.size : 0;
}

function journalReputation(journal: string | null): number {
  if (!journal) return 0.5;
  const name = journal.toLowerCase();
  for (const j of HIGH_REPUTATION_JOURNALS) {
    if (name.includes(j)) return 1;
  }
  return 0.5;
}

/**
 * Rank and filter papers by relevance: keyword overlap, recency, journal reputation.
 * No Gemini; deterministic.
 */
export function literatureAgent(query: string, papers: NormalizedPaper[]): LiteratureAgentOutput {
  const nowYear = new Date().getFullYear();
  const scored = papers.map((paper) => {
    const kw = keywordOverlap(query, `${paper.title} ${paper.abstract}`);
    const recency = paper.year != null ? Math.max(0, 1 - (nowYear - paper.year) / 15) : 0.5;
    const journal = journalReputation(paper.journal);
    const relevanceScore = Math.round((kw * 0.5 + recency * 0.3 + journal * 0.2) * 100) / 100;
    return { paper, relevanceScore, reason: `keywords: ${(kw * 100).toFixed(0)}%, recency: ${(recency * 100).toFixed(0)}%, journal: ${(journal * 100).toFixed(0)}%` };
  });
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return {
    rankedPapers: scored,
    totalCount: scored.length,
  };
}
