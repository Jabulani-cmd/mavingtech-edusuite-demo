import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Lock, User, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError("Invalid credentials. Use admin / demo123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Demo notice */}
        <div className="mb-6 rounded-lg bg-warning/10 border border-warning/30 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Demo Version</p>
            <p className="text-xs text-muted-foreground mt-1">
              Use credentials: <strong className="text-foreground">admin</strong> / <strong className="text-foreground">demo123</strong>
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg mb-4">
              MTBS
            </div>
            <h1 className="text-xl font-bold font-heading text-foreground">MavingTech Business Solutions</h1>
            <p className="text-sm text-muted-foreground mt-1">Empowering Education Through Technology</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            MavingTech Demonstration Academy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
