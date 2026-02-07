import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Download, AlertTriangle, CheckCircle, BookOpen, FlaskConical, BarChart3, Heart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AgentSidebar from "@/components/AgentSidebar";
import ConfidenceBar from "@/components/ConfidenceBar";
import GlassCard from "@/components/GlassCard";

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
  const query = searchParams.get("q") || "Is AI-based mammography effective for early breast cancer detection?";

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
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {agentTitles[agentId] || "Analysis"}
              </h1>
              <p className="text-muted-foreground mb-8">{query}</p>

              {/* Evidence Summary */}
              <GlassCard className="mb-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-5">Evidence Summary</h2>
                <div className="space-y-4">
                  <ConfidenceBar label="Overall Confidence" value={72} icon="🟡" variant="medium" />
                  <ConfidenceBar label="Disagreement Level" value={55} icon="🔴" variant="low" />
                  <ConfidenceBar label="Clinical Readiness" value={38} icon="🔺" variant="low" />
                </div>
              </GlassCard>

              {/* Agent Cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <GlassCard>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-semibold text-sm text-foreground">Research Agent</h3>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">12</div>
                  <p className="text-xs text-muted-foreground mb-3">• Moderate confidence</p>
                  <p className="text-xs text-muted-foreground">FDA bio mammography bouts calculate in early beam</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3" /> Comp Recertams
                  </div>
                  <Link to="/agents/research" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1">
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
                    <span className="text-2xl font-bold text-foreground">2</span>
                  </div>
                  <p className="text-xs text-muted-foreground">• Observational Studies: 8</p>
                  <p className="text-xs text-muted-foreground">• Bias Risk: <span className="text-confidence-medium">Moderate</span></p>
                  <Link to="/agents/trial-quality" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1">
                    Review Trials →
                  </Link>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-secondary" />
                    <h3 className="font-display font-semibold text-sm text-foreground">Statistics Agent</h3>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-2">Learn More</p>
                  <p className="text-xs text-muted-foreground">• Prevalence o N, 7HIBI; G113 TimeShift models</p>
                  <p className="text-xs text-muted-foreground">• Correct readliner G&N?</p>
                  <Link to="/agents/statistics" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1">
                    Learn More →
                  </Link>
                </GlassCard>
              </div>

              {/* Agent-specific content */}
              {agentId === "research" && <ResearchContent />}
              {agentId === "trial-quality" && <TrialQualityContent />}
              {agentId === "statistics" && <StatisticsContent />}
              {agentId === "patient-match" && <PatientCareContent />}
              {agentId === "ethics" && <EthicsContent />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

const ResearchContent = () => (
  <GlassCard className="space-y-4">
    <h3 className="font-display font-bold text-foreground">Key Findings</h3>
    <ul className="space-y-3">
      {[
        "AI-based mammography shows 11.5% improvement in cancer detection rate vs. standard double-reading",
        "Specificity comparable to radiologist-only reading (96.2% vs 96.6%)",
        "Most evidence from European screening populations; limited data for non-European cohorts",
        "False positive rates may increase by 2-4% depending on model calibration",
      ].map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
          <CheckCircle className="w-4 h-4 text-confidence-high mt-0.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
    <div className="pt-4 border-t border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-confidence-medium" />
        <span className="text-sm font-medium text-foreground">Conflicting Evidence Found</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Two studies report no statistically significant improvement when AI used as standalone reader vs. assist mode. Population differences may account for variance.
      </p>
    </div>
    <div className="pt-3">
      <h4 className="text-sm font-medium text-foreground mb-2">Key Citations</h4>
      <div className="space-y-2">
        {["Lancet Digital Health 2024; 6(1):e45-e57", "JAMA Oncol. 2023;9(10):1391–1399", "Nature Med. 2024;30:312-320"].map((cite, i) => (
          <a key={i} href="#" className="flex items-center gap-2 text-xs text-primary hover:underline">
            <ExternalLink className="w-3 h-3" /> {cite}
          </a>
        ))}
      </div>
    </div>
  </GlassCard>
);

const TrialQualityContent = () => (
  <GlassCard className="space-y-4">
    <h3 className="font-display font-bold text-foreground">Trial Quality Assessment</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-muted/30">
        <span className="text-xs text-muted-foreground">Total RCTs</span>
        <div className="text-2xl font-bold text-foreground">2</div>
      </div>
      <div className="p-4 rounded-lg bg-muted/30">
        <span className="text-xs text-muted-foreground">Observational</span>
        <div className="text-2xl font-bold text-foreground">8</div>
      </div>
      <div className="p-4 rounded-lg bg-muted/30">
        <span className="text-xs text-muted-foreground">Sample Size (total)</span>
        <div className="text-2xl font-bold text-foreground">580K</div>
      </div>
      <div className="p-4 rounded-lg bg-muted/30">
        <span className="text-xs text-muted-foreground">Bias Risk</span>
        <div className="text-2xl font-bold text-confidence-medium">Moderate</div>
      </div>
    </div>
  </GlassCard>
);

const StatisticsContent = () => (
  <GlassCard className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-display font-bold text-foreground">Outcome Comparisons</h3>
      <button className="text-xs text-primary flex items-center gap-1 hover:underline">
        <Download className="w-3 h-3" /> Export CSV
      </button>
    </div>
    <div className="space-y-3">
      {[
        { label: "Detection Rate (AI-assist)", value: "91.5%", bar: 91.5 },
        { label: "Detection Rate (Standard)", value: "80.0%", bar: 80 },
        { label: "Specificity (AI-assist)", value: "96.2%", bar: 96.2 },
        { label: "Specificity (Standard)", value: "96.6%", bar: 96.6 },
      ].map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground/80">{item.label}</span>
            <span className="text-foreground font-medium">{item.value}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${item.bar}%` }} />
          </div>
        </div>
      ))}
    </div>
  </GlassCard>
);

const PatientCareContent = () => (
  <GlassCard className="space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Heart className="w-4 h-4 text-destructive" />
      <span className="text-xs font-medium text-destructive">⚠ Not Medical Advice</span>
    </div>
    <h3 className="font-display font-bold text-foreground">Plain-Language Summary</h3>
    <p className="text-sm text-foreground/80 leading-relaxed">
      Research suggests that using AI to help read mammograms may catch more breast cancers earlier than traditional methods alone. The technology works alongside radiologists rather than replacing them.
    </p>
    <div className="pt-4">
      <h4 className="text-sm font-medium text-foreground mb-3">Questions You Might Ask Your Doctor</h4>
      <ul className="space-y-2">
        {[
          "Does my screening center use AI-assisted mammography?",
          "How does AI-assisted screening affect false positive rates?",
          "Is this technology validated for my demographic group?",
        ].map((q, i) => (
          <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
            <span className="text-primary">•</span> {q}
          </li>
        ))}
      </ul>
    </div>
  </GlassCard>
);

const EthicsContent = () => (
  <GlassCard className="space-y-4">
    <h3 className="font-display font-bold text-foreground">Ethics & Bias Analysis</h3>
    <div className="space-y-3">
      {[
        { level: "warning", text: "Limited representation of non-European populations in training data" },
        { level: "warning", text: "Potential socioeconomic bias in screening access studies" },
        { level: "info", text: "No significant gender bias detected in algorithm performance" },
        { level: "error", text: "Insufficient data on performance in dense breast tissue populations" },
      ].map((item, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
          item.level === "error" ? "bg-destructive/10" : item.level === "warning" ? "bg-confidence-medium/10" : "bg-muted/30"
        }`}>
          <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${
            item.level === "error" ? "text-destructive" : item.level === "warning" ? "text-confidence-medium" : "text-muted-foreground"
          }`} />
          <span className="text-sm text-foreground/80">{item.text}</span>
        </div>
      ))}
    </div>
  </GlassCard>
);

export default Results;
