import { useState } from "react";
import { useDemoData } from "@/contexts/DemoDataContext";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Teacher } from "@/data/demoData";

const Teachers = () => {
  const { teachers, setTeachers } = useDemoData();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = teachers.filter((t) =>
    `${t.firstName} ${t.lastName} ${t.subject}`.toLowerCase().includes(search.toLowerCase())
  );

  const blankTeacher: Teacher = {
    id: `T${String(teachers.length + 1).padStart(3, "0")}`,
    firstName: "", lastName: "", email: "", subject: "", phone: "", hireDate: new Date().toISOString().slice(0, 10), status: "active",
  };

  const saveTeacher = (t: Teacher) => {
    setTeachers((prev) => {
      const idx = prev.findIndex((p) => p.id === t.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = t; return u; }
      return [...prev, t];
    });
    setEditing(null);
    setAdding(false);
    toast.success("Teacher saved (demo)");
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="page-title">Teachers & Staff</h1>
          <p className="page-subtitle">Manage teaching staff and subject assignments</p>
        </div>
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild><Button className="sm:ml-auto gap-2"><Plus className="h-4 w-4" /> Add Teacher</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
            <TeacherForm teacher={blankTeacher} onSave={saveTeacher} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search teachers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.firstName[0]}{t.lastName[0]}
                  </div>
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{t.firstName} {t.lastName}</h3>
                <p className="text-sm text-primary font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.email}</p>
                <p className="text-xs text-muted-foreground">{t.phone}</p>
                <div className="flex justify-end gap-1 mt-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(t)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setTeachers((p) => p.filter((x) => x.id !== t.id)); toast.success("Removed (demo)"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent><DialogHeader><DialogTitle>Edit Teacher</DialogTitle></DialogHeader>
          {editing && <TeacherForm teacher={editing} onSave={saveTeacher} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TeacherForm = ({ teacher, onSave }: { teacher: Teacher; onSave: (t: Teacher) => void }) => {
  const [form, setForm] = useState(teacher);
  const u = (f: keyof Teacher, v: string) => setForm((p) => ({ ...p, [f]: v }));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-muted-foreground">First Name</label><Input value={form.firstName} onChange={(e) => u("firstName", e.target.value)} /></div>
        <div><label className="text-xs text-muted-foreground">Last Name</label><Input value={form.lastName} onChange={(e) => u("lastName", e.target.value)} /></div>
      </div>
      <div><label className="text-xs text-muted-foreground">Subject</label><Input value={form.subject} onChange={(e) => u("subject", e.target.value)} /></div>
      <div><label className="text-xs text-muted-foreground">Email</label><Input value={form.email} onChange={(e) => u("email", e.target.value)} /></div>
      <div><label className="text-xs text-muted-foreground">Phone</label><Input value={form.phone} onChange={(e) => u("phone", e.target.value)} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

export default Teachers;
