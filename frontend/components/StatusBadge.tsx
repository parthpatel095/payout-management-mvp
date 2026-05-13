import { PayoutStatus } from "@/types";
import { cn } from "@/utils/helpers";

const styles: Record<PayoutStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
