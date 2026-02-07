import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const GlassCard = ({ children, className = "", animate = true }: GlassCardProps) => {
  if (!animate) {
    return <div className={`glass-panel p-6 ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`glass-panel p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
