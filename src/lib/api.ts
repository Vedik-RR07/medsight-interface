/**
 * Backend API base URL. Frontend only talks to the backend; keys stay server-side.
 */
const API_BASE = "http://localhost:3001";

export interface PatientParams {
  ageRange?: { min?: number; max?: number };
  sex?: string;
  condition?: string;
  comorbidities?: string[];
}

export interface AnalyzeRequestBody {
  query: string;
  patient?: PatientParams;
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
  synthesis: {
    summary: string;
    overallConfidence: number;
    disagreementLevel: number;
    clinicalReadiness: number;
    conflictingEvidence?: string;
    keyFindings: string[];
    keyCitations: string[];
  };
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
