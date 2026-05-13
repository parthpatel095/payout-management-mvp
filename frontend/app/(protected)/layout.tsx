"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { useAuthStore, initAuthFromStorage } from "@/store/authStore";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    initAuthFromStorage();
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
