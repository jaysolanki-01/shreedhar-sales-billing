"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Receipt, Users,
  CreditCard, BarChart2, Settings, LogOut, ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Quotations", href: "/quotations",  icon: FileText },
  { label: "Invoices",   href: "/invoices",    icon: Receipt },
  { label: "Customers",  href: "/customers",   icon: Users },
  { label: "Payments",   href: "/payments",    icon: CreditCard },
  { label: "Reports",    href: "/reports",     icon: BarChart2 },
  { label: "Settings",   href: "/settings",    icon: Settings },
  { label: "Admin",      href: "/admin",       icon: ShieldCheck },
];

export function Sidebar() {
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

  return (
    <aside
      className="hidden lg:flex w-52 flex-shrink-0 flex-col h-screen sticky top-0"
      style={{ background: "#FFFFFF", borderRight: "1px solid #E5E7EB" }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
        <img
          src="/logo.png"
          alt="Shreedhar Sales"
          className="flex-shrink-0 object-contain"
          style={{ width: 36, height: 36 }}
        />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.2, letterSpacing: "-0.02em" }}>Shreedhar</p>
          <p style={{ fontSize: 10, fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.04em", lineHeight: 1.4, textTransform: "uppercase" }}>Sales & Co.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                background: active ? "#F3F4F6" : "transparent",
                color: active ? "#111827" : "#6B7280",
                textDecoration: "none",
                transition: "background 0.1s, color 0.1s",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0, color: active ? "#4F46E5" : "#9CA3AF" }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Plywood animation */}
      <div style={{ padding: "4px 14px 14px", overflow: "hidden" }}>
        <style>{`
          @keyframes plySway {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-4px); }
          }
          .ply-sheet-1 { animation: plySway 4s ease-in-out infinite; }
          .ply-sheet-2 { animation: plySway 4s ease-in-out infinite; animation-delay: -1.33s; }
          .ply-sheet-3 { animation: plySway 4s ease-in-out infinite; animation-delay: -2.66s; }
        `}</style>
        <svg
          width="100%"
          viewBox="0 0 176 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ display: "block", opacity: 0.85 }}
        >
          {/* Shadow under stack */}
          <ellipse cx="88" cy="73" rx="68" ry="3.5" fill="#D1B48C" opacity="0.3" />

          {/* Bottom sheet — darkest */}
          <g className="ply-sheet-3" style={{ willChange: "transform" }}>
            <rect x="4" y="52" width="168" height="17" rx="3" fill="#B07848" />
            <path d="M10 55.5 Q50 56.8 88 55.5 Q126 54.2 166 55.5" stroke="#8A5C32" strokeWidth="0.7" strokeOpacity="0.45" fill="none" />
            <path d="M10 59   Q50 60.3 88 59.2 Q126 58   166 59.2" stroke="#8A5C32" strokeWidth="0.55" strokeOpacity="0.35" fill="none" />
            <path d="M10 62.5 Q50 63.5 88 62.8 Q126 61.8 166 62.8" stroke="#8A5C32" strokeWidth="0.45" strokeOpacity="0.28" fill="none" />
          </g>

          {/* Middle sheet */}
          <g className="ply-sheet-2" style={{ willChange: "transform" }}>
            <rect x="10" y="35" width="156" height="17" rx="3" fill="#C8945A" />
            <path d="M16 38.5 Q54 39.8 88 38.5 Q122 37.2 160 38.5" stroke="#9B7040" strokeWidth="0.7" strokeOpacity="0.45" fill="none" />
            <path d="M16 42   Q54 43.3 88 42.2 Q122 41   160 42.2" stroke="#9B7040" strokeWidth="0.55" strokeOpacity="0.35" fill="none" />
            <path d="M16 45.5 Q54 46.5 88 45.8 Q122 44.8 160 45.8" stroke="#9B7040" strokeWidth="0.45" strokeOpacity="0.28" fill="none" />
          </g>

          {/* Top sheet — lightest */}
          <g className="ply-sheet-1" style={{ willChange: "transform" }}>
            <rect x="16" y="18" width="144" height="17" rx="3" fill="#DEB078" />
            {/* Edge highlight */}
            <rect x="16" y="18" width="144" height="2" rx="2" fill="#ECC890" opacity="0.7" />
            <path d="M22 22   Q58 23.3 88 22 Q118 20.8 154 22"   stroke="#B08848" strokeWidth="0.7" strokeOpacity="0.45" fill="none" />
            <path d="M22 25.5 Q58 26.8 88 25.5 Q118 24.3 154 25.5" stroke="#B08848" strokeWidth="0.55" strokeOpacity="0.35" fill="none" />
            <path d="M22 29   Q58 30   88 29.2 Q118 28.2 154 29.2" stroke="#B08848" strokeWidth="0.45" strokeOpacity="0.28" fill="none" />
          </g>
        </svg>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5" style={{ borderTop: "1px solid #E5E7EB" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 10px",
            marginTop: 8,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 400,
            color: "#9CA3AF",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background 0.1s, color 0.1s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
