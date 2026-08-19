import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shreedhar Sales — Billing",
  description: "Professional billing and quotation management for Shreedhar Sales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="h-full antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "10px",
              fontSize: "13px",
              border: "1px solid #E0E7FF",
              boxShadow: "0 8px 24px rgba(79,70,229,0.12)",
            },
          }}
        />
      </body>
    </html>
  );
}
