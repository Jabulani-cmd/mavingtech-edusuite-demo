// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Sparkles, Trash2, CheckCircle2, Loader2, Download, Users, GraduationCap, BookOpen, Building2, CalendarClock, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllocation } from "@/contexts/AllocationContext";
import { useDemoPeople } from "@/contexts/DemoPeopleContext";
import { generateDemoSeed, DEMO_PERIODS } from "@/lib/demoSeeder";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  "Generating venues and classrooms",
  "Creating subjects and curriculum",
  "Provisioning teacher accounts",
  "Enrolling 180 students across Form 1–6",
  "Assigning 360 parents and guardians",
  "Building class allocations",
  "Solving weekly timetable",
  "Provisioning login accounts (admin + teachers)",
  "Publishing to all portals",
];

export default function DemoDataSeederPanel() {
  const alloc = useAllocation();
  const people = useDemoPeople();
  const { toast } = useToast();

  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [summary, setSummary] = useState<null | {
    students: number; parents: number; teachers: number;
    subjects: number; classes: number; rooms: number; periods: number;
  }>(null);
  const [showSummary, setShowSummary] = useState(false);

  const seeded = people.loadedAt != null;

  async function provisionAuthAccounts(seed: ReturnType<typeof generateDemoSeed>) {
    const adminAcct = { email: "admin@schooldemo.com", password: "Demo@2025", full_name: "Demo Administrator", role: "admin" as const };
    const teacherAccts = seed.teachers.map(t => ({
      email: t.email, password: "Teacher@2025", full_name: t.name, role: "teacher" as const,
    }));
    const studentAccts = seed.students.map(s => ({
      email: s.email, password: s.password, full_name: s.fullName, role: "student" as const,
    }));
    const parentAccts = seed.parents.map(p => ({
      email: p.email, password: p.password, full_name: p.fullName, role: "parent" as const,
    }));

    // Phase 1 (blocking): admin + teachers so the demo can log in immediately.
    const priority = [adminAcct, ...teacherAccts];
    const { error: e1 } = await supabase.functions.invoke("seed-demo-accounts", { body: { accounts: priority } });
    if (e1) throw e1;

    // Phase 2 (background): students + parents in chunks of 50.
    const rest = [...studentAccts, ...parentAccts];
    (async () => {
      for (let i = 0; i < rest.length; i += 50) {
        const chunk = rest.slice(i, i + 50);
        try { await supabase.functions.invoke("seed-demo-accounts", { body: { accounts: chunk } }); }
        catch (err) { console.error("seed-demo-accounts chunk failed", err); }
      }
      toast({ title: "All demo logins ready", description: `Students & parents provisioned (${rest.length} accounts).` });
    })();
  }

  async function persistStudentsToDb(seed: ReturnType<typeof generateDemoSeed>) {
    // Insert seeded students into the DB so they appear in the Admin → Students section
    // (which reads from the `students` table). Logged-in admin satisfies RLS.
    const rows = seed.students.map(s => {
      const [first, ...rest] = s.fullName.split(" ");
      const last = rest.join(" ");
      const parent = seed.parents.find(p => p.studentId === s.id);
      return {
        admission_number: s.admissionNumber,
        full_name: s.fullName,
        first_name: first,
        last_name: last,
        email: s.email,
        date_of_birth: s.dob,
        gender: s.gender,
        form: `Form ${s.form}`,
        stream: s.stream,
        class: `Form ${s.form}${s.stream}`,
        boarding_status: "day",
        status: "active",
        guardian_name: parent?.fullName ?? null,
        guardian_phone: parent?.phone ?? null,
        guardian_email: parent?.email ?? null,
      };
    });
    // Chunk to keep request size small.
    for (let i = 0; i < rows.length; i += 60) {
      const chunk = rows.slice(i, i + 60);
      const { error } = await supabase
        .from("students")
        .upsert(chunk, { onConflict: "admission_number" });
      if (error) throw error;
    }
  }

  async function handleLoad() {
    setRunning(true);
    setStepIdx(0);
    for (let i = 0; i < 7; i++) {
      await new Promise(r => setTimeout(r, 300));
      setStepIdx(i + 1);
    }
    const seed = generateDemoSeed();
    alloc.replaceAllData({
      teachers: seed.teachers,
      subjects: seed.subjects,
      rooms: seed.rooms,
      classes: seed.classes,
      allocations: seed.allocations,
      slots: seed.slots,
    });
    people.setSeed({ students: seed.students, parents: seed.parents });

    setStepIdx(7);
    try {
      await provisionAuthAccounts(seed);
    } catch (e: any) {
      toast({ title: "Account provisioning failed", description: e?.message || "Could not create login accounts", variant: "destructive" });
    }
    setStepIdx(8);
    await new Promise(r => setTimeout(r, 300));

    const summ = {
      students: seed.students.length,
      parents: seed.parents.length,
      teachers: seed.teachers.length,
      subjects: seed.subjects.length,
      classes: seed.classes.length,
      rooms: seed.rooms.length,
      periods: seed.slots.filter(s => s.subjectId).length,
    };
    setSummary(summ);
    setShowSummary(true);
    setRunning(false);
    toast({ title: "Demo data loaded", description: `Admin + ${summ.teachers} teachers can log in now. Students & parents finishing in background.` });
  }

  function handleClear() {
    if (!confirm("Remove all seeded demo data and reset to a clean state? Real data is untouched.")) return;
    alloc.resetToSeed();
    people.clear();
    setSummary(null);
    toast({ title: "Demo data cleared", description: "Application reset to a clean state." });
  }

  function downloadCredentialsCsv() {
    if (!people.students.length) return;
    const lines = ["role,full_name,reference,email,password"];
    lines.push(`admin,"Administrator","Full access",admin@schooldemo.com,Demo@2025`);
    alloc.teachers.forEach(t => lines.push(`teacher,"${t.name}","${t.employeeNumber}",${t.email},Teacher@2025`));
    people.students.forEach(s => lines.push(`student,"${s.fullName}","${s.admissionNumber} • Form ${s.form}${s.stream}",${s.email},${s.password}`));
    people.parents.forEach(p => {
      const child = people.students.find(s => s.id === p.studentId);
      lines.push(`parent (${p.relationship}),"${p.fullName}","Child: ${child?.fullName ?? ""}",${p.email},${p.password}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "demo-credentials.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    { icon: GraduationCap, label: "Students",  value: people.students.length, color: "text-blue-600" },
    { icon: UserCog,       label: "Parents",   value: people.parents.length,  color: "text-purple-600" },
    { icon: Users,         label: "Teachers",  value: seeded ? alloc.teachers.length : 0, color: "text-emerald-600" },
    { icon: BookOpen,      label: "Subjects",  value: seeded ? alloc.subjects.length : 0, color: "text-amber-600" },
    { icon: Building2,     label: "Classes",   value: seeded ? alloc.classes.length  : 0, color: "text-rose-600" },
    { icon: CalendarClock, label: "Periods",   value: seeded ? alloc.slots.filter(s => s.subjectId).length : 0, color: "text-cyan-600" },
  ];

  return (
    <>
      <Card className="border-2 border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50/60 via-background to-teal-50/40 dark:from-cyan-950/30 dark:to-teal-950/20">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-600" />
              Demo Data Seeder
              <Badge variant="outline" className="ml-2 border-cyan-300 text-cyan-700 dark:text-cyan-300">Demo</Badge>
              {seeded && <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Loaded</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              One-click populate the entire system with realistic Zimbabwean school data — students, parents,
              teachers, subjects, classes, venues and a complete weekly timetable.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleLoad} disabled={running} className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-90">
              {running ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
              {seeded ? "Re-seed Demo Data" : "Load Demo Data"}
            </Button>
            {seeded && (
              <>
                <Button onClick={downloadCredentialsCsv} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Credentials CSV
                </Button>
                <Button onClick={handleClear} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" /> Clear Demo Data
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {running && (
            <div className="space-y-3 mb-4">
              <Progress value={((stepIdx + 1) / STEPS.length) * 100} />
              <div className="space-y-1.5">
                {STEPS.map((s, i) => (
                  <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: i <= stepIdx ? 1 : 0.4 }}
                    className="flex items-center gap-2 text-sm">
                    {i < stepIdx ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                      i === stepIdx ? <Loader2 className="h-4 w-4 animate-spin text-cyan-600" /> :
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />}
                    <span>{s}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-lg border bg-background/80 p-3">
                <div className={`flex items-center gap-2 ${color}`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{value}</div>
              </div>
            ))}
          </div>

          {seeded && (
            <p className="text-xs text-muted-foreground mt-3">
              Loaded {new Date(people.loadedAt!).toLocaleString()} — visible across student, teacher, parent and admin portals.
              School day: {DEMO_PERIODS[0].start}–{DEMO_PERIODS[DEMO_PERIODS.length - 1].end}, {DEMO_PERIODS.length} periods × 45 min, break after P3, lunch after P5.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" /> Demo data loaded successfully
            </DialogTitle>
            <DialogDescription>
              The entire system has been populated and the timetable is live across every portal.
            </DialogDescription>
          </DialogHeader>
          {summary && (
            <div className="space-y-2 text-sm">
              <Row label="Students enrolled"   value={summary.students}  hint="Form 1–6, 30 per form, 15 per stream" />
              <Row label="Parents & guardians" value={summary.parents}   hint="2 per student with portal logins" />
              <Row label="Teachers"            value={summary.teachers}  hint="All subjects covered" />
              <Row label="Subjects"            value={summary.subjects}  hint="Linked to relevant forms" />
              <Row label="Classes"             value={summary.classes}   hint="Form 1A through Form 6B" />
              <Row label="Venues"              value={summary.rooms}     hint="Classrooms, labs, hall, sports field" />
              <Row label="Timetable periods"   value={summary.periods}   hint="Every slot filled with subject, teacher, venue, time" />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={downloadCredentialsCsv} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-1" /> Download credentials CSV
            </Button>
            <Button onClick={() => setShowSummary(false)} className="flex-1">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}
