"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPayouts } from "@/services/payout.service";
import { fetchVendors } from "@/services/vendor.service";
import { Payout, Vendor } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import { formatAmount, formatDate } from "@/utils/helpers";

export default function PayoutsPage() {
  const { user } = useAuthStore();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");

  const load = () => {
    const params: { status?: string; vendor?: string } = {};
    if (statusFilter !== "All") params.status = statusFilter;
    if (vendorFilter !== "All") params.vendor = vendorFilter;

    setLoading(true);
    fetchPayouts(params)
      .then(setPayouts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors().then(setVendors);
  }, []);

  useEffect(() => {
    load();
  }, [statusFilter, vendorFilter]);

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Payouts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{payouts.length} results</p>
        </div>
        {user?.role === "OPS" && (
          <Link href="/payouts/create" className="btn-primary">
            + Create Payout
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input w-auto"
        >
          <option value="All">All statuses</option>
          <option>Draft</option>
          <option>Submitted</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>

        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="form-input w-auto"
        >
          <option value="All">All vendors</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>

        {(statusFilter !== "All" || vendorFilter !== "All") && (
          <button
            onClick={() => { setStatusFilter("All"); setVendorFilter("All"); }}
            className="btn-outline btn-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading payouts...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Vendor</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Mode</th>
                <th className="table-th">Status</th>
                <th className="table-th">Created By</th>
                <th className="table-th">Date</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No payouts match your filters
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{p.vendor_id?.name || "—"}</td>
                    <td className="table-td font-semibold">{formatAmount(p.amount)}</td>
                    <td className="table-td">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {p.mode}
                      </span>
                    </td>
                    <td className="table-td"><StatusBadge status={p.status} /></td>
                    <td className="table-td text-slate-500 text-xs">{p.created_by?.email || "—"}</td>
                    <td className="table-td text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="table-td">
                      <Link href={`/payouts/${p._id}`} className="text-blue-600 hover:underline text-xs font-medium">
                        View →
                      </Link>
                    </td>
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
