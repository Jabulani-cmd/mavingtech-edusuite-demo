import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The live database refuses any UPDATE or DELETE without a WHERE clause (the pg_safeupdate setting), and a
 * demo loader that breaks it fails only on the live site. This guards the loader migration against that.
 */
const dir = "supabase/migrations";
const file = readdirSync(dir).filter((f) => f.startsWith("20261106150000_")).map((f) => join(dir, f))[0];
const sql = file ? readFileSync(file, "utf8") : "";
const code = sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n"); // without comments

describe("demo loader functions", () => {
  it("has the migration that replaces both loaders", () => {
    expect(file).toBeTruthy();
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
});
