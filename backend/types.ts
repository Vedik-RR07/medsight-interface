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

/** Optional patient context for patient-match agent. */
export interface PatientParams {
  ageRange?: { min?: number; max?: number };
  sex?: string;
  condition?: string;
  comorbidities?: string[];
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

/** Patient-match agent: match score and mismatch reasons. */
export interface PatientMatchAgentOutput {
  matchScore: number;
  mismatchReasons: string[];
  plainLanguageSummary?: string;
  questionsForDoctor?: string[];
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
}

/** Full analyze API response for frontend. */
export interface AnalyzeResponse {
  query: string;
  papers: NormalizedPaper[];
  literature: LiteratureAgentOutput;
  trialQuality: TrialQualityAgentOutput;
  statistics: StatisticsAgentOutput;
  patientMatch: PatientMatchAgentOutput;
  synthesis: SynthesisAgentOutput;
}

export interface AnalyzeRequestBody {
  query: string;
  patient?: PatientParams;
}
