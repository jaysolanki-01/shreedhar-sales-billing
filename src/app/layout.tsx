import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shreedhar Sales — Billing",
  description: "Professional billing and quotation management for Shreedhar Sales",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lexend.variable} h-full`}>
      <body className="h-full antialiased">
        <NextTopLoader color="#4F46E5" height={2} showSpinner={false} />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-lexend), sans-serif",
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
