interface ConfidenceBarProps {
  label: string;
  value: number;
  icon?: string;
  variant?: "high" | "medium" | "low";
}

const ConfidenceBar = ({ label, value, icon, variant }: ConfidenceBarProps) => {
  const autoVariant = variant || (value >= 70 ? "high" : value >= 40 ? "medium" : "low");
  const colors = {
    high: "bg-confidence-high",
    medium: "bg-confidence-medium",
    low: "bg-confidence-low",
  };

  return (
    <div className="flex items-center gap-4">
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-sm text-foreground min-w-[160px]">{label}:</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[autoVariant]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;
