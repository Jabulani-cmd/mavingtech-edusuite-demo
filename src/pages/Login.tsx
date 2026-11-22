import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StoneWall from "@/components/masonry/StoneWall";
import hero4 from "@/assets/hero-students-4.jpg";
import { Home, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PORTALS, isPortalKey, type PortalKey } from "@/lib/portals";
import schoolLogo from "@/assets/mavingtech-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage } from "@/lib/errors";
import { DEMO_EMAIL_DOMAIN, DEMO_PASSWORDS } from "@/lib/demoAccounts";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signOut, role, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const initialPortal = searchParams.get("portal");
  const [portal, setPortal] = useState<PortalKey>(isPortalKey(initialPortal) ? initialPortal : "student");

  const handleSeedDemoAdmin = async () => {
    setSeedingDemo(true);
    try {
      const { error } = await supabase.functions.invoke("seed-demo-accounts", { body: {} });
      if (error) throw error;
      setEmail(`admin@${DEMO_EMAIL_DOMAIN}`);
      setPassword(DEMO_PASSWORDS.admin);
      toast({ title: "Demo admin ready", description: "Credentials pre-filled. Click Sign In." });
    } catch (e) {
      toast({ title: "Could not provision demo admin", description: errorMessage(e, "Unknown error"), variant: "destructive" });
    } finally {
      setSeedingDemo(false);
    }
  };

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const redirectByRole = useCallback((r: string) => {
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
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && user && role && justLoggedIn) {
      if (user.user_metadata?.must_change_password || user.app_metadata?.must_change_password) {
        navigate("/change-password");
        return;
      }
      const selected = PORTALS.find((p) => p.key === portal);
      if (selected && !selected.roles.includes(role)) {
        setJustLoggedIn(false);
        signOut();
        toast({
          title: t("login.wrongPortal", "Wrong portal"),
          description: t("login.wrongPortalDesc", "This account is not a {{portal}} account. Choose the correct portal and try again.", { portal: t(`login.portal.${selected.key}`, selected.label) }),
          variant: "destructive",
        });
        return;
      }
      toast({ title: t("login.loginSuccess") });
      redirectByRole(role);
    }
  }, [authLoading, user, role, justLoggedIn, portal, signOut, toast, t, redirectByRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setJustLoggedIn(false);
    try {
      const { error } = await signIn(email, password);
      if (error) toast({ title: t("login.loginFailed"), description: error.message, variant: "destructive" });
      else setJustLoggedIn(true);
    } catch (err) {
      toast({ title: t("login.loginFailed"), description: errorMessage(err, "An unexpected error occurred"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="grid min-h-[72vh] lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <StoneWall src={hero4} alt="" seed={19} heights={[22, 18, 26, 17, 17]} position="center 30%" phonePosition="55% 40%" className="h-44 w-full sm:h-56 lg:h-full lg:min-h-[640px]" />
          <div className="absolute inset-x-0 bottom-0 z-10 bg-navy px-6 py-5 text-lit lg:px-8 lg:py-7">
            <p className="font-heading text-2xl font-extrabold leading-tight lg:text-3xl">{t("login.title")}</p>
            <p className="mt-1.5 text-sm leading-snug text-lit/80">{t("login.tagline")}</p>
          </div>
        </div>

        <div className="flex items-start justify-center px-4 py-10 sm:px-8 lg:col-span-7 lg:items-center lg:py-16">
          <div className="slab w-full max-w-md border-t-[6px] border-ochre p-6 sm:p-8">
            <img src={schoolLogo} alt="MavingTech High School" className="mb-5 h-auto w-44 object-contain" />
            <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="portal">{t("login.choosePortal", "Sign in to")}</Label>
                <Select value={portal} onValueChange={(v) => setPortal(v as PortalKey)}>
                  <SelectTrigger id="portal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTALS.map(({ key, label }) => (
                      <SelectItem key={key} value={key}>{t(`login.portal.${key}`, label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.emailLabel")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.emailPlaceholder")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 flex h-10 w-11 items-center justify-center text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t("login.signingIn") : t("login.signIn")}
              </Button>

              <div className="border border-border bg-muted p-3 text-center">
                <p className="mb-2 text-xs text-muted-foreground">{t("login.demoNote")}</p>
                <Button type="button" variant="outline" size="sm" onClick={handleSeedDemoAdmin} disabled={seedingDemo} className="h-auto w-full whitespace-normal py-2 leading-snug">
                  {seedingDemo ? t("login.provisioning") : t("login.provisionAdmin")}
                </Button>
              </div>

              <div className="space-y-1 text-center">
                <Link to="/forgot-password" className="inline-block py-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">{t("login.forgot")}</Link>
                <p className="text-sm text-muted-foreground">
                  {t("login.parentPrompt")}{" "}
                  <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">{t("login.registerHere")}</Link>
                </p>
                <p className="text-xs text-muted-foreground">{t("login.studentTeacherNote")}</p>
                <Link to="/">
                  <Button variant="outline" size="sm" className="mt-2 gap-2">
                    <Home className="h-4 w-4" /> {t("login.backHome")}
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
