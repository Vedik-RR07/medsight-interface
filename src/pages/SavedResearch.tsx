import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import { Bookmark, Clock, Search } from "lucide-react";
import { motion } from "framer-motion";

const savedItems = [
  { title: "AI-based mammography for early breast cancer detection", agents: 5, date: "Feb 6, 2026", confidence: 72 },
  { title: "Metformin efficacy in Type 2 diabetes prevention", agents: 4, date: "Feb 4, 2026", confidence: 85 },
  { title: "CRISPR gene therapy safety in pediatric patients", agents: 5, date: "Jan 30, 2026", confidence: 58 },
];

const SavedResearch = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Saved Research</h1>
        <p className="text-muted-foreground mb-8">Your bookmarked analyses and research sessions</p>

        <div className="space-y-4">
          {savedItems.map((item, i) => (
            <GlassCard key={i} className="flex items-center gap-4 cursor-pointer hover:border-primary/20 transition-all">
              <Bookmark className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Search className="w-3 h-3" /> {item.agents} agents</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <div className={`text-lg font-bold ${item.confidence >= 70 ? "text-confidence-high" : item.confidence >= 40 ? "text-confidence-medium" : "text-confidence-low"}`}>
                  {item.confidence}%
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </main>
  </div>
);

export default SavedResearch;
