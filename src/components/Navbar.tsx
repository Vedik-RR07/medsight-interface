import { Link, useLocation } from "react-router-dom";
import MedSightLogo from "./MedSightLogo";
import { User } from "lucide-react";

const navItems = [
  { label: "Analysis", path: "/dashboard" },
  { label: "Patient Care", path: "/patient-care" },
  { label: "Saved Research", path: "/saved" },
  { label: "Agent Explorer", path: "/agents" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard">
          <MedSightLogo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border cursor-pointer hover:border-primary/30 transition-colors">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground hidden md:block">Dr. A. Collins</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
