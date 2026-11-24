import { describe, it, expect } from "vitest";
import { attendanceRegister, marksRegister } from "@/lib/classRecords";
const st = [{ id: "a", full_name: "Tendai Moyo", admission_number: "1" }];
describe("class registers", () => {
  it("counts present and late as attending", () => {
    const t = attendanceRegister(st, [{ student_id: "a", date: "2026-11-02", status: "present" }, { student_id: "a", date: "2026-11-03", status: "late" }, { student_id: "a", date: "2026-11-04", status: "absent" }, { student_id: "a", date: "2026-11-05", status: "absent" }]);
    expect(t.body[0].slice(-5)).toEqual([1, 2, 1, 0, "50%"]);
  });
  it("averages marks as percentages per subject", () => {
    const t = marksRegister(st, [{ student_id: "a", subject_id: "m", mark: 40, out_of: 50 }, { student_id: "a", subject_id: "m", mark: 60, out_of: 100 }], { m: "Mathematics" });
    expect(t.body[0].slice(3)).toEqual(["70%", "70%"]);
  });
});
