import { generateJson } from "../services/gemini.js";
import type { NormalizedPaper } from "../types.js";
import type { StatisticsAgentOutput } from "../types.js";

interface GeminiStatsOutput {
  explanation?: string;
  statisticalStrength?: number;
  outcomeComparisons?: Array<{ label: string; value: string; bar: number }>;
}

/**
 * Statistics Agent: Gemini focuses on effect sizes, CIs, clinical meaningfulness.
 * Returns plain-language explanation and statistical strength 0–1.
 */
export async function statisticsAgent(papers: NormalizedPaper[], query: string): Promise<StatisticsAgentOutput> {
  const combinedAbstracts = papers.slice(0, 5).map((p) => `[${p.title}]\n${p.abstract}`).join("\n\n");
  const system = "You are a medical statistics expert. Ignore narrative conclusions. Focus on effect sizes, confidence intervals, and whether results are clinically meaningful, not just statistically significant. Output only valid JSON.";
  const user = `Query: ${query}\n\nAbstracts:\n${combinedAbstracts.slice(0, 8000)}\n\nRespond with JSON: { "explanation": "plain-language summary of statistical evidence", "statisticalStrength": number between 0 and 1, "outcomeComparisons": [ { "label": "string", "value": "string e.g. 91.5%", "bar": number 0-100 } ] }. Include 2-4 outcome comparisons if data is present.`;

  const out = await generateJson<GeminiStatsOutput>(system, user);
  return {
    explanation: out?.explanation ?? "Unable to extract statistical summary from the provided abstracts.",
    statisticalStrength: typeof out?.statisticalStrength === "number" ? Math.max(0, Math.min(1, out.statisticalStrength)) : 0.5,
    outcomeComparisons: Array.isArray(out?.outcomeComparisons) ? out.outcomeComparisons : [],
  };
}
