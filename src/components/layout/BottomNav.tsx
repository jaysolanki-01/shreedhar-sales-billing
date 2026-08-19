"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Receipt, Users } from "lucide-react";

const tabs = [
  { label: "Home",       href: "/dashboard",  icon: LayoutDashboard },
  { label: "Quotes",     href: "/quotations",  icon: FileText },
  { label: "Invoices",   href: "/invoices",    icon: Receipt },
  { label: "Customers",  href: "/customers",   icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
      style={{ background: "#FFFFFF", borderTop: "1px solid #E5E7EB" }}
    >
      {tabs.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              paddingTop: 10,
              paddingBottom: 12,
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? "#4F46E5" : "#9CA3AF",
              textDecoration: "none",
            }}
          >
            <Icon style={{ width: 20, height: 20 }} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
