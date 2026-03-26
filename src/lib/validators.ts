import { z } from "zod";

// Zimbabwe phone: 07XXXXXXXX or +2637XXXXXXXX
export const zimPhoneRegex = /^(\+263|0)7[0-9]{8}$/;
export const zimPhoneSchemaRequired = z.string().regex(zimPhoneRegex, "Invalid Zimbabwe phone number (07... or +2637...)");
export const zimPhoneSchema = zimPhoneSchemaRequired.or(z.literal(""));

// Zimbabwe National ID: XX-XXXXXXX-X-XX
export const zimNationalIdRegex = /^\d{2}-\d{6,7}-?[A-Z]-\d{2}$/;
export const zimNationalIdSchema = z.string().regex(zimNationalIdRegex, "Invalid National ID format (XX-XXXXXXX-X-XX)").or(z.literal(""));

export const studentFormSchema = z.object({
  admission_number: z.string().optional().default(""),
  full_name: z.string().min(2, "Full name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  form: z.string().min(1, "Form is required"),
  stream: z.string().optional(),
  subject_combination: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  guardian_name: z.string().min(2, "Guardian name is required"),
  guardian_phone: zimPhoneSchemaRequired,
  guardian_email: z.string().email("Invalid email").min(1, "Guardian email is required"),
  emergency_contact: zimPhoneSchemaRequired,
  medical_conditions: z.string().optional(),
  has_medical_alert: z.boolean().default(false),
  address: z.string().min(5, "Address is required"),
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
  phone: zimPhoneSchema.optional().or(z.literal("")),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  address: z.string().optional(),
  emergency_contact: zimPhoneSchema.optional().or(z.literal("")),
  employment_date: z.string().optional(),
  qualifications: z.string().optional(),
  nssa_number: z.string().optional(),
  paye_number: z.string().optional(),
  bank_details: z.string().optional(),
  national_id: zimNationalIdSchema.optional().or(z.literal("")),
  status: z.string().default("active"),
  category: z.string().default("teaching"),
  title: z.string().optional(),
  bio: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
export type StaffFormData = z.infer<typeof staffFormSchema>;
