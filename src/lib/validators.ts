import { z } from "zod";

// South African phone: +27XXXXXXXXX or 0XXXXXXXXX (10 digits starting with 0)
export const saPhoneRegex = /^(\+?27|0)[6-8][0-9]{8}$/;
export const saPhoneSchemaRequired = z.string().regex(saPhoneRegex, "Invalid South African phone number (0XXXXXXXXX or +27XXXXXXXXX)");
export const saPhoneSchema = saPhoneSchemaRequired.or(z.literal(""));

// Back-compat aliases (legacy imports named zimPhone*)
export const zimPhoneRegex = saPhoneRegex;
export const zimPhoneSchemaRequired = saPhoneSchemaRequired;
export const zimPhoneSchema = saPhoneSchema;

// South African ID: 13-digit numeric with Luhn checksum
export const saIdRegex = /^\d{13}$/;

function luhnValidSaId(id: string): boolean {
  if (!saIdRegex.test(id)) return false;
  // South African ID uses a modified Luhn on 13 digits
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = parseInt(id[i], 10);
    if ((i + 1) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export const saIdSchema = z
  .string()
  .refine((v) => v === "" || luhnValidSaId(v), "Invalid South African ID number (13 digits, Luhn checksum)")
  .or(z.literal(""));

// Back-compat alias
export const zimNationalIdRegex = saIdRegex;
export const zimNationalIdSchema = saIdSchema;

// App is scoped to KwaZulu-Natal and Gauteng only.
export const SA_PROVINCES = ["KwaZulu-Natal", "Gauteng"] as const;

export const SA_CITIES_BY_PROVINCE: Record<(typeof SA_PROVINCES)[number], string[]> = {
  "KwaZulu-Natal": [
    "Durban",
    "Pietermaritzburg",
    "Richards Bay",
    "Empangeni",
    "Mandeni",
    "Stanger (KwaDukuza)",
    "Newcastle",
    "Ladysmith",
    "Umhlanga",
    "Pinetown",
  ],
  Gauteng: [
    "Johannesburg",
    "Pretoria",
    "Soweto",
    "Sandton",
    "Centurion",
    "Midrand",
    "Benoni",
    "Kempton Park",
  ],
};

export const SA_CITIES = Object.values(SA_CITIES_BY_PROVINCE).flat();

export const studentFormSchema = z.object({
  admission_number: z.string().optional().default(""),
  full_name: z.string().min(2, "Full name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  form: z.string().min(1, "Grade is required"),
  stream: z.string().optional(),
  subject_combination: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  guardian_name: z.string().min(2, "Guardian name is required"),
  guardian_phone: saPhoneSchemaRequired,
  guardian_email: z.string().email("Invalid email").min(1, "Guardian email is required"),
  emergency_contact: saPhoneSchemaRequired,
  medical_conditions: z.string().optional(),
  has_medical_alert: z.boolean().default(false),
  address: z.string().min(5, "Address is required"),
  province: z.string().optional(),
  enrollment_date: z.string().min(1, "Enrollment date is required"),
  status: z.string().default("active"),
  sports_activities: z.array(z.string()).optional().default([]),
  boarding_status: z.string().default("day"),
});

export const staffFormSchema = z.object({
  staff_number: z.string().optional(),
  full_name: z.string().min(2, "Full name is required"),
  role: z.string().default("teacher"),
  department: z.string().optional(),
  subjects_taught: z.array(z.string()).optional(),
  phone: saPhoneSchema.optional().or(z.literal("")),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  address: z.string().optional(),
  emergency_contact: saPhoneSchema.optional().or(z.literal("")),
  employment_date: z.string().optional(),
  qualifications: z.string().optional(),
  sars_number: z.string().optional(),      // SARS tax number (was PAYE)
  uif_number: z.string().optional(),       // UIF number (was NSSA)
  bank_details: z.string().optional(),
  national_id: saIdSchema.optional().or(z.literal("")),
  status: z.string().default("active"),
  category: z.string().default("teaching"),
  title: z.string().optional(),
  bio: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
export type StaffFormData = z.infer<typeof staffFormSchema>;
