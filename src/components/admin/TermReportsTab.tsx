import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Loader2, RefreshCw, CheckCircle, Send, Sparkles, PencilLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { errorMessage } from "@/lib/errors";
import { gradeFor, gradeBadgeClass } from "@/lib/grading";
import { DEFAULT_FORM, FORM_LEVELS } from "@/lib/forms";
import { takesSubject } from "@/lib/studentSubjects";

const termOptions = ["Term 1", "Term 2", "Term 3"];

interface TermReport {
  id: string;
  student_id: string;
  academic_year: string;
  term: string;
  form_level: string;
  average_mark: number;
  overall_grade: string;
  class_rank: number | null;
  class_size: number | null;
  is_published: boolean;
  generated_at: string;
  class_teacher_comment?: string | null;
  head_comment?: string | null;
  exam_data?: unknown;
  assessment_data?: unknown;
  students?: { full_name: string; admission_number: string };
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  form: string;
  subject_combination: string | null;
}

type SubjectRow = { subject: string; mark: number | null; grade: string | null };

/** Per-subject marks summary stored on a report, used for AI comments. */
function subjectsOf(report: TermReport): SubjectRow[] {
  const map = new Map<string, number[]>();
  const add = (name: string | undefined, mark: number | null | undefined) => {
    if (!name || mark == null) return;
    map.set(name, [...(map.get(name) ?? []), Number(mark)]);
  };
  for (const r of (report.exam_data as Array<{ mark: number; subjects?: { name: string } }>) ?? []) add(r.subjects?.name, r.mark);
  for (const r of (report.assessment_data as Array<{ percentage: number; assessments?: { subjects?: { name: string } } }>) ?? []) add(r.assessments?.subjects?.name, r.percentage);
  return [...map.entries()].map(([subject, marks]) => {
    const mark = Math.round(marks.reduce((a, b) => a + b, 0) / marks.length);
    return { subject, mark, grade: gradeFor(mark) };
  });
}

export default function TermReportsTab({ isAdmin = true }: { isAdmin?: boolean }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<TermReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Filters
  const [filterForm, setFilterForm] = useState(DEFAULT_FORM);
  const [filterTerm, setFilterTerm] = useState("Term 1");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<TermReport | null>(null);
  const [teacherComment, setTeacherComment] = useState("");
  const [headComment, setHeadComment] = useState("");
  const [tone, setTone] = useState<"encouraging" | "neutral" | "needs_improvement">("neutral");
  const [aiBusy, setAiBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  async function aiComment(report: TermReport, t = tone): Promise<string> {
    const { data, error } = await supabase.functions.invoke("ai-report-comment", {
      body: { studentName: report.students?.full_name ?? "Learner", formLevel: report.form_level, term: `${report.term} ${report.academic_year}`, grades: subjectsOf(report), tone: t },
    });
    if (error) throw new Error((data as { error?: string })?.error || error.message);
    if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    return (data as { comment: string }).comment;
  }

  function openEditor(report: TermReport) {
    setEditing(report);
    setTeacherComment(report.class_teacher_comment ?? "");
    setHeadComment(report.head_comment ?? "");
  }

  async function draftWithAi() {
    if (!editing) return;
    setAiBusy(true);
    try { setTeacherComment(await aiComment(editing)); }
    catch (err) { toast({ title: "AI could not write the comment", description: errorMessage(err), variant: "destructive" }); }
    setAiBusy(false);
  }

  async function saveComments() {
    if (!editing) return;
    const patch: { class_teacher_comment: string; head_comment?: string } = { class_teacher_comment: teacherComment.trim() };
    if (isAdmin) patch.head_comment = headComment.trim();
    const { error } = await supabase.from("term_reports").update(patch).eq("id", editing.id);
    if (error) { toast({ title: "Could not save", description: errorMessage(error), variant: "destructive" }); return; }
    toast({ title: "Report saved" });
    setEditing(null);
    fetchReports();
  }

  /** AI agent: writes class teacher comments for every draft report that has none yet. */
  async function aiWriteAll() {
    const todo = reports.filter((r) => !r.is_published && !r.class_teacher_comment);
    if (todo.length === 0) { toast({ title: "Nothing to write", description: "All draft reports already have comments." }); return; }
    let done = 0;
    for (const r of todo) {
      setBulkProgress(`${done}/${todo.length}`);
      try {
        const comment = await aiComment(r, r.average_mark >= 70 ? "encouraging" : r.average_mark < 50 ? "needs_improvement" : "neutral");
        await supabase.from("term_reports").update({ class_teacher_comment: comment }).eq("id", r.id);
        done++;
      } catch (err) {
        toast({ title: `Stopped after ${done} reports`, description: errorMessage(err), variant: "destructive" });
        break;
      }
    }
    setBulkProgress(null);
    if (done) toast({ title: "AI comments written", description: `${done} reports updated. Review them before publishing.` });
    fetchReports();
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("students")
      .select("id, full_name, admission_number, form, subject_combination")
      .eq("status", "active")
      
      .order("full_name");
    if (data) setStudents(data);
    setLoading(false);
  }

  const fetchReports = useCallback(async () => {
    const { data } = await supabase
      .from("term_reports")
      .select("*, students(full_name, admission_number)")
      .eq("form_level", filterForm)
      .eq("term", filterTerm)
      .eq("academic_year", filterYear)
      .order("class_rank", { nullsFirst: false });
    if (data) setReports(data);
  }, [filterForm, filterTerm, filterYear]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, filterForm, filterTerm, filterYear]);

  async function generateReports() {
    setGenerating(true);
    try {
      // Published reports are historical records: never replace them when rebuilding current drafts.
      const { data: published } = await supabase.from("term_reports").select("student_id")
        .eq("form_level", filterForm).eq("term", filterTerm).eq("academic_year", filterYear).eq("is_published", true);
      const publishedIds = new Set((published ?? []).map((r) => r.student_id));
      const formStudents = students.filter(s => s.form === filterForm && !publishedIds.has(s.id));
      if (formStudents.length === 0) {
        toast({ title: "No students", description: "No active students in this form level", variant: "destructive" });
        setGenerating(false);
        return;
      }

      // Get exam results for this form, term, year
      const { data: exams } = await supabase
        .from("exams")
        .select("id")
        .eq("form_level", filterForm)
        .eq("term", filterTerm)
        .eq("academic_year", filterYear);
      const examIds = exams?.map(e => e.id) || [];

      // Get assessment results for students in this form
      const { data: assessmentResults } = await supabase
        .from("assessment_results")
        .select("student_id, mark, percentage, grade, assessments(subjects(name))")
        .in("student_id", formStudents.map(s => s.id))
        .eq("is_published", true);

      // Get exam results
      const { data: examResults } = await supabase
        .from("exam_results")
        .select("student_id, subject_id, mark, grade, subjects(name)")
        .in("exam_id", examIds);

      // Calculate averages and rankings
      const studentAverages: { id: string; total: number; count: number; avg: number }[] = [];

      for (const student of formStudents) {
        const studentExamResults = examResults?.filter(r => r.student_id === student.id && takesSubject(student.subject_combination, r.subjects?.name)) || [];
        const studentAssessResults = assessmentResults?.filter(r => r.student_id === student.id && takesSubject(student.subject_combination, r.assessments?.subjects?.name)) || [];

        // Calculate weighted average (exams 70%, assessments 30%)
        let examTotal = 0, examCount = 0;
        studentExamResults.forEach(r => { examTotal += r.mark; examCount++; });
        
        let assessTotal = 0, assessCount = 0;
        studentAssessResults.forEach(r => { 
          if (r.percentage) { assessTotal += r.percentage; assessCount++; }
        });

        const examAvg = examCount > 0 ? examTotal / examCount : 0;
        const assessAvg = assessCount > 0 ? assessTotal / assessCount : 0;
        
        // Weighted average
        let finalAvg = 0;
        if (examCount > 0 && assessCount > 0) {
          finalAvg = (examAvg * 0.7) + (assessAvg * 0.3);
        } else if (examCount > 0) {
          finalAvg = examAvg;
        } else if (assessCount > 0) {
          finalAvg = assessAvg;
        }

        studentAverages.push({ id: student.id, total: examTotal + assessTotal, count: examCount + assessCount, avg: finalAvg });
      }

      // Sort by average and assign ranks
      studentAverages.sort((a, b) => b.avg - a.avg);
      const classSize = studentAverages.filter(s => s.count > 0).length;

      // Delete existing reports for this combination
      await supabase
        .from("term_reports")
        .delete()
        .eq("form_level", filterForm)
        .eq("term", filterTerm)
        .eq("academic_year", filterYear)
        .eq("is_published", false);

      // Create new reports
      const reportsToInsert = studentAverages
        .filter(s => s.count > 0)
        .map((s, idx) => ({
          student_id: s.id,
          academic_year: filterYear,
          term: filterTerm,
          form_level: filterForm,
          total_marks: s.total,
          average_mark: Math.round(s.avg * 100) / 100,
          overall_grade: gradeFor(s.avg),
          class_rank: idx + 1,
          class_size: classSize,
          assessment_data: assessmentResults?.filter(r => r.student_id === s.id && takesSubject(formStudents.find((st) => st.id === s.id)?.subject_combination, r.assessments?.subjects?.name)) || [],
          exam_data: examResults?.filter(r => r.student_id === s.id && takesSubject(formStudents.find((st) => st.id === s.id)?.subject_combination, r.subjects?.name)) || [],
          generated_by: user?.id,
          is_published: false
        }));

      if (reportsToInsert.length > 0) {
        const { error } = await supabase.from("term_reports").insert(reportsToInsert);
        if (error) throw error;
      }

      toast({ title: "Reports generated", description: `${reportsToInsert.length} reports created` });
      fetchReports();
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err), variant: "destructive" });
    }
    setGenerating(false);
  }

  async function togglePublish(reportId: string, currentStatus: boolean) {
    await supabase.from("term_reports").update({ is_published: !currentStatus }).eq("id", reportId);
    toast({ title: currentStatus ? "Report unpublished" : "Report published" });
    fetchReports();
  }

  async function publishSelected() {
    if (selectedIds.length === 0) return;
    await supabase.from("term_reports").update({ is_published: true }).in("id", selectedIds);
    toast({ title: "Reports published", description: `${selectedIds.length} reports published` });
    setSelectedIds([]);
    fetchReports();
  }

  async function notifyParents() {
    const publishedReports = reports.filter(r => r.is_published);
    if (publishedReports.length === 0) {
      toast({ title: "No published reports", variant: "destructive" });
      return;
    }

    // Get parent links
    const { data: parentLinks } = await supabase
      .from("parent_students")
      .select("parent_id, student_id")
      .in("student_id", publishedReports.map(r => r.student_id));

    if (parentLinks && parentLinks.length > 0) {
      const notifications = parentLinks.map(pl => ({
        user_id: pl.parent_id,
        title: "Term Report Available",
        message: `The ${filterTerm} ${filterYear} report for your child is now available. Please check your dashboard.`,
        type: "term_report"
      }));

      await supabase.from("notifications").insert(notifications);
      toast({ title: "Parents notified", description: `${parentLinks.length} notifications sent` });
    } else {
      toast({ title: "No linked parents found", variant: "destructive" });
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reports.map(r => r.id));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="font-heading">Term Reports</CardTitle>
            <CardDescription>Generate comprehensive end-of-term reports combining assessments and exam results</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-2">
            <Label>Form Level</Label>
            <Select value={filterForm} onValueChange={setFilterForm}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORM_LEVELS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Term</Label>
            <Select value={filterTerm} onValueChange={setFilterTerm}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {termOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-[100px]" />
          </div>
          <Button onClick={generateReports} disabled={generating} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {generating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
            Generate Reports
          </Button>
          {reports.length > 0 && (
            <Button onClick={aiWriteAll} disabled={!!bulkProgress} variant="outline">
              {bulkProgress ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
              {bulkProgress ? `AI writing ${bulkProgress}` : "AI Agent: Write All Comments"}
            </Button>
          )}
          {isAdmin && reports.length > 0 && (
            <>
              <Button onClick={publishSelected} disabled={selectedIds.length === 0} variant="outline">
                <CheckCircle className="mr-1 h-4 w-4" /> Publish Selected ({selectedIds.length})
              </Button>
              <Button onClick={notifyParents} variant="outline">
                <Send className="mr-1 h-4 w-4" /> Notify Parents
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        {reports.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span>Total: <strong>{reports.length}</strong></span>
            <span className="text-green-600">Published: <strong>{reports.filter(r => r.is_published).length}</strong></span>
            <span className="text-amber-600">Draft: <strong>{reports.filter(r => !r.is_published).length}</strong></span>
          </div>
        )}

        {/* Reports Table */}
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedIds.length === reports.length && reports.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Adm #</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(report.id)}
                        onCheckedChange={() => toggleSelect(report.id)}
                      />
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {report.class_rank}
                      <span className="text-xs text-muted-foreground font-normal">/{report.class_size}</span>
                    </TableCell>
                    <TableCell className="font-medium">{report.students?.full_name}</TableCell>
                    <TableCell className="text-xs">{report.students?.admission_number}</TableCell>
                    <TableCell className="font-semibold">{report.average_mark}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={gradeBadgeClass(report.overall_grade)}>
                        {report.overall_grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-xs text-muted-foreground truncate" title={report.class_teacher_comment ?? ""}>
                      {report.class_teacher_comment || "Not written"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.is_published ? "default" : "outline"}>
                        {report.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(report.generated_at), "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditor(report)} disabled={report.is_published && !isAdmin} title="Write or edit comments">
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        {isAdmin && <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => togglePublish(report.id, report.is_published)}
                          title={report.is_published ? "Unpublish" : "Publish"}
                        >
                          <CheckCircle className={`h-4 w-4 ${report.is_published ? "text-green-600" : ""}`} />
                        </Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No reports generated for {filterForm} - {filterTerm} {filterYear}</p>
            <p className="text-sm mt-1">Click "Generate Reports" to compile results from assessments and exams</p>
          </div>
        )}
      </CardContent>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.students?.full_name}: {editing?.term} {editing?.academic_year}</DialogTitle>
            <DialogDescription>Average {editing?.average_mark}% ({editing?.overall_grade}), position {editing?.class_rank}/{editing?.class_size}. Write the comment yourself or let AI draft it, then edit.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {subjectsOf(editing).map((s) => <Badge key={s.subject} variant="outline">{s.subject}: {s.mark}% {s.grade}</Badge>)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>Class teacher's comment</Label>
                  <div className="flex gap-2">
                    <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                      <SelectTrigger className="w-[170px] h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encouraging">Encouraging</SelectItem>
                        <SelectItem value="neutral">Balanced</SelectItem>
                        <SelectItem value="needs_improvement">Needs improvement</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={draftWithAi} disabled={aiBusy}>
                      {aiBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />} Write with AI
                    </Button>
                  </div>
                </div>
                <Textarea rows={5} value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} placeholder="Type the comment for this learner's report" />
              </div>
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Head's comment</Label>
                  <Textarea rows={3} value={headComment} onChange={(e) => setHeadComment(e.target.value)} />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveComments}>Save report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
