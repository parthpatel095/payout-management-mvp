import mongoose, { Schema, Document, Types } from "mongoose";

export type AuditAction = "CREATED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface IAudit extends Document {
  payout_id: Types.ObjectId;
  action: AuditAction;
  performed_by: Types.ObjectId;
  role: string;
  note?: string;
  timestamp: Date;
}

const auditSchema = new Schema<IAudit>(
  {
    payout_id: {
      type: Schema.Types.ObjectId,
      ref: "Payout",
      required: true,
    },
    action: {
      type: String,
      enum: ["CREATED", "SUBMITTED", "APPROVED", "REJECTED"],
      required: true,
    },
    performed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    note: String,
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: true }
);

auditSchema.index({ payout_id: 1 });
auditSchema.index({ timestamp: -1 });

export const Audit = mongoose.model<IAudit>("Audit", auditSchema);
