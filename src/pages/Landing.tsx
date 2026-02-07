import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Brain, BarChart3, Heart, ShieldCheck, ArrowRight, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import MedSightLogo from "@/components/MedSightLogo";
import AgentCard from "@/components/AgentCard";
import GlassCard from "@/components/GlassCard";
import heroBg from "@/assets/hero-bg.jpg";

const agents = [
  { icon: Search, title: "Research Agent", description: "Searches and synthesizes medical literature from PubMed, trials, and reviews" },
  { icon: Brain, title: "Clinical Reasoning Agent", description: "Applies differential diagnosis logic and step-by-step reasoning" },
  { icon: BarChart3, title: "Data Visualization Agent", description: "Generates interactive charts for outcomes, risks, and populations" },
  { icon: Heart, title: "Patient Care Agent", description: "Translates findings into plain-language patient summaries" },
  { icon: ShieldCheck, title: "Ethics & Bias Agent", description: "Detects bias, ethical concerns, and population representation gaps" },
];

const Landing = () => {
  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <div className="flex justify-center mb-8">
            <MedSightLogo size="lg" showText={false} />
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-2">
            MedSight
          </h1>
          <p className="font-display text-xl md:text-2xl text-foreground/80 mb-4">
            Multi-Agent Intelligence<br />for Medical Research & Care
          </p>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Search, synthesize, and reason across medical literature using collaborative AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="glow-button-solid px-8 py-3.5 rounded-xl font-semibold text-base inline-block">
              Get Started
            </Link>
            <a href="#how-it-works" className="ghost-button px-8 py-3.5 rounded-xl font-medium text-base inline-flex items-center gap-2">
              Learn How It Works <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-10 z-10"
        >
          <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Agents Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What MedSight Does
          </h2>
          <p className="text-muted-foreground text-lg">Five specialized agents working in concert</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <AgentCard {...agent} compact />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Multi-Agent Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Agent collaboration diagram */}
            <div className="glass-panel p-8 relative">
              <div className="grid grid-cols-3 gap-4">
                {agents.slice(0, 3).map((agent, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <agent.icon className="w-6 h-6 text-primary" />
                    <span className="text-[10px] text-muted-foreground text-center">{agent.title}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center my-4">
                <div className="w-px h-8 bg-primary/30" />
              </div>
              <div className="text-center p-4 rounded-lg glow-border bg-primary/5">
                <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="text-xs text-foreground font-medium">Cross-Verified Synthesis</span>
              </div>
              <div className="flex justify-center my-4">
                <div className="w-px h-8 bg-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {agents.slice(3).map((agent, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <agent.icon className="w-6 h-6 text-primary" />
                    <span className="text-[10px] text-muted-foreground text-center">{agent.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Why Multi-Agent AI?
            </h2>
            <div className="space-y-5">
              {[
                { icon: AlertTriangle, text: "Single LLMs hallucinate — MedSight agents cross-verify" },
                { icon: CheckCircle, text: "Citations, confidence scoring, and disagreement detection" },
                { icon: ShieldCheck, text: "Ethical analysis as a first-class citizen, not an afterthought" },
                { icon: Heart, text: "Patient-safe abstraction layer with plain-language summaries" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-foreground/80">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 flex justify-center">
        <GlassCard className="max-w-lg text-center glow-border">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Ready to explore?
          </h2>
          <p className="text-muted-foreground mb-8">
            Access live research synthesis and patient-safe reasoning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup" className="glow-button-solid px-8 py-3 rounded-xl font-semibold">
              Sign Up
            </Link>
            <Link to="/auth?mode=signin" className="ghost-button px-8 py-3 rounded-xl font-medium">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Landing;
