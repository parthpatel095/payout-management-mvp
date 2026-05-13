"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchVendors } from "@/services/vendor.service";
import { Vendor } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/helpers";

export default function VendorsPage() {
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendors()
      .then(setVendors)
      .catch(() => setError("Failed to load vendors"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Vendors</h1>
          <p className="text-sm text-slate-500 mt-0.5">{vendors.length} registered vendors</p>
        </div>
        {user?.role === "OPS" && (
          <Link href="/vendors/create" className="btn-primary">
            + Add Vendor
          </Link>
        )}
      </div>

      {loading && <div className="text-slate-500 text-sm">Loading vendors...</div>}
      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-4 py-3">{error}</div>}

      {!loading && !error && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Vendor Name</th>
                <th className="table-th">UPI ID</th>
                <th className="table-th">Bank Account</th>
                <th className="table-th">IFSC</th>
                <th className="table-th">Status</th>
                <th className="table-th">Created</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No vendors found. {user?.role === "OPS" && <Link href="/vendors/create" className="text-blue-600 hover:underline">Add one →</Link>}
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{v.name}</td>
                    <td className="table-td text-slate-500 text-xs">{v.upi_id || "—"}</td>
                    <td className="table-td text-slate-500 text-xs">{v.bank_account || "—"}</td>
                    <td className="table-td font-mono text-xs">{v.ifsc || "—"}</td>
                    <td className="table-td">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${v.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {v.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="table-td text-slate-500">{formatDate(v.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
