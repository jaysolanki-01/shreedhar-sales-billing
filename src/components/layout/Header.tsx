"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, actions, onMenuClick }: HeaderProps) {
  return (
    <header
      className="px-5 lg:px-7 h-14 flex items-center justify-between gap-4 sticky top-0 z-10 bg-white"
      style={{ borderBottom: "1px solid #E0E7FF" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 -ml-1 rounded-lg transition-colors flex-shrink-0"
          style={{ color: "#9CA3AF" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EEF2FF"; (e.currentTarget as HTMLElement).style.color = "#4F46E5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
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
