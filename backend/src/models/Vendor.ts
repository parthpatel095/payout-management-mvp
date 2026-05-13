import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  is_active: boolean;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    upi_id: {
      type: String,
      trim: true,
    },
    bank_account: {
      type: String,
      trim: true,
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model<IVendor>("Vendor", vendorSchema);
