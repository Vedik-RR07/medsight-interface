import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MedSightLogo from "@/components/MedSightLogo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">(
    searchParams.get("mode") === "signin" ? "signin" : "signup"
  );
  const [role, setRole] = useState<string>("researcher");
  
  // Separate state for sign-up form
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  
  // Separate state for sign-in form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const roles = ["Clinician", "Researcher", "Student"];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail.trim() || !signUpPassword) {
      toast.error("Please enter email and password");
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(signUpEmail.trim(), signUpPassword, role);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to confirm your account");
    setMode("signin");
    setSignUpPassword("");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
    // On success, Supabase redirects to Google then back to /dashboard
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await signIn(signInEmail.trim(), signInPassword);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <MedSightLogo size="md" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mt-6">
            Get Started for Free
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Sign Up Card */}
          <div
            className={`glass-panel p-6 cursor-pointer transition-all ${
              mode === "signup" ? "glow-border" : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => setMode("signup")}
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-5">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <input
                type="email"
                placeholder="Email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition"
              />
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Role:</span>
                <div className="flex gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRole(r.toLowerCase());
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        role === r.toLowerCase()
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-muted text-muted-foreground border border-border hover:border-primary/20"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="glow-button w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Sign Up"}
              </button>
              <div className="pt-2 space-y-2">
                <p className="text-xs text-muted-foreground">or continue with</p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground hover:border-primary/30 transition disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Already have an account?{" "}
              <button onClick={(e) => { e.stopPropagation(); setMode("signin"); }} className="text-primary hover:underline">
                Log in
              </button>
            </p>
          </div>

          {/* Sign In Card */}
          <div
            className={`glass-panel p-6 cursor-pointer transition-all ${
              mode === "signin" ? "glow-border" : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => setMode("signin")}
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-5">Welcome Back</h2>
            <form onSubmit={handleSignIn} className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition"
              />
              <button type="button" className="text-xs text-muted-foreground hover:text-primary transition">
                Forgot password?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="glow-button w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Log in →"}
              </button>
              <div className="pt-2 space-y-2">
                <p className="text-xs text-muted-foreground">or continue with</p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground hover:border-primary/30 transition disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Don't have an account?{" "}
              <button onClick={(e) => { e.stopPropagation(); setMode("signup"); }} className="text-primary hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
