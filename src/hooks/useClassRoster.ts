import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { takesSubject } from "@/lib/studentSubjects";

/** Class membership, not Form alone, determines who can be marked for a subject. */
export function useClassRoster(classId?: string | null, subjectName?: string | null) {
  const [studentIds, setStudentIds] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    setStudentIds([]);
    if (!classId) return;
    void (async () => {
      const { data: placements } = await supabase.from("student_classes").select("student_id").eq("class_id", classId);
      const ids = (placements ?? []).map((r) => r.student_id);
      if (!ids.length) return;
      const { data } = await supabase.from("students").select("id, subject_combination").in("id", ids);
      if (active) setStudentIds((data ?? []).filter((s) => takesSubject(s.subject_combination, subjectName)).map((s) => s.id));
    })();
    return () => { active = false; };
  }, [classId, subjectName]);
  return studentIds;
}