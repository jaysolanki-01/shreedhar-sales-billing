"use client";

import { Menu } from "lucide-react";
import { useMobileMenu } from "@/lib/mobile-menu-context";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void; // kept for backward compat, context takes priority
}

export function Header({ title, subtitle, actions, onMenuClick }: HeaderProps) {
  const { openMenu } = useMobileMenu();

  return (
    <header
      className="px-4 lg:px-7 h-14 flex items-center justify-between gap-4 sticky top-0 z-10 bg-white"
      style={{ borderBottom: "1px solid #E0E7FF" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick ?? openMenu}
          className="lg:hidden p-2 -ml-1.5 rounded-lg transition-colors flex-shrink-0 active:bg-indigo-50"
          style={{ color: "#9CA3AF" }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "#1E1B4B", lineHeight: 1.3 }} className="truncate">{title}</h1>
          {subtitle && <p style={{ fontSize: 11.5, color: "#818CF8", lineHeight: 1.3, marginTop: 1 }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}
