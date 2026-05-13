"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { createVendorApi } from "@/services/vendor.service";
import { useAuthStore } from "@/store/authStore";
import { getAxiosError } from "@/utils/helpers";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be under 100 characters").trim(),
  upi_id: z.string().regex(/^[\w.\-]+@[\w]+$/, "Invalid UPI format").optional().or(z.literal("")),
  bank_account: z.string().optional(),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format (e.g. HDFC0001234)").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function CreateVendorPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  if (user?.role !== "OPS") {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          Access denied. Only OPS users can add vendors.
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createVendorApi({
        name: data.name,
        upi_id: data.upi_id || undefined,
        bank_account: data.bank_account || undefined,
        ifsc: data.ifsc ? data.ifsc.toUpperCase() : undefined,
      });
      toast.success("Vendor added successfully");
      router.push("/vendors");
    } catch (err) {
      toast.error(getAxiosError(err));
    }
  };

  return (
    <div className="p-6">
      <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5">
        ← Back to Vendors
      </Link>

      <div className="max-w-xl">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">Add New Vendor</h1>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="form-label">Vendor Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className={`form-input ${errors.name ? "form-input-error" : ""}`}
                {...register("name")}
              />
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">UPI ID <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="name@bank"
                  className={`form-input ${errors.upi_id ? "form-input-error" : ""}`}
                  {...register("upi_id")}
                />
                {errors.upi_id && <p className="error-msg">{errors.upi_id.message}</p>}
              </div>
              <div>
                <label className="form-label">Bank Account <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="Account number"
                  className="form-input"
                  {...register("bank_account")}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label">IFSC Code <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="HDFC0001234"
                className={`form-input uppercase ${errors.ifsc ? "form-input-error" : ""}`}
                {...register("ifsc")}
              />
              {errors.ifsc && <p className="error-msg">{errors.ifsc.message}</p>}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Link href="/vendors" className="btn-outline">Cancel</Link>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Vendor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
