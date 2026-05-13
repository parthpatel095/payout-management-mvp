"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPayouts } from "@/services/payout.service";
import { Payout } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatAmount } from "@/utils/helpers";

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color || "text-slate-900"}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts()
      .then(setPayouts)
      .finally(() => setLoading(false));
  }, []);

  const draft = payouts.filter((p) => p.status === "Draft").length;
  const submitted = payouts.filter((p) => p.status === "Submitted").length;
  const approved = payouts.filter((p) => p.status === "Approved").length;
  const rejected = payouts.filter((p) => p.status === "Rejected").length;
  const totalApproved = payouts.filter((p) => p.status === "Approved").reduce((s, p) => s + p.amount, 0);
  const recent = payouts.slice(0, 6);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of payout activity</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Payouts" value={payouts.length} />
            <StatCard label="Pending Review" value={submitted} color="text-blue-600" />
            <StatCard label="Approved" value={approved} color="text-green-600" />
            <StatCard label="Rejected" value={rejected} color="text-red-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">Recent Payouts</h2>
                <Link href="/payouts" className="text-xs text-blue-600 hover:underline">
                  View all →
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No payouts yet</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-th">Vendor</th>
                      <th className="table-th">Amount</th>
                      <th className="table-th">Mode</th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="table-td font-medium">
                          <Link href={`/payouts/${p._id}`} className="hover:text-blue-600">
                            {p.vendor_id?.name || "—"}
                          </Link>
                        </td>
                        <td className="table-td">{formatAmount(p.amount)}</td>
                        <td className="table-td">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {p.mode}
                          </span>
                        </td>
                        <td className="table-td">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="table-td text-slate-500">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: "Draft", count: draft, color: "bg-slate-400" },
                  { label: "Submitted", count: submitted, color: "bg-blue-500" },
                  { label: "Approved", count: approved, color: "bg-green-500" },
                  { label: "Rejected", count: rejected, color: "bg-red-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                    <span className="text-sm text-slate-600 flex-1">{label}</span>
                    <span className="text-sm font-semibold">{count}</span>
                    <span className="text-xs text-slate-400 w-8 text-right">
                      {payouts.length ? Math.round((count / payouts.length) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Total Approved Value</p>
                <p className="text-xl font-bold text-green-600 mt-1">{formatAmount(totalApproved)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
