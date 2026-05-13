import { z } from "zod";

export const createVendorSchema = z.object({
  name: z
    .string({ required_error: "Vendor name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),
  upi_id: z
    .string()
    .regex(/^[\w.\-]+@[\w]+$/, "Invalid UPI format (e.g. name@bank)")
    .optional()
    .or(z.literal("")),
  bank_account: z.string().optional().or(z.literal("")),
  ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format (e.g. HDFC0001234)")
    .optional()
    .or(z.literal("")),
});
