export const splitSubjects = (value: string | null | undefined): string[] =>
  [...new Set((value ?? "").split(",").map((s) => s.trim()).filter(Boolean))];

export function subjectLoadError(form: string, names: string[], allowUnallocated = false): string | null {
  if (names.some((name) => ["study hall", "private study"].includes(name.trim().toLowerCase()))) return "Supervised study is a timetable activity, not an enrolled subject.";
  if (allowUnallocated && names.length === 0) return null;
  const count = new Set(names.map((s) => s.trim().toLowerCase()).filter(Boolean)).size;
  const sixth = /^Form [56]$/.test(form);
  const min = sixth ? 1 : 7;
  const max = sixth ? 4 : 10;
  return count < min || count > max ? `${form} requires ${min} to ${max} ${sixth ? "A-Level " : ""}subjects.` : null;
}

export function takesSubject(combination: string | null | undefined, name: string | null | undefined): boolean {
  const selected = splitSubjects(combination).map((s) => s.toLowerCase());
  return selected.length === 0 || !name || selected.includes(name.trim().toLowerCase());
}

export function isTimetableActivity(name: string | null | undefined): boolean {
  return ["study hall", "private study", "physical education"].includes((name ?? "").trim().toLowerCase());
}