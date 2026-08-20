"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Receipt, ChevronRight, Download } from "lucide-react";
import { Invoice, InvoicePaymentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useOwnerId } from "@/lib/use-owner";

const STATUS_FILTERS: { label: string; value: InvoicePaymentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Partial", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
];

export function InvoicesContent() {
  const userId = useOwnerId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoicePaymentStatus | "all">("all");

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("invoices")
      .select("*, customers(name, company_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          import("sonner").then(({ toast }) =>
            toast.error("Could not load invoices — your session may have expired. Please refresh.")
          );
          setLoading(false);
          return;
        }
        setInvoices((data as Invoice[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  const filtered = invoices.filter((inv) => {
    const matchSearch = search
      ? `${inv.invoice_number} ${(inv.customers as any)?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === "all" || inv.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPending = filtered.filter((i) => i.payment_status !== "paid").reduce((s, i) => s + Number(i.balance_due), 0);

  return (
    <div className="px-4 lg:px-6 py-5 max-w-4xl mx-auto w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs w-full">
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              paddingLeft: 32,
              paddingRight: 12,
              fontSize: 13,
              color: "#111827",
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: statusFilter === f.value ? 600 : 400,
                background: statusFilter === f.value ? "#111827" : "transparent",
                color: statusFilter === f.value ? "#FFFFFF" : "#6B7280",
                border: statusFilter === f.value ? "1px solid #111827" : "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.1s",
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {statusFilter !== "all" && totalPending > 0 && (
        <div style={{ marginBottom: 16, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#92400E" }}>
          Outstanding balance: <strong>{formatCurrency(totalPending)}</strong>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title={search || statusFilter !== "all" ? "No invoices match your filter" : "No invoices yet"}
          description={!search && statusFilter === "all" ? "Create your first invoice to get started." : undefined}
          action={!search && statusFilter === "all" ? { label: "Create Invoice", href: "/invoices/new" } : undefined}
        />
      ) : (
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div className="hidden lg:grid" style={{
            gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1.5fr 1fr 40px",
            gap: 16,
            padding: "10px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: 11,
            fontWeight: 600,
            color: "#9CA3AF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "#F9FAFB",
          }}>
            <span>Invoice</span><span>Customer</span><span>Date</span><span>Amount</span><span>Balance</span><span>Status</span><span></span>
          </div>
          <div>
            {filtered.map((inv, i) => (
              <div
                key={inv.id}
                className="flex items-center lg:grid"
                style={{
                  gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1.5fr 1fr 40px",
                  gap: 16,
                  padding: "14px 20px",
                  borderTop: i === 0 ? "none" : "1px solid #F3F4F6",
                  transition: "background 0.1s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <Link href={`/invoices/${inv.id}`} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Receipt style={{ width: 14, height: 14, color: "#9CA3AF" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{inv.invoice_number}</span>
                </Link>
                <Link href={`/invoices/${inv.id}`} className="hidden lg:block" style={{ fontSize: 13, color: "#374151", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(inv.customers as any)?.name ?? "—"}</Link>
                <Link href={`/invoices/${inv.id}`} className="hidden lg:block" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>{formatDate(inv.date)}</Link>
                <Link href={`/invoices/${inv.id}`} style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginLeft: "auto", textDecoration: "none" }} className="lg:m-0">{formatCurrency(Number(inv.grand_total))}</Link>
                <span className="hidden lg:block" style={{ fontSize: 13, color: "#6B7280" }}>{Number(inv.balance_due) > 0 ? formatCurrency(Number(inv.balance_due)) : "—"}</span>
                <div className="hidden lg:block"><PaymentStatusBadge status={inv.payment_status} /></div>
                <button
                  title="Download PDF"
                  onClick={() => window.open(`/api/pdf/invoice/${inv.id}`, "_blank")}
                  className="hidden lg:flex"
                  style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", transition: "all 0.1s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EEF2FF"; (e.currentTarget as HTMLElement).style.color = "#4F46E5"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
