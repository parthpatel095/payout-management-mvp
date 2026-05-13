import api from "@/lib/api";
import { ApiResponse, Vendor } from "@/types";

export async function fetchVendors() {
  const res = await api.get<ApiResponse<Vendor[]>>("/vendors");
  return res.data.data || [];
}

export async function createVendorApi(data: {
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
}) {
  const res = await api.post<ApiResponse<Vendor>>("/vendors", data);
  return res.data;
}
