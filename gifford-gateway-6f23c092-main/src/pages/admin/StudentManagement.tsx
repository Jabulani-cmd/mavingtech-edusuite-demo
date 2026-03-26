// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye, Upload, Download, AlertTriangle, User, LinkIcon, Copy, Users, Camera, KeyRound } from "lucide-react";
import { studentFormSchema, type StudentFormData, zimPhoneRegex } from "@/lib/validators";
import ImageCropper from "@/components/ImageCropper";
import WebcamCapture from "@/components/WebcamCapture";

const formOptions = ["Form 1", "Form 2", "Form 3", "Form 4", "Lower 6", "Upper 6"];
const streamOptions = ["A", "B", "C", "D", "Arts", "Sciences", "Commercials"];
const statusOptions = ["active", "graduated", "withdrawn"];
const genderOptions = ["Male", "Female"];

type Student = {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string | null;
  form: string;
  stream: string | null;
  subject_combination: string | null;
  gender: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  emergency_contact: string | null;
  medical_conditions: string | null;
  has_medical_alert: boolean;
  address: string | null;
  enrollment_date: string | null;
  status: string;
  profile_photo_url: string | null;
  deleted_at: string | null;
  created_at: string;
  sports_activities: string[] | null;
  user_id: string | null;
};

const sportsOptions = ["Rugby", "Soccer", "Cricket", "Tennis", "Athletics", "Swimming", "Volleyball", "Basketball", "Hockey", "Netball", "Chess", "Table Tennis"];

const emptyForm: StudentFormData = {
  admission_number: "",
  full_name: "",
  date_of_birth: "",
  form: "Form 1",
  stream: "",
  subject_combination: "",
  gender: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_email: "",
  emergency_contact: "",
  medical_conditions: "",
  has_medical_alert: false,
  address: "",
  enrollment_date: new Date().toISOString().split("T")[0],
  status: "active",
  sports_activities: [],
  boarding_status: "day",
};

function GenerateCodeButton({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
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
          body: JSON.stringify({ action: "generate-code", student_id: studentId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCode(data.code);
      toast({ title: "Verification code generated" });
    } catch (err: any) {
      toast({ title: "Failed to generate code", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({ title: "Code copied to clipboard" });
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-dashed p-4">
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Parent Linking Code</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Generate a verification code for parents to link their account to this student.
      </p>
      {code ? (
        <div className="flex items-center gap-3">
          <code className="rounded bg-muted px-4 py-2 text-lg font-mono font-bold tracking-widest">{code}</code>
          <Button variant="outline" size="sm" onClick={copyCode}><Copy className="h-3.5 w-3.5 mr-1" /> Copy</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={generate} disabled={generating}>
          {generating ? "Generating..." : "Generate Code"}
        </Button>
      )}
    </div>
  );
}

function BulkGenerateCodes() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formFilter, setFormFilter] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const generate = async () => {
    setGenerating(true);
    setResults(null);
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
          body: JSON.stringify({ action: "bulk-generate-codes", form_filter: formFilter }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
      toast({ title: `Generated codes for ${data.results.filter((r: any) => r.code).length} students` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const exportCSV = () => {
    if (!results) return;
    const header = "Admission Number,Student Name,Form,Stream,Verification Code";
    const rows = results
      .filter((r: any) => r.code)
      .map((r: any) => `${r.admission_number},"${r.full_name}",${r.form},${r.stream || ""},${r.code}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-codes-${formFilter === "all" ? "all" : formFilter.replace(" ", "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setOpen(true); setResults(null); }}>
        <Users className="mr-1 h-4 w-4" /> Bulk Codes
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Bulk Generate Verification Codes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Generate parent-linking codes for all students at once and export as CSV.</p>

          <div className="flex items-end gap-3">
            <div className="space-y-1 flex-1">
              <Label>Filter by Form</Label>
              <Select value={formFilter} onValueChange={setFormFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {formOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={generating}>
              {generating ? "Generating..." : "Generate All"}
            </Button>
          </div>

          {results && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-xs">{results.filter((r: any) => r.code).length} codes generated</Badge>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="mr-1 h-4 w-4" /> Export CSV
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adm #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{r.admission_number}</TableCell>
                        <TableCell className="text-sm">{r.full_name}</TableCell>
                        <TableCell className="text-sm">{r.form}</TableCell>
                        <TableCell>
                          {r.code ? (
                            <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-bold tracking-wider">{r.code}</code>
                          ) : (
                            <span className="text-xs text-destructive">Error</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function StudentManagement() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterForm, setFilterForm] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Photo upload
  const photoRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [dbSubjects, setDbSubjects] = useState<{ id: string; name: string; department: string | null }[]>([]);
  const [provisionResult, setProvisionResult] = useState<{ email: string; temp_password: string; admission_number: string } | null>(null);
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);

  useEffect(() => { fetchStudents(); fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    const { data } = await supabase.from("subjects").select("id, name, department").order("name");
    if (data) setDbSubjects(data);
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .is("deleted_at", null)
      .order("full_name");
    if (data) setStudents(data as Student[]);
    if (error) toast({ title: "Error loading students", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  const filtered = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchForm = filterForm === "all" || s.form === filterForm;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchForm && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setPhotoUrl(null);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingId(s.id);
    setFormData({
      admission_number: s.admission_number,
      full_name: s.full_name,
      date_of_birth: s.date_of_birth || "",
      form: s.form,
      stream: s.stream || "",
      subject_combination: s.subject_combination || "",
      gender: s.gender || "",
      guardian_name: s.guardian_name || "",
      guardian_phone: s.guardian_phone || "",
      guardian_email: s.guardian_email || "",
      emergency_contact: s.emergency_contact || "",
      medical_conditions: s.medical_conditions || "",
      has_medical_alert: s.has_medical_alert,
      address: s.address || "",
      enrollment_date: s.enrollment_date || "",
      status: s.status,
      sports_activities: s.sports_activities || [],
      boarding_status: (s as any).boarding_status || "day",
    });
    setPhotoUrl(s.profile_photo_url);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const result = studentFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);

    const payload = { ...result.data, profile_photo_url: photoUrl };

    if (editingId) {
      const { error } = await supabase.from("students").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Student updated!" });
    } else {
      // Remove admission_number so the database trigger auto-generates GHS#####
      const { admission_number, ...insertPayload } = payload;
      const { data: newStudent, error } = await supabase.from("students").insert(insertPayload as any).select("id, admission_number").single();
      if (error) {
        const desc = error.message.includes("students_admission_number_key")
          ? "A student with this admission number already exists. The system will auto-generate a unique number — please try again."
          : error.message;
        toast({ title: "Error", description: desc, variant: "destructive" });
        setSaving(false);
        return;
      }

      // Auto-provision student auth account
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`,
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              action: "provision-student",
              student_id: newStudent.id,
              full_name: result.data.full_name,
              admission_number: newStudent.admission_number,
              guardian_email: result.data.guardian_email,
            }),
          }
        );
        const provData = await res.json();
        if (res.ok) {
          setProvisionResult({
            email: provData.email,
            temp_password: provData.temp_password,
            admission_number: newStudent.admission_number,
          });
          setProvisionDialogOpen(true);
        } else {
          toast({ title: "Student added but account creation failed", description: provData.error, variant: "destructive" });
        }
      } catch (provErr: any) {
        toast({ title: "Student added but account creation failed", description: provErr?.message, variant: "destructive" });
      }

      toast({ title: "Student added!", description: `Student number: ${newStudent?.admission_number}` });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    // Soft delete
    const { error } = await supabase.from("students").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Student removed" }); fetchStudents(); }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropSrc(reader.result as string); setCropOpen(true); };
    reader.readAsDataURL(file);
    if (photoRef.current) photoRef.current.value = "";
  };

  const handleCropComplete = async (blob: Blob) => {
    setUploading(true);
    try {
      const path = `profile-photos/students/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("school-media").upload(path, blob, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("school-media").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      toast({ title: "Photo uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const exportCSV = () => {
    const headers = ["Admission #", "Full Name", "Form", "Stream", "Gender", "Guardian Phone", "Status"];
    const rows = filtered.map(s => [s.admission_number, s.full_name, s.form, s.stream || "", s.gender || "", s.guardian_phone || "", s.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "students.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const provisionExistingStudent = async (s: Student) => {
    if (s.user_id) {
      toast({ title: "Student already has an account", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            action: "provision-student",
            student_id: s.id,
            full_name: s.full_name,
            admission_number: s.admission_number,
            guardian_email: s.guardian_email,
          }),
        }
      );
      const provData = await res.json();
      if (res.ok) {
        setProvisionResult({
          email: provData.email,
          temp_password: provData.temp_password,
          admission_number: s.admission_number,
        });
        setProvisionDialogOpen(true);
        fetchStudents();
      } else {
        toast({ title: "Account creation failed", description: provData.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Account creation failed", description: err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-100 text-green-800";
    if (s === "graduated") return "bg-blue-100 text-blue-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-2xl font-bold text-foreground">Student Management</h2>
        <div className="flex flex-wrap gap-2">
          <BulkGenerateCodes />
          <Button onClick={exportCSV} variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export CSV</Button>
          <Button onClick={openAdd} className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Plus className="mr-1 h-4 w-4" /> Add Student</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or admission #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterForm} onValueChange={setFilterForm}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Form" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {formOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Student #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Form/Stream</TableHead>
                <TableHead>Guardian Phone</TableHead>
                <TableHead>Portal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                <TableHead>Form/Stream</TableHead>
                <TableHead>Guardian Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No students found. Click "Add Student" to get started.</TableCell></TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.profile_photo_url ? (
                      <img src={s.profile_photo_url} alt={s.full_name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-light">
                        <User className="h-4 w-4 text-secondary" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{s.admission_number}</TableCell>
                  <TableCell className="font-medium">
                    {s.full_name}
                    {s.has_medical_alert && <AlertTriangle className="ml-1 inline h-4 w-4 text-destructive" />}
                  </TableCell>
                  <TableCell>{s.form}{s.stream ? ` / ${s.stream}` : ""}</TableCell>
                  <TableCell>{s.guardian_phone || "—"}</TableCell>
                  <TableCell>
                    {s.user_id ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">No Account</Badge>
                    )}
                  </TableCell>
                  <TableCell><Badge className={statusColor(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!s.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Provision portal account"
                          onClick={() => provisionExistingStudent(s)}
                        >
                          <KeyRound className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedStudent(s); setProfileOpen(true); }}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                            <AlertDialogDescription>This will soft-delete {s.full_name}. The record can be restored later.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(s.id)} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Photo */}
            <div className="sm:col-span-2 flex items-center gap-4">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon-light"><User className="h-8 w-8 text-secondary" /></div>
              )}
              <div className="flex gap-2">
                <input type="file" accept="image/*" ref={photoRef} onChange={handlePhotoSelect} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => photoRef.current?.click()} disabled={uploading}>
                  <Upload className="mr-1 h-4 w-4" /> {uploading ? "Uploading..." : "Upload Photo"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowWebcam(true)} disabled={uploading}>
                  <Camera className="mr-1 h-4 w-4" /> Take Photo
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Student Number {editingId ? "" : "(Auto-generated)"}</Label>
              {editingId ? (
                <Input value={formData.admission_number} readOnly className="bg-muted" />
              ) : (
                <p className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted">
                  Will be auto-generated as <strong>GHS#####</strong> on save
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input value={formData.full_name} onChange={e => updateField("full_name", e.target.value)} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.date_of_birth || ""} onChange={e => updateField("date_of_birth", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select value={formData.gender || ""} onValueChange={v => updateField("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Form *</Label>
              <Select value={formData.form} onValueChange={v => updateField("form", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{formOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Stream</Label>
              <Select value={formData.stream || ""} onValueChange={v => updateField("stream", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{streamOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Subjects</Label>
              {dbSubjects.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border p-3 max-h-48 overflow-y-auto">
                  {dbSubjects.map(subj => {
                    const selected = (formData.subject_combination || "").split(", ").filter(Boolean);
                    const isChecked = selected.includes(subj.name);
                    return (
                      <label key={subj.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = (formData.subject_combination || "").split(", ").filter(Boolean);
                            const updated = checked
                              ? [...current, subj.name]
                              : current.filter(s => s !== subj.name);
                            updateField("subject_combination", updated.join(", "));
                          }}
                        />
                        <span className="text-sm">{subj.name}</span>
                        {subj.department && <span className="text-[10px] text-muted-foreground">({subj.department})</span>}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No subjects loaded. Add subjects in Academic Management first.</p>
              )}
              {formData.subject_combination && (
                <p className="text-xs text-primary font-medium">{formData.subject_combination.split(", ").filter(Boolean).length} subject(s) selected</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Guardian Name</Label>
              <Input value={formData.guardian_name || ""} onChange={e => updateField("guardian_name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Guardian Phone</Label>
              <Input value={formData.guardian_phone || ""} onChange={e => updateField("guardian_phone", e.target.value)} placeholder="07XXXXXXXX" />
              {errors.guardian_phone && <p className="text-xs text-destructive">{errors.guardian_phone}</p>}
            </div>
            <div className="space-y-1">
              <Label>Guardian Email</Label>
              <Input value={formData.guardian_email || ""} onChange={e => updateField("guardian_email", e.target.value)} type="email" />
            </div>
            <div className="space-y-1">
              <Label>Emergency Contact</Label>
              <Input value={formData.emergency_contact || ""} onChange={e => updateField("emergency_contact", e.target.value)} placeholder="07XXXXXXXX" />
              {errors.emergency_contact && <p className="text-xs text-destructive">{errors.emergency_contact}</p>}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Address</Label>
              <Textarea value={formData.address || ""} onChange={e => updateField("address", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Medical Conditions</Label>
              <Textarea value={formData.medical_conditions || ""} onChange={e => updateField("medical_conditions", e.target.value)} rows={2} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox checked={formData.has_medical_alert} onCheckedChange={v => updateField("has_medical_alert", !!v)} id="medical-alert" />
              <Label htmlFor="medical-alert" className="text-sm text-destructive font-medium">Has Medical Alert</Label>
            </div>

            {/* Sports Activities */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Sports & Extracurricular Activities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border p-3">
                {sportsOptions.map(sport => (
                  <label key={sport} className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                    <Checkbox
                      checked={(formData.sports_activities || []).includes(sport)}
                      onCheckedChange={(checked) => {
                        const current = formData.sports_activities || [];
                        const updated = checked
                          ? [...current, sport]
                          : current.filter(s => s !== sport);
                        updateField("sports_activities", updated);
                      }}
                    />
                    <span className="text-sm">{sport}</span>
                  </label>
                ))}
              </div>
              {(formData.sports_activities || []).length > 0 && (
                <p className="text-xs text-primary font-medium">{(formData.sports_activities || []).length} sport(s) selected</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Boarding Status *</Label>
              <Select value={(formData as any).boarding_status || "day"} onValueChange={v => updateField("boarding_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Scholar</SelectItem>
                  <SelectItem value="boarder">Boarder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Enrollment Date</Label>
              <Input type="date" value={formData.enrollment_date || ""} onChange={e => updateField("enrollment_date", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {saving ? "Saving..." : editingId ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Cropper */}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          open={cropOpen}
          onClose={() => { setCropOpen(false); setCropSrc(null); }}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          cropShape="round"
          title="Crop Student Photo"
        />
      )}

      {/* Student Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-3">
                  {selectedStudent.profile_photo_url ? (
                    <img src={selectedStudent.profile_photo_url} alt={selectedStudent.full_name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-light"><User className="h-6 w-6 text-secondary" /></div>
                  )}
                  {selectedStudent.full_name}
                  {selectedStudent.has_medical_alert && <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Medical Alert</Badge>}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="personal">
                <TabsList className="w-full flex-wrap">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="academics">Academics</TabsTrigger>
                  <TabsTrigger value="fees">Fees</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="boarding">Boarding</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Admission #", selectedStudent.admission_number],
                      ["Form", selectedStudent.form],
                      ["Stream", selectedStudent.stream],
                      ["Gender", selectedStudent.gender],
                      ["Date of Birth", selectedStudent.date_of_birth],
                      ["Subject Combination", selectedStudent.subject_combination],
                      ["Guardian", selectedStudent.guardian_name],
                      ["Guardian Phone", selectedStudent.guardian_phone],
                      ["Guardian Email", selectedStudent.guardian_email],
                      ["Emergency Contact", selectedStudent.emergency_contact],
                      ["Address", selectedStudent.address],
                      ["Enrollment Date", selectedStudent.enrollment_date],
                      ["Status", selectedStudent.status],
                      ["Sports/Activities", (selectedStudent.sports_activities || []).join(", ") || "None"],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-medium">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                  {selectedStudent.medical_conditions && (
                    <div className={`rounded-lg p-3 ${selectedStudent.has_medical_alert ? "bg-destructive/10 border border-destructive/30" : "bg-muted"}`}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Medical Conditions</p>
                      <p className={`text-sm ${selectedStudent.has_medical_alert ? "text-destructive font-medium" : ""}`}>{selectedStudent.medical_conditions}</p>
                    </div>
                  )}
                  <GenerateCodeButton studentId={selectedStudent.id} />
                </TabsContent>
                <TabsContent value="academics">
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-lg font-medium">Academic records</p>
                    <p className="text-sm">Grades and subject enrollment will appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="fees">
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-lg font-medium">Fee Records</p>
                    <p className="text-sm">Invoice summary and balances (USD/ZiG) will appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="attendance">
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-lg font-medium">Attendance</p>
                    <p className="text-sm">Attendance charts will appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="boarding">
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-lg font-medium">Boarding</p>
                    <p className="text-sm">Room allocation details will appear here.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
      <WebcamCapture
        open={showWebcam}
        onClose={() => setShowWebcam(false)}
        onCapture={(blob) => { setCropSrc(URL.createObjectURL(blob)); setCropOpen(true); }}
        title="Take Student Photo"
      />
      {/* Student Credentials Dialog */}
      <Dialog open={provisionDialogOpen} onOpenChange={setProvisionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Student Account Created</DialogTitle>
          </DialogHeader>
          {provisionResult && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A portal account has been created for this student. Please share the following credentials securely. The student will be required to change their password on first login.
              </p>
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Admission Number</p>
                  <p className="font-mono font-bold">{provisionResult.admission_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Login Email</p>
                  <p className="font-mono font-bold">{provisionResult.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temporary Password</p>
                  <p className="font-mono font-bold text-primary">{provisionResult.temp_password}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const text = `Student Portal Credentials\nAdmission: ${provisionResult.admission_number}\nEmail: ${provisionResult.email}\nTemp Password: ${provisionResult.temp_password}\n\nPlease change your password on first login.`;
                    navigator.clipboard.writeText(text);
                    toast({ title: "Credentials copied to clipboard" });
                  }}
                >
                  <Copy className="mr-1 h-4 w-4" /> Copy All
                </Button>
                <Button onClick={() => setProvisionDialogOpen(false)} className="flex-1">Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
