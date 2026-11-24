import { describe, expect, it } from "vitest";
import { subjectLoadError, takesSubject, isTimetableActivity } from "@/lib/studentSubjects";

describe("current learner subject selection", () => {
  it("requires 7–10 O-Level subjects", () => {
    const names = Array.from({ length: 11 }, (_, i) => `Subject ${i}`);
    expect(subjectLoadError("Form 1", names.slice(0, 6))).not.toBeNull();
    expect(subjectLoadError("Form 4", names.slice(0, 7))).toBeNull();
    expect(subjectLoadError("Form 2", names.slice(0, 10))).toBeNull();
    expect(subjectLoadError("Form 3", names)).not.toBeNull();
  });
  it("requires 1–4 A-Level subjects", () => {
    expect(subjectLoadError("Form 5", [])).not.toBeNull();
    expect(subjectLoadError("Form 5", ["Physics"])).toBeNull();
    expect(subjectLoadError("Form 6", ["Physics", "Chemistry", "Biology", "Pure Mathematics"])).toBeNull();
    expect(subjectLoadError("Form 6", ["Physics", "Chemistry", "Biology", "Pure Mathematics", "Economics"])).not.toBeNull();
  });
  it("only includes the learner's chosen subjects, without counting study periods", () => {
    expect(takesSubject("Physics, Chemistry", "Physics")).toBe(true);
    expect(takesSubject("Physics, Chemistry", "Accounting")).toBe(false);
    expect(takesSubject("Physics, Chemistry", "Study Hall")).toBe(false);
    expect(isTimetableActivity("Study Hall")).toBe(true);
    expect(subjectLoadError("Form 6", ["Physics", "Study Hall"])).not.toBeNull();
  });
});