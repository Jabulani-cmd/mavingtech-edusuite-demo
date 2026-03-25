import { useState } from "react";
import { useDemoData } from "@/contexts/DemoDataContext";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Student } from "@/data/demoData";

const Students = () => {
  const { students, setStudents } = useDemoData();
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.id} ${s.class}`.toLowerCase().includes(search.toLowerCase())
  );

  const blankStudent: Student = {
    id: `S${String(students.length + 1).padStart(3, "0")}`,
    firstName: "", lastName: "", grade: "", class: "", email: "",
    guardianName: "", guardianPhone: "", enrollmentDate: new Date().toISOString().slice(0, 10), status: "active",
  };

  const saveStudent = (s: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((p) => p.id === s.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = s;
        return updated;
      }
      return [...prev, s];
    });
    setEditing(null);
    setAdding(false);
    toast.success("Student saved (demo)");
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast.success("Student removed (demo)");
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage student profiles and enrollment</p>
        </div>
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button className="sm:ml-auto gap-2"><Plus className="h-4 w-4" /> Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
            <StudentForm student={blankStudent} onSave={saveStudent} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Class</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Guardian</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground">{s.id}</td>
                  <td className="p-3 font-medium text-foreground">{s.firstName} {s.lastName}</td>
                  <td className="p-3 hidden sm:table-cell text-foreground">{s.class}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{s.guardianName}</td>
                  <td className="p-3"><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(s)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(s)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStudent(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-center text-muted-foreground">No students found</p>}
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.firstName} {viewing?.lastName}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              {Object.entries({ ID: viewing.id, Email: viewing.email, Grade: viewing.grade, Class: viewing.class, Guardian: viewing.guardianName, Phone: viewing.guardianPhone, Enrolled: viewing.enrollmentDate, Status: viewing.status }).map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium text-foreground">{v}</span></div>
              ))}
              <div className="pt-2"><span className="demo-badge">Demo Record</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          {editing && <StudentForm student={editing} onSave={saveStudent} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StudentForm = ({ student, onSave }: { student: Student; onSave: (s: Student) => void }) => {
  const [form, setForm] = useState(student);
  const update = (field: keyof Student, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-muted-foreground">First Name</label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></div>
        <div><label className="text-xs text-muted-foreground">Last Name</label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-muted-foreground">Grade</label><Input value={form.grade} onChange={(e) => update("grade", e.target.value)} /></div>
        <div><label className="text-xs text-muted-foreground">Class</label><Input value={form.class} onChange={(e) => update("class", e.target.value)} /></div>
      </div>
      <div><label className="text-xs text-muted-foreground">Email</label><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
      <div><label className="text-xs text-muted-foreground">Guardian Name</label><Input value={form.guardianName} onChange={(e) => update("guardianName", e.target.value)} /></div>
      <div><label className="text-xs text-muted-foreground">Guardian Phone</label><Input value={form.guardianPhone} onChange={(e) => update("guardianPhone", e.target.value)} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

export default Students;
