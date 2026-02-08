import { fetchPapers } from "./services/paperSources.js";
import { literatureAgent } from "./agents/literatureAgent.js";
import { trialQualityAgent } from "./agents/trialQualityAgent.js";
import { statisticsAgent } from "./agents/statisticsAgent.js";
import { patientMatchAgent } from "./agents/patientMatchAgent.js";
import { patientSafetyAgent } from "./agents/patientSafetyAgent.js";
import { synthesisAgent } from "./agents/synthesisAgent.js";
import type { 
  AnalyzeResponse, 
  PatientParams, 
  PatientProfile, 
  AnalysisMode,
  VetoStatus,
  Objection,
  PatientSafetyAgentOutput
} from "./types.js";

/**
 * Validate analysis request based on mode and patient profile.
 */
export function validateRequest(
  mode: AnalysisMode,
  patient?: PatientProfile
): { valid: boolean; error?: string } {
  // Validate mode parameter
  if (mode !== 'clinical' && mode !== 'research') {
    return { valid: false, error: "Invalid mode. Must be 'clinical' or 'research'" };
  }

  // Clinical mode requires complete patient profile
  if (mode === 'clinical') {
    if (!patient) {
      return { valid: false, error: "Patient profile is required in clinical mode" };
    }

    if (patient.age === undefined || patient.age === null) {
      return { valid: false, error: "Patient age is required in clinical mode" };
    }

    if (typeof patient.age !== 'number' || patient.age < 0 || patient.age > 120) {
      return { valid: false, error: "Patient age must be between 0 and 120" };
    }

    if (!patient.sex) {
      return { valid: false, error: "Patient sex is required in clinical mode" };
    }

    if (!['male', 'female', 'other'].includes(patient.sex)) {
      return { valid: false, error: "Patient sex must be 'male', 'female', or 'other'" };
    }

    if (!patient.primaryCondition || patient.primaryCondition.trim() === '') {
      return { valid: false, error: "Patient primary condition is required in clinical mode" };
    }
  }

  // Research mode accepts optional or missing patient data
  return { valid: true };
}

/**
 * Determine veto status based on agent outputs.
 */
export function determineVeto(
  safetyOutput: PatientSafetyAgentOutput,
  trialQuality: any,
  statistics: any,
  mode: AnalysisMode
): VetoStatus {
  const objections: Objection[] = [];

  // Research mode suppresses vetoes
  if (mode === 'research') {
    // Collect objections but don't veto
    if (safetyOutput.safetyTier === 'contraindicated' || safetyOutput.safetyTier === 'not-recommended') {
      objections.push({
        source: 'safety',
        severity: 'warning',
        message: `Safety tier: ${safetyOutput.safetyTier}`,
        details: safetyOutput.plainLanguageSummary
      });
    }
    return { type: 'none', reason: 'Research mode - vetoes suppressed', objections };
  }

  // Hard veto for contraindicated
  if (safetyOutput.safetyTier === 'contraindicated') {
    objections.push({
      source: 'safety',
      severity: 'critical',
      message: 'Patient has contraindications for this intervention',
      details: safetyOutput.plainLanguageSummary
    });
    return {
      type: 'hard',
      reason: 'Explicit contraindications detected',
      objections
    };
  }

  // Soft veto for not-recommended
  if (safetyOutput.safetyTier === 'not-recommended') {
    objections.push({
      source: 'safety',
      severity: 'warning',
      message: 'Significant demographic gaps or concerning evidence patterns',
      details: safetyOutput.plainLanguageSummary
    });
    return {
      type: 'soft',
      reason: 'Significant safety concerns require justification',
      objections
    };
  }

  // Collect quality objections
  if (trialQuality.summary?.overallBiasRisk === 'high') {
    objections.push({
      source: 'quality',
      severity: 'warning',
      message: 'High overall bias risk in studies',
      details: `RCT count: ${trialQuality.summary.rctCount}, Observational: ${trialQuality.summary.observationalCount}`
    });
  }

  // Collect statistics objections
  if (statistics.statisticalStrength < 0.5) {
    objections.push({
      source: 'statistics',
      severity: 'warning',
      message: 'Weak statistical evidence',
      details: statistics.explanation
    });
  }

  return { type: 'none', reason: 'No veto triggered', objections };
}

/**
 * Run full pipeline: fetch papers → literature rank → trial quality + statistics + patient safety (parallel) → synthesis.
 * Response shape matches what the frontend expects for agent tabs, confidence bars, and expandable content.
 * 
 * @param query - The clinical query
 * @param mode - Analysis mode: 'clinical' (strict safety) or 'research' (informational)
 * @param patient - Patient profile (required for clinical mode)
 */
export async function runAnalyzePipeline(
  query: string, 
  mode: AnalysisMode = 'research',
  patient?: PatientProfile
): Promise<AnalyzeResponse> {
  // Validate request
  const validation = validateRequest(mode, patient);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Fetch and rank papers
  const papers = await fetchPapers(query);
  const literature = literatureAgent(query, papers);
  const rankedPapers = literature.rankedPapers.map((r) => r.paper);

  // Run quality and statistics agents in parallel
  const [trialQuality, statistics] = await Promise.all([
    trialQualityAgent(rankedPapers),
    statisticsAgent(rankedPapers, query),
  ]);

  // Run patient safety agent (requires patient profile)
  let patientSafety: PatientSafetyAgentOutput;
  if (patient) {
    patientSafety = await patientSafetyAgent(rankedPapers, query, patient, mode);
  } else {
    // Fallback for research mode without patient data
    patientSafety = {
      safetyTier: 'safe',
      clinicalAlerts: [{
        severity: 'info',
        message: 'No patient profile provided - general analysis only',
        citations: [],
        category: 'demographic'
      }],
      exclusionMatches: [],
      demographicGaps: [],
      alternativeOptions: [],
      plainLanguageSummary: 'No patient-specific safety analysis performed.',
      questionsForClinician: ['Would patient-specific analysis be beneficial?']
    };
  }

  // Keep legacy patientMatch for backwards compatibility
  const patientMatch = patientMatchAgent(rankedPapers, query, patient as PatientParams);

  // Determine veto status
  const vetoStatus = determineVeto(patientSafety, trialQuality, statistics, mode);

  // Run synthesis with veto status
  const synthesis = await synthesisAgent(
    query, 
    rankedPapers, 
    literature, 
    trialQuality, 
    statistics, 
    patientMatch,
    vetoStatus
  );

  return {
    query,
    mode,
    papers: rankedPapers,
    literature,
    trialQuality,
    statistics,
    patientMatch,
    patientSafety,
    synthesis,
    vetoStatus,
  };
}
