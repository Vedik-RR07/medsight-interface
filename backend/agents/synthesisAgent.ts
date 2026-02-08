import { generateJson } from "../services/gemini.js";
import type {
  LiteratureAgentOutput,
  TrialQualityAgentOutput,
  StatisticsAgentOutput,
  PatientMatchAgentOutput,
  SynthesisAgentOutput,
  NormalizedPaper,
  VetoStatus,
} from "../types.js";

interface GeminiSynthesis {
  summary?: string;
  overallConfidence?: number;
  disagreementLevel?: number;
  clinicalReadiness?: number;
  conflictingEvidence?: string;
  keyFindings?: string[];
  keyCitations?: string[];
  clinicianSummary?: string;
  patientExplanation?: string;
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  objectionResponses?: Array<{ objection: string; response: string }>;
  confidenceJustification?: string;
  biasAndUncertainty?: string;
}

/**
 * Synthesis Agent: aggregates all agent outputs; explicitly cites conflicts and addresses objections.
 * Respects veto logic: hard veto blocks recommendations, soft veto requires justification.
 */
export async function synthesisAgent(
  query: string,
  papers: NormalizedPaper[],
  literature: LiteratureAgentOutput,
  trialQuality: TrialQualityAgentOutput,
  statistics: StatisticsAgentOutput,
  patientMatch: PatientMatchAgentOutput,
  vetoStatus: VetoStatus
): Promise<SynthesisAgentOutput> {
  // Handle hard veto - block recommendation
  if (vetoStatus.type === 'hard') {
    return {
      summary: "⚠️ DO NOT PROCEED - Contraindications detected for this patient.",
      overallConfidence: 0,
      disagreementLevel: 100,
      clinicalReadiness: 0,
      conflictingEvidence: vetoStatus.reason,
      keyFindings: vetoStatus.objections.map(o => o.message),
      keyCitations: [],
      clinicianSummary: `SAFETY ALERT: ${vetoStatus.reason}. ${vetoStatus.objections.map(o => o.message).join(' ')}`,
      patientExplanation: "Based on your specific health profile, this intervention is not recommended. Please discuss alternative options with your healthcare provider.",
      supportingEvidence: [],
      contradictingEvidence: vetoStatus.objections.map(o => `${o.source}: ${o.message}`),
      objectionResponses: vetoStatus.objections.map(o => ({
        objection: o.message,
        response: "This is a critical safety concern that cannot be overridden. Alternative approaches should be considered."
      })),
      confidenceJustification: "Confidence is zero due to explicit contraindications for this patient.",
      biasAndUncertainty: "Safety concerns override evidence quality assessment.",
      vetoApplied: true,
      vetoReason: vetoStatus.reason
    };
  }

  // Collect evidence and conflicts
  const conflictCandidates: string[] = [];
  const supportingPoints: string[] = [];
  const contradictingPoints: string[] = [];

  // Statistical evidence
  if (statistics.statisticalStrength >= 0.7) {
    supportingPoints.push(`Strong statistical evidence (strength: ${statistics.statisticalStrength})`);
  } else if (statistics.statisticalStrength < 0.5) {
    contradictingPoints.push(`Weak statistical evidence (strength: ${statistics.statisticalStrength})`);
  }

  // Trial quality
  if (trialQuality.summary.overallBiasRisk === "low") {
    supportingPoints.push(`Low bias risk with ${trialQuality.summary.rctCount} RCTs`);
  } else if (trialQuality.summary.overallBiasRisk === "high") {
    contradictingPoints.push(`High bias risk in studies`);
    conflictCandidates.push("High bias risk may affect reliability of findings.");
  }

  // Patient match
  if (patientMatch.matchScore >= 0.7) {
    supportingPoints.push(`Good patient population match (score: ${patientMatch.matchScore})`);
  } else {
    contradictingPoints.push(`Limited patient match (score: ${patientMatch.matchScore})`);
    conflictCandidates.push("Patient match is limited: " + patientMatch.mismatchReasons.join(" "));
  }

  // Quality vs strength conflict
  if (statistics.statisticalStrength >= 0.7 && trialQuality.summary.overallBiasRisk !== "low") {
    conflictCandidates.push("Strong statistical results but trial quality or bias risk is not low.");
  }

  // Add veto objections
  vetoStatus.objections.forEach(obj => {
    contradictingPoints.push(`${obj.source}: ${obj.message}`);
  });

  const system = `You are a medical evidence synthesis expert. You must address all safety concerns and objections explicitly. 
  
${vetoStatus.type === 'soft' ? 'SOFT VETO ACTIVE: You must justify why evidence might still be considered despite significant safety concerns.' : ''}

Output only valid JSON with all required fields.`;

  const user = `Query: ${query}

EVIDENCE SUMMARY:
- Papers: ${literature.totalCount}
- Trial Quality: ${trialQuality.summary.rctCount} RCTs, ${trialQuality.summary.observationalCount} observational
- Overall Bias Risk: ${trialQuality.summary.overallBiasRisk}
- Statistical Strength: ${statistics.statisticalStrength}
- Patient Match Score: ${patientMatch.matchScore}
- Statistics: ${statistics.explanation}

VETO STATUS: ${vetoStatus.type}
${vetoStatus.type !== 'none' ? `Reason: ${vetoStatus.reason}` : ''}

OBJECTIONS TO ADDRESS:
${vetoStatus.objections.map((o, i) => `${i + 1}. [${o.source}] ${o.message}${o.details ? ': ' + o.details : ''}`).join('\n')}

SUPPORTING EVIDENCE:
${supportingPoints.join('\n')}

CONTRADICTING EVIDENCE:
${contradictingPoints.join('\n')}

${conflictCandidates.length ? "CONFLICTS: " + conflictCandidates.join("; ") : ""}

Respond with JSON containing:
{
  "summary": "2-4 sentence final recommendation or 'Evidence insufficient' or 'Recommendation unsafe'",
  "overallConfidence": 0-100,
  "disagreementLevel": 0-100,
  "clinicalReadiness": 0-100,
  "conflictingEvidence": "string describing conflicts",
  "keyFindings": ["3-5 key findings"],
  "keyCitations": ["2-4 citations"],
  "clinicianSummary": "Technical summary for clinicians with all caveats",
  "patientExplanation": "Plain language explanation suitable for patients",
  "supportingEvidence": ["list of supporting points"],
  "contradictingEvidence": ["list of contradicting points"],
  "objectionResponses": [{"objection": "string", "response": "explicit response to each objection"}],
  "confidenceJustification": "Explain how trial quality, statistics, patient match, and disagreement affect confidence",
  "biasAndUncertainty": "List bias sources, uncertainty, conflicts, and gaps"
}`;

  try {
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
      
      // New safety-first fields
      clinicianSummary: out?.clinicianSummary ?? out?.summary ?? "See detailed analysis above.",
      patientExplanation: out?.patientExplanation ?? "Discuss these findings with your healthcare provider to understand how they apply to your situation.",
      supportingEvidence: out?.supportingEvidence ?? supportingPoints,
      contradictingEvidence: out?.contradictingEvidence ?? contradictingPoints,
      objectionResponses: out?.objectionResponses ?? vetoStatus.objections.map(o => ({
        objection: o.message,
        response: "This concern has been noted and should be discussed with your healthcare provider."
      })),
      confidenceJustification: out?.confidenceJustification ?? `Confidence based on: trial quality (${trialQuality.summary.overallBiasRisk} bias), statistical strength (${statistics.statisticalStrength}), patient match (${patientMatch.matchScore}).`,
      biasAndUncertainty: out?.biasAndUncertainty ?? (conflictCandidates.length ? conflictCandidates.join(" ") : "See individual agent assessments for detailed bias and uncertainty analysis."),
      vetoApplied: vetoStatus.type !== 'none',
      vetoReason: vetoStatus.type !== 'none' ? vetoStatus.reason : undefined
    };
  } catch (error) {
    console.error('SynthesisAgent error:', error);
    
    // Fallback for LLM failures - check veto type
    if (vetoStatus.type !== 'none' && vetoStatus.type !== 'soft') {
      // Hard veto fallback
      return {
        summary: "⚠️ DO NOT PROCEED - Safety analysis failed but contraindications were detected.",
        overallConfidence: 0,
        disagreementLevel: 100,
        clinicalReadiness: 0,
        conflictingEvidence: vetoStatus.reason,
        keyFindings: ["Safety analysis incomplete", "Contraindications detected"],
        keyCitations: [],
        clinicianSummary: "SAFETY ALERT: System error during synthesis, but hard veto was triggered. Do not proceed.",
        patientExplanation: "Due to safety concerns, this intervention is not recommended for you.",
        supportingEvidence: [],
        contradictingEvidence: vetoStatus.objections.map(o => o.message),
        objectionResponses: vetoStatus.objections.map(o => ({
          objection: o.message,
          response: "Critical safety concern - alternative approaches required."
        })),
        confidenceJustification: "Confidence is zero due to safety veto.",
        biasAndUncertainty: "Analysis incomplete due to system error.",
        vetoApplied: true,
        vetoReason: vetoStatus.reason
      };
    }
    
    throw error;
  }
}
