import { useCallback, useEffect, useState } from "react";
import { Activity, CheckCircle2, Loader2, Link2, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/errors";
import { HEALTH_CHECKS, fetchHealth, healthIssues, relinkEverything, removeDemoLogins, type HealthReport } from "@/lib/dataHealth";

/**
 * Data health: teachers, students, parents, classes and logins all line up.
 * Each row should read 0. Used on the admin "Data health" tab and under the demo seeder.
 */
export default function DataHealthPanel({ compact = false, refreshKey = 0 }: { compact?: boolean; refreshKey?: number }) {
  const { toast } = useToast();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy("load");
    try { setReport(await fetchHealth()); setError(null); }
    catch (e) { setError(errorMessage(e, "Could not run the check")); }
    finally { setBusy(null); }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function relink() {
    setBusy("relink");
    try {
      const res = await relinkEverything();
      setReport(res.health);
      const made = Object.values(res.created ?? {}).reduce((a, b) => a + Number(b), 0);
      const linked = Object.values(res.linked ?? {}).reduce((a, b) => a + Number(b), 0);
      toast({ title: "Everything re-linked", description: `${linked} links repaired and ${made} missing records added.` });
    } catch (e) {
      toast({ title: "Re-linking failed", description: errorMessage(e), variant: "destructive" });
    } finally { setBusy(null); }
  }

  async function removeLogins(orphansOnly: boolean) {
    const msg = orphansOnly
      ? "Delete demo logins (@schooldemo.com) whose teacher, student or parent record no longer exists?"
      : "Going live: delete EVERY demo login (@schooldemo.com) except your own? Clear the demo data first. Real logins are untouched.";
    if (!confirm(msg)) return;
    setBusy(orphansOnly ? "orphans" : "all");
    try {
      const res = await removeDemoLogins(orphansOnly);
      toast(res.failed
        ? { title: `${res.removed} removed, ${res.failed} failed`, description: res.errors[0], variant: "destructive" }
        : { title: `${res.removed} demo logins removed` });
      await load();
    } catch (e) {
      toast({ title: "Removing logins failed", description: errorMessage(e), variant: "destructive" });
    } finally { setBusy(null); }
  }

  const issues = healthIssues(report);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="font-heading flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" /> Data health
            {report && (issues.length === 0
              ? <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />All zero</Badge>
              : <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{issues.length} to fix</Badge>)}
          </CardTitle>
          {!compact && <p className="text-sm text-muted-foreground mt-1">Teachers, students, parents, classes and logins must line up. Every row should read 0.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={!!busy}>
            {busy === "load" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />} Check again
          </Button>
          <Button size="sm" onClick={relink} disabled={!!busy}>
            {busy === "relink" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Link2 className="h-4 w-4 mr-1" />} Re-link everything
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        <div className="divide-y rounded-md border">
          {HEALTH_CHECKS.map((c) => {
            const n = Number(report?.[c.key] ?? 0);
            const samples = report?.samples?.[c.key] ?? [];
            return (
              <div key={c.key} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <span>{c.label}</span>
                  {n > 0 && samples.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate max-w-[520px]" title={samples.join(", ")}>e.g. {samples.slice(0, 3).join(", ")}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold tabular-nums ${n > 0 ? "text-destructive" : "text-primary"}`}>{report ? n : "–"}</span>
                  {n > 0 && (c.fix === "orphans"
                    ? <Button size="sm" variant="outline" onClick={() => removeLogins(true)} disabled={!!busy}>Remove leftover demo logins</Button>
                    : <Button size="sm" variant="outline" onClick={relink} disabled={!!busy}>Fix</Button>)}
                </div>
              </div>
            );
          })}
        </div>
        {report && Number(report.teachers_without_class) > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Teachers with no subjects listed can't be placed automatically. Assign them a class under Academics or Timetables, then check again.
          </p>
        )}
        {!compact && (
          <div className="mt-4 rounded-md border border-destructive/30 p-3 text-sm">
            <p className="font-medium">Going live</p>
            <p className="text-xs text-muted-foreground mt-1">
              1. Clear the demo data from the Demo Data Seeder. 2. Remove the demo logins below. 3. Ask for the DEMO_MODE setting to be switched off so the demo administrator and demo loading are refused.
            </p>
            <Button size="sm" variant="destructive" className="mt-2" onClick={() => removeLogins(false)} disabled={!!busy}>
              {busy === "all" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} Remove all demo logins
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
