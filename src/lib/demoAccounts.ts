/** Sign-in details shared by the demo seeder, the login page and the credentials workbook. */
export const DEMO_EMAIL_DOMAIN = "schooldemo.com";
/**
 * Demo passwords. They must not be common passwords: Supabase's leaked-password
 * protection rejects ones like "Student@2025". Keep in step with DEMO_ADMIN and
 * STAFF_ROLES in supabase/functions/seed-demo-accounts.
 */
export const DEMO_PASSWORDS = {
  admin: "MbsDemo#Admin26",
  teacher: "MbsDemo#Teacher26",
  student: "MbsDemo#Student26",
  parent: "MbsDemo#Parent26",
  staff: "MbsDemo#Staff26",
} as const;

/** School leaders and office staff who sign in through the "Administration" portal. */
export type DemoStaffRole =
  | "principal" | "deputy_principal" | "hod" | "finance" | "bursar" | "finance_clerk" | "registration" | "admin_supervisor";

export interface DemoStaffAccount {
  role: DemoStaffRole;
  email: string;
  fullName: string;
  /** Shown in the credentials workbook. */
  title: string;
  department: string;
  /** The staff record's category on the public Staff page (teaching staff are seeded separately). */
  category: "leadership" | "admin";
  /** Where this account lands after signing in. */
  portal: string;
}

/** One demo login for every staff portal, so each dashboard can be shown. */
export const DEMO_STAFF_ACCOUNTS: DemoStaffAccount[] = [
  { role: "principal",        email: `principal@${DEMO_EMAIL_DOMAIN}`,    fullName: "Mr. Tendai Mutasa",   title: "Principal",            department: "Management",     category: "leadership",     portal: "/portal/principal" },
  { role: "deputy_principal", email: `deputy@${DEMO_EMAIL_DOMAIN}`,       fullName: "Mrs. Rudo Chirwa",    title: "Deputy Principal",     department: "Management",     category: "leadership",     portal: "/portal/deputy-principal" },
  { role: "hod",              email: `hod@${DEMO_EMAIL_DOMAIN}`,          fullName: "Mr. Farai Gumbo",     title: "Head of Department",   department: "Sciences",       category: "leadership",     portal: "/portal/hod" },
  { role: "finance",          email: `finance@${DEMO_EMAIL_DOMAIN}`,      fullName: "Mrs. Chipo Mapfumo",  title: "Finance Officer",      department: "Finance",        category: "admin",        portal: "/portal/finance" },
  { role: "bursar",           email: `bursar@${DEMO_EMAIL_DOMAIN}`,       fullName: "Mr. Blessing Makoni", title: "Bursar",               department: "Finance",        category: "admin",        portal: "/portal/finance" },
  { role: "finance_clerk",    email: `clerk@${DEMO_EMAIL_DOMAIN}`,        fullName: "Ms. Nyasha Hove",     title: "Finance Clerk",        department: "Finance",        category: "admin",        portal: "/portal/finance" },
  { role: "registration",     email: `registration@${DEMO_EMAIL_DOMAIN}`, fullName: "Mrs. Tsitsi Mhlanga", title: "Registration Officer", department: "Administration", category: "admin", portal: "/portal/registration" },
  { role: "admin_supervisor", email: `supervisor@${DEMO_EMAIL_DOMAIN}`,   fullName: "Mr. Simba Dube",      title: "Admin Supervisor",     department: "Administration", category: "admin", portal: "/portal/admin-supervisor" },
];
