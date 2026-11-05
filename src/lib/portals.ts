// The portals a visitor can choose when signing in. Staff accounts of every other kind (principal, deputy,
// finance, bursar, registration, ...) sign in through "Administration" with their own credentials, so they
// are deliberately not listed as separate portals.
export type PortalKey = "student" | "parent" | "teacher" | "admin";

export const PORTALS: { key: PortalKey; label: string; roles: string[] }[] = [
  { key: "student", label: "Student", roles: ["student"] },
  { key: "parent", label: "Parent", roles: ["parent"] },
  { key: "teacher", label: "Teacher", roles: ["teacher", "hod"] },
  {
    key: "admin",
    label: "Administration",
    roles: ["admin", "principal", "deputy_principal", "hod", "admin_supervisor", "registration", "finance", "finance_clerk", "bursar"],
  },
];

export const isPortalKey = (v: string | null): v is PortalKey => PORTALS.some((p) => p.key === v);
