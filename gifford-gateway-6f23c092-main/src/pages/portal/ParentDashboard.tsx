// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  LogOut, Users, GraduationCap, Calendar, DollarSign, Bell,
  TrendingUp, BookOpen, Trophy, Award, ChevronRight, LinkIcon, Plus, CalendarDays, FileText
} from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StudentExamTimetableTab from "@/components/student/StudentExamTimetableTab";
import StudentTermReportsTab from "@/components/student/StudentTermReportsTab";
import NotificationBell from "@/components/NotificationBell";
import StudentAnnouncementsSection from "@/components/student/StudentAnnouncementsSection";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type TabId = "overview" | "grades" | "attendance" | "fees" | "announcements" | "exam-timetable" | "reports";

interface ChildInfo {
  id: string;
  full_name: string;
  form: string;
  stream: string | null;
  admission_number: string;
  status: string;
}

function getZIMSECGrade(mark: number): string {
  if (mark >= 90) return "A*";
  if (mark >= 80) return "A";
  if (mark >= 70) return "B";
  if (mark >= 60) return "C";
  if (mark >= 50) return "D";
  if (mark >= 40) return "E";
  return "U";
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A*": return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "A": return "bg-green-100 text-green-800 border-green-300";
    case "B": return "bg-blue-100 text-blue-800 border-blue-300";
    case "C": return "bg-sky-100 text-sky-800 border-sky-300";
    case "D": return "bg-amber-100 text-amber-800 border-amber-300";
    case "E": return "bg-orange-100 text-orange-800 border-orange-300";
    case "U": return "bg-red-100 text-red-800 border-red-300";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function ParentDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Child-specific data
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedChildId) fetchChildData(selectedChildId);
  }, [selectedChildId]);

  useEffect(() => {
    if (selectedExamId && selectedChildId) fetchExamResults();
  }, [selectedExamId]);

  const fetchInitialData = async () => {
    setLoading(true);
    const uid = user!.id;

    const [{ data: prof }, { data: links }, { data: ann }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).single(),
      supabase.from("parent_students").select("student_id").eq("parent_id", uid),
      supabase.from("announcements").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(20),
    ]);

    setProfile(prof);
    setAnnouncements(ann || []);

    if (links && links.length > 0) {
      const studentIds = links.map((l) => l.student_id);
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name, form, stream, admission_number, status")
        .in("id", studentIds);

      const childList = (students || []) as ChildInfo[];
      setChildren(childList);
      if (childList.length > 0) {
        setSelectedChildId(childList[0].id);
      }
    }
    setLoading(false);
  };

  const fetchChildData = async (studentId: string) => {
    const [{ data: att }, { data: inv }, { data: exm }] = await Promise.all([
      supabase.from("attendance").select("*").eq("student_id", studentId).order("attendance_date", { ascending: false }),
      supabase.from("invoices").select("*").eq("student_id", studentId).order("created_at", { ascending: false }),
      supabase.from("exams").select("*").eq("is_published", true).order("academic_year", { ascending: false }).order("term", { ascending: false }),
    ]);

    setAttendanceData(att || []);
    setInvoices(inv || []);
    setExams(exm || []);

    if (exm && exm.length > 0) {
      setSelectedExamId(exm[0].id);
    } else {
      setSelectedExamId(null);
      setExamResults([]);
      setRankings(null);
    }
  };

  const fetchExamResults = async () => {
    if (!selectedExamId || !selectedChildId) return;

    const [{ data: results }, { data: rankData }] = await Promise.all([
      supabase
        .from("exam_results")
        .select("id, mark, grade, teacher_comment, subject_id, subjects(name, code)")
        .eq("exam_id", selectedExamId)
        .eq("student_id", selectedChildId)
        .order("mark", { ascending: false }),
      supabase.rpc("get_exam_rankings", { p_exam_id: selectedExamId, p_student_id: selectedChildId }),
    ]);

    setExamResults(results || []);
    setRankings(rankData || {});
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Parent";

  // Computed metrics for selected child
  const attendancePercent = attendanceData.length > 0
    ? Math.round((attendanceData.filter((a) => a.status === "present" || a.status === "late").length / attendanceData.length) * 100)
    : 0;

  const feeBalance = invoices.reduce((sum, inv) => sum + ((inv.total_usd || 0) - (inv.paid_usd || 0)), 0);

  const avgMark = examResults.length > 0
    ? Math.round(examResults.reduce((s, r: any) => s + r.mark, 0) / examResults.length)
    : 0;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "grades", label: "Grades", icon: GraduationCap },
    { id: "exam-timetable", label: "Exam Timetable", icon: CalendarDays },
    { id: "reports", label: "Term Reports", icon: FileText },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "fees", label: "Fees", icon: DollarSign },
    { id: "announcements", label: "Announcements", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={schoolLogo} alt="Gifford High School" className="h-8 w-8 object-contain" />
            <div className="hidden sm:block">
              <span className="font-heading text-base font-bold text-foreground">Parent Portal</span>
              <p className="text-xs text-muted-foreground leading-none">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className="text-xs text-muted-foreground sm:hidden max-w-[120px] truncate">{displayName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="hidden md:flex">
        {/* Desktop Side Nav */}
        <aside className="sticky top-14 h-[calc(100vh-56px)] w-56 border-r bg-card p-4 space-y-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 p-6 max-w-4xl">
          <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={setSelectedChildId} onLinked={fetchInitialData} />
          <TabContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            child={selectedChild || null}
            attendanceData={attendanceData}
            attendancePercent={attendancePercent}
            invoices={invoices}
            feeBalance={feeBalance}
            exams={exams}
            examResults={examResults}
            selectedExamId={selectedExamId}
            setSelectedExamId={setSelectedExamId}
            rankings={rankings}
            avgMark={avgMark}
            announcements={announcements}
          />
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <main className="container px-4 py-4 space-y-4">
          <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={setSelectedChildId} onLinked={fetchInitialData} />
          {/* Tab pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <TabContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            child={selectedChild || null}
            attendanceData={attendanceData}
            attendancePercent={attendancePercent}
            invoices={invoices}
            feeBalance={feeBalance}
            exams={exams}
            examResults={examResults}
            selectedExamId={selectedExamId}
            setSelectedExamId={setSelectedExamId}
            rankings={rankings}
            avgMark={avgMark}
            announcements={announcements}
          />
        </main>
      </div>
    </div>
  );
}

function LinkChildDialog({ onLinked }: { onLinked: () => void }) {
  const [open, setOpen] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [linking, setLinking] = useState(false);
  const { toast } = useToast();

  const handleLink = async () => {
    if (!admissionNumber.trim() || !verificationCode.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLinking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/link-child`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            action: "link",
            admission_number: admissionNumber.trim(),
            verification_code: verificationCode.trim().toUpperCase(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link child");
      toast({ title: "Child linked!", description: `${data.student.full_name} has been linked to your account.` });
      setOpen(false);
      setAdmissionNumber("");
      setVerificationCode("");
      onLinked();
    } catch (err: any) {
      toast({ title: "Link failed", description: err.message, variant: "destructive" });
    }
    setLinking(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Link Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" /> Link Your Child
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Enter your child's admission number and the verification code provided by the school.
          </p>
          <div className="space-y-2">
            <Label>Admission Number</Label>
            <Input
              placeholder="e.g. GHS-2026-001"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input
              placeholder="e.g. ABC123"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="tracking-widest font-mono text-center text-lg"
            />
          </div>
          <Button onClick={handleLink} disabled={linking} className="w-full">
            {linking ? "Linking..." : "Link Child"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChildSelector({ children, selectedChildId, onSelect, onLinked }: {
  children: ChildInfo[];
  selectedChildId: string | null;
  onSelect: (id: string) => void;
  onLinked: () => void;
}) {
  if (children.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="py-8 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No children linked to your account yet.</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Use a verification code from the school to link your child.</p>
          <LinkChildDialog onLinked={onLinked} />
        </CardContent>
      </Card>
    );
  }

  if (children.length === 1) {
    const child = children[0];
    return (
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{child.full_name}</p>
            <p className="text-xs text-muted-foreground">{child.form} {child.stream} · {child.admission_number}</p>
          </div>
        </div>
        <LinkChildDialog onLinked={onLinked} />
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <Select value={selectedChildId || ""} onValueChange={onSelect}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder="Select child" />
        </SelectTrigger>
        <SelectContent>
          {children.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.full_name} — {c.form} {c.stream}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <LinkChildDialog onLinked={onLinked} />
    </div>
  );
}

interface TabContentProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  child: ChildInfo | null;
  attendanceData: any[];
  attendancePercent: number;
  invoices: any[];
  feeBalance: number;
  exams: any[];
  examResults: any[];
  selectedExamId: string | null;
  setSelectedExamId: (id: string) => void;
  rankings: any;
  avgMark: number;
  announcements: any[];
}

function TabContent(props: TabContentProps) {
  const { activeTab, setActiveTab, child, attendanceData, attendancePercent, invoices, feeBalance, exams, examResults, selectedExamId, setSelectedExamId, rankings, avgMark, announcements } = props;

  if (!child) return null;

  if (activeTab === "overview") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Viewing child:</p>
          <h1 className="text-xl font-bold">{child.full_name}</h1>
          <p className="text-sm text-muted-foreground">{child.form} {child.stream} · {child.admission_number}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("attendance")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-lg font-bold text-secondary">{attendancePercent}%</p>
                <p className="text-[11px] text-muted-foreground">Attendance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("grades")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-blue-700">{avgMark > 0 ? `${avgMark}%` : "—"}</p>
                <p className="text-[11px] text-muted-foreground">Avg. Grade</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("grades")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-amber-700">
                  {rankings?.overall_rank ? `#${rankings.overall_rank}` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">Class Rank</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("fees")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-red-700">${feeBalance}</p>
                <p className="text-[11px] text-muted-foreground">Fee Balance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("grades")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">View Exam Results</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("announcements")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">Announcements ({announcements.length})</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Announcements */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Announcements</h3>
          <StudentAnnouncementsSection announcements={announcements} limit={3} />
        </div>
      </motion.div>
    );
  }

  if (activeTab === "grades") {
    const selectedExam = exams.find((e) => e.id === selectedExamId);
    const subjectRankings = rankings?.subject_rankings || {};
    const overallRank = rankings?.overall_rank ? { rank: rankings.overall_rank, total: rankings.total_students } : null;
    const avgGrade = getZIMSECGrade(avgMark);

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-lg font-bold">Exam Results — {child.full_name}</h2>

        {exams.length === 0 ? (
          <Card><CardContent className="py-10 text-center">
            <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No published exam results yet.</p>
          </CardContent></Card>
        ) : (
          <>
            <Select value={selectedExamId || ""} onValueChange={setSelectedExamId}>
              <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.term} {e.academic_year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {examResults.length === 0 ? (
              <Card><CardContent className="py-10 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No results for this exam.</p>
              </CardContent></Card>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                    <CardContent className="p-3 text-center">
                      <TrendingUp className="mx-auto mb-1 h-5 w-5 text-secondary" />
                      <p className="text-lg font-bold text-secondary">{avgMark}%</p>
                      <Badge className={`mt-1 text-[10px] ${getGradeColor(avgGrade)}`} variant="outline">{avgGrade}</Badge>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/40">
                    <CardContent className="p-3 text-center">
                      <Trophy className="mx-auto mb-1 h-5 w-5 text-amber-600" />
                      <p className="text-lg font-bold text-amber-700">{overallRank ? overallRank.rank : "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{overallRank ? `of ${overallRank.total}` : "Rank"}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/40">
                    <CardContent className="p-3 text-center">
                      <Award className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                      <p className="text-xs font-bold text-emerald-700 truncate">{(examResults[0] as any)?.subjects?.name || "—"}</p>
                      <p className="text-lg font-bold text-emerald-700">{(examResults[0] as any)?.mark || 0}%</p>
                      <p className="text-[10px] text-muted-foreground">Best</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Results Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Subject</th>
                            <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">Mark</th>
                            <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">Grade</th>
                            <th className="px-3 py-2.5 text-center font-medium text-muted-foreground hidden sm:table-cell">Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examResults.map((r: any) => {
                            const grade = r.grade || getZIMSECGrade(r.mark);
                            const sr = subjectRankings[r.subject_id] || {};
                            return (
                              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-3 py-3">
                                  <p className="font-medium text-foreground">{r.subjects?.name || "Unknown"}</p>
                                  {r.teacher_comment && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{r.teacher_comment}</p>}
                                </td>
                                <td className="px-3 py-3 text-center font-bold">{r.mark}%</td>
                                <td className="px-3 py-3 text-center">
                                  <Badge className={`text-xs ${getGradeColor(grade)}`} variant="outline">{grade}</Badge>
                                </td>
                                <td className="px-3 py-3 text-center hidden sm:table-cell">
                                  {sr.rank ? <span className="text-xs"><span className="font-semibold">{sr.rank}</span>/{sr.total}</span> : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted/50 font-medium">
                            <td className="px-3 py-2.5">Average</td>
                            <td className="px-3 py-2.5 text-center font-bold">{avgMark}%</td>
                            <td className="px-3 py-2.5 text-center">
                              <Badge className={`text-xs ${getGradeColor(avgGrade)}`} variant="outline">{avgGrade}</Badge>
                            </td>
                            <td className="px-3 py-2.5 text-center hidden sm:table-cell">
                              {overallRank ? <span className="text-xs font-semibold">{overallRank.rank}/{overallRank.total}</span> : "—"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </motion.div>
    );
  }

  if (activeTab === "attendance") {
    const present = attendanceData.filter((a) => a.status === "present").length;
    const late = attendanceData.filter((a) => a.status === "late").length;
    const absent = attendanceData.filter((a) => a.status === "absent").length;
    const recentRecords = attendanceData.slice(0, 20);

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-lg font-bold">Attendance — {child.full_name}</h2>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-2">
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-secondary">{attendancePercent}%</p>
            <p className="text-[10px] text-muted-foreground">Rate</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">{present}</p>
            <p className="text-[10px] text-muted-foreground">Present</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{late}</p>
            <p className="text-[10px] text-muted-foreground">Late</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-600">{absent}</p>
            <p className="text-[10px] text-muted-foreground">Absent</p>
          </CardContent></Card>
        </div>

        {/* Recent records */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Records</CardTitle></CardHeader>
          <CardContent className="p-0">
            {recentRecords.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden sm:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.map((a: any) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="px-3 py-2 text-foreground">{format(new Date(a.attendance_date), "dd MMM yyyy")}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant="outline" className={
                            a.status === "present" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                            a.status === "late" ? "bg-amber-100 text-amber-800 border-amber-300" :
                            "bg-red-100 text-red-800 border-red-300"
                          }>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">{a.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (activeTab === "fees") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-lg font-bold">Fee Statement — {child.full_name}</h2>

        {/* Balance summary */}
        <Card className={feeBalance > 0 ? "border-red-200 bg-red-50/50" : "border-emerald-200 bg-emerald-50/50"}>
          <CardContent className="p-4 flex items-center gap-4">
            <DollarSign className={`h-8 w-8 ${feeBalance > 0 ? "text-red-600" : "text-emerald-600"}`} />
            <div>
              <p className="text-2xl font-bold">${feeBalance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{feeBalance > 0 ? "Outstanding Balance" : "No Outstanding Balance"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No invoices found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Invoice</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Term</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Total</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Paid</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Balance</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv: any) => {
                      const bal = (inv.total_usd || 0) - (inv.paid_usd || 0);
                      return (
                        <tr key={inv.id} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium text-foreground">{inv.invoice_number}</td>
                          <td className="px-3 py-2 text-muted-foreground">{inv.term} {inv.academic_year}</td>
                          <td className="px-3 py-2 text-center">${inv.total_usd}</td>
                          <td className="px-3 py-2 text-center text-emerald-600">${inv.paid_usd}</td>
                          <td className="px-3 py-2 text-center font-bold">${bal.toFixed(2)}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge variant="outline" className={
                              inv.status === "paid" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                              inv.status === "partial" ? "bg-amber-100 text-amber-800 border-amber-300" :
                              "bg-red-100 text-red-800 border-red-300"
                            }>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (activeTab === "announcements") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-lg font-bold">Announcements</h2>
        <StudentAnnouncementsSection announcements={announcements} />
      </motion.div>
    );
  }

  if (activeTab === "exam-timetable") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-lg font-bold">Exam Timetable — {child.full_name}</h2>
        <StudentExamTimetableTab />
      </motion.div>
    );
  }

  if (activeTab === "reports") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-lg font-bold">Term Reports — {child.full_name}</h2>
        <StudentTermReportsTab />
      </motion.div>
    );
  }

  return null;
}
