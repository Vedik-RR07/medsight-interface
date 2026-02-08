/**
 * Backend API base URL. Frontend only talks to the backend; keys stay server-side.
 */
const API_BASE = "http://localhost:3001";

// Analysis mode types
export type AnalysisMode = 'clinical' | 'research';
export type SafetyTier = 'safe' | 'caution' | 'not-recommended' | 'contraindicated';

// Legacy patient params (for backwards compatibility)
export interface PatientParams {
  ageRange?: { min?: number; max?: number };
  sex?: string;
  condition?: string;
  comorbidities?: string[];
}

// New patient profile for clinical mode
export interface PatientProfile {
  age: number;
  sex: 'male' | 'female' | 'other';
  primaryCondition: string;
  comorbidities?: string[];
  medications?: string[];
}

// Safety-first types
export interface ClinicalAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  citations: string[];
  category: 'contraindication' | 'exclusion' | 'demographic' | 'interaction';
}

export interface ExclusionMatch {
  criterion: string;
  patientMatch: string;
  paperId: string;
  severity: 'absolute' | 'relative';
}

export interface DemographicGap {
  type: 'age' | 'sex' | 'comorbidity' | 'geographic';
  patientValue: string | number;
  studyValue: string | number;
  severity: 'minor' | 'moderate' | 'severe';
  explanation: string;
  impact: string;
}

export interface Objection {
  source: 'safety' | 'quality' | 'statistics';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details?: string;
}

export interface VetoStatus {
  type: 'none' | 'soft' | 'hard';
  reason: string;
  objections: Objection[];
}

export interface PatientSafetyAgentOutput {
  safetyTier: SafetyTier;
  clinicalAlerts: ClinicalAlert[];
  exclusionMatches: ExclusionMatch[];
  demographicGaps: DemographicGap[];
  alternativeOptions: string[];
  plainLanguageSummary: string;
  questionsForClinician: string[];
}

export interface AnalyzeRequestBody {
  query: string;
  mode: AnalysisMode;
  patient?: PatientProfile;
}

export interface NormalizedPaper {
  id: string;
  title: string;
  abstract: string;
  year: number | null;
  journal: string | null;
  studyType: string;
  source: string;
  doi?: string;
  pmid?: string;
  url?: string;
}

/** Mirrors backend AnalyzeResponse for type-safe rendering. */
export interface AnalyzeResponse {
  query: string;
  mode: AnalysisMode;
  papers: NormalizedPaper[];
  literature: {
    rankedPapers: Array<{ paper: NormalizedPaper; relevanceScore: number; reason?: string }>;
    totalCount: number;
  };
  trialQuality: {
    assessments: Array<{
      paperId: string;
      assessment: {
        studyDesign: string;
        biasRisk: "low" | "moderate" | "high";
        confidenceScore: number;
        sampleSizeAdequate: boolean;
        internalValidityNotes?: string;
      };
    }>;
    summary: {
      rctCount: number;
      observationalCount: number;
      metaAnalysisCount: number;
      overallBiasRisk: string;
      totalSampleSize?: number;
    };
  };
  statistics: {
    explanation: string;
    statisticalStrength: number;
    outcomeComparisons?: Array<{ label: string; value: string; bar: number }>;
  };
  patientMatch: {
    matchScore: number;
    mismatchReasons: string[];
    plainLanguageSummary?: string;
    questionsForDoctor?: string[];
  };
  patientSafety: PatientSafetyAgentOutput;
  synthesis: {
    summary: string;
    overallConfidence: number;
    disagreementLevel: number;
    clinicalReadiness: number;
    conflictingEvidence?: string;
    keyFindings: string[];
    keyCitations: string[];
    // New safety-first fields
    clinicianSummary: string;
    patientExplanation: string;
    supportingEvidence: string[];
    contradictingEvidence: string[];
    objectionResponses: Array<{
      objection: string;
      response: string;
    }>;
    confidenceJustification: string;
    biasAndUncertainty: string;
    vetoApplied: boolean;
    vetoReason?: string;
  };
  vetoStatus: VetoStatus;
}

export async function analyzeSearch(body: AnalyzeRequestBody): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Analysis failed");
  }
  return res.json() as Promise<AnalyzeResponse>;
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend not healthy");
  return res.json() as Promise<{ status: string }>;
}
