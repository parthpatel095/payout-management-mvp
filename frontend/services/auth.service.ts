import api from "@/lib/api";
import { ApiResponse, User } from "@/types";

export async function loginApi(email: string, password: string) {
  const res = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/login", { email, password });
  return res.data;
}
