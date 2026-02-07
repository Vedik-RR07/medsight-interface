import logoImg from "@/assets/medsight-logo.png";

interface MedSightLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const imgSizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
};

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const MedSightLogo = ({ size = "md", showText = true }: MedSightLogoProps) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoImg}
        alt="MedSight logo"
        className={`${imgSizes[size]} object-contain`}
      />
      {showText && (
        <span className={`font-display font-bold ${textSizes[size]} text-foreground`}>
          MedSight
        </span>
      )}
    </div>
  );
};

export default MedSightLogo;
