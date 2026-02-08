/** Normalized paper from any source (PubMed, OpenAlex). */
export interface NormalizedPaper {
  id: string;
  title: string;
  abstract: string;
  year: number | null;
  journal: string | null;
  studyType: string;
  source: "pubmed" | "openalex";
  doi?: string;
  pmid?: string;
  url?: string;
}

/** Optional patient context for patient-match agent (legacy). */
export interface PatientParams {
  ageRange?: { min?: number; max?: number };
  sex?: string;
  condition?: string;
  comorbidities?: string[];
}

/** Analysis mode: clinical requires complete patient profile and enforces safety checks. */
export type AnalysisMode = 'clinical' | 'research';

/** Safety tier classification for recommendations. */
export type SafetyTier = 'safe' | 'caution' | 'not-recommended' | 'contraindicated';

/** Required patient profile for clinical mode. */
export interface PatientProfile {
  // Required fields in clinical mode
  age: number;
  sex: 'male' | 'female' | 'other';
  primaryCondition: string;
  
  // Optional fields
  comorbidities?: string[];
  medications?: string[];
}

/** Clinical alert about safety concerns. */
export interface ClinicalAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  citations: string[];  // Paper IDs or titles
  category: 'contraindication' | 'exclusion' | 'demographic' | 'interaction';
}

/** Exclusion criterion match from studies. */
export interface ExclusionMatch {
  criterion: string;  // The exclusion criterion from the study
  patientMatch: string;  // How the patient matches this criterion
  paperId: string;
  severity: 'absolute' | 'relative';
}

/** Demographic gap between patient and study populations. */
export interface DemographicGap {
  type: 'age' | 'sex' | 'comorbidity' | 'geographic';
  patientValue: string | number;
  studyValue: string | number;
  severity: 'minor' | 'moderate' | 'severe';
  explanation: string;
  impact: string;  // How this gap affects applicability
}

/** Objection from an agent about evidence quality or safety. */
export interface Objection {
  source: 'safety' | 'quality' | 'statistics';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details?: string;
}

/** Veto status from safety analysis. */
export interface VetoStatus {
  type: 'none' | 'soft' | 'hard';
  reason: string;
  objections: Objection[];
}

/** Literature agent: ranked papers. */
export interface LiteratureAgentOutput {
  rankedPapers: Array<{ paper: NormalizedPaper; relevanceScore: number; reason?: string }>;
  totalCount: number;
}

/** Trial-quality agent: per-paper assessment. */
export interface TrialQualityAssessment {
  studyDesign: string;
  biasRisk: "low" | "moderate" | "high";
  confidenceScore: number;
  sampleSizeAdequate: boolean;
  internalValidityNotes?: string;
}

export interface TrialQualityAgentOutput {
  assessments: Array<{ paperId: string; assessment: TrialQualityAssessment }>;
  summary: { rctCount: number; observationalCount: number; metaAnalysisCount: number; overallBiasRisk: string; totalSampleSize?: number };
}

/** Statistics agent: plain-language + strength score. */
export interface StatisticsAgentOutput {
  explanation: string;
  statisticalStrength: number;
  outcomeComparisons?: Array<{ label: string; value: string; bar: number }>;
}

/** Patient-match agent: match score and mismatch reasons (legacy). */
export interface PatientMatchAgentOutput {
  matchScore: number;
  mismatchReasons: string[];
  plainLanguageSummary?: string;
  questionsForDoctor?: string[];
}

/** Patient safety agent: contraindication detection and safety analysis. */
export interface PatientSafetyAgentOutput {
  safetyTier: SafetyTier;
  clinicalAlerts: ClinicalAlert[];
  exclusionMatches: ExclusionMatch[];
  demographicGaps: DemographicGap[];
  alternativeOptions: string[];
  plainLanguageSummary: string;
  questionsForClinician: string[];
}

/** Synthesis agent: final recommendation and conflicts. */
export interface SynthesisAgentOutput {
  summary: string;
  overallConfidence: number;
  disagreementLevel: number;
  clinicalReadiness: number;
  conflictingEvidence?: string;
  keyFindings: string[];
  keyCitations: string[];
  
  // New fields for safety-first mode
  clinicianSummary: string;  // Technical summary for clinicians
  patientExplanation: string;  // Plain language for patients
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
}

/** Full analyze API response for frontend. */
export interface AnalyzeResponse {
  query: string;
  mode: AnalysisMode;
  papers: NormalizedPaper[];
  literature: LiteratureAgentOutput;
  trialQuality: TrialQualityAgentOutput;
  statistics: StatisticsAgentOutput;
  patientMatch: PatientMatchAgentOutput;  // Legacy
  patientSafety: PatientSafetyAgentOutput;  // New safety-first
  synthesis: SynthesisAgentOutput;
  vetoStatus: VetoStatus;
}

export interface AnalyzeRequestBody {
  query: string;
  mode: AnalysisMode;
  patient?: PatientProfile;  // Required if mode === 'clinical'
}
