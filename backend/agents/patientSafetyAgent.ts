import type { 
  NormalizedPaper, 
  PatientProfile, 
  PatientSafetyAgentOutput,
  SafetyTier,
  ClinicalAlert,
  ExclusionMatch,
  DemographicGap,
  AnalysisMode
} from "../types.js";
import { generateText } from "../services/gemini.js";

/**
 * Patient Safety Agent: Scan literature for contraindications, exclusion criteria, and demographic gaps.
 * Assigns safety tier and generates clinical alerts for patient-specific safety analysis.
 */
export async function patientSafetyAgent(
  papers: NormalizedPaper[],
  query: string,
  patient: PatientProfile,
  mode: AnalysisMode
): Promise<PatientSafetyAgentOutput> {
  // If no papers, return safe with informational message
  if (papers.length === 0) {
    return {
      safetyTier: 'safe',
      clinicalAlerts: [{
        severity: 'info',
        message: 'No papers available for safety analysis',
        citations: [],
        category: 'demographic'
      }],
      exclusionMatches: [],
      demographicGaps: [],
      alternativeOptions: [],
      plainLanguageSummary: 'No literature available to assess safety for this patient.',
      questionsForClinician: ['Should alternative sources be consulted?']
    };
  }

  // Prepare paper summaries for LLM analysis
  const paperSummaries = papers.slice(0, 10).map(p => ({
    id: p.id,
    title: p.title,
    abstract: p.abstract || 'No abstract available',
    year: p.year
  }));

  const prompt = `You are a medical safety expert analyzing research papers for patient-specific contraindications and safety concerns.

PATIENT PROFILE:
- Age: ${patient.age} years
- Sex: ${patient.sex}
- Primary Condition: ${patient.primaryCondition}
${patient.comorbidities?.length ? `- Comorbidities: ${patient.comorbidities.join(', ')}` : ''}
${patient.medications?.length ? `- Medications: ${patient.medications.join(', ')}` : ''}

QUERY: ${query}

PAPERS TO ANALYZE:
${paperSummaries.map((p, i) => `
Paper ${i + 1} (ID: ${p.id}):
Title: ${p.title}
Abstract: ${p.abstract.substring(0, 500)}...
`).join('\n')}

TASK: Analyze these papers for patient safety concerns. Identify:

1. CONTRAINDICATIONS: Explicit contraindications or exclusion criteria that match this patient
2. DEMOGRAPHIC GAPS: Differences between patient and study populations (age, sex, comorbidities)
3. SAFETY CONCERNS: Any warnings, adverse events, or safety signals relevant to this patient

Provide your analysis in JSON format:

{
  "contraindications": [
    {
      "criterion": "string - the exclusion criterion",
      "patientMatch": "string - how patient matches",
      "paperId": "string - paper ID",
      "severity": "absolute" or "relative"
    }
  ],
  "demographicGaps": [
    {
      "type": "age" | "sex" | "comorbidity" | "geographic",
      "patientValue": "string or number",
      "studyValue": "string or number",
      "severity": "minor" | "moderate" | "severe",
      "explanation": "string",
      "impact": "string"
    }
  ],
  "clinicalAlerts": [
    {
      "severity": "info" | "warning" | "critical",
      "message": "string",
      "citations": ["paper IDs"],
      "category": "contraindication" | "exclusion" | "demographic" | "interaction"
    }
  ],
  "safetyTier": "safe" | "caution" | "not-recommended" | "contraindicated",
  "plainLanguageSummary": "string - plain language summary for clinician",
  "questionsForClinician": ["array of questions"],
  "alternativeOptions": ["array of alternative approaches if unsafe"]
}

SAFETY TIER GUIDELINES:
- "contraindicated": Explicit contraindications match patient
- "not-recommended": Severe demographic gaps (age >20 years, sex <20% representation)
- "caution": Moderate gaps (age 10-20 years, sex 20-40% representation)
- "safe": No significant concerns`;

  try {
    const response = await generateText(prompt);
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Map to our types
    const exclusionMatches: ExclusionMatch[] = (analysis.contraindications || []).map((c: any) => ({
      criterion: c.criterion,
      patientMatch: c.patientMatch,
      paperId: c.paperId,
      severity: c.severity
    }));

    const demographicGaps: DemographicGap[] = (analysis.demographicGaps || []).map((g: any) => ({
      type: g.type,
      patientValue: g.patientValue,
      studyValue: g.studyValue,
      severity: g.severity,
      explanation: g.explanation,
      impact: g.impact
    }));

    const clinicalAlerts: ClinicalAlert[] = (analysis.clinicalAlerts || []).map((a: any) => ({
      severity: a.severity,
      message: a.message,
      citations: a.citations || [],
      category: a.category
    }));

    const safetyTier: SafetyTier = analysis.safetyTier || 'safe';
    
    return {
      safetyTier,
      clinicalAlerts,
      exclusionMatches,
      demographicGaps,
      alternativeOptions: analysis.alternativeOptions || [],
      plainLanguageSummary: analysis.plainLanguageSummary || 'Safety analysis completed.',
      questionsForClinician: analysis.questionsForClinician || []
    };

  } catch (error) {
    console.error('PatientSafetyAgent LLM error:', error);
    
    // Fallback: Basic rule-based safety analysis
    return performBasicSafetyAnalysis(papers, patient, query);
  }
}

/**
 * Fallback basic safety analysis when LLM fails
 */
function performBasicSafetyAnalysis(
  papers: NormalizedPaper[],
  patient: PatientProfile,
  query: string
): PatientSafetyAgentOutput {
  const clinicalAlerts: ClinicalAlert[] = [];
  const demographicGaps: DemographicGap[] = [];
  const exclusionMatches: ExclusionMatch[] = [];
  
  const text = papers.map(p => `${p.title} ${p.abstract}`.toLowerCase()).join(' ');
  
  // Check for age-related concerns
  if (patient.age < 18) {
    if (!text.includes('pediatric') && !text.includes('children') && !text.includes('adolescent')) {
      demographicGaps.push({
        type: 'age',
        patientValue: patient.age,
        studyValue: 'Adult populations',
        severity: 'severe',
        explanation: 'Studies primarily focus on adult populations',
        impact: 'Evidence may not apply to pediatric patients'
      });
      clinicalAlerts.push({
        severity: 'warning',
        message: 'Limited pediatric data available',
        citations: [],
        category: 'demographic'
      });
    }
  } else if (patient.age >= 65) {
    if (!text.includes('elderly') && !text.includes('geriatric') && !text.includes('older adult')) {
      demographicGaps.push({
        type: 'age',
        patientValue: patient.age,
        studyValue: 'Younger adult populations',
        severity: 'moderate',
        explanation: 'Studies may underrepresent older adults',
        impact: 'Outcomes may differ in elderly population'
      });
      clinicalAlerts.push({
        severity: 'info',
        message: 'Consider age-specific evidence for older adults',
        citations: [],
        category: 'demographic'
      });
    }
  }
  
  // Check for sex representation
  const hasMaleStudies = text.includes('male') || text.includes('men');
  const hasFemaleStudies = text.includes('female') || text.includes('women');
  
  if (patient.sex === 'female' && hasMaleStudies && !hasFemaleStudies) {
    demographicGaps.push({
      type: 'sex',
      patientValue: 'female',
      studyValue: 'Predominantly male',
      severity: 'moderate',
      explanation: 'Studies may have limited female representation',
      impact: 'Sex-specific outcomes may differ'
    });
  } else if (patient.sex === 'male' && hasFemaleStudies && !hasMaleStudies) {
    demographicGaps.push({
      type: 'sex',
      patientValue: 'male',
      studyValue: 'Predominantly female',
      severity: 'moderate',
      explanation: 'Studies may have limited male representation',
      impact: 'Sex-specific outcomes may differ'
    });
  }
  
  // Determine safety tier
  let safetyTier: SafetyTier = 'safe';
  
  if (exclusionMatches.some(e => e.severity === 'absolute')) {
    safetyTier = 'contraindicated';
  } else if (demographicGaps.some(g => g.severity === 'severe')) {
    safetyTier = 'not-recommended';
  } else if (demographicGaps.some(g => g.severity === 'moderate') || clinicalAlerts.some(a => a.severity === 'warning')) {
    safetyTier = 'caution';
  }
  
  return {
    safetyTier,
    clinicalAlerts: clinicalAlerts.length > 0 ? clinicalAlerts : [{
      severity: 'info',
      message: 'Basic safety analysis completed (LLM unavailable)',
      citations: [],
      category: 'demographic'
    }],
    exclusionMatches,
    demographicGaps,
    alternativeOptions: safetyTier === 'contraindicated' || safetyTier === 'not-recommended' 
      ? ['Consult specialist for patient-specific guidance', 'Consider alternative interventions']
      : [],
    plainLanguageSummary: `Safety analysis for ${patient.age}-year-old ${patient.sex} patient with ${patient.primaryCondition}. ${
      safetyTier === 'safe' ? 'No major safety concerns identified.' :
      safetyTier === 'caution' ? 'Some demographic differences noted - discuss with clinician.' :
      safetyTier === 'not-recommended' ? 'Significant demographic gaps - evidence may not apply.' :
      'Contraindications detected - do not proceed without specialist consultation.'
    }`,
    questionsForClinician: [
      'How well do these studies represent my patient population?',
      'Are there patient-specific factors that affect applicability?',
      'Should we seek additional evidence or specialist consultation?'
    ]
  };
}
