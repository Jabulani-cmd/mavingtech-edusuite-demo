import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Teachers may record marks only for classes they teach, and "teaches" comes from class_subjects,
 * student_classes, classes.class_teacher_id and the timetable. If a teacher could write to those,
 * they could assign themselves to any class. The migration below must keep them school-leader only.
 */
const dir = "supabase/migrations";
const file = readdirSync(dir).filter((f) => f.startsWith("20261106100000_")).map((f) => join(dir, f))[0];
const sql = file ? readFileSync(file, "utf8") : "";

function policy(name: string) {
  const start = sql.indexOf(`CREATE POLICY ${name} `);
  return start < 0 ? "" : sql.slice(start, sql.indexOf(";", start));
}

describe("class assignment write rules", () => {
  it("has the lock-down migration", () => {
    expect(file).toBeTruthy();
  });

  it.each(["class_subjects_leaders_write", "student_classes_leaders_write"])("%s does not include the teacher role", (name) => {
    const p = policy(name);
    expect(p).not.toBe("");
    expect(p).not.toMatch(/'teacher'/);
    expect(p).toMatch(/'admin'/);
  });

  it("drops the old rules that let any teacher write them", () => {
    expect(sql).toContain('DROP POLICY IF EXISTS "Academic roles can manage class_subjects"');
    expect(sql).toContain('DROP POLICY IF EXISTS "Academic roles can manage student_classes"');
    expect(sql).toContain('DROP POLICY IF EXISTS "Teachers can insert marks"');
  });
});
