// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Home, Eye, EyeOff } from "lucide-react";
import schoolLogo from "@/assets/mavingtech-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, role, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  // Seed admin on first visit
  useEffect(() => {
    const seedAdmin = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        await fetch(`https://${projectId}.supabase.co/functions/v1/manage-users`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ action: "seed-admin" }),
        });
      } catch {
        // Silently fail
      }
    };
    seedAdmin();
  }, []);

  // Track whether a manual login was just performed
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Only redirect after a manual login, not on page load with existing session
  useEffect(() => {
    if (!authLoading && user && role && justLoggedIn) {
      if (user.user_metadata?.must_change_password) {
        navigate("/change-password");
        return;
      }
      toast({ title: "Logged in successfully!" });
      redirectByRole(role);
    }
  }, [authLoading, user, role, justLoggedIn]);

  const redirectByRole = (r: string) => {
    if (r === "student") navigate("/portal/student");
    else if (r === "teacher") navigate("/portal/teacher");
    else if (r === "parent") navigate("/portal/parent-teacher");
    else if (r === "admin") navigate("/portal/admin");
    else if (r === "finance") navigate("/portal/finance");
    else if (r === "finance_clerk") navigate("/portal/finance");
    else if (r === "bursar") navigate("/portal/finance");
    else if (r === "principal") navigate("/portal/principal");
    else if (r === "deputy_principal") navigate("/portal/deputy-principal");
    else if (r === "hod") navigate("/portal/hod");
    else if (r === "admin_supervisor") navigate("/portal/admin-supervisor");
    else if (r === "registration") navigate("/portal/registration");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setJustLoggedIn(false);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        setJustLoggedIn(true);
      }
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="flex min-h-[70vh] items-center justify-center bg-section-warm py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
          <Card className="shadow-maroon">
            <CardHeader className="text-center">
              <img src={schoolLogo} alt="MavingTech Business Solutions" className="mx-auto mb-2 h-32 w-32 object-contain" />
              <CardTitle className="font-heading text-2xl text-primary">Portal Login</CardTitle>
              <p className="text-xs italic text-muted-foreground">Empowering Your Business Through Technology</p>
              <p className="text-sm text-muted-foreground">Access your MavingTech portal</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@mavingtech.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>


                <div className="text-center space-y-1">
                  <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                    Forgot your password?
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Parent?{" "}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                      Register here
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Students & teachers: credentials provided by admin
                  </p>
                  <Link to="/">
                    <Button variant="outline" size="sm" className="mt-2 gap-2">
                      <Home className="h-4 w-4" /> Back to Home
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </Layout>
  );
}
