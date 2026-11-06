import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Subjects, rooms and meetings are for signed-in users only: visitors read nothing, and only school
 * administrators change them. This is how the live site behaves; the migration keeps the repo in step.
 */
const dir = "supabase/migrations";
const file = readdirSync(dir).filter((f) => f.startsWith("20261106140000_")).map((f) => join(dir, f))[0];
const sql = file ? readFileSync(file, "utf8") : "";
const statements = sql.split(";").map((s) => s.trim());

describe("subjects, rooms and meetings visibility", () => {
  it("has the migration", () => {
    expect(file).toBeTruthy();
    for (const t of ["subjects", "rooms", "meetings"]) expect(sql).toContain(`'${t}'`);
  });

  it("never creates a rule for visitors", () => {
    const creates = statements.filter((s) => /CREATE POLICY/i.test(s));
    expect(creates.length).toBeGreaterThan(0);
    expect(creates.every((s) => /TO authenticated/i.test(s) && !/\b(anon|public)\b\s+(USING|WITH)/i.test(s))).toBe(true);
  });

  it("lets only school administrators write", () => {
    const write = statements.find((s) => /_admin_write/.test(s) && /CREATE POLICY/i.test(s))!;
    expect(write).toMatch(/FOR ALL TO authenticated/);
    expect(write).toMatch(/is_school_admin\(auth\.uid\(\)\)/);
    expect(write).not.toMatch(/USING \(true\)/i);
  });

  it("removes any rule that applies to visitors or lets every signed-in user write", () => {
    expect(sql).toMatch(/roles && ARRAY\['public', 'anon'\]/);
    expect(sql).toMatch(/cmd <> 'SELECT'/);
  });
});
