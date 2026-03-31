import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["agent", "qip", "dlaa", "dna", "super_admin"]),
  function: z.string().optional(),
  phone: z.string().optional(),
  countryId: z.string().uuid().optional(),
  airportId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const submitLicenseSchema = z.object({
  documents: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(["medical", "english", "skills"]),
    fileUrl: z.string().url(),
    expiryDate: z.string().optional(),
  })),
});

export const validateLicenseSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  comment: z.string().optional(),
});
