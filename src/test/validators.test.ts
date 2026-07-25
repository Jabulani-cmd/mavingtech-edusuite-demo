import { describe, it, expect } from "vitest";
import {
  saPhoneRegex,
  saIdSchema,
  studentFormSchema,
  staffFormSchema,
} from "@/lib/validators";

describe("SA Phone Validation", () => {
  it("accepts valid 0 format", () => {
    expect(saPhoneRegex.test("0821234567")).toBe(true);
    expect(saPhoneRegex.test("0731234567")).toBe(true);
    expect(saPhoneRegex.test("0611234567")).toBe(true);
  });

  it("accepts valid +27 format", () => {
    expect(saPhoneRegex.test("+27821234567")).toBe(true);
  });

  it("rejects invalid numbers", () => {
    expect(saPhoneRegex.test("1234567890")).toBe(false);
    expect(saPhoneRegex.test("082123456")).toBe(false);   // too short
    expect(saPhoneRegex.test("08212345678")).toBe(false); // too long
    expect(saPhoneRegex.test("0521234567")).toBe(false);  // not mobile prefix
    expect(saPhoneRegex.test("")).toBe(false);
  });
});

describe("SA National ID Validation", () => {
  it("accepts a valid 13-digit SA ID (Luhn)", () => {
    // 8001015009087 is a well-known Luhn-valid test SA ID
    const parsed = saIdSchema.safeParse("8001015009087");
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid IDs", () => {
    expect(saIdSchema.safeParse("1234567890123").success).toBe(false);
    expect(saIdSchema.safeParse("abc").success).toBe(false);
  });
});

describe("Student Form Schema", () => {
  const validStudent = {
    admission_number: "STU0001",
    full_name: "Thabo Nkosi",
    form: "Grade 8",
    date_of_birth: "2010-05-15",
    gender: "Male",
    guardian_name: "Mr. Nkosi",
    guardian_phone: "0821234567",
    guardian_email: "nkosi@example.com",
    emergency_contact: "0832345678",
    address: "123 Long Street, Johannesburg",
    enrollment_date: "2026-01-15",
  };

  it("validates a minimal valid student", () => {
    expect(studentFormSchema.safeParse(validStudent).success).toBe(true);
  });

  it("rejects missing full_name", () => {
    expect(studentFormSchema.safeParse({ ...validStudent, full_name: "" }).success).toBe(false);
  });

  it("rejects missing grade", () => {
    expect(studentFormSchema.safeParse({ ...validStudent, form: "" }).success).toBe(false);
  });

  it("rejects invalid guardian phone", () => {
    expect(studentFormSchema.safeParse({ ...validStudent, guardian_phone: "12345" }).success).toBe(false);
  });

  it("rejects invalid guardian email", () => {
    expect(studentFormSchema.safeParse({ ...validStudent, guardian_email: "not-an-email" }).success).toBe(false);
  });
});

describe("Staff Form Schema", () => {
  const validStaff = { full_name: "Mr. T. Ndlovu" };

  it("validates a minimal valid staff member", () => {
    expect(staffFormSchema.safeParse(validStaff).success).toBe(true);
  });

  it("defaults role to teacher", () => {
    const r = staffFormSchema.safeParse(validStaff);
    if (r.success) expect(r.data.role).toBe("teacher");
  });

  it("accepts valid SA national ID", () => {
    expect(staffFormSchema.safeParse({ ...validStaff, national_id: "8001015009087" }).success).toBe(true);
  });

  it("rejects invalid national ID", () => {
    expect(staffFormSchema.safeParse({ ...validStaff, national_id: "invalid-id" }).success).toBe(false);
  });

  it("accepts subjects_taught array", () => {
    expect(staffFormSchema.safeParse({ ...validStaff, subjects_taught: ["Mathematics", "Physical Sciences"] }).success).toBe(true);
  });
});
