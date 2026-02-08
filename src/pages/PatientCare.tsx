import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import { Heart, MessageCircle, FileText, Download, Loader2, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentAnalyses, type SavedAnalysis } from "@/lib/database";
import { getStoredAnalyses, type StoredAnalysis } from "@/lib/sessionStorage";
import { toast } from "sonner";
import type { AnalyzeResponse } from "@/lib/api";

const PatientCare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<Array<StoredAnalysis | SavedAnalysis>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalyzeResponse | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);

  useEffect(() => {
    loadRecentAnalyses();
  }, [user]);

  const loadRecentAnalyses = async () => {
    setLoading(true);
    try {
      // Always load from session storage first (works without database)
      const sessionAnalyses = getStoredAnalyses();
      
      // Try to load from database if user is logged in
      if (user) {
        const { data, error } = await getRecentAnalyses(user.id, 5);
        
        if (!error && data && data.length > 0) {
          // Merge database and session analyses, preferring database
          const dbIds = new Set(data.map(d => d.query + d.created_at));
          const uniqueSession = sessionAnalyses.filter(
            s => !dbIds.has(s.analysis.query + s.timestamp)
          );
          setRecentAnalyses([...data, ...uniqueSession]);
        } else {
          // Use session storage only
          setRecentAnalyses(sessionAnalyses);
        }
      } else {
        // Not logged in, use session storage only
        setRecentAnalyses(sessionAnalyses);
      }
    } catch (err) {
      console.error('Failed to load analyses:', err);
      // Fallback to session storage
      setRecentAnalyses(getStoredAnalyses());
    } finally {
      setLoading(false);
    }
  };

  const generatePlainLanguageReport = (analysis: StoredAnalysis | SavedAnalysis) => {
    // Extract the AnalyzeResponse from either type
    const analyzeResponse = 'analysis' in analysis ? analysis.analysis : analysis.full_results;
    setSelectedAnalysis(analyzeResponse);
    setShowReport(true);
  };

  const generateDiscussionPoints = (analysis: StoredAnalysis | SavedAnalysis) => {
    // Extract the AnalyzeResponse from either type
    const analyzeResponse = 'analysis' in analysis ? analysis.analysis : analysis.full_results;
    setSelectedAnalysis(analyzeResponse);
    setShowDiscussion(true);
  };

  const downloadReport = () => {
    if (!selectedAnalysis) return;

    const patientAge = selectedAnalysis.mode === 'clinical' ? 'N/A' : 'N/A';
    const patientSex = selectedAnalysis.mode === 'clinical' ? 'N/A' : 'N/A';
    const patientCondition = selectedAnalysis.mode === 'clinical' ? 'N/A' : 'N/A';

    const report = `
PATIENT-FRIENDLY MEDICAL RESEARCH SUMMARY
Generated: ${new Date().toLocaleDateString()}

Research Question: ${selectedAnalysis.query}

${selectedAnalysis.mode === 'clinical' ? `Patient Profile:
- Age: ${patientAge} years
- Sex: ${patientSex}
- Condition: ${patientCondition}
` : ''}

WHAT WE FOUND:
${selectedAnalysis.synthesis.patientExplanation || selectedAnalysis.synthesis.summary}

SAFETY ASSESSMENT:
${selectedAnalysis.patientSafety?.safetyTier ? `Safety Level: ${selectedAnalysis.patientSafety.safetyTier.toUpperCase()}` : 'General research summary'}

${selectedAnalysis.patientSafety?.plainLanguageSummary || ''}

KEY POINTS:
${selectedAnalysis.synthesis.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

CONFIDENCE LEVEL: ${selectedAnalysis.synthesis.overallConfidence}%

${selectedAnalysis.synthesis.biasAndUncertainty ? `
IMPORTANT CONSIDERATIONS:
${selectedAnalysis.synthesis.biasAndUncertainty}
` : ''}

---
This is a summary of medical research and is NOT medical advice.
Always consult with your healthcare provider before making any medical decisions.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSafetyColor = (tier?: string) => {
    switch (tier) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'not-recommended': return 'text-orange-600';
      case 'contraindicated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Patient Care</h1>
          <p className="text-muted-foreground mb-8">Patient-safe summaries and communication tools</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">Plain-Language Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate patient-friendly summaries from your research analyses. 
                Automatically adjusted for reading level.
              </p>
              <p className="text-xs text-muted-foreground">
                Select an analysis below to generate a report
              </p>
            </GlassCard>

            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">Discussion Points</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-generated talking points for doctor-patient conversations based on latest evidence.
              </p>
              <p className="text-xs text-muted-foreground">
                Select an analysis below to view discussion points
              </p>
            </GlassCard>
          </div>

          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">Recent Patient Summaries</h3>
              </div>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30 animate-pulse h-20" />
                ))}
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No analyses yet. Run a search from the Dashboard to get started.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="glow-button px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => {
                  // Handle both StoredAnalysis and SavedAnalysis types
                  const isStored = 'analysis' in analysis;
                  const query = isStored ? analysis.analysis.query : analysis.query;
                  const timestamp = isStored ? analysis.timestamp : analysis.created_at;
                  const safetyTier = isStored ? analysis.analysis.patientSafety?.safetyTier : analysis.safety_tier;
                  const confidence = isStored ? analysis.analysis.synthesis.overallConfidence : analysis.confidence;
                  const id = isStored ? analysis.id : analysis.id;
                  
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition">
                            {query}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(timestamp)}
                            </span>
                            {safetyTier && (
                              <span className={`font-medium ${getSafetyColor(safetyTier)}`}>
                                {safetyTier.replace('-', ' ').toUpperCase()}
                              </span>
                            )}
                            <span>Confidence: {confidence}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePlainLanguageReport(analysis);
                          }}
                          className="px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition text-xs font-medium"
                        >
                          Generate Report
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateDiscussionPoints(analysis);
                          }}
                          className="px-3 py-1.5 bg-secondary/20 text-secondary-foreground rounded-md hover:bg-secondary/30 transition text-xs font-medium"
                        >
                          Discussion Points
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Plain Language Report Modal */}
          {showReport && selectedAnalysis && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Patient-Friendly Report</h2>
                  <button
                    onClick={() => setShowReport(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Research Question:</h3>
                    <p className="text-muted-foreground">{selectedAnalysis.query}</p>
                  </div>

                  {selectedAnalysis.mode === 'clinical' && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Patient Profile:</h3>
                      <p className="text-muted-foreground text-sm">Clinical mode analysis</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What We Found:</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAnalysis.synthesis.patientExplanation || selectedAnalysis.synthesis.summary}
                    </p>
                  </div>

                  {selectedAnalysis.patientSafety?.safetyTier && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Safety Assessment:</h3>
                      <p className={`font-medium ${getSafetyColor(selectedAnalysis.patientSafety.safetyTier)}`}>
                        {selectedAnalysis.patientSafety.safetyTier.replace('-', ' ').toUpperCase()}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {selectedAnalysis.patientSafety.plainLanguageSummary}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Points:</h3>
                    <ul className="text-muted-foreground space-y-2">
                      {selectedAnalysis.synthesis.keyFindings.map((finding, i) => (
                        <li key={i}>• {finding}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      This is a summary of medical research and is NOT medical advice. 
                      Always consult with your healthcare provider before making any medical decisions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={downloadReport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Discussion Points Modal */}
          {showDiscussion && selectedAnalysis && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Discussion Points</h2>
                  <button
                    onClick={() => setShowDiscussion(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">For: {selectedAnalysis.query}</h3>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Questions to Ask Your Doctor:</h3>
                    <ul className="space-y-3">
                      {selectedAnalysis.patientSafety?.questionsForClinician.map((q, i) => (
                        <li key={i} className="p-3 bg-muted/30 rounded-lg text-muted-foreground">
                          {i + 1}. {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedAnalysis.synthesis.objectionResponses && 
                   selectedAnalysis.synthesis.objectionResponses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Important Considerations:</h3>
                      <ul className="space-y-3">
                        {selectedAnalysis.synthesis.objectionResponses.map((resp, i) => (
                          <li key={i} className="p-3 bg-muted/30 rounded-lg">
                            <p className="font-medium text-foreground mb-1">{resp.objection}</p>
                            <p className="text-muted-foreground text-xs">{resp.response}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-2">Confidence Level:</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${selectedAnalysis.synthesis.overallConfidence}%` }}
                        />
                      </div>
                      <span className="text-foreground font-medium">{selectedAnalysis.synthesis.overallConfidence}%</span>
                    </div>
                    {selectedAnalysis.synthesis.confidenceJustification && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedAnalysis.synthesis.confidenceJustification}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowDiscussion(false)}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PatientCare;
