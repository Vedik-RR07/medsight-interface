import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import AgentExplorer from "./pages/AgentExplorer";
import PatientCare from "./pages/PatientCare";
import SavedResearch from "./pages/SavedResearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/results/:agentId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><AgentExplorer /></ProtectedRoute>} />
            <Route path="/agents/:agentId" element={<ProtectedRoute><AgentExplorer /></ProtectedRoute>} />
            <Route path="/patient-care" element={<ProtectedRoute><PatientCare /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedResearch /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
