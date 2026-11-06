import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/**
 * Loads the demo school through the admin panel against a fake Supabase client
 * and checks what would reach the database and the account edge function.
 */

type Row = Record<string, unknown>;
const writes: { table: string; op: string; rows: Row[] }[] = [];
const invokes: { accounts: Row[] }[] = [];
type InvokeResult = { data: unknown; error: unknown };
const ok = (): InvokeResult => ({ data: { ok: true, errors: 0 }, error: null });
let respond: (body: { accounts: Row[] }) => InvokeResult = ok;

// Rows inserted per table, so reading a table back returns what was saved.
const saved = new Map<string, Row[]>();

function fakeQuery(table: string) {
  let result: { data: unknown; error: null | { message: string } } = { data: saved.get(table) ?? [], error: null };
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  for (const m of ["select", "eq", "in", "like", "ilike", "order", "limit"]) chain[m] = vi.fn(self);
  const write = (op: string) => (rows: Row | Row[]) => {
    const list = Array.isArray(rows) ? rows : [rows];
    writes.push({ table, op, rows: list });
    const withIds = list.map((r, i) => ({ id: `${table}-${writes.length}-${i}`, ...r }));
    if (op !== "update") saved.set(table, [...(saved.get(table) ?? []), ...withIds]);
    result = { data: withIds, error: null };
    return chain;
  };
  chain.insert = vi.fn(write("insert"));
  chain.upsert = vi.fn(write("upsert"));
  chain.update = vi.fn(write("update"));
  chain.delete = vi.fn(() => {
    writes.push({ table, op: "delete", rows: [] });
    if (table === "students" && blockStudentDelete) result = { data: null, error: { message: blockStudentDelete } };
    return chain;
  });
  chain.single = vi.fn(() => Promise.resolve({ data: (result.data as Row[])[0] ?? null, error: null }));
  chain.then = (resolve: (r: typeof result) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

// Records loaded after the school itself is saved: marks and attendance, fees and invoices, then an agent run.
const rpcCalls: string[] = [];
const agentRuns: string[] = [];
let failRpc: string | null = null;
// A school-life area that loads but reports one failed step.
let failStep: string | null = null;
const ALL_RPC = ["seed_demo_activity", "seed_demo_finance", "seed_demo_school_life:academic", "seed_demo_school_life:finance", "seed_demo_school_life:boarding", "seed_demo_school_life:school"];
// A foreign key error the database gives when something still points at the students being deleted.
let blockStudentDelete: string | null = null;
// Who is signed in while the seeder runs (the demo administrator is left out of the accounts it sends).
let signedInEmail = "head.office@school.test";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => fakeQuery(table),
    auth: { getUser: vi.fn(async () => ({ data: { user: { email: signedInEmail } }, error: null })) },
    rpc: vi.fn(async (name: string, args?: { _area?: string }) => {
      const call = args?._area ? `${name}:${args._area}` : name;
      rpcCalls.push(call);
      if (call === failRpc) return { data: null, error: { message: `${name} failed in the test` } };
      if (call === failStep) return { data: { area: args?._area, loaded: { exams: 3 }, failed: [{ step: "exam timetable", error: "column start_time is of type time" }] }, error: null };
      return { data: name === "seed_demo_school_life" ? { area: args?._area, loaded: { rows: 10 }, failed: [] } : { ok: true }, error: null };
    }),
    functions: {
      invoke: vi.fn(async (name: string, { body }: { body: { accounts: Row[] } }) => {
        if (name === "school-agent") { agentRuns.push(name); return { data: { ok: true }, error: null }; }
        invokes.push(body);
        return respond(body);
      }),
    },
  },
}));

import DemoDataSeederPanel from "@/components/admin/DemoDataSeederPanel";
import { Toaster } from "@/components/ui/toaster";
import { DEMO_PASSWORDS, DEMO_STAFF_ACCOUNTS } from "@/lib/demoAccounts";
import { AllocationProvider } from "@/contexts/AllocationContext";
import { DemoPeopleProvider } from "@/contexts/DemoPeopleContext";

describe("Demo data seeder panel", () => {
  it("saves 500 students and creates a linked login for everyone", async () => {
    render(
      <AllocationProvider>
        <DemoPeopleProvider>
          <DemoDataSeederPanel />
        </DemoPeopleProvider>
      </AllocationProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /load demo data/i }));
    await waitFor(() => expect(screen.getByText(/demo data loaded successfully/i)).toBeInTheDocument(), { timeout: 15000 });

    // Classes are written before students, so the roster trigger can link each student.
    const firstClass = writes.findIndex((w) => w.table === "classes" && w.op === "insert");
    const firstStudent = writes.findIndex((w) => w.table === "students");
    expect(firstClass).toBeGreaterThanOrEqual(0);
    expect(firstClass).toBeLessThan(firstStudent);

    const students = writes.filter((w) => w.table === "students" && w.op === "upsert").flatMap((w) => w.rows);
    expect(students).toHaveLength(500);
    expect(students.every((s) => /^Form [1-6]$/.test(String(s.form)) && s.class === `${s.form}${s.stream}`)).toBe(true);
    expect(students.every((s) => s.guardian_name && s.guardian_phone && s.province)).toBe(true);

    // Logins: 1 admin + 8 leadership and office staff + 30 teachers + 500 students + every parent, in small batches.
    const accounts = invokes.flatMap((b) => b.accounts);
    expect(invokes.every((b) => b.accounts.length <= 20)).toBe(true);
    expect(new Set(accounts.map((a) => a.email)).size).toBe(accounts.length);
    const count = (role: string) => accounts.filter((a) => a.role === role).length;
    expect([count("admin"), count("teacher"), count("student")]).toEqual([1, 30, 500]);
    // Every staff portal has a login, so principal, deputy, HOD, finance, bursar, clerk, registration and supervisor can all be shown.
    expect(accounts.filter((a) => DEMO_STAFF_ACCOUNTS.some((d) => d.role === a.role)).map((a) => a.role).sort())
      .toEqual(DEMO_STAFF_ACCOUNTS.map((d) => d.role).sort());
    expect(accounts.filter((a) => DEMO_STAFF_ACCOUNTS.some((d) => d.role === a.role)).every((a) => a.password === DEMO_PASSWORDS.staff)).toBe(true);
    expect(count("parent")).toBeGreaterThan(800);
    expect(accounts.filter((a) => a.role === "student").every((a) => a.admission_number)).toBe(true);

    // Parents are sent after every student, and every child is linked to a parent.
    const lastStudentCall = Math.max(...invokes.map((b, i) => (b.accounts.some((a) => a.role === "student") ? i : -1)));
    const firstParentCall = invokes.findIndex((b) => b.accounts.some((a) => a.role === "parent"));
    expect(firstParentCall).toBeGreaterThan(lastStudentCall);
    const linked = accounts.flatMap((a) => (a.children as { admission_number: string }[] | undefined) ?? []).map((c) => c.admission_number);
    expect(new Set(linked).size).toBe(500);

    // Demo records are loaded last, after the classes, teachers and logins they depend on.
    expect(rpcCalls).toEqual(ALL_RPC);
    expect(agentRuns).toHaveLength(1);

    // Every student is placed in their own class by the seeder (not by a database trigger), with an enrolment record.
    const roster = writes.filter((w) => w.table === "student_classes" && w.op === "insert").flatMap((w) => w.rows);
    expect(roster).toHaveLength(500);
    expect(new Set(roster.map((r) => r.student_id)).size).toBe(500);
    expect(writes.filter((w) => w.table === "enrollments" && w.op === "insert").flatMap((w) => w.rows)).toHaveLength(500);
    // Earlier placements are cleared first, so a trigger that put a student in the wrong class cannot leave them there.
    const firstRosterInsert = writes.findIndex((w) => w.table === "student_classes" && w.op === "insert");
    const firstRosterDelete = writes.findIndex((w) => w.table === "student_classes" && w.op === "delete");
    expect(firstRosterDelete).toBeGreaterThanOrEqual(0);
    expect(firstRosterDelete).toBeLessThan(firstRosterInsert);
  }, 30000);

  it("leaves the signed-in demo administrator's own login alone, so their session is not ended mid-load", async () => {
    writes.length = 0; invokes.length = 0; rpcCalls.length = 0; agentRuns.length = 0; saved.clear();
    signedInEmail = "admin@schooldemo.com";
    render(
      <AllocationProvider>
        <DemoPeopleProvider>
          <DemoDataSeederPanel />
        </DemoPeopleProvider>
      </AllocationProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /(re-seed|load) demo data/i }));
    await waitFor(() => expect(rpcCalls).toEqual(ALL_RPC), { timeout: 15000 });
    const accounts = invokes.flatMap((b) => b.accounts);
    // Updating the administrator's login ends their session on the server and every later call is refused.
    expect(accounts.some((a) => a.email === "admin@schooldemo.com")).toBe(false);
    // Everyone else is still created.
    expect(accounts.filter((a) => a.role === "student")).toHaveLength(500);
    expect(accounts.filter((a) => DEMO_STAFF_ACCOUNTS.some((d) => d.role === a.role))).toHaveLength(DEMO_STAFF_ACCOUNTS.length);
    signedInEmail = "head.office@school.test";
  }, 30000);

  it("loads every area of the school and names a step that failed inside one", async () => {
    writes.length = 0; invokes.length = 0; rpcCalls.length = 0; agentRuns.length = 0; saved.clear();
    failStep = "seed_demo_school_life:academic";
    render(
      <AllocationProvider>
        <DemoPeopleProvider>
          <DemoDataSeederPanel />
        </DemoPeopleProvider>
      </AllocationProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /(re-seed|load) demo data/i }));
    await waitFor(() => expect(screen.getByText(/exam timetable not loaded/i)).toBeInTheDocument(), { timeout: 15000 });
    // The four areas each ran as their own call, in order, and the other areas were not stopped.
    expect(rpcCalls).toEqual(ALL_RPC);
    expect(agentRuns).toHaveLength(1);
    failStep = null;
  }, 30000);

  it("Clear removes everything that points at the demo students before the students, and says when it cannot", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    writes.length = 0; invokes.length = 0; rpcCalls.length = 0; agentRuns.length = 0; saved.clear();
    // The students are found by admission number, so give the fake database some to find.
    saved.set("students", Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, admission_number: `STU000${i + 1}` })));
    blockStudentDelete = 'update or delete on table "students" violates foreign key constraint "invoices_student_id_fkey" on table "invoices"';
    render(
      <AllocationProvider>
        <DemoPeopleProvider>
          <DemoDataSeederPanel />
          <Toaster />
        </DemoPeopleProvider>
      </AllocationProvider>,
    );
    // Clear is offered once demo data is loaded.
    fireEvent.click(screen.getByRole("button", { name: /(re-seed|load) demo data/i }));
    await waitFor(() => expect(screen.getByText(/demo data loaded successfully/i)).toBeInTheDocument(), { timeout: 15000 });
    fireEvent.click(screen.getByRole("button", { name: /^done$/i })); // close the summary
    await waitFor(() => expect(screen.getByRole("button", { name: /clear demo data/i })).toBeInTheDocument());
    writes.length = 0;
    fireEvent.click(screen.getByRole("button", { name: /clear demo data/i }));
    await waitFor(() => expect(screen.getByText(/demo students could not all be removed/i)).toBeInTheDocument(), { timeout: 15000 });
    const order = writes.filter((w) => w.op === "delete").map((w) => w.table);
    // Invoices (the database creates one per student automatically) and payments are removed before the students.
    for (const table of ["payments", "invoices", "marks", "exam_results", "student_classes", "parent_students"]) {
      expect(order.indexOf(table), `${table} is cleared`).toBeGreaterThanOrEqual(0);
      expect(order.indexOf(table), `${table} before students`).toBeLessThan(order.indexOf("students"));
    }
    // The message names the blocking table instead of claiming everything was cleared.
    expect(screen.getByText(/invoices_student_id_fkey/)).toBeInTheDocument();
    blockStudentDelete = null;
  }, 30000);

  it("still finishes the load and says what is missing when fees cannot be loaded", async () => {
    writes.length = 0; invokes.length = 0; rpcCalls.length = 0; agentRuns.length = 0; saved.clear();
    failRpc = "seed_demo_finance";
    render(
      <AllocationProvider>
        <DemoPeopleProvider>
          <DemoDataSeederPanel />
        </DemoPeopleProvider>
      </AllocationProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /(re-seed|load) demo data/i }));
    await waitFor(() => expect(screen.getByText(/fees, invoices and payments not loaded/i)).toBeInTheDocument(), { timeout: 15000 });
    // The other parts still ran, and the logins were all created.
    expect(rpcCalls).toEqual(ALL_RPC);
    expect(agentRuns).toHaveLength(1);
    expect(invokes.flatMap((b) => b.accounts).filter((a) => a.role === "student")).toHaveLength(500);
    failRpc = null;
  }, 30000);

  it("creates missing logins for saved demo data and says why any failed", async () => {
    writes.length = 0;
    invokes.length = 0;
    rpcCalls.length = 0;
    saved.clear();
    // The service refuses the whole call, the way it does when demo mode is switched off.
    const refused = { error: "Demo mode is switched off for this school." };
    respond = () => ({
      data: null,
      error: Object.assign(new Error("Edge Function returned a non-2xx status code"), {
        context: new Response(JSON.stringify(refused), { status: 403 }),
      }),
    });

    render(
      <AllocationProvider>
        <DemoPeopleProvider>
          <DemoDataSeederPanel />
        </DemoPeopleProvider>
      </AllocationProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /create missing logins/i }));
    await waitFor(() => expect(screen.getByText(/some items need attention/i)).toBeInTheDocument(), { timeout: 15000 });
    expect(screen.getAllByText(/demo mode is switched off/i).length).toBeGreaterThan(0);

    // Only logins: the saved school records are left alone.
    expect(writes).toHaveLength(0);
    const accounts = invokes.flatMap((b) => b.accounts);
    expect(accounts.filter((a) => a.role === "student")).toHaveLength(500);
    expect(accounts.filter((a) => a.role === "teacher")).toHaveLength(30);
    expect(accounts.filter((a) => a.role === "parent").length).toBeGreaterThan(800);
    expect(accounts.filter((a) => DEMO_STAFF_ACCOUNTS.some((d) => d.role === a.role))).toHaveLength(DEMO_STAFF_ACCOUNTS.length);
    // Repairing logins does not reload any records.
    expect(rpcCalls).toHaveLength(0);
    respond = ok;
  }, 30000);
});
