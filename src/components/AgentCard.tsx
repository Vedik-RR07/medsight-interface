import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status?: "active" | "uncertain" | "idle";
  confidence?: number;
  onClick?: () => void;
  compact?: boolean;
}

const AgentCard = ({ icon: Icon, title, description, status = "idle", confidence, onClick, compact = false }: AgentCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={`glass-panel p-5 h-full ${
        compact ? "flex flex-col items-center text-center" : ""
      } ${onClick ? "hover:border-primary/30 cursor-pointer" : ""} transition-all duration-300`}
    >
      <div className={compact ? "flex flex-col items-center gap-3" : "flex items-start gap-3"}>
        <div className="p-2 rounded-lg bg-primary/15 border border-primary/20 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={compact ? "" : "flex-1 min-w-0"}>
          <div className={compact ? "" : "flex items-center gap-2"}>
            <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
            {status !== "idle" && !compact && (
              <span className={`w-2 h-2 rounded-full ${
                status === "active" ? "bg-confidence-high" : "bg-confidence-medium"
              }`} />
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{description}</p>
          {confidence !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span className="text-foreground">{confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    confidence >= 70 ? "bg-confidence-high" : confidence >= 40 ? "bg-confidence-medium" : "bg-confidence-low"
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;
