"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { createPayoutApi } from "@/services/payout.service";
import { fetchVendors } from "@/services/vendor.service";
import { Vendor } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { getAxiosError } from "@/utils/helpers";

const schema = z.object({
  vendor_id: z.string().min(1, "Please select a vendor"),
  amount: z.coerce.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be greater than 0"),
  mode: z.enum(["UPI", "IMPS", "NEFT"], { required_error: "Please select a payment mode" }),
  note: z.string().max(500, "Note must be under 500 characters").optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreatePayoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetchVendors().then((vs) => setVendors(vs.filter((v) => v.is_active)));
  }, []);

  if (user?.role !== "OPS") {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          Access denied. Only OPS users can create payout drafts.
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const noteValue = watch("note") || "";

  const onSubmit = async (data: FormData) => {
    try {
      await createPayoutApi(data);
      toast.success("Payout draft created");
      router.push("/payouts");
    } catch (err) {
      toast.error(getAxiosError(err));
    }
  };

  return (
    <div className="p-6">
      <Link href="/payouts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5">
        ← Back to Payouts
      </Link>

      <div className="max-w-xl">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">Create Payout Draft</h1>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="form-label">Vendor *</label>
              <select
                className={`form-input ${errors.vendor_id ? "form-input-error" : ""}`}
                {...register("vendor_id")}
              >
                <option value="">Select a vendor...</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {errors.vendor_id && <p className="error-msg">{errors.vendor_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 25000"
                  className={`form-input ${errors.amount ? "form-input-error" : ""}`}
                  {...register("amount")}
                />
                {errors.amount && <p className="error-msg">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="form-label">Payment Mode *</label>
                <select
                  className={`form-input ${errors.mode ? "form-input-error" : ""}`}
                  {...register("mode")}
                >
                  <option value="">Select mode...</option>
                  <option>UPI</option>
                  <option>IMPS</option>
                  <option>NEFT</option>
                </select>
                {errors.mode && <p className="error-msg">{errors.mode.message}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label">
                Note{" "}
                <span className="text-slate-400 font-normal">(optional, max 500 chars)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Add a note for this payout..."
                className="form-input resize-none"
                {...register("note")}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{noteValue.length}/500</p>
              {errors.note && <p className="error-msg">{errors.note.message}</p>}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Link href="/payouts" className="btn-outline">Cancel</Link>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving Draft..." : "Save as Draft"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
