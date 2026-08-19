"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileMenuContext } from "@/lib/mobile-menu-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ openMenu: () => setMobileOpen(true) }}>
      <div className="flex h-screen overflow-hidden" style={{ background: "#F5F3FF" }}>
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
