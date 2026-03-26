import { describe, it, expect } from "vitest";

// Test role-based redirect logic (extracted from Login.tsx)
function getRedirectPath(role: string): string {
  if (role === "student") return "/portal/student";
  if (role === "teacher") return "/portal/teacher";
  if (role === "parent") return "/portal/parent-teacher";
  if (role === "admin") return "/portal/admin";
  if (role === "finance") return "/portal/finance";
  if (role === "finance_clerk") return "/portal/finance";
  if (role === "principal") return "/portal/principal";
  if (role === "deputy_principal") return "/portal/deputy-principal";
  if (role === "hod") return "/portal/hod";
  if (role === "admin_supervisor") return "/portal/admin-supervisor";
  if (role === "registration") return "/portal/registration";
  return "/";
}

describe("Role-Based Redirects", () => {
  it("redirects students correctly", () => {
    expect(getRedirectPath("student")).toBe("/portal/student");
  });

  it("redirects teachers correctly", () => {
    expect(getRedirectPath("teacher")).toBe("/portal/teacher");
  });

  it("redirects parents correctly", () => {
    expect(getRedirectPath("parent")).toBe("/portal/parent-teacher");
  });

  it("redirects admins correctly", () => {
    expect(getRedirectPath("admin")).toBe("/portal/admin");
  });

  it("redirects finance correctly", () => {
    expect(getRedirectPath("finance")).toBe("/portal/finance");
  });

  it("defaults to home for unknown roles", () => {
    expect(getRedirectPath("unknown")).toBe("/");
    expect(getRedirectPath("")).toBe("/");
  });
});

describe("App Role Types", () => {
  const validRoles = ["student", "parent", "teacher", "admin", "finance", "finance_clerk", "principal", "deputy_principal", "hod", "admin_supervisor", "registration"];

  it("all portal roles are accounted for", () => {
    validRoles.forEach((role) => {
      const path = getRedirectPath(role);
      expect(path).toContain("/portal/");
    });
  });
});
