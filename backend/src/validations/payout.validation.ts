import { z } from "zod";

export const createPayoutSchema = z.object({
  vendor_id: z.string({ required_error: "Vendor is required" }).min(1, "Vendor is required"),
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  mode: z.enum(["UPI", "IMPS", "NEFT"], { required_error: "Payment mode is required" }),
  note: z.string().max(500, "Note must be under 500 characters").optional(),
});

export const rejectPayoutSchema = z.object({
  reason: z
    .string({ required_error: "Rejection reason is required" })
    .min(5, "Please provide a more detailed reason"),
});
