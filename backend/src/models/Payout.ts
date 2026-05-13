import mongoose, { Schema, Document, Types } from "mongoose";

export type PayoutStatus = "Draft" | "Submitted" | "Approved" | "Rejected";
export type PayoutMode = "UPI" | "IMPS" | "NEFT";

export interface IPayout extends Document {
  vendor_id: Types.ObjectId;
  amount: number;
  mode: PayoutMode;
  note?: string;
  status: PayoutStatus;
  decision_reason?: string;
  created_by: Types.ObjectId;
  submitted_by?: Types.ObjectId;
  approved_by?: Types.ObjectId;
  rejected_by?: Types.ObjectId;
  submitted_at?: Date;
  approved_at?: Date;
  rejected_at?: Date;
}

const payoutSchema = new Schema<IPayout>(
  {
    vendor_id: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    mode: {
      type: String,
      enum: ["UPI", "IMPS", "NEFT"],
      required: true,
    },
    note: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected"],
      default: "Draft",
    },
    decision_reason: String,
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submitted_by: { type: Schema.Types.ObjectId, ref: "User" },
    approved_by: { type: Schema.Types.ObjectId, ref: "User" },
    rejected_by: { type: Schema.Types.ObjectId, ref: "User" },
    submitted_at: Date,
    approved_at: Date,
    rejected_at: Date,
  },
  { timestamps: true }
);

payoutSchema.index({ status: 1 });
payoutSchema.index({ vendor_id: 1 });
payoutSchema.index({ createdAt: -1 });

export const Payout = mongoose.model<IPayout>("Payout", payoutSchema);
