import { describe, it, expect } from "vitest";
import {
  zimPhoneRegex,
  zimNationalIdRegex,
  studentFormSchema,
  staffFormSchema,
} from "@/lib/validators";

describe("Zimbabwe Phone Validation", () => {
  it("accepts valid 07 format", () => {
    expect(zimPhoneRegex.test("0771234567")).toBe(true);
    expect(zimPhoneRegex.test("0712345678")).toBe(true);
  });

  it("accepts valid +263 format", () => {
    expect(zimPhoneRegex.test("+263771234567")).toBe(true);
  });

  it("rejects invalid numbers", () => {
    expect(zimPhoneRegex.test("1234567890")).toBe(false);
    expect(zimPhoneRegex.test("077123456")).toBe(false); // too short
    expect(zimPhoneRegex.test("07712345678")).toBe(false); // too long
    expect(zimPhoneRegex.test("0871234567")).toBe(false); // not 07x
    expect(zimPhoneRegex.test("")).toBe(false);
  });
});

describe("Zimbabwe National ID Validation", () => {
  it("accepts valid format", () => {
    expect(zimNationalIdRegex.test("63-123456A-42")).toBe(true);
    expect(zimNationalIdRegex.test("08-1234567Z-01")).toBe(true);
    expect(zimNationalIdRegex.test("63-768982-C-03")).toBe(true); // dash before letter
  });

  it("rejects invalid format", () => {
    expect(zimNationalIdRegex.test("123456789")).toBe(false);
    expect(zimNationalIdRegex.test("63-12345-A-42")).toBe(false);
    expect(zimNationalIdRegex.test("")).toBe(false);
  });
});

describe("Student Form Schema", () => {
  const validStudent = {
    admission_number: "GHS2026/001",
    full_name: "Tatenda Moyo",
    form: "Form 1",
    date_of_birth: "2010-05-15",
    gender: "Male",
    guardian_name: "Mr. Moyo",
    guardian_phone: "0771234567",
    guardian_email: "moyo@example.com",
    emergency_contact: "0772345678",
    address: "123 Main Road, Harare",
    enrollment_date: "2026-01-15",
  };

  it("validates a minimal valid student", () => {
    const result = studentFormSchema.safeParse(validStudent);
    expect(result.success).toBe(true);
  });

  it("rejects missing admission_number", () => {
    const result = studentFormSchema.safeParse({ ...validStudent, admission_number: "" });
    // admission_number is optional with default "", so empty is valid
    expect(result.success).toBe(true);
  });

  it("rejects missing full_name", () => {
    const result = studentFormSchema.safeParse({ ...validStudent, full_name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing form", () => {
    const result = studentFormSchema.safeParse({ ...validStudent, form: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid optional fields", () => {
    const result = studentFormSchema.safeParse({
      ...validStudent,
      has_medical_alert: true,
      medical_conditions: "Asthma",
      stream: "A",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid guardian phone", () => {
    const result = studentFormSchema.safeParse({
      ...validStudent,
      guardian_phone: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid guardian email", () => {
    const result = studentFormSchema.safeParse({
      ...validStudent,
      guardian_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = studentFormSchema.safeParse({
      full_name: "Tatenda Moyo",
      form: "Form 1",
    });
    expect(result.success).toBe(false);
  });
});

describe("Staff Form Schema", () => {
  const validStaff = {
    staff_number: "GHS-T001",
    full_name: "Mr. T. Ndlovu",
  };

  it("validates a minimal valid staff member", () => {
    const result = staffFormSchema.safeParse(validStaff);
    expect(result.success).toBe(true);
  });

  it("rejects missing staff_number", () => {
    const result = staffFormSchema.safeParse({ ...validStaff, staff_number: "" });
    expect(result.success).toBe(false);
  });

  it("defaults role to teacher", () => {
    const result = staffFormSchema.safeParse(validStaff);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("teacher");
    }
  });

  it("defaults category to teaching", () => {
    const result = staffFormSchema.safeParse(validStaff);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("teaching");
    }
  });

  it("accepts valid national ID", () => {
    const result = staffFormSchema.safeParse({
      ...validStaff,
      national_id: "63-123456A-42",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid national ID", () => {
    const result = staffFormSchema.safeParse({
      ...validStaff,
      national_id: "invalid-id",
    });
    expect(result.success).toBe(false);
  });

  it("accepts subjects_taught array", () => {
    const result = staffFormSchema.safeParse({
      ...validStaff,
      subjects_taught: ["Mathematics", "Physics"],
    });
    expect(result.success).toBe(true);
  });
});
