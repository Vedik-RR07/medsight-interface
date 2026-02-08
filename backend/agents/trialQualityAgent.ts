import { generateJson } from "../services/gemini.js";
import type { NormalizedPaper } from "../types.js";
import type { TrialQualityAgentOutput, TrialQualityAssessment } from "../types.js";

function inferStudyDesign(paper: NormalizedPaper): string {
  const t = `${paper.title} ${paper.abstract}`.toLowerCase();
  if (t.includes("randomized") || t.includes("rct") || t.includes("randomised")) return "RCT";
  if (t.includes("meta-analysis") || t.includes("systematic review")) return "Meta-analysis";
  if (t.includes("observational") || t.includes("cohort") || t.includes("case-control")) return "Observational";
  if (t.includes("case series") || t.includes("case report")) return "Case study";
  return paper.studyType || "Other";
}

interface GeminiTrialAssessment {
  biasRisk?: "low" | "moderate" | "high";
  confidenceScore?: number;
  sampleSizeAdequate?: boolean;
  internalValidityNotes?: string;
}

async function assessWithGemini(abstract: string): Promise<GeminiTrialAssessment | null> {
  const system = "You are a clinical trial quality assessor. Output only valid JSON.";
  const user = `Assess this abstract for internal validity, sample size adequacy, and bias risk. Respond with a JSON object with keys: biasRisk (one of "low","moderate","high"), confidenceScore (0-1), sampleSizeAdequate (boolean), internalValidityNotes (short string). Abstract:\n\n${abstract.slice(0, 3000)}`;
  return generateJson<GeminiTrialAssessment>(system, user);
}

/**
 * Trial-Quality Agent: infer study type from metadata, then use Gemini for validity/bias/sample size.
 */
export async function trialQualityAgent(papers: NormalizedPaper[]): Promise<TrialQualityAgentOutput> {
  const assessments: Array<{ paperId: string; assessment: TrialQualityAssessment }> = [];
  const designCounts = { rct: 0, observational: 0, metaAnalysis: 0 };

  for (const paper of papers) {
    const studyDesign = inferStudyDesign(paper);
    if (studyDesign === "RCT") designCounts.rct++;
    else if (studyDesign === "Observational" || studyDesign === "Case study") designCounts.observational++;
    else if (studyDesign === "Meta-analysis") designCounts.metaAnalysis++;

    const gemini = await assessWithGemini(paper.abstract || paper.title);
    const biasRisk = gemini?.biasRisk ?? (studyDesign === "RCT" ? "moderate" : "moderate");
    const confidenceScore = typeof gemini?.confidenceScore === "number" ? gemini.confidenceScore : 0.6;
    const sampleSizeAdequate = gemini?.sampleSizeAdequate ?? true;

    assessments.push({
      paperId: paper.id,
      assessment: {
        studyDesign,
        biasRisk,
        confidenceScore,
        sampleSizeAdequate,
        internalValidityNotes: gemini?.internalValidityNotes,
      },
    });
  }

  const maxBias = assessments.map((a) => (a.assessment.biasRisk === "high" ? 3 : a.assessment.biasRisk === "moderate" ? 2 : 1));
  const overallBiasRisk = Math.max(...maxBias) >= 3 ? "high" : Math.max(...maxBias) === 2 ? "moderate" : "low";

  return {
    assessments,
    summary: {
      rctCount: designCounts.rct,
      observationalCount: designCounts.observational,
      metaAnalysisCount: designCounts.metaAnalysis,
      overallBiasRisk,
      totalSampleSize: undefined,
    },
  };
}
