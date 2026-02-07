import { Search, FlaskConical, BarChart3, Heart, ShieldCheck } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const agents = [
  { id: "research", label: "Research", icon: Search, path: "/results/research" },
  { id: "trial-quality", label: "Trial Quality", icon: FlaskConical, path: "/results/trial-quality" },
  { id: "statistics", label: "Statistics", icon: BarChart3, path: "/results/statistics" },
  { id: "patient-match", label: "Patient Match", icon: Heart, path: "/results/patient-match" },
  { id: "ethics", label: "Ethics & Bias", icon: ShieldCheck, path: "/results/ethics" },
];

const AgentSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-56 border-r border-border/50 bg-sidebar min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {agents.map((agent) => {
          const isActive = location.pathname === agent.path;
          return (
            <Link
              key={agent.id}
              to={agent.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "nav-link-active"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <agent.icon className="w-4 h-4" />
              <span>{agent.label}</span>
              {!isActive && <span className="ml-auto text-muted-foreground">›</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default AgentSidebar;
