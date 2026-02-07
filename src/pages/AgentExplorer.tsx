import { motion } from "framer-motion";
import { Search, Brain, BarChart3, Heart, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";

const agentDetails = [
  {
    id: "research",
    icon: Search,
    title: "Research Agent",
    purpose: "Searches, retrieves, and synthesizes medical literature from PubMed, clinical trials databases, and systematic reviews.",
    sources: ["PubMed / MEDLINE", "ClinicalTrials.gov", "Cochrane Library", "WHO ICTRP"],
    methodology: "Semantic search with citation graph analysis, relevance ranking, and cross-reference validation.",
    strengths: ["Comprehensive literature coverage", "Citation tracking", "Conflict detection between studies"],
    limitations: ["Limited to English-language publications", "May miss preprints not indexed in major databases"],
  },
  {
    id: "clinical-reasoning",
    icon: Brain,
    title: "Clinical Reasoning Agent",
    purpose: "Applies differential diagnosis logic, step-by-step clinical reasoning, and evidence-based decision trees.",
    sources: ["UpToDate protocols", "Clinical practice guidelines", "Diagnostic algorithms"],
    methodology: "Chain-of-thought reasoning with explicit assumption tracking and uncertainty quantification.",
    strengths: ["Transparent reasoning chain", "Explicit assumption documentation", "Uncertainty awareness"],
    limitations: ["Cannot replace clinical judgment", "Limited by training data recency"],
  },
  {
    id: "data-visualization",
    icon: BarChart3,
    title: "Data Visualization Agent",
    purpose: "Generates interactive charts for outcome comparisons, population distributions, and risk analyses.",
    sources: ["Extracted study data", "Statistical outputs from other agents"],
    methodology: "Automated chart generation with statistical overlays, confidence intervals, and forest plots.",
    strengths: ["Interactive exploration", "Multiple visualization types", "Export capabilities"],
    limitations: ["Dependent on data quality from source studies", "Complex meta-analyses may oversimplify"],
  },
  {
    id: "patient-care",
    icon: Heart,
    title: "Patient Care Agent",
    purpose: "Translates complex medical findings into plain-language summaries suitable for patient communication.",
    sources: ["Outputs from all other agents", "Health literacy guidelines"],
    methodology: "Simplified language generation with reading-level targeting and cultural sensitivity checks.",
    strengths: ["Accessible language", "Patient question generation", "Discussion point suggestions"],
    limitations: ["Not a substitute for medical advice", "May oversimplify nuanced findings"],
  },
  {
    id: "ethics-bias",
    icon: ShieldCheck,
    title: "Ethics & Bias Agent",
    purpose: "Detects ethical concerns, population representation gaps, and potential biases in research and recommendations.",
    sources: ["Study demographics", "Bias assessment tools", "Ethics guidelines"],
    methodology: "Population representation analysis, bias risk scoring, and ethical framework evaluation.",
    strengths: ["First-class ethical analysis", "Bias detection across demographics", "Transparency scoring"],
    limitations: ["Ethical frameworks vary by jurisdiction", "Some biases are difficult to quantify"],
  },
];

const AgentExplorer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Agent Explorer</h1>
          <p className="text-muted-foreground mb-12">Deep-dive into each agent's capabilities, methodology, and limitations.</p>
        </motion.div>

        <div className="space-y-8">
          {agentDetails.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/15 border border-primary/20">
                    <agent.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">{agent.title}</h2>
                    <p className="text-sm text-muted-foreground">{agent.purpose}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Data Sources</h4>
                    <ul className="space-y-1">
                      {agent.sources.map((s) => (
                        <li key={s} className="text-sm text-foreground/70 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Methodology</h4>
                    <p className="text-sm text-foreground/70">{agent.methodology}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-confidence-high mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {agent.strengths.map((s) => (
                        <li key={s} className="text-sm text-foreground/70 flex items-center gap-2">
                          <span className="text-confidence-high">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-confidence-medium mb-2">Limitations</h4>
                    <ul className="space-y-1">
                      {agent.limitations.map((l) => (
                        <li key={l} className="text-sm text-foreground/70 flex items-center gap-2">
                          <span className="text-confidence-medium">⚠</span> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AgentExplorer;
