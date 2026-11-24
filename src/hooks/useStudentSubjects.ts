import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { takesSubject, isTimetableActivity } from "@/lib/studentSubjects";

/** Current subject selection only; completed marks and published reports keep their historical subjects. */
export function useStudentSubjects(studentId?: string | null, enabled = true) {
  const { user } = useAuth();
  const [combination, setCombination] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (!enabled) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      if (!studentId && !user?.id) { if (active) setLoading(false); return; }
      let query = supabase.from("students").select("subject_combination");
      if (studentId) query = query.eq("id", studentId);
      else if (user?.id) query = query.eq("user_id", user.id);
      const { data } = await query.maybeSingle();
      if (active) { setCombination(data?.subject_combination ?? null); setLoading(false); }
    };
    void load();
    const onFocus = () => { void load(); };
    window.addEventListener("focus", onFocus);
    const channel = supabase.channel(`student-subjects-${studentId ?? user?.id}-${Math.random()}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "students", filter: studentId ? `id=eq.${studentId}` : `user_id=eq.${user?.id}` }, onFocus)
      .subscribe();
    return () => { active = false; window.removeEventListener("focus", onFocus); void supabase.removeChannel(channel); };
  }, [studentId, user?.id, enabled]);
  const includes = useCallback((name?: string | null, activity = false) =>
    takesSubject(combination, name) || (activity && isTimetableActivity(name)), [combination]);
  return { combination, includes, loading };
}