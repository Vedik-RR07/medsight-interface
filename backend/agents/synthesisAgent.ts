import { generateJson } from "../services/gemini.js";
import type {
  LiteratureAgentOutput,
  TrialQualityAgentOutput,
  StatisticsAgentOutput,
  PatientMatchAgentOutput,
  SynthesisAgentOutput,
  NormalizedPaper,
} from "../types.js";

interface GeminiSynthesis {
  summary?: string;
  overallConfidence?: number;
  disagreementLevel?: number;
  clinicalReadiness?: number;
  conflictingEvidence?: string;
  keyFindings?: string[];
  keyCitations?: string[];
}

/**
 * Synthesis Agent: aggregates all agent outputs; explicitly cites conflicts (e.g. strong stats but poor trial quality).
 */
export async function synthesisAgent(
  query: string,
  papers: NormalizedPaper[],
  literature: LiteratureAgentOutput,
  trialQuality: TrialQualityAgentOutput,
  statistics: StatisticsAgentOutput,
  patientMatch: PatientMatchAgentOutput
): Promise<SynthesisAgentOutput> {
  const conflictCandidates: string[] = [];
  if (statistics.statisticalStrength >= 0.7 && trialQuality.summary.overallBiasRisk !== "low") {
    conflictCandidates.push("Strong statistical results but trial quality or bias risk is not low.");
  }
  if (patientMatch.matchScore < 0.7 && patientMatch.mismatchReasons.length) {
    conflictCandidates.push("Patient match is limited: " + patientMatch.mismatchReasons.join(" "));
  }

  const system = "You are a medical evidence synthesis expert. Summarize the evidence and explicitly mention any conflicts between strength of results and study quality or applicability. Output only valid JSON.";
  const user = `Query: ${query}\n\nEvidence: ${literature.totalCount} papers. Trial quality: ${trialQuality.summary.rctCount} RCTs, ${trialQuality.summary.observationalCount} observational, bias risk ${trialQuality.summary.overallBiasRisk}. Statistical strength: ${statistics.statisticalStrength}. Patient match score: ${patientMatch.matchScore}. Statistics summary: ${statistics.explanation}\n\n${conflictCandidates.length ? "Potential conflicts to mention: " + conflictCandidates.join("; ") : ""}\n\nRespond with JSON: { "summary": "2-4 sentence final recommendation", "overallConfidence": 0-100, "disagreementLevel": 0-100, "clinicalReadiness": 0-100, "conflictingEvidence": "optional string if conflicts exist", "keyFindings": ["string"], "keyCitations": ["journal year; short ref"] }. Include 3-5 key findings and 2-4 citations.`;

  const out = await generateJson<GeminiSynthesis>(system, user);
  const citations = papers.slice(0, 5).map((p) => (p.journal ? `${p.journal} ${p.year ?? ""}` : p.title).trim());
  return {
    summary: out?.summary ?? "Evidence was synthesized; see individual agent tabs for details.",
    overallConfidence: typeof out?.overallConfidence === "number" ? Math.max(0, Math.min(100, out.overallConfidence)) : 65,
    disagreementLevel: typeof out?.disagreementLevel === "number" ? Math.max(0, Math.min(100, out.disagreementLevel)) : 40,
    clinicalReadiness: typeof out?.clinicalReadiness === "number" ? Math.max(0, Math.min(100, out.clinicalReadiness)) : 50,
    conflictingEvidence: out?.conflictingEvidence ?? (conflictCandidates.length ? conflictCandidates.join(" ") : undefined),
    keyFindings: Array.isArray(out?.keyFindings) && out.keyFindings.length ? out.keyFindings : [statistics.explanation],
    keyCitations: Array.isArray(out?.keyCitations) && out.keyCitations.length ? out.keyCitations : citations,
  };
}
