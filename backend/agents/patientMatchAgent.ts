import type { NormalizedPaper } from "../types.js";
import type { PatientParams } from "../types.js";
import type { PatientMatchAgentOutput } from "../types.js";

/**
 * Patient-Match Agent: compare study populations to optional patient profile.
 * Returns match score 0–1 and mismatch reasons. Future-proof for full UI.
 */
export function patientMatchAgent(
  papers: NormalizedPaper[],
  _query: string,
  patient?: PatientParams
): PatientMatchAgentOutput {
  const mismatchReasons: string[] = [];
  if (!patient || (!patient.ageRange && !patient.sex && !patient.condition && !patient.comorbidities?.length)) {
    return {
      matchScore: 0.75,
      mismatchReasons: ["No patient parameters provided; assuming general adult population."],
      plainLanguageSummary: "Research summaries are general. For personalized relevance, add age, sex, condition, or comorbidities.",
      questionsForDoctor: [
        "Does this evidence apply to my age group and condition?",
        "Are there studies that match my specific situation?",
      ],
    };
  }

  let matchScore = 1;
  const text = papers.map((p) => `${p.title} ${p.abstract}`).join(" ").toLowerCase();

  if (patient.ageRange) {
    const hasPediatric = text.includes("pediatric") || text.includes("children") || text.includes("adolescent");
    const hasGeriatric = text.includes("elderly") || text.includes("older adults") || text.includes("geriatric");
    const hasAdult = text.includes("adult") || text.includes("middle-aged");
    const wantPediatric = (patient.ageRange.max ?? 0) < 18;
    const wantGeriatric = (patient.ageRange.min ?? 0) >= 65;
    if (wantPediatric && !hasPediatric) {
      mismatchReasons.push("Limited data for pediatric population.");
      matchScore -= 0.2;
    }
    if (wantGeriatric && !hasGeriatric && !hasAdult) {
      mismatchReasons.push("Limited data for older adults.");
      matchScore -= 0.15;
    }
  }

  if (patient.condition && !text.includes(patient.condition.toLowerCase().slice(0, 20))) {
    mismatchReasons.push(`Study populations may not specifically address ${patient.condition}.`);
    matchScore -= 0.1;
  }

  if (patient.comorbidities?.length) {
    const mentioned = patient.comorbidities.filter((c) => text.includes(c.toLowerCase()));
    if (mentioned.length < patient.comorbidities.length) {
      mismatchReasons.push("Comorbidity-specific evidence may be limited.");
      matchScore -= 0.1;
    }
  }

  matchScore = Math.max(0, Math.min(1, matchScore));
  return {
    matchScore,
    mismatchReasons: mismatchReasons.length ? mismatchReasons : ["Study populations align reasonably with provided profile."],
    plainLanguageSummary: "Consider discussing with your doctor how well the study populations match your situation.",
    questionsForDoctor: [
      "Do these studies include people like me in terms of age and condition?",
      "Are there known differences in outcomes for my demographic?",
    ],
  };
}
