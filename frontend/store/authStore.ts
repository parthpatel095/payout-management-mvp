import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("payout_token", token);
      localStorage.setItem("payout_user", JSON.stringify(user));
    }
    set({ user, token });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("payout_token");
      localStorage.removeItem("payout_user");
    }
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));

export function initAuthFromStorage() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("payout_token");
  const userRaw = localStorage.getItem("payout_user");
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      useAuthStore.getState().setAuth(user, token);
    } catch {
      localStorage.clear();
    }
  }
}
