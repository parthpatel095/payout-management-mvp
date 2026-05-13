"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  fetchPayoutById,
  submitPayoutApi,
  approvePayoutApi,
  rejectPayoutApi,
} from "@/services/payout.service";
import { Payout, AuditEntry } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import { formatAmount, formatDate, formatDateTime, getAxiosError } from "@/utils/helpers";

function RejectModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) { setErr("Rejection reason is required"); return; }
    if (reason.trim().length < 5) { setErr("Please provide a more detailed reason"); return; }
    setLoading(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-slate-900">Reject Payout</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Provide a reason for rejection. This will be recorded in the audit trail.
        </p>

        <label className="form-label">Rejection Reason *</label>
        <textarea
          rows={4}
          placeholder="e.g. Duplicate request, incorrect amount..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setErr(""); }}
          className={`form-input resize-none ${err ? "form-input-error" : ""}`}
        />
        {err && <p className="error-msg">{err}</p>}

        <div className="flex items-center gap-2 justify-end mt-4">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-danger">
            {loading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

const auditDotColor: Record<string, string> = {
  CREATED: "bg-slate-400",
  SUBMITTED: "bg-blue-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
};

function DetailField({ label, value, danger }: { label: string; value: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${danger ? "bg-red-50" : "bg-slate-50"}`}>
      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${danger ? "text-red-500" : "text-slate-500"}`}>
        {label}
      </p>
      <div className={`text-sm font-medium ${danger ? "text-red-800" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

export default function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [payout, setPayout] = useState<Payout | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const load = () => {
    fetchPayoutById(id)
      .then(({ payout, audits }) => {
        setPayout(payout);
        setAudits(audits);
      })
      .catch(() => toast.error("Failed to load payout"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    setActionLoading("submit");
    try {
      await submitPayoutApi(id);
      toast.success("Payout submitted for approval");
      load();
    } catch (err) {
      toast.error(getAxiosError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      await approvePayoutApi(id);
      toast.success("Payout approved");
      load();
    } catch (err) {
      toast.error(getAxiosError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectPayoutApi(id, reason);
      toast.success("Payout rejected");
      setShowRejectModal(false);
      load();
    } catch (err) {
      toast.error(getAxiosError(err));
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading payout details...</div>;
  }

  if (!payout) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          Payout not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showRejectModal && (
        <RejectModal onClose={() => setShowRejectModal(false)} onConfirm={handleReject} />
      )}

      <div className="flex items-center justify-between mb-5">
        <Link
          href="/payouts"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to Payouts
        </Link>

        <div className="flex items-center gap-2">
          {user?.role === "OPS" && payout.status === "Draft" && (
            <button
              onClick={handleSubmit}
              disabled={actionLoading === "submit"}
              className="btn-primary"
            >
              {actionLoading === "submit" ? "Submitting..." : "Submit Payout"}
            </button>
          )}
          {user?.role === "FINANCE" && payout.status === "Submitted" && (
            <>
              <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="btn-success"
              >
                {actionLoading === "approve" ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={!!actionLoading}
                className="btn-danger"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          {/* Payout Info */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Payout Details</h2>
              <StatusBadge status={payout.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <DetailField label="Vendor" value={payout.vendor_id?.name || "—"} />
              <DetailField
                label="Amount"
                value={<span className="text-lg">{formatAmount(payout.amount)}</span>}
              />
              <DetailField label="Payment Mode" value={payout.mode} />
              <DetailField label="Status" value={payout.status} />
              {payout.note && (
                <div className="col-span-2">
                  <DetailField label="Note" value={payout.note} />
                </div>
              )}
              {payout.decision_reason && (
                <div className="col-span-2">
                  <DetailField label="Rejection Reason" value={payout.decision_reason} danger />
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Timeline
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Created by</p>
                  <p className="font-medium">{payout.created_by?.email || "—"}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(payout.createdAt)}</p>
                </div>
                {payout.submitted_by && (
                  <div>
                    <p className="text-xs text-slate-500">Submitted by</p>
                    <p className="font-medium">{payout.submitted_by?.email || "—"}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(payout.submitted_at)}</p>
                  </div>
                )}
                {payout.approved_by && (
                  <div>
                    <p className="text-xs text-slate-500">Approved by</p>
                    <p className="font-medium">{payout.approved_by?.email || "—"}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(payout.approved_at)}</p>
                  </div>
                )}
                {payout.rejected_by && (
                  <div>
                    <p className="text-xs text-slate-500">Rejected by</p>
                    <p className="font-medium">{payout.rejected_by?.email || "—"}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(payout.rejected_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          {payout.vendor_id && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Vendor Information</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Name", payout.vendor_id.name],
                  ["UPI ID", payout.vendor_id.upi_id || "—"],
                  ["Bank Account", payout.vendor_id.bank_account || "—"],
                  ["IFSC", payout.vendor_id.ifsc || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-medium font-mono text-xs mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Trail */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Audit Trail</h2>
          {audits.length === 0 ? (
            <p className="text-sm text-slate-400">No audit records found</p>
          ) : (
            <div className="space-y-0">
              {audits.map((entry, i) => (
                <div
                  key={entry._id}
                  className={`flex gap-3 pb-4 ${i < audits.length - 1 ? "border-b border-slate-100 mb-4" : ""}`}
                >
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${auditDotColor[entry.action] || "bg-slate-400"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{entry.action}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          entry.role === "OPS"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {entry.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {entry.performed_by?.email || "—"}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 mt-1.5">
                        {entry.note}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
