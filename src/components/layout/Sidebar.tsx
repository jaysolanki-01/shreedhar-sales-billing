"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Receipt, Users,
  CreditCard, BarChart2, Settings, X,
} from "lucide-react";
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

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const content = (
    <div className="flex flex-col h-full bg-white" style={{ borderRight: "1px solid #E0E7FF" }}>

      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden"
              style={{ width: 40, height: 40, background: "#EEF2FF", border: "1px solid #C7D2FE" }}
            >
              <img
                src="/logo.png"
                alt="Shreedhar Sales"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  const p = t.parentElement;
                  if (p) p.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;height:100%;font-weight:700;font-size:14px;color:#4F46E5;">SS</span>';
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1E1B4B", lineHeight: 1.2 }}>Shreedhar</p>
              <p style={{ fontSize: 10.5, fontWeight: 500, color: "#818CF8", letterSpacing: "0.04em", lineHeight: 1.3 }}>Sales & Co.</p>
            </div>
          </div>
          {onMobileClose && (
            <button onClick={onMobileClose} style={{ color: "#9CA3AF" }} className="lg:hidden hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#EEF2FF", margin: "0 16px 4px" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150")}
              style={{
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                background: active ? "#EEF2FF" : "transparent",
                color: active ? "#4F46E5" : "#6B7280",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F5F3FF"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon
                style={{
                  width: 15, height: 15, flexShrink: 0,
                  color: active ? "#4F46E5" : "#9CA3AF",
                }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="pb-4" />
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
          <aside className="absolute left-0 top-0 h-full w-56 flex flex-col shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
