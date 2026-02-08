import { useEffect, useState } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Download, AlertTriangle, CheckCircle, BookOpen, FlaskConical, BarChart3, Heart, ShieldCheck, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from "@/components/Navbar";
import AgentSidebar from "@/components/AgentSidebar";
import ConfidenceBar from "@/components/ConfidenceBar";
import GlassCard from "@/components/GlassCard";
import { SafetyBanner } from "@/components/SafetyBanner";
import { ClinicalAlerts } from "@/components/ClinicalAlerts";
import { DemographicGapsDisplay } from "@/components/DemographicGapsDisplay";
import { PatientExplanation } from "@/components/PatientExplanation";
import { AlternativeOptions } from "@/components/AlternativeOptions";
import { analyzeSearch, type AnalyzeResponse } from "@/lib/api";

const agentTitles: Record<string, string> = {
  research: "Research Analysis",
  "trial-quality": "Trial Quality Assessment",
  statistics: "Statistical Analysis",
  "patient-match": "Patient Care Summary",
  ethics: "Ethics & Bias Analysis",
};

const Results = () => {
  const { agentId = "research" } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryFromUrl = searchParams.get("q") || "";
  const query = queryFromUrl || "Run a search from the Dashboard to see analysis.";
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>((location.state as { analysis?: AnalyzeResponse } | null)?.analysis ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysis != null) return;
    if (!queryFromUrl) return;
    setError(null);
    setLoading(true);
    analyzeSearch({ query: queryFromUrl })
      .then(setAnalysis)
      .catch((e) => setError(e instanceof Error ? e.message : "Analysis failed"))
      .finally(() => setLoading(false));
  }, [queryFromUrl, analysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <AgentSidebar />
          <main className="flex-1 p-8 overflow-auto flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Agents are analyzing…</p>
              <p className="text-sm text-muted-foreground mt-1">Fetching papers, assessing quality, and synthesizing evidence.</p>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  if (error || (!analysis && queryFromUrl)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <AgentSidebar />
          <main className="flex-1 p-8 overflow-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <p className="text-destructive mb-2">{error ?? "No analysis data."}</p>
              <Link to="/dashboard" className="text-primary hover:underline">Return to Dashboard to run a search</Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <AgentSidebar />
          <main className="flex-1 p-8 overflow-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <p className="text-muted-foreground mb-2">No search query. Run a search from the Dashboard to see agent analysis.</p>
              <Link to="/dashboard" className="text-primary hover:underline">Go to Dashboard</Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const s = analysis.synthesis;
  const lit = analysis.literature;
  const tq = analysis.trialQuality;
  const stats = analysis.statistics;
  const pm = analysis.patientMatch;
  const safety = analysis.patientSafety;
  const veto = analysis.vetoStatus;

  // Determine if recommendation should be suppressed
  const isSuppressed = safety.safetyTier === 'contraindicated' || safety.safetyTier === 'not-recommended';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <AgentSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition">
              <ArrowLeft className="w-4 h-4" /> Return to Overview
            </Link>

            <motion.div
              key={agentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {agentId === "research" ? (
                <>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    {agentTitles[agentId] || "Analysis"}
                  </h1>
                  <p className="text-muted-foreground mb-4">{analysis.query}</p>
                  
                  {/* Display selected mode */}
                  <div className="mb-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      analysis.mode === 'clinical' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {analysis.mode === 'clinical' ? '🏥 Clinical Mode' : '🔬 Research Mode'}
                    </span>
                  </div>

                  {/* Safety-First Components - Always displayed first */}
                  <SafetyBanner 
                    safetyTier={safety.safetyTier} 
                    summary={safety.plainLanguageSummary} 
                  />

                  {safety.clinicalAlerts.length > 0 && (
                    <ClinicalAlerts alerts={safety.clinicalAlerts} />
                  )}

                  {safety.demographicGaps.length > 0 && (
                    <DemographicGapsDisplay gaps={safety.demographicGaps} />
                  )}

                  {safety.alternativeOptions.length > 0 && (
                    <AlternativeOptions alternatives={safety.alternativeOptions} />
                  )}

                  {s.patientExplanation && (
                    <PatientExplanation explanation={s.patientExplanation} />
                  )}

                  {/* Recommendation Section - Conditionally rendered based on safety tier */}
                  {isSuppressed ? (
                    <GlassCard className="mb-6 bg-red-50 border-red-300">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="text-red-600" size={24} />
                        <h2 className="font-display text-lg font-bold text-red-900">
                          Recommendation Withheld Due to Safety Concerns
                        </h2>
                      </div>
                      <p className="text-red-800 mb-4">
                        {s.vetoReason || 'This intervention is not recommended for this patient based on safety analysis.'}
                      </p>
                      {veto.objections.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <h3 className="font-semibold text-red-900 mb-2">Safety Objections:</h3>
                          <ul className="space-y-2">
                            {veto.objections.map((obj, i) => (
                              <li key={i} className="text-sm text-red-800">
                                <span className="font-medium">[{obj.source}]</span> {obj.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </GlassCard>
                  ) : (
                    <GlassCard className={`mb-6 ${safety.safetyTier === 'not-recommended' ? 'border-orange-300 bg-orange-50' : ''}`}>
                      <h2 className="font-display text-lg font-bold text-foreground mb-5">
                        {safety.safetyTier === 'not-recommended' ? '⚠️ ' : ''}Evidence Summary
                      </h2>
                      <div className="space-y-4">
                        <ConfidenceBar label="Overall Confidence" value={s.overallConfidence} icon="🟡" />
                        <ConfidenceBar label="Disagreement Level" value={s.disagreementLevel} icon="🔴" />
                        <ConfidenceBar label="Clinical Readiness" value={s.clinicalReadiness} icon="🔺" />
                      </div>
                      
                      {/* Confidence Justification */}
                      {s.confidenceJustification && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h3 className="text-sm font-semibold text-foreground mb-2">Confidence Justification</h3>
                          <p className="text-sm text-muted-foreground">{s.confidenceJustification}</p>
                        </div>
                      )}
                      
                      {/* Bias and Uncertainty */}
                      {s.biasAndUncertainty && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h3 className="text-sm font-semibold text-foreground mb-2">Bias & Uncertainty</h3>
                          <p className="text-sm text-muted-foreground">{s.biasAndUncertainty}</p>
                        </div>
                      )}
                      
                      {/* Objection Responses */}
                      {s.objectionResponses && s.objectionResponses.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h3 className="text-sm font-semibold text-foreground mb-3">Addressing Concerns</h3>
                          <div className="space-y-3">
                            {s.objectionResponses.map((resp, i) => (
                              <div key={i} className="bg-muted/30 p-3 rounded-lg">
                                <p className="text-sm font-medium text-foreground mb-1">
                                  <AlertTriangle className="inline w-3 h-3 mr-1" />
                                  {resp.objection}
                                </p>
                                <p className="text-sm text-muted-foreground">{resp.response}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  )}

                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <GlassCard>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <h3 className="font-display font-semibold text-sm text-foreground">Research Agent</h3>
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{lit.totalCount}</div>
                      <p className="text-xs text-muted-foreground mb-3">• Ranked by relevance</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{lit.rankedPapers[0]?.paper.title ?? "—"}</p>
                      <Link to="/results/research" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1">
                        View Papers →
                      </Link>
                    </GlassCard>
                    <GlassCard>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="w-4 h-4 text-confidence-medium" />
                        <h3 className="font-display font-semibold text-sm text-foreground">Trial Quality Agent</h3>
                      </div>
                      <div className="mb-2">
                        <span className="text-foreground font-bold">RCTs: </span>
                        <span className="text-2xl font-bold text-foreground">{tq.summary.rctCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">• Observational: {tq.summary.observationalCount}</p>
                      <p className="text-xs text-muted-foreground">• Bias Risk: <span className="text-confidence-medium">{tq.summary.overallBiasRisk}</span></p>
                      <Link to="/results/trial-quality" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1">
                        Review Trials →
                      </Link>
                    </GlassCard>
                    <GlassCard>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-secondary" />
                        <h3 className="font-display font-semibold text-sm text-foreground">Statistics Agent</h3>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-2">Strength: {(stats.statisticalStrength * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{stats.explanation}</p>
                      <Link to="/results/statistics" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1">
                        Learn More →
                      </Link>
                    </GlassCard>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/results/research" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Overview
                  </Link>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    {agentTitles[agentId] || "Analysis"}
                  </h1>
                  <p className="text-muted-foreground mb-4">{analysis.query}</p>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      analysis.mode === 'clinical' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {analysis.mode === 'clinical' ? '🏥 Clinical Mode' : '🔬 Research Mode'}
                    </span>
                  </div>
                </>
              )}

              {agentId === "research" && <ResearchContent analysis={analysis} />}
              {agentId === "trial-quality" && <TrialQualityContent analysis={analysis} />}
              {agentId === "statistics" && <StatisticsContent analysis={analysis} />}
              {agentId === "patient-match" && <PatientCareContent analysis={analysis} />}
              {agentId === "ethics" && <EthicsContent />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

function ResearchContent({ analysis }: { analysis: AnalyzeResponse }) {
  const s = analysis.synthesis;
  const lit = analysis.literature;
  return (
    <GlassCard className="space-y-4">
      <h3 className="font-display font-bold text-foreground">Key Findings</h3>
      <ul className="space-y-3">
        {s.keyFindings.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
            <CheckCircle className="w-4 h-4 text-confidence-high mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      {s.conflictingEvidence && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-confidence-medium" />
            <span className="text-sm font-medium text-foreground">Conflicting Evidence Found</span>
          </div>
          <p className="text-sm text-muted-foreground">{s.conflictingEvidence}</p>
        </div>
      )}
      <div className="pt-3">
        <h4 className="text-sm font-medium text-foreground mb-2">Key Citations</h4>
        <div className="space-y-2">
          {s.keyCitations.map((cite, i) => (
            <a key={i} href="#" className="flex items-center gap-2 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> {cite}
            </a>
          ))}
        </div>
      </div>
      <div className="pt-3 border-t border-border/50">
        <h4 className="text-sm font-medium text-foreground mb-2">Ranked Papers ({lit.totalCount})</h4>
        <ul className="space-y-2">
          {lit.rankedPapers.slice(0, 5).map((r) => (
            <li key={r.paper.id} className="text-sm">
              <a href={r.paper.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{r.paper.title}</a>
              <span className="text-muted-foreground text-xs ml-2">({(r.relevanceScore * 100).toFixed(0)}% relevance)</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

function TrialQualityContent({ analysis }: { analysis: AnalyzeResponse }) {
  const tq = analysis.trialQuality;
  return (
    <GlassCard className="space-y-4">
      <h3 className="font-display font-bold text-foreground">Trial Quality Assessment</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground">Total RCTs</span>
          <div className="text-2xl font-bold text-foreground">{tq.summary.rctCount}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground">Observational</span>
          <div className="text-2xl font-bold text-foreground">{tq.summary.observationalCount}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground">Meta-analyses</span>
          <div className="text-2xl font-bold text-foreground">{tq.summary.metaAnalysisCount}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground">Bias Risk</span>
          <div className="text-2xl font-bold text-confidence-medium capitalize">{tq.summary.overallBiasRisk}</div>
        </div>
      </div>
      <h4 className="text-sm font-medium text-foreground mt-4">Per-paper assessment</h4>
      <ul className="space-y-2">
        {tq.assessments.map((a) => (
          <li key={a.paperId} className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{a.assessment.studyDesign}</span> — bias: {a.assessment.biasRisk}, confidence: {(a.assessment.confidenceScore * 100).toFixed(0)}%
            {a.assessment.internalValidityNotes && ` — ${a.assessment.internalValidityNotes}`}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function StatisticsContent({ analysis }: { analysis: AnalyzeResponse }) {
  const stats = analysis.statistics;
  const comparisons = stats.outcomeComparisons?.length ? stats.outcomeComparisons : [
    { label: "Statistical strength", value: `${(stats.statisticalStrength * 100).toFixed(0)}%`, bar: stats.statisticalStrength * 100 },
  ];
  const chartData = comparisons.map((item) => ({ name: item.label, value: item.bar }));
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-foreground">Outcome Comparisons</h3>
        <button type="button" className="text-xs text-primary flex items-center gap-1 hover:underline">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>
      <p className="text-sm text-foreground/80">{stats.explanation}</p>
      <div className="space-y-3">
        {comparisons.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground/80">{item.label}</span>
              <span className="text-foreground font-medium">{item.value}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, item.bar)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Trend Visualization</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function PatientCareContent({ analysis }: { analysis: AnalyzeResponse }) {
  const pm = analysis.patientMatch;
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-4 h-4 text-destructive" />
        <span className="text-xs font-medium text-destructive">⚠ Not Medical Advice</span>
      </div>
      <h3 className="font-display font-bold text-foreground">Plain-Language Summary</h3>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {pm.plainLanguageSummary ?? "Consider discussing with your doctor how well the study populations match your situation."}
      </p>
      {pm.mismatchReasons.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Match score: {(pm.matchScore * 100).toFixed(0)}%</span>
          <ul className="mt-1 list-disc list-inside">{pm.mismatchReasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}
      {pm.questionsForDoctor && pm.questionsForDoctor.length > 0 && (
        <div className="pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Questions You Might Ask Your Doctor</h4>
          <ul className="space-y-2">
            {pm.questionsForDoctor.map((q, i) => (
              <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                <span className="text-primary">•</span> {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}

const EthicsContent = () => (
  <GlassCard className="space-y-4">
    <h3 className="font-display font-bold text-foreground">Ethics & Bias Analysis</h3>
    <p className="text-sm text-muted-foreground">Ethics agent (bias, population representation) can be added in a future backend iteration. For now, consider the Trial Quality and Patient Match tabs for bias and applicability.</p>
    <div className="space-y-3">
      {[
        { level: "warning", text: "Consider limited representation of some populations in training data" },
        { level: "info", text: "Review trial quality and patient-match tabs for applicability" },
      ].map((item, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${item.level === "warning" ? "bg-confidence-medium/10" : "bg-muted/30"}`}>
          <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${item.level === "warning" ? "text-confidence-medium" : "text-muted-foreground"}`} />
          <span className="text-sm text-foreground/80">{item.text}</span>
        </div>
      ))}
    </div>
  </GlassCard>
);

export default Results;