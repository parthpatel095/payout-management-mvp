import api from "@/lib/api";
import { ApiResponse, AuditEntry, Payout } from "@/types";

export async function fetchPayouts(params?: { status?: string; vendor?: string }) {
  const res = await api.get<ApiResponse<Payout[]>>("/payouts", { params });
  return res.data.data || [];
}

export async function fetchPayoutById(id: string) {
  const res = await api.get<ApiResponse<{ payout: Payout; audits: AuditEntry[] }>>(`/payouts/${id}`);
  return res.data.data!;
}

export async function createPayoutApi(data: {
  vendor_id: string;
  amount: number;
  mode: string;
  note?: string;
}) {
  const res = await api.post<ApiResponse<Payout>>("/payouts", data);
  return res.data;
}

export async function submitPayoutApi(id: string) {
  const res = await api.post<ApiResponse<Payout>>(`/payouts/${id}/submit`);
  return res.data;
}

export async function approvePayoutApi(id: string) {
  const res = await api.post<ApiResponse<Payout>>(`/payouts/${id}/approve`);
  return res.data;
}

export async function rejectPayoutApi(id: string, reason: string) {
  const res = await api.post<ApiResponse<Payout>>(`/payouts/${id}/reject`, { reason });
  return res.data;
}
