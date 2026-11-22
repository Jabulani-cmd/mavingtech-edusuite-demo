import { supabase } from "@/integrations/supabase/client";

export type HealthKey =
  | "teachers_without_class"
  | "classes_without_subject_teacher"
  | "classes_without_class_teacher"
  | "subjects_without_teacher"
  | "students_without_class"
  | "logins_not_linked"
  | "logins_without_profile";

export type HealthReport = Record<HealthKey, number> & { samples?: Partial<Record<HealthKey, string[]>> };

export const HEALTH_CHECKS: { key: HealthKey; label: string; fix: "relink" | "orphans" }[] = [
  { key: "teachers_without_class", label: "Teachers without a class", fix: "relink" },
  { key: "classes_without_class_teacher", label: "Classes without a class teacher", fix: "relink" },
  { key: "classes_without_subject_teacher", label: "Classes without any subject teacher", fix: "relink" },
  { key: "subjects_without_teacher", label: "Class subjects with no teacher", fix: "relink" },
  { key: "students_without_class", label: "Students without a class", fix: "relink" },
  { key: "logins_not_linked", label: "Logins not linked to a record", fix: "orphans" },
  { key: "logins_without_profile", label: "Logins without a profile", fix: "relink" },
];

/** Checks that are not zero, in display order. */
export function healthIssues(report: Partial<HealthReport> | null | undefined) {
  if (!report) return [];
  return HEALTH_CHECKS.filter((c) => Number(report[c.key] ?? 0) > 0);
}

/** Generated types lag behind new functions, so call them through an untyped rpc. */
const rpc = (name: string) => (supabase.rpc as unknown as (n: string) => Promise<{ data: unknown; error: { message: string } | null }>)(name);

export async function fetchHealth(): Promise<HealthReport> {
  const { data, error } = await rpc("school_data_health");
  if (error) throw new Error(error.message);
  return data as HealthReport;
}

export async function relinkEverything(): Promise<{ health: HealthReport; linked: Record<string, number>; created: Record<string, number> }> {
  const { data, error } = await rpc("sync_school_links");
  if (error) throw new Error(error.message);
  return data as { health: HealthReport; linked: Record<string, number>; created: Record<string, number> };
}

export async function removeDemoLogins(orphansOnly: boolean): Promise<{ removed: number; failed: number; errors: string[] }> {
  const { data, error } = await supabase.functions.invoke("seed-demo-accounts", { body: { action: "remove_demo_logins", orphansOnly } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
