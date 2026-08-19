"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Receipt, Users,
  CreditCard, BarChart2, Settings, X, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Quotations", href: "/quotations",  icon: FileText },
  { label: "Invoices",   href: "/invoices",    icon: Receipt },
  { label: "Customers",  href: "/customers",   icon: Users },
  { label: "Payments",   href: "/payments",    icon: CreditCard },
  { label: "Reports",    href: "/reports",     icon: BarChart2 },
  { label: "Settings",   href: "/settings",    icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const content = (
    <div className="flex flex-col h-full" style={{ background: "#FFFFFF", borderRight: "1px solid #E5E9F5" }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden"
              style={{ width: 38, height: 38, background: "#EEF2FF", border: "1px solid #C7D2FE" }}
            >
              <img
                src="/logo.png"
                alt="Shreedhar Sales"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  const p = t.parentElement;
                  if (p) p.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;height:100%;font-weight:700;font-size:13px;color:#4F46E5;letter-spacing:-0.02em;">SS</span>';
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1740", lineHeight: 1.2, letterSpacing: "-0.02em" }}>Shreedhar</p>
              <p style={{ fontSize: 10, fontWeight: 500, color: "#818CF8", letterSpacing: "0.06em", lineHeight: 1.4, textTransform: "uppercase" }}>Sales & Co.</p>
            </div>
          </div>
          {onMobileClose && (
            <button onClick={onMobileClose} style={{ color: "#9CA3AF" }} className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F0F2FA", margin: "0 16px 6px" }} />

      {/* Nav label */}
      <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 20px 8px" }}>Menu</p>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150")}
              style={{
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                letterSpacing: active ? "-0.01em" : "0",
                background: active ? "#EEF2FF" : "transparent",
                color: active ? "#4338CA" : "#6B7280",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F7F8FD"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: active ? "#DBEAFE" : "transparent",
              }}>
                <Icon style={{ width: 14, height: 14, color: active ? "#4338CA" : "#9CA3AF" }} />
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <div style={{ height: 1, background: "#F0F2FA", marginBottom: 8 }} />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-red-50 group"
          style={{ fontSize: 13, fontWeight: 500, color: "#9CA3AF" }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LogOut style={{ width: 14, height: 14 }} className="group-hover:text-red-500" />
          </div>
          <span className="group-hover:text-red-500">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col h-screen sticky top-0">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-56 flex flex-col shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
