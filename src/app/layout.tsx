import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shreedhar Sales — Billing",
  description: "Professional billing and quotation management for Shreedhar Sales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              borderRadius: "10px",
              fontSize: "13px",
              border: "1px solid #E0E7FF",
              boxShadow: "0 8px 24px rgba(79,70,229,0.12)",
              letterSpacing: "-0.01em",
            },
          }}
        />
      </body>
    </html>
  );
}
