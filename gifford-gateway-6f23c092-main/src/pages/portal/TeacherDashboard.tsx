// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, BookOpen, Bell, BarChart3, Calendar, ClipboardList,
  FileText, Users, CheckCircle2, Clock, GraduationCap, AlertCircle, CalendarOff
} from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PersonalTimetableEditor from "@/components/PersonalTimetableEditor";
import NotificationBell from "@/components/NotificationBell";
import AssessmentsTab from "@/components/teacher/AssessmentsTab";
import EnhancedMaterialsTab from "@/components/teacher/EnhancedMaterialsTab";
import EnhancedAnnouncementsTab from "@/components/teacher/EnhancedAnnouncementsTab";
import BulkMarksUpload from "@/components/teacher/BulkMarksUpload";
import StaffLeaveRequest from "@/components/teacher/StaffLeaveRequest";
import ExamResultsUpload from "@/components/teacher/ExamResultsUpload";
const termOptions = ["Term 1", "Term 2", "Term 3"];
const assessmentTypes = ["test", "exam", "assignment", "project"];

function zimGrade(mark: number): string {
  if (mark >= 90) return "A*";
  if (mark >= 80) return "A";
  if (mark >= 70) return "B";
  if (mark >= 60) return "C";
  if (mark >= 50) return "D";
  if (mark >= 40) return "E";
  return "U";
}

export default function TeacherDashboard() {
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [myMaterials, setMyMaterials] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<any[]>([]);
  const [attendanceClasses, setAttendanceClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ classCount: 0, pendingGrading: 0, materialsCount: 0, upcomingHw: 0 });

  // Mark form
  const [markForm, setMarkForm] = useState({ student_id: "", subject_id: "", mark: "", term: "Term 1", assessment_type: "test", description: "", comment: "" });
  const [markLoading, setMarkLoading] = useState(false);

  // Homework form
  const [hwForm, setHwForm] = useState({ class_id: "", subject_id: "", title: "", due_date: "", description: "" });
  const [hwLoading, setHwLoading] = useState(false);

  // Attendance
  const [attClass, setAttClass] = useState("");
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attStudents, setAttStudents] = useState<any[]>([]);
  const [attRecords, setAttRecords] = useState<Record<string, string>>({});
  const [attLoading, setAttLoading] = useState(false);

  // Timetable
  const [selectedTTClass, setSelectedTTClass] = useState("");
  const [timetableData, setTimetableData] = useState<any[]>([]);

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [profRes, subRes, allClassRes, staffRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("classes").select("*").order("name"),
      supabase.from("staff").select("id, staff_number, department, role").eq("user_id", user!.id).single(),
    ]);
    if (profRes.data) setProfile(profRes.data);
    if (staffRes.data) setStaffInfo(staffRes.data);
    if (subRes.data) setSubjects(subRes.data);

    // Filter classes to only those assigned to this teacher
    const allClasses = allClassRes.data || [];
    let teacherClasses = allClasses;
    
    if (staffRes.data) {
      const staffId = staffRes.data.id;
      // Get classes assigned via class_subjects
      const { data: csData } = await supabase
        .from("class_subjects")
        .select("class_id")
        .eq("teacher_id", staffId);
      
      const assignedClassIds = new Set<string>();
      // Classes where teacher is class_teacher
      allClasses.forEach(c => {
        if (c.class_teacher_id === staffId) assignedClassIds.add(c.id);
      });
      // Classes where teacher teaches a subject
      if (csData) {
        csData.forEach(cs => assignedClassIds.add(cs.class_id));
      }
      
      if (assignedClassIds.size > 0) {
        teacherClasses = allClasses.filter(c => assignedClassIds.has(c.id));
      }
    }

    setClasses(teacherClasses);
    setAttendanceClasses(teacherClasses);
    if (teacherClasses.length > 0) setSelectedTTClass(teacherClasses[0].id);

    const { data: allStudents } = await supabase.from("students").select("id, full_name, form, stream, admission_number").eq("status", "active").order("full_name");
    if (allStudents) setStudents(allStudents);

    const { data: mats } = await supabase.from("study_materials").select("*, classes(name), subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false });
    if (mats) setMyMaterials(mats);

    const { data: marksData } = await supabase.from("marks").select("*, subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false }).limit(50);
    if (marksData) setMarks(marksData);

    const { data: hwData } = await supabase.from("homework").select("*, subjects(name), classes:class_id(name)").eq("teacher_id", user!.id).order("due_date", { ascending: false }).limit(50);
    if (hwData) setHomework(hwData);

    const { data: ann } = await supabase.from("announcements").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(20);
    if (ann) setAnnouncements(ann);

    const { data: myAnn } = await supabase.from("announcements").select("*").eq("author_id", user!.id).order("created_at", { ascending: false }).limit(20);
    if (myAnn) setMyAnnouncements(myAnn);

    const classCount = teacherClasses.length;
    const upcomingHw = hwData?.filter(h => new Date(h.due_date) >= new Date()).length || 0;
    setStats({ classCount, pendingGrading: 0, materialsCount: mats?.length || 0, upcomingHw });

    setLoading(false);
  };

  useEffect(() => {
    if (selectedTTClass) {
      supabase.from("timetable").select("*, subjects(name)").eq("class_id", selectedTTClass).then(({ data }) => {
        if (data) setTimetableData(data);
      });
    }
  }, [selectedTTClass]);

  useEffect(() => {
    if (!attClass) return;
    (async () => {
      const { data: sc } = await supabase.from("student_classes").select("student_id").eq("class_id", attClass);
      if (sc && sc.length > 0) {
        const ids = sc.map(s => s.student_id);
        const { data: studs } = await supabase.from("students").select("id, full_name, admission_number").in("id", ids).eq("status", "active").order("full_name");
        if (studs) { setAttStudents(studs); const d: Record<string, string> = {}; studs.forEach(s => { d[s.id] = "present"; }); setAttRecords(d); }
      } else {
        const cls = classes.find(c => c.id === attClass);
        if (cls?.form_level) {
          const { data: studs } = await supabase.from("students").select("id, full_name, admission_number").eq("form", cls.form_level).eq("status", "active").order("full_name");
          if (studs) { setAttStudents(studs); const d: Record<string, string> = {}; studs.forEach(s => { d[s.id] = "present"; }); setAttRecords(d); }
        }
      }
    })();
  }, [attClass]);

  const submitMark = async () => {
    const { student_id, subject_id, mark, term, assessment_type, description, comment } = markForm;
    if (!student_id || !subject_id || !mark) { toast({ title: "Fill all required fields", variant: "destructive" }); return; }
    setMarkLoading(true);
    const { error } = await supabase.from("marks").insert({ student_id, subject_id, mark: parseInt(mark), term, assessment_type, description: description || null, teacher_id: user!.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: `Mark submitted — Grade: ${zimGrade(parseInt(mark))}` });
      await supabase.from("notifications").insert({ user_id: user!.id, title: "Mark Recorded", message: `Grade ${zimGrade(parseInt(mark))} recorded for ${assessment_type}.`, type: "mark" });
      setMarkForm({ student_id: "", subject_id: "", mark: "", term: "Term 1", assessment_type: "test", description: "", comment: "" });
      const { data } = await supabase.from("marks").select("*, subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false }).limit(50);
      if (data) setMarks(data);
    }
    setMarkLoading(false);
  };

  const submitHomework = async () => {
    const { class_id, subject_id, title, due_date, description } = hwForm;
    if (!class_id || !subject_id || !title || !due_date) { toast({ title: "Fill all required fields", variant: "destructive" }); return; }
    setHwLoading(true);
    const { error } = await supabase.from("homework").insert({ class_id, subject_id, title, due_date, description: description || null, teacher_id: user!.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Homework posted!" });
      setHwForm({ class_id: "", subject_id: "", title: "", due_date: "", description: "" });
      const { data } = await supabase.from("homework").select("*, subjects(name), classes:class_id(name)").eq("teacher_id", user!.id).order("due_date", { ascending: false }).limit(50);
      if (data) setHomework(data);
    }
    setHwLoading(false);
  };

  const submitAttendance = async () => {
    if (!attClass || !attDate || attStudents.length === 0) { toast({ title: "Select class and date", variant: "destructive" }); return; }
    setAttLoading(true);
    const records = attStudents.map(s => ({ student_id: s.id, class_id: attClass, attendance_date: attDate, status: attRecords[s.id] || "present", recorded_by: user!.id }));
    const { error } = await supabase.from("attendance").upsert(records, { onConflict: "student_id,class_id,attendance_date", ignoreDuplicates: false });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: `Attendance saved — ${Object.values(attRecords).filter(s => s === "present").length}/${attStudents.length} present` }); }
    setAttLoading(false);
  };

  const markAllPresent = () => { const r: Record<string, string> = {}; attStudents.forEach(s => { r[s.id] = "present"; }); setAttRecords(r); };
  const markAllAbsent = () => { const r: Record<string, string> = {}; attStudents.forEach(s => { r[s.id] = "absent"; }); setAttRecords(r); };

  const refreshMaterials = async () => {
    const { data } = await supabase.from("study_materials").select("*, classes(name), subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false });
    if (data) { setMyMaterials(data); setStats(p => ({ ...p, materialsCount: data.length })); }
  };

  const refreshAnnouncements = async () => {
    const [{ data: ann }, { data: myAnn }] = await Promise.all([
      supabase.from("announcements").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(20),
      supabase.from("announcements").select("*").eq("author_id", user!.id).order("created_at", { ascending: false }).limit(20),
    ]);
    if (ann) setAnnouncements(ann);
    if (myAnn) setMyAnnouncements(myAnn);
  };

  const refreshMarks = async () => {
    const { data } = await supabase.from("marks").select("*, subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false }).limit(50);
    if (data) setMarks(data);
  };

  const handleLogout = async () => { await signOut(); navigate("/login"); };
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Teacher";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["07:30", "08:30", "10:00", "11:00", "13:00"];
  const getTimetableCell = (ts: string, di: number) => timetableData.find(t => t.time_slot === ts && t.day_of_week === di)?.subjects?.name || "—";

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={schoolLogo} alt="Gifford High" className="h-8 w-8 object-contain" />
            <span className="font-heading text-lg font-bold text-primary">Teacher Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{displayName}</span>
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-1 h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-primary mb-1">Welcome, {displayName}</h1>
          {staffInfo?.staff_number && (
            <p className="text-sm text-muted-foreground mb-4">Staff No: <span className="font-medium text-foreground">{staffInfo.staff_number}</span>{staffInfo.department ? ` · ${staffInfo.department}` : ""}</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.classCount}</p>
                <p className="text-xs text-muted-foreground">Classes</p>
                {classes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {classes.map(c => (
                      <Badge key={c.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{stats.materialsCount}</p><p className="text-xs text-muted-foreground">Materials</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{marks.length}</p><p className="text-xs text-muted-foreground">Marks Entered</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{stats.upcomingHw}</p><p className="text-xs text-muted-foreground">Upcoming Tasks</p></div>
            </CardContent></Card>
          </div>
        </motion.div>

        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="materials"><FileText className="mr-1 h-4 w-4" /> Materials</TabsTrigger>
            <TabsTrigger value="assessments"><ClipboardList className="mr-1 h-4 w-4" /> Assessments</TabsTrigger>
            <TabsTrigger value="exam-results"><GraduationCap className="mr-1 h-4 w-4" /> Exam Results</TabsTrigger>
            <TabsTrigger value="marks"><BarChart3 className="mr-1 h-4 w-4" /> Marks</TabsTrigger>
            <TabsTrigger value="homework"><BookOpen className="mr-1 h-4 w-4" /> Homework</TabsTrigger>
            <TabsTrigger value="attendance"><CheckCircle2 className="mr-1 h-4 w-4" /> Attendance</TabsTrigger>
            <TabsTrigger value="announcements"><Bell className="mr-1 h-4 w-4" /> Announcements</TabsTrigger>
            <TabsTrigger value="timetable"><Calendar className="mr-1 h-4 w-4" /> Timetable</TabsTrigger>
            <TabsTrigger value="schedule"><ClipboardList className="mr-1 h-4 w-4" /> My Schedule</TabsTrigger>
            <TabsTrigger value="leave"><CalendarOff className="mr-1 h-4 w-4" /> Leave</TabsTrigger>
          </TabsList>

          {/* MATERIALS - Enhanced */}
          <TabsContent value="materials">
            <EnhancedMaterialsTab userId={user!.id} classes={classes} subjects={subjects} materials={myMaterials} onRefresh={refreshMaterials} />
          </TabsContent>

          {/* ASSESSMENTS - New */}
          <TabsContent value="assessments">
            <AssessmentsTab userId={user!.id} classes={classes} subjects={subjects} students={students} />
          </TabsContent>
          {/* EXAM RESULTS UPLOAD */}
          <TabsContent value="exam-results">
            <ExamResultsUpload userId={user!.id} classes={classes} subjects={subjects} />
          </TabsContent>

          {/* MARKS */}
          <TabsContent value="marks" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="font-heading">Enter Student Mark</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Student *</Label>
                    <Select value={markForm.student_id} onValueChange={v => setMarkForm(p => ({ ...p, student_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                      <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Subject *</Label>
                    <Select value={markForm.subject_id} onValueChange={v => setMarkForm(p => ({ ...p, subject_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Term</Label>
                      <Select value={markForm.term} onValueChange={v => setMarkForm(p => ({ ...p, term: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{termOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Type</Label>
                      <Select value={markForm.assessment_type} onValueChange={v => setMarkForm(p => ({ ...p, assessment_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{assessmentTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Description *</Label><Input value={markForm.description} onChange={e => setMarkForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Test 1, Assignment 2, Mid-term Exam" /></div>
                  <div className="space-y-2"><Label>Mark (%) *</Label><Input type="number" min="0" max="100" value={markForm.mark} onChange={e => setMarkForm(p => ({ ...p, mark: e.target.value }))} />
                    {markForm.mark && <p className="text-xs text-muted-foreground">Grade: <span className="font-bold text-primary">{zimGrade(parseInt(markForm.mark))}</span></p>}
                  </div>
                  <div className="space-y-2"><Label>Comment</Label><Textarea rows={2} value={markForm.comment} onChange={e => setMarkForm(p => ({ ...p, comment: e.target.value }))} /></div>
                  <Button onClick={submitMark} disabled={markLoading} className="w-full">{markLoading ? "Submitting..." : "Submit Mark"}</Button>
                </CardContent>
              </Card>
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="font-heading">Recent Marks ({marks.length})</CardTitle></CardHeader>
                  <CardContent className="overflow-x-auto">
                    {marks.length === 0 ? <p className="text-sm text-muted-foreground">No marks submitted yet.</p> : (
                      <table className="w-full text-sm">
                        <thead className="bg-muted"><tr><th className="px-3 py-2 text-left">Subject</th><th className="px-3 py-2">Description</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Mark</th><th className="px-3 py-2">Grade</th></tr></thead>
                        <tbody>{marks.map(m => (
                          <tr key={m.id} className="border-b"><td className="px-3 py-2">{m.subjects?.name}</td><td className="px-3 py-2 text-center">{m.description || "—"}</td><td className="px-3 py-2 text-center">{m.assessment_type}</td><td className="px-3 py-2 text-center font-bold">{m.mark}%</td><td className="px-3 py-2 text-center"><Badge>{zimGrade(m.mark)}</Badge></td></tr>
                        ))}</tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
                <BulkMarksUpload userId={user!.id} classes={classes} subjects={subjects} students={students} onMarksUploaded={refreshMarks} />
              </div>
            </div>
          </TabsContent>

          {/* HOMEWORK */}
          <TabsContent value="homework" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="font-heading">Post Homework</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Class *</Label>
                      <Select value={hwForm.class_id} onValueChange={v => setHwForm(p => ({ ...p, class_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Subject *</Label>
                      <Select value={hwForm.subject_id} onValueChange={v => setHwForm(p => ({ ...p, subject_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Title *</Label><Input value={hwForm.title} onChange={e => setHwForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 7 Exercises" /></div>
                  <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={hwForm.due_date} onChange={e => setHwForm(p => ({ ...p, due_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={hwForm.description} onChange={e => setHwForm(p => ({ ...p, description: e.target.value }))} /></div>
                  <Button onClick={submitHomework} disabled={hwLoading} className="w-full">{hwLoading ? "Posting..." : "Post Homework"}</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-heading">Posted Homework ({homework.length})</CardTitle></CardHeader>
                <CardContent>
                  {homework.length === 0 ? <p className="text-sm text-muted-foreground">No homework posted yet.</p> : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {homework.map(h => (
                        <div key={h.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{h.title}</p>
                            <Badge variant={new Date(h.due_date) < new Date() ? "destructive" : "default"} className="text-xs">Due: {new Date(h.due_date).toLocaleDateString()}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{h.classes?.name} • {h.subjects?.name}</p>
                          {h.description && <p className="text-xs mt-1">{h.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ATTENDANCE */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="font-heading">Take Attendance</CardTitle><CardDescription>Select a class and date, then mark each student.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Class *</Label>
                    <Select value={attClass} onValueChange={setAttClass}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>{attendanceClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Date</Label><Input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} /></div>
                </div>
                {attStudents.length > 0 && (
                  <>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={markAllPresent}><CheckCircle2 className="mr-1 h-4 w-4" /> All Present</Button>
                      <Button variant="outline" size="sm" onClick={markAllAbsent}><AlertCircle className="mr-1 h-4 w-4" /> All Absent</Button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {attStudents.map(s => (
                        <div key={s.id} className="flex items-center justify-between rounded border p-2">
                          <div>
                            <p className="text-sm font-medium">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground">{s.admission_number}</p>
                          </div>
                          <Select value={attRecords[s.id] || "present"} onValueChange={v => setAttRecords(p => ({ ...p, [s.id]: v }))}>
                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <Button onClick={submitAttendance} disabled={attLoading} className="w-full">{attLoading ? "Saving..." : `Save Attendance (${attStudents.length} students)`}</Button>
                  </>
                )}
                {attClass && attStudents.length === 0 && <p className="text-sm text-muted-foreground">No students found for this class.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANNOUNCEMENTS - Enhanced */}
          <TabsContent value="announcements">
            <EnhancedAnnouncementsTab userId={user!.id} classes={classes} announcements={announcements} myAnnouncements={myAnnouncements} onRefresh={refreshAnnouncements} />
          </TabsContent>

          {/* TIMETABLE */}
          <TabsContent value="timetable">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Class Timetable</CardTitle>
                <Select value={selectedTTClass} onValueChange={setSelectedTTClass}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-muted"><tr><th className="border px-3 py-2">Time</th>{days.map(d => <th key={d} className="border px-3 py-2">{d}</th>)}</tr></thead>
                  <tbody>{timeSlots.map(ts => (
                    <tr key={ts}><td className="border px-3 py-2 font-medium">{ts}</td>{days.map((_, di) => <td key={di} className="border px-3 py-2 text-center">{getTimetableCell(ts, di)}</td>)}</tr>
                  ))}</tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY SCHEDULE */}
          <TabsContent value="schedule">
            <PersonalTimetableEditor />
          </TabsContent>

          {/* LEAVE REQUESTS */}
          <TabsContent value="leave">
            <StaffLeaveRequest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
