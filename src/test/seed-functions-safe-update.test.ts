import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The live database refuses any UPDATE or DELETE without a WHERE clause (the pg_safeupdate setting), and a
 * demo loader that breaks it fails only on the live site. This guards the loader migration against that.
 */
const dir = "supabase/migrations";
const file = readdirSync(dir).filter((f) => f.startsWith("20261106150000_")).map((f) => join(dir, f))[0];
const lifeFile = readdirSync(dir).filter((f) => f.startsWith("20261106160000_")).map((f) => join(dir, f))[0];
const feesFile = readdirSync(dir).filter((f) => f.startsWith("20261106170000_")).map((f) => join(dir, f))[0];
// Both loader migrations are held to the same rules.
const sql = [file, lifeFile, feesFile].filter(Boolean).map((f) => readFileSync(f, "utf8")).join("\n");
const code = sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n"); // without comments

describe("demo loader functions", () => {
  it("has the migration that replaces both loaders", () => {
    expect(file).toBeTruthy();
    expect(lifeFile).toBeTruthy();
    expect(sql).toContain("FUNCTION public.seed_demo_school_life(_area text)");
    expect(sql).toContain("FUNCTION public.seed_demo_activity()");
    expect(sql).toContain("FUNCTION public.seed_demo_finance()");
  });

  it("puts a WHERE clause on every UPDATE and DELETE", () => {
    const writes = [...sql.matchAll(/(?:^|\n)\s*((?:UPDATE\s+\S+\s+SET|DELETE\s+FROM)\b[^;]*);/gi)].map((m) => m[1]);
    expect(writes.length).toBeGreaterThan(0);
    for (const w of writes) expect(w, w.slice(0, 80)).toMatch(/\bWHERE\b/i);
  });

  it("names each step so a failure says where it happened", () => {
    expect(sql).toMatch(/Demo activity failed while %/);
    expect(sql).toMatch(/Demo finance failed while %/);
    for (const step of ["adding attendance", "adding class test marks", "adding homework marks", "adding invoices", "adding payments"]) {
      expect(sql).toContain(`step := '${step}'`);
    }
  });

  it("does not join a LATERAL sub-select after another join (the live failure)", () => {
    expect(code).not.toMatch(/\bLATERAL\b/i);
  });

  it("replaces every invoice of the demo learners, including the automatic one", () => {
    expect(feesFile).toBeTruthy();
    const fees = readFileSync(feesFile, "utf8");
    expect(fees).toContain("FUNCTION public.seed_demo_finance()");
    expect(fees).toMatch(/DELETE FROM public\.invoices WHERE notes = 'demo-finance'\s+OR student_id IN/);
    expect(fees).toMatch(/lower\(st\.email\) LIKE '%schooldemo\.com'/);
  });

  it("only links to demo images and documents that exist", () => {
    const life = readFileSync(lifeFile, "utf8");
    const links = [...life.matchAll(/'(\/demo\/[^']+)'/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThanOrEqual(16); // 4 carousel + 8 gallery + 4 downloads
    for (const link of links) expect(existsSync(join("public", link)), link).toBe(true);
  });

  it("loads the four areas and can clear everything it created", () => {
    for (const area of ["academic", "finance", "boarding", "school"]) expect(sql).toContain(`_area = '${area}'`);
    expect(sql).toContain("FUNCTION public.clear_demo_school_life()");
    expect(sql).toContain("demo_seed_rows");
  });
});
