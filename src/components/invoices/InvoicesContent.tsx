"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Receipt, ChevronRight } from "lucide-react";
import { Invoice, InvoicePaymentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";

const STATUS_FILTERS: { label: string; value: InvoicePaymentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Partial", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
];

export function InvoicesContent({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoicePaymentStatus | "all">("all");

  const filtered = invoices.filter((inv) => {
    const matchSearch = search
      ? `${inv.invoice_number} ${(inv.customers as any)?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === "all" || inv.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPending = filtered.filter((i) => i.payment_status !== "paid").reduce((s, i) => s + Number(i.balance_due), 0);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-md border border-brand-border bg-surface pl-9 pr-3 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
          />
        </div>
        <div className="flex gap-1 bg-brand-beige rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === f.value
                  ? "bg-brand-dark text-brand-gold"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {statusFilter !== "all" && totalPending > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
          Outstanding balance: <strong>{formatCurrency(totalPending)}</strong>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title={search || statusFilter !== "all" ? "No invoices match your filter" : "No invoices yet"}
          description={!search && statusFilter === "all" ? "Create your first invoice to get started." : undefined}
          action={!search && statusFilter === "all" ? { label: "Create Invoice", href: "/invoices/new" } : undefined}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-brand-border bg-brand-beige text-xs font-semibold text-brand-muted uppercase tracking-wide">
            <span>Invoice</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Balance</span>
            <span>Status</span>
            <span></span>
          </div>
          <div className="divide-y divide-brand-border">
            {filtered.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center lg:grid lg:grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3.5 hover:bg-brand-beige transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-beige-dark flex items-center justify-center flex-shrink-0">
                    <Receipt className="h-3.5 w-3.5 text-brand-muted" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">{inv.invoice_number}</span>
                </div>
                <span className="text-sm text-brand-dark truncate hidden lg:block">
                  {(inv.customers as any)?.name ?? "—"}
                </span>
                <span className="text-sm text-brand-muted hidden lg:block">{formatDate(inv.date)}</span>
                <span className="text-sm font-semibold text-brand-dark ml-auto lg:ml-0">{formatCurrency(Number(inv.grand_total))}</span>
                <span className="text-sm text-brand-muted hidden lg:block">
                  {Number(inv.balance_due) > 0 ? formatCurrency(Number(inv.balance_due)) : "—"}
                </span>
                <div className="hidden lg:block"><PaymentStatusBadge status={inv.payment_status} /></div>
                <ChevronRight className="h-4 w-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
