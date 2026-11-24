import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StudentTimetableTab from "./StudentTimetableTab";
import PublishedTimetableWidget from "@/components/timetable/PublishedTimetableWidget";
import SubscriptionGate from "@/components/subscription/SubscriptionGate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Learner = { id: string; full_name: string; form: string; stream: string | null };

export default function LearnerTimetablePage({ parent = false }: { parent?: boolean }) {
  const { user } = useAuth();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!user?.id) { setLoading(false); return; }
      let query = supabase.from("students").select("id, full_name, form, stream");
      if (parent) {
        const { data } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
        const ids = (data ?? []).map((r) => r.student_id);
        if (!ids.length) { if (active) setLoading(false); return; }
        query = query.in("id", ids);
      } else query = query.eq("user_id", user.id);
      const { data } = await query;
      if (active) { setLearners(data ?? []); setSelectedId(data?.[0]?.id ?? ""); setLoading(false); }
    })();
    return () => { active = false; };
  }, [user?.id, parent]);
  useEffect(() => {
    let active = true;
    setClassId(null);
    if (selectedId) void supabase.from("student_classes").select("class_id").eq("student_id", selectedId).limit(1).maybeSingle()
      .then(({ data }) => { if (active) setClassId(data?.class_id ?? null); });
    return () => { active = false; };
  }, [selectedId]);
  const learner = learners.find((s) => s.id === selectedId);
  if (loading) return <div className="container py-6 text-muted-foreground">Loading timetable…</div>;
  if (!learner) return <div className="container py-6 text-muted-foreground">No linked learner found.</div>;
  return <SubscriptionGate feature="the timetable" hard>
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="font-heading text-3xl font-bold">{parent ? "Child's Timetable" : "My Timetable"}</h1>
      {parent && <Select value={selectedId} onValueChange={setSelectedId}><SelectTrigger className="w-full max-w-sm"><SelectValue /></SelectTrigger><SelectContent>{learners.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent></Select>}
      <PublishedTimetableWidget studentId={learner.id} title={`${learner.form} ${learner.stream ?? ""}`} mode="class" filterValue={`${learner.form} ${learner.stream ?? ""}`.trim()} />
      <StudentTimetableTab studentId={learner.id} studentClassId={classId} />
    </div>
  </SubscriptionGate>;
}