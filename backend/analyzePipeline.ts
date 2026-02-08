import { fetchPapers } from "./services/paperSources.js";
import { literatureAgent } from "./agents/literatureAgent.js";
import { trialQualityAgent } from "./agents/trialQualityAgent.js";
import { statisticsAgent } from "./agents/statisticsAgent.js";
import { patientMatchAgent } from "./agents/patientMatchAgent.js";
import { synthesisAgent } from "./agents/synthesisAgent.js";
import type { AnalyzeResponse, PatientParams } from "./types.js";

/**
 * Run full pipeline: fetch papers → literature rank → trial quality + statistics + patient match (parallel) → synthesis.
 * Response shape matches what the frontend expects for agent tabs, confidence bars, and expandable content.
 */
export async function runAnalyzePipeline(query: string, patient?: PatientParams): Promise<AnalyzeResponse> {
  const papers = await fetchPapers(query);
  const literature = literatureAgent(query, papers);
  const rankedPapers = literature.rankedPapers.map((r) => r.paper);

  const [trialQuality, statistics, patientMatch] = await Promise.all([
    trialQualityAgent(rankedPapers),
    statisticsAgent(rankedPapers, query),
    Promise.resolve(patientMatchAgent(rankedPapers, query, patient)),
  ]);

  const synthesis = await synthesisAgent(query, rankedPapers, literature, trialQuality, statistics, patientMatch);

  return {
    query,
    papers: rankedPapers,
    literature,
    trialQuality,
    statistics,
    patientMatch,
    synthesis,
  };
}
