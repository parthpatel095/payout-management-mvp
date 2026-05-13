"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/helpers";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/vendors", label: "Vendors", icon: "🏢" },
  { href: "/payouts", label: "Payouts", icon: "💸" },
];

const opsOnly = [
  { href: "/vendors/create", label: "Add Vendor", icon: "➕" },
  { href: "/payouts/create", label: "Create Payout", icon: "📝" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const logout = () => {
    clearAuth();
    if (typeof document !== "undefined") {
      document.cookie = "payout_token=; path=/; max-age=0";
    }
    router.push("/login");
  };

  const allItems = user?.role === "OPS" ? [...navItems, ...opsOnly] : navItems;

  return (
    <aside className="w-56 bg-slate-900 flex flex-col h-screen flex-shrink-0">
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="text-base font-semibold text-white">PayoutOS</div>
        <div className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">
          Payout Management
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <p className="px-2 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Navigation
        </p>
        {allItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.email}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-1 flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <span>⎋</span> Logout
        </button>
      </div>
    </aside>
  );
}
