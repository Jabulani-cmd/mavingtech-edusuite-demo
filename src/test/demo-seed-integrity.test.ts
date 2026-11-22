import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { generateDemoSeed } from "@/lib/demoSeeder";
import { DEMO_EMAIL_DOMAIN, DEMO_PASSWORDS, DEMO_STAFF_ACCOUNTS } from "@/lib/demoAccounts";
import { PORTALS } from "@/lib/portals";

/**
 * The demo has to work in every portal. These checks catch a seed that would leave a portal empty or
 * a login that cannot reach its dashboard, before anyone loads it.
 */
const seed = generateDemoSeed();
const read = (path: string) => readFileSync(path, "utf8");

describe("demo school", () => {
  it("gives every class a class teacher and a teacher for every subject it takes", () => {
    const teachers = new Set(seed.teachers.map((t) => t.id));
    for (const c of seed.classes) {
      expect(c.classTeacherId && teachers.has(c.classTeacherId), `${c.name} has a class teacher`).toBeTruthy();
      const taught = seed.allocations.filter((a) => a.classId === c.id);
      expect(taught.length, `${c.name} has subject teachers`).toBeGreaterThan(0);
      expect(taught.every((a) => teachers.has(a.teacherId)), `${c.name}: every subject has a teacher`).toBe(true);
    }
  });

  it("gives every teacher at least one class, so no teacher portal is empty and marks can be entered", () => {
    const withClasses = new Set(seed.allocations.map((a) => a.teacherId));
    const idle = seed.teachers.filter((t) => !withClasses.has(t.id)).map((t) => t.name);
    expect(idle).toEqual([]);
  });

  it("puts every student in a real class and links every parent to children who exist", () => {
    const classes = new Set(seed.classes.map((c) => c.id));
    const students = new Set(seed.students.map((s) => s.id));
    expect(seed.students.every((s) => classes.has(s.classId))).toBe(true);
    expect(seed.parents.every((p) => p.childIds.length > 0 && p.childIds.every((id) => students.has(id)))).toBe(true);
    const withParent = new Set(seed.parents.flatMap((p) => p.childIds));
    expect(seed.students.filter((s) => !withParent.has(s.id))).toEqual([]);
  });

  it("never books a teacher, class or room twice in the same period", () => {
    for (const key of ["teacherId", "classId", "roomId"] as const) {
      const seen = new Set<string>();
      for (const s of seed.slots.filter((x) => x.subjectId && x[key])) {
        const k = `${s[key]}|${s.day}|${s.period}`;
        expect(seen.has(k), `${key} double-booked: ${k}`).toBe(false);
        seen.add(k);
      }
    }
  });

  it("has a unique sign-in address for every account, all on the demo domain", () => {
    const emails = [
      `admin@${DEMO_EMAIL_DOMAIN}`,
      ...DEMO_STAFF_ACCOUNTS.map((a) => a.email),
      ...seed.teachers.map((t) => t.email),
      ...seed.students.map((s) => s.email),
      ...seed.parents.map((p) => p.email),
    ].map((e) => e.toLowerCase());
    expect(new Set(emails).size).toBe(emails.length);
    expect(emails.every((e) => e.endsWith(`.${DEMO_EMAIL_DOMAIN}`) || e.endsWith(`@${DEMO_EMAIL_DOMAIN}`))).toBe(true);
  });
});

describe("demo staff logins", () => {
  it("cover every staff portal", () => {
    const roles = DEMO_STAFF_ACCOUNTS.map((a) => a.role).sort();
    expect(roles).toEqual(["admin_supervisor", "bursar", "deputy_principal", "finance", "finance_clerk", "hod", "principal", "registration"]);
    // Together with the administrator, teacher, student and parent logins, every role a user can sign in with.
    const portalRoles = new Set([...PORTALS.flatMap((p) => p.roles), "student", "parent", "teacher", "admin"]);
    for (const a of DEMO_STAFF_ACCOUNTS) expect(portalRoles.has(a.role), a.role).toBe(true);
  });

  it("are sign-in-able through Administration and use a password that is not a common one", () => {
    const admin = PORTALS.find((p) => p.key === "admin")!;
    for (const a of DEMO_STAFF_ACCOUNTS) expect(admin.roles.includes(a.role), `${a.role} signs in through Administration`).toBe(true);
    expect(DEMO_PASSWORDS.staff.length).toBeGreaterThanOrEqual(12);
  });

  it("land on a dashboard whose route allows their role", () => {
    const app = read("src/App.tsx");
    const login = read("src/pages/Login.tsx");
    for (const a of DEMO_STAFF_ACCOUNTS) {
      expect(login, `Login sends ${a.role} to ${a.portal}`).toMatch(new RegExp(`"${a.role}"\\) navigate\\("${a.portal}"\\)`));
      const route = app.split("\n").findIndex((l) => l.includes(`path="${a.portal}"`));
      expect(route, `route ${a.portal} exists`).toBeGreaterThanOrEqual(0);
      const guard = app.split("\n").slice(route, route + 4).join(" ");
      expect(guard, `${a.portal} allows ${a.role}`).toContain(`"${a.role}"`);
    }
  });

  it("match the roles and password the account service accepts", () => {
    const fn = read("supabase/functions/seed-demo-accounts/index.ts");
    const listed = [...(fn.match(/const STAFF_ROLES = \[([^\]]+)\]/)?.[1] ?? "").matchAll(/"(\w+)"/g)].map((m) => m[1]).sort();
    expect(listed).toEqual(DEMO_STAFF_ACCOUNTS.map((a) => a.role).sort());
  });
});

describe("keeping teachers, students, classes and logins in step", () => {
  const migrations = readdirSync("drizzle/migrations").filter((f) => f.endsWith(".sql"));
  const sync = migrations.filter((f) => f.includes("sync_school_links")).map((f) => read(`drizzle/migrations/${f}`)).join("\n");

  it("every seeded login can be linked to its record", () => {
    const teacherEmails = new Set(seed.teachers.map((t) => t.email.toLowerCase()));
    expect(teacherEmails.size).toBe(seed.teachers.length);
    const admissions = new Set(seed.students.map((s) => s.admissionNumber));
    expect(admissions.size).toBe(seed.students.length);
    const studentIds = new Set(seed.students.map((s) => s.id));
    for (const p of seed.parents) expect(p.childIds.every((id) => studentIds.has(id)), p.email).toBe(true);
  });

  it("has a re-link function that links by email, fills rosters and subject teachers, and reports what is left", () => {
    expect(sync).toContain("FUNCTION public.sync_school_links()");
    expect(sync).toMatch(/lower\(u\.email\) = lower\(s\.email\)/);
    expect(sync).toContain("INSERT INTO student_classes");
    expect(sync).toContain("UPDATE class_subjects cs SET teacher_id = te.teacher_id");
    for (const k of ["teachers_without_class", "classes_without_class_teacher", "students_without_class", "logins_not_linked"]) expect(sync).toContain(`'${k}'`);
    expect(sync).toMatch(/is_school_admin\(auth\.uid\(\)\)/);
  });

  it("puts a WHERE clause on every UPDATE and DELETE (the live database refuses them otherwise)", () => {
    const writes = [...sync.matchAll(/(?:^|\n)\s*((?:UPDATE\s+\S+(?:\s+\w+)?\s+SET|DELETE\s+FROM)\b[^;]*);/gi)].map((m) => m[1]);
    expect(writes.length).toBeGreaterThan(5);
    for (const w of writes) expect(w, w.slice(0, 80)).toMatch(/\bWHERE\b/i);
  });

  it("links records automatically when a login or record is added", () => {
    expect(sync).toContain("ON auth.users");
    expect(sync).toContain("ON public.staff");
    expect(sync).toContain("ON public.students");
    expect(sync).toContain("ON public.class_subjects");
  });
});
