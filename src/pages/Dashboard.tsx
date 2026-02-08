import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AgentSidebar from "@/components/AgentSidebar";
import { analyzeSearch } from "@/lib/api";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (queryOverride?: string) => {
    const q = (queryOverride ?? query).trim();
    if (!q) return;
    if (!queryOverride) setQuery(q);
    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeSearch({ query: q });
      navigate("/results/research?q=" + encodeURIComponent(q), { state: { analysis: result } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Is the backend running on port 3001?");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <AgentSidebar />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mt-16"
          >
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">What research are you looking for today?</h1>
            <p className="text-muted-foreground mb-8">
              Search medical research, conditions, trials, or patient scenarios
            </p>

            <div className="glass-panel-strong p-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground ml-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Is AI-based mammography effective for early breast cancer detection?"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground py-3 focus:outline-none"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-muted transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => void handleSearch()}
                disabled={analyzing}
                className="glow-button-solid px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Agents analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive mt-2"
              >
                {error}
              </motion.p>
            )}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass-panel mt-4 p-5"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Publication Year", options: ["Any", "Last year", "Last 5 years", "Last 10 years"] },
                    { label: "Study Type", options: ["Any", "RCT", "Meta-analysis", "Case study"] },
                    { label: "Population", options: ["Any", "Adults", "Pediatric", "Geriatric"] },
                    { label: "Confidence Threshold", options: ["Any", ">50%", ">70%", ">90%"] },
                  ].map((filter) => (
                    <div key={filter.label}>
                      <label className="text-xs text-muted-foreground mb-1.5 block">{filter.label}</label>
                      <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                        {filter.options.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Searches */}
            <div className="mt-12">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Searches</h3>
              <div className="space-y-2">
                {[
                  "AI-based mammography for early breast cancer detection",
                  "Metformin efficacy in Type 2 diabetes prevention",
                  "CRISPR gene therapy safety in pediatric patients",
                ].map((search) => (
                  <button
                    key={search}
                    onClick={() => { setQuery(search); void handleSearch(search); }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-muted/30 hover:bg-muted/60 text-sm text-foreground/80 transition flex items-center gap-3"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
