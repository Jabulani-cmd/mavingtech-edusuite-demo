// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PrintableSection from "@/components/shared/PrintableSection";

interface Props {
  userId: string;
  classes: any[];
  subjects: any[];
}

function capsGrade(pct: number): string {
  if (pct >= 80) return "7";
  if (pct >= 70) return "6";
  if (pct >= 60) return "5";
  if (pct >= 50) return "4";
  if (pct >= 40) return "3";
  if (pct >= 30) return "2";
  return "1";
}

export default function TeacherMarksReport({ userId, classes, subjects }: Props) {
  const [classId, setClassId] = useState<string>("all");
  const [subjectId, setSubjectId] = useState<string>("all");
  const [term, setTerm] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [classId, subjectId, userId]);

  const load = async () => {
    setLoading(true);
    try {
      // Resolve student ids for scope
      let studentIds: string[] | null = null;
      if (classId !== "all") {
        const { data: sc } = await supabase.from("student_classes").select("student_id").eq("class_id", classId);
        studentIds = (sc || []).map((r: any) => r.student_id);
        if (studentIds.length === 0) { setRows([]); setLoading(false); return; }
      }

      // Manual marks by this teacher
      let mq = supabase.from("marks").select("id, mark, term, assessment_type, description, created_at, student_id, subject_id, subjects(name), students(full_name, admission_number, form, class)").eq("teacher_id", userId);
      if (studentIds) mq = mq.in("student_id", studentIds);
      if (subjectId !== "all") mq = mq.eq("subject_id", subjectId);
      const { data: manual } = await mq.order("created_at", { ascending: false });

      // AI/assessment results for assessments owned by this teacher
      const { data: myAssess } = await supabase.from("assessments").select("id, title, assessment_type, max_marks, subject_id, subjects(name)").eq("created_by", userId);
      const assessIds = (myAssess || []).map((a: any) => a.id);
      let aiRows: any[] = [];
      if (assessIds.length) {
        let aq = supabase.from("assessment_results").select("id, mark, created_at, graded_by, assessment_id, student_id, students(full_name, admission_number, form, class)").in("assessment_id", assessIds);
        if (studentIds) aq = aq.in("student_id", studentIds);
        const { data: ar } = await aq.order("created_at", { ascending: false });
        const aMap = new Map((myAssess || []).map((a: any) => [a.id, a]));
        aiRows = (ar || []).map((r: any) => {
          const a = aMap.get(r.assessment_id) || {};
          const max = Number(a.max_marks) || 0;
          const pct = max > 0 ? Math.round((Number(r.mark) / max) * 100) : Number(r.mark) || 0;
          return {
            id: `r-${r.id}`,
            source: r.graded_by ? "teacher" : "ai",
            student: r.students?.full_name || "—",
            admission: r.students?.admission_number || "—",
            grade: r.students?.form || r.students?.class || "—",
            subject: a.subjects?.name || "—",
            subject_id: a.subject_id,
            description: a.title || "Assessment",
            type: a.assessment_type || "assessment",
            term: "—",
            scoreLabel: max > 0 ? `${r.mark}/${max}` : `${r.mark}`,
            percent: pct,
            created_at: r.created_at,
          };
        });
        if (subjectId !== "all") aiRows = aiRows.filter(r => r.subject_id === subjectId);
      }

      const manualRows = (manual || []).map((m: any) => ({
        id: `m-${m.id}`, source: "manual",
        student: m.students?.full_name || "—",
        admission: m.students?.admission_number || "—",
        grade: m.students?.form || m.students?.class || "—",
        subject: m.subjects?.name || "—",
        subject_id: m.subject_id,
        description: m.description || "—",
        type: m.assessment_type || "—",
        term: m.term || "—",
        scoreLabel: `${m.mark}%`,
        percent: Number(m.mark) || 0,
        created_at: m.created_at,
      }));

      setRows([...manualRows, ...aiRows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (term !== "all" && r.term !== term) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(r.student.toLowerCase().includes(q) || r.admission.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [rows, term, search]);

  const overall = filtered.length ? Math.round(filtered.reduce((a, r) => a + r.percent, 0) / filtered.length) : 0;

  const bySubject = useMemo(() => {
    const map: Record<string, { total: number; n: number }> = {};
    filtered.forEach(r => {
      map[r.subject] = map[r.subject] || { total: 0, n: 0 };
      map[r.subject].total += r.percent; map[r.subject].n += 1;
    });
    return Object.entries(map).map(([subject, v]) => ({ subject, avg: Math.round(v.total / v.n), n: v.n })).sort((a, b) => b.avg - a.avg);
  }, [filtered]);

  const byStudent = useMemo(() => {
    const map: Record<string, { name: string; admission: string; total: number; n: number }> = {};
    filtered.forEach(r => {
      const k = r.admission + "|" + r.student;
      map[k] = map[k] || { name: r.student, admission: r.admission, total: 0, n: 0 };
      map[k].total += r.percent; map[k].n += 1;
    });
    return Object.values(map).map(s => ({ ...s, avg: Math.round(s.total / s.n) })).sort((a, b) => b.avg - a.avg);
  }, [filtered]);

  const className = classId === "all" ? "All Classes" : (classes.find(c => c.id === classId)?.name || "Class");
  const subjectName = subjectId === "all" ? "All Subjects" : (subjects.find(s => s.id === subjectId)?.name || "Subject");
  const subtitle = `${className} · ${subjectName}${term !== "all" ? ` · ${term}` : ""} · ${filtered.length} record${filtered.length === 1 ? "" : "s"} · Overall average ${overall}%`;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Class / Grade</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subject</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Term</label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
                <SelectItem value="Term 4">Term 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Student, subject, assessment…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <PrintableSection title={`Marks Report — ${className}`} subtitle={subtitle} fileName={`marks-${className}`.replace(/\s+/g, "-").toLowerCase()}>
        {loading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading marks…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No marks match the current filters.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Overall Average</p>
                <p className="text-2xl font-bold text-primary">{overall}%</p>
                <p className="text-xs">CAPS Code {capsGrade(overall)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Records</p>
                <p className="text-2xl font-bold">{filtered.length}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Learners</p>
                <p className="text-2xl font-bold">{byStudent.length}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Class Averages by Subject</h4>
              <table className="w-full text-sm border">
                <thead className="bg-muted"><tr>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-center">Records</th>
                  <th className="px-3 py-2 text-center">Average</th>
                  <th className="px-3 py-2 text-center">CAPS</th>
                </tr></thead>
                <tbody>
                  {bySubject.map(s => (
                    <tr key={s.subject} className="border-t">
                      <td className="px-3 py-2">{s.subject}</td>
                      <td className="px-3 py-2 text-center">{s.n}</td>
                      <td className="px-3 py-2 text-center font-bold">{s.avg}%</td>
                      <td className="px-3 py-2 text-center">{capsGrade(s.avg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Learner Rankings</h4>
              <table className="w-full text-sm border">
                <thead className="bg-muted"><tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Learner</th>
                  <th className="px-3 py-2 text-left">Admission</th>
                  <th className="px-3 py-2 text-center">Records</th>
                  <th className="px-3 py-2 text-center">Average</th>
                  <th className="px-3 py-2 text-center">CAPS</th>
                </tr></thead>
                <tbody>
                  {byStudent.map((s, i) => (
                    <tr key={s.admission} className="border-t">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{s.admission}</td>
                      <td className="px-3 py-2 text-center">{s.n}</td>
                      <td className="px-3 py-2 text-center font-bold">{s.avg}%</td>
                      <td className="px-3 py-2 text-center">{capsGrade(s.avg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">All Marks</h4>
              <table className="w-full text-sm border">
                <thead className="bg-muted"><tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Learner</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Assessment</th>
                  <th className="px-3 py-2 text-center">Type</th>
                  <th className="px-3 py-2 text-center">Term</th>
                  <th className="px-3 py-2 text-center">Source</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-center">%</th>
                  <th className="px-3 py-2 text-center">CAPS</th>
                </tr></thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString("en-ZA")}</td>
                      <td className="px-3 py-2">{r.student}</td>
                      <td className="px-3 py-2">{r.grade}</td>
                      <td className="px-3 py-2">{r.subject}</td>
                      <td className="px-3 py-2">{r.description}</td>
                      <td className="px-3 py-2 text-center capitalize">{r.type}</td>
                      <td className="px-3 py-2 text-center">{r.term}</td>
                      <td className="px-3 py-2 text-center">
                        {r.source === "ai"
                          ? <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-300"><Sparkles className="h-3 w-3 mr-1" />AI</Badge>
                          : <Badge variant="outline">{r.source === "teacher" ? "Teacher" : "Manual"}</Badge>}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{r.scoreLabel}</td>
                      <td className="px-3 py-2 text-center">{r.percent}%</td>
                      <td className="px-3 py-2 text-center">{capsGrade(r.percent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PrintableSection>
    </div>
  );
}
