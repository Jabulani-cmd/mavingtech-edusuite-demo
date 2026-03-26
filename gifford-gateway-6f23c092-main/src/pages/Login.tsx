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
import schoolLogo from "@/assets/school-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, role, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && role) {
      // Check if must change password first
      if (user.user_metadata?.must_change_password) {
        navigate("/change-password");
        return;
      }
      redirectByRole(role);
    }
  }, [authLoading, user, role]);

  const redirectByRole = (r: string) => {
    if (r === "student") navigate("/portal/student");
    else if (r === "teacher") navigate("/portal/teacher");
    else if (r === "parent") navigate("/portal/parent-teacher");
    else if (r === "admin") navigate("/portal/admin");
    else if (r === "finance") navigate("/portal/finance");
    else if (r === "principal") navigate("/portal/principal");
    else if (r === "deputy_principal") navigate("/portal/deputy-principal");
    else if (r === "hod") navigate("/portal/hod");
    else if (r === "admin_supervisor") navigate("/portal/admin-supervisor");
    else if (r === "registration") navigate("/portal/registration");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
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
              <img src={schoolLogo} alt="Gifford High School crest" className="mx-auto mb-2 h-32 w-32 object-contain" />
              <CardTitle className="font-heading text-2xl text-primary">Portal Login</CardTitle>
              <p className="text-xs italic text-muted-foreground">Hinc Orior — From Here I Arise</p>
              <p className="text-sm text-muted-foreground">Access your Gifford High portal</p>
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
                    placeholder="you@giffordhigh.ac.zw"
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

                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                  disabled={googleLoading}
                  onClick={async () => {
                    setGoogleLoading(true);
                    try {
                      const result = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (result?.error) {
                        toast({ title: "Google sign-in failed", description: String(result.error), variant: "destructive" });
                      }
                    } catch (err: any) {
                      toast({ title: "Google sign-in failed", description: err?.message || "An error occurred", variant: "destructive" });
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {googleLoading ? "Connecting..." : "Sign in with Google"}
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
