import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { openPrintWindow } from "@/lib/finance/print";
import { safeFileName } from "@/lib/print/printSection";
import { csvBlob } from "@/lib/spreadsheet";
import { attendanceRegister, classList, marksRegister, registerCsv, registerHtml, registerPdf, type RegisterStudent, type RegisterTable } from "@/lib/classRecords";

type Kind = "attendance" | "marks" | "list";
const LABEL: Record<Kind, string> = { attendance: "Attendance Register", marks: "Marks Register", list: "Class List" };
const LEGEND: Partial<Record<Kind, string>> = { attendance: "P = Present, A = Absent, L = Late, E = Excused, - = not marked", marks: "Average percentage per subject across all recorded marks in the period" };

export default function ClassRecordsExport({ classes: given }: { classes?: { id: string; name: string }[] }) {
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";
  const [classes, setClasses] = useState(given || []);
  const [classId, setClassId] = useState("");
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (given) { setClasses(given); return; }
    supabase.from("classes").select("id, name").order("name").then(({ data }) => setClasses(data || []));
  }, [given]);

  const roster = async (): Promise<RegisterStudent[]> => {
    const { data: links } = await supabase.from("student_classes").select("student_id").eq("class_id", classId);
    const ids = [...new Set((links || []).map(l => l.student_id).filter(Boolean) as string[])];
    if (!ids.length) return [];
    const { data } = await supabase.from("students").select("id, full_name, admission_number, gender, guardian_name, guardian_phone, subject_combination").in("id", ids);
    return (data || []) as RegisterStudent[];
  };

  const build = async (kind: Kind): Promise<RegisterTable> => {
    const students = await roster();
    if (kind === "list") return classList(students);
    if (kind === "attendance") {
      const { data, error } = await supabase.from("attendance").select("student_id, date, status").eq("class_id", classId).gte("date", from).lte("date", to).limit(20000);
      if (error) throw error;
      return attendanceRegister(students, data || []);
    }
    const ids = students.map(s => s.id);
    const { data, error } = await supabase.from("marks").select("student_id, subject_id, mark, out_of").in("student_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]).gte("created_at", from).lte("created_at", to + "T23:59:59").limit(20000);
    if (error) throw error;
    const { data: subs } = await supabase.from("subjects").select("id, name");
    return marksRegister(students, data || [], Object.fromEntries((subs || []).map(s => [s.id, s.name])));
  };

  const run = async (kind: Kind, mode: "print" | "pdf" | "csv") => {
    if (!classId) { toast({ title: "Please select a class first", variant: "destructive" }); return; }
    setBusy(kind + mode);
    try {
      const t = await build(kind);
      if (!t.body.length) { toast({ title: "No learners found in this class" }); return; }
      const cls = classes.find(c => c.id === classId)?.name || "Class";
      const title = `${LABEL[kind]}: ${cls}`;
      const sub = kind === "list" ? `As at ${today}` : `${from} to ${to}`;
      const file = safeFileName(`${LABEL[kind]}-${cls}-${kind === "list" ? today : `${from}-${to}`}`);
      if (mode === "print") openPrintWindow(registerHtml(title, sub, t, LEGEND[kind]));
      else if (mode === "pdf") (await registerPdf(title, sub, t, LEGEND[kind])).save(`${file}.pdf`);
      else {
        const url = URL.createObjectURL(csvBlob(registerCsv(t)));
        const a = document.createElement("a"); a.href = url; a.download = `${file}.csv`; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (e) {
      toast({ title: "Could not create the record", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Print and Download Class Records</CardTitle>
        <CardDescription>Official attendance registers, marks registers and class lists with school letterhead and signature lines for filing and evidence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-2"><Label>Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger aria-label="Records class"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>From</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="space-y-2"><Label>To</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
        </div>
        <div className="space-y-2">
          {(Object.keys(LABEL) as Kind[]).map(kind => (
            <div key={kind} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
              <span className="text-sm font-medium">{LABEL[kind]}</span>
              <div className="flex gap-2">
                {([["print", Printer, "Print"], ["pdf", FileDown, "PDF"], ["csv", FileSpreadsheet, "Excel/CSV"]] as const).map(([mode, Icon, text]) => (
                  <Button key={mode} variant="outline" size="sm" disabled={!!busy} onClick={() => run(kind, mode)} aria-label={`${text} ${LABEL[kind]}`}>
                    {busy === kind + mode ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Icon className="mr-1 h-4 w-4" />}{text}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
