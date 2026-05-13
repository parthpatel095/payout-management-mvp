export type UserRole = "OPS" | "FINANCE";
export type PayoutStatus = "Draft" | "Submitted" | "Approved" | "Rejected";
export type PayoutMode = "UPI" | "IMPS" | "NEFT";
export type AuditAction = "CREATED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Vendor {
  _id: string;
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  _id: string;
  vendor_id: Vendor;
  amount: number;
  mode: PayoutMode;
  note?: string;
  status: PayoutStatus;
  decision_reason?: string;
  created_by: User;
  submitted_by?: User;
  approved_by?: User;
  rejected_by?: User;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  _id: string;
  payout_id: string;
  action: AuditAction;
  performed_by: { _id: string; email: string; name: string };
  role: string;
  note?: string;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}
