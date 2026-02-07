import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import { Heart, MessageCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";

const PatientCare = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Patient Care</h1>
        <p className="text-muted-foreground mb-8">Patient-safe summaries and communication tools</p>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Plain-Language Reports</h3>
            </div>
            <p className="text-sm text-muted-foreground">Generate patient-friendly summaries from any research analysis. Automatically adjusted for reading level.</p>
            <button className="glow-button px-4 py-2 rounded-lg text-sm font-medium">Generate Report</button>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Discussion Points</h3>
            </div>
            <p className="text-sm text-muted-foreground">AI-generated talking points for doctor-patient conversations based on latest evidence.</p>
            <button className="glow-button px-4 py-2 rounded-lg text-sm font-medium">View Points</button>
          </GlassCard>

          <GlassCard className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Recent Patient Summaries</h3>
            </div>
            <div className="space-y-3">
              {["AI Mammography Screening — Summary generated Feb 6", "Metformin Type 2 Prevention — Summary generated Feb 4", "CRISPR Pediatric Safety — Summary generated Jan 30"].map((item) => (
                <div key={item} className="p-3 rounded-lg bg-muted/30 text-sm text-foreground/80 hover:bg-muted/50 cursor-pointer transition">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </main>
  </div>
);

export default PatientCare;
