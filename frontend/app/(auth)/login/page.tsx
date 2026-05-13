"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { loginApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getAxiosError } from "@/utils/helpers";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await loginApi(data.email, data.password);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        if (typeof document !== "undefined") {
          document.cookie = `payout_token=${res.data.token}; path=/; max-age=${7 * 24 * 3600}`;
        }
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(getAxiosError(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">PayoutOS</h1>
          <p className="text-slate-400 text-sm mt-1">Internal Payout Management System</p>
        </div>

        <div className="bg-white rounded-xl p-7 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="form-label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? "form-input-error" : ""}`}
                {...register("email")}
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div className="mb-5">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••"
                className={`form-input ${errors.password ? "form-input-error" : ""}`}
                {...register("password")}
              />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 p-3 bg-slate-50 rounded-md text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700 mb-1">Demo credentials</p>
            <p>OPS: ops@demo.com / ops123</p>
            <p>Finance: finance@demo.com / fin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
