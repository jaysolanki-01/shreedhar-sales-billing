"use client";

import { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/ui/badge";
import Link from "next/link";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";

type PeriodKey = "today" | "this_week" | "this_month" | "last_month" | "all";

const PERIODS: { label: string; value: PeriodKey }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "All Time", value: "all" },
];

function getRange(period: PeriodKey): { from: string; to: string } | null {
  const now = new Date();
  if (period === "all") return null;
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");
  switch (period) {
    case "today": return { from: fmt(startOfDay(now)), to: fmt(endOfDay(now)) };
    case "this_week": return { from: fmt(startOfWeek(now, { weekStartsOn: 1 })), to: fmt(endOfWeek(now, { weekStartsOn: 1 })) };
    case "this_month": return { from: fmt(startOfMonth(now)), to: fmt(endOfMonth(now)) };
    case "last_month": const lm = subMonths(now, 1); return { from: fmt(startOfMonth(lm)), to: fmt(endOfMonth(lm)) };
  }
}

export function ReportsContent({ invoices }: { invoices: any[] }) {
  const [period, setPeriod] = useState<PeriodKey>("this_month");

  const filtered = useMemo(() => {
    const range = getRange(period);
    if (!range) return invoices;
    return invoices.filter((inv) => inv.date >= range.from && inv.date <= range.to);
  }, [invoices, period]);

  const totalBilled = filtered.reduce((s, i) => s + Number(i.grand_total), 0);
  const totalPaid = filtered.reduce((s, i) => s + Number(i.amount_paid), 0);
  const totalPending = filtered.reduce((s, i) => s + Number(i.balance_due), 0);
  const totalGst = filtered.reduce((s, i) => s + Number(i.gst_amount), 0);

  // Customer-wise summary
  const customerMap: Record<string, { name: string; total: number; count: number }> = {};
  for (const inv of filtered) {
    const name = (inv.customers as any)?.name ?? "Unknown";
    if (!customerMap[name]) customerMap[name] = { name, total: 0, count: 0 };
    customerMap[name].total += Number(inv.grand_total);
    customerMap[name].count++;
  }
  const customerSummary = Object.values(customerMap).sort((a, b) => b.total - a.total);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Period filter */}
      <div className="overflow-x-auto">
      <div className="flex gap-1 bg-brand-beige rounded-lg p-1 w-fit min-w-max">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              period === p.value ? "bg-brand-dark text-brand-gold" : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Invoices" value={filtered.length.toString()} />
        <StatCard label="Total Billed" value={formatCurrency(totalBilled)} gold />
        <StatCard label="Collected" value={formatCurrency(totalPaid)} green />
        <StatCard label="Outstanding" value={formatCurrency(totalPending)} warn />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Summary */}
        <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5">
          <h3 className="font-semibold text-brand-dark mb-4">Tax Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-brand-muted">Taxable Amount</span>
              <span className="text-sm font-semibold text-brand-dark">{formatCurrency(totalBilled - totalGst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-brand-muted">Total GST</span>
              <span className="text-sm font-semibold text-brand-dark">{formatCurrency(totalGst)}</span>
            </div>
            <div className="border-t border-brand-border pt-3 flex justify-between">
              <span className="text-sm font-bold text-brand-dark">Total Invoice Value</span>
              <span className="text-sm font-bold text-brand-brown">{formatCurrency(totalBilled)}</span>
            </div>
          </div>
        </div>

        {/* Customer-wise */}
        <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h3 className="font-semibold text-brand-dark">By Customer</h3>
          </div>
          {customerSummary.length === 0 ? (
            <div className="py-8 text-center text-sm text-brand-muted">No data</div>
          ) : (
            <div className="divide-y divide-brand-border">
              {customerSummary.slice(0, 8).map((c) => (
                <div key={c.name} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-dark">{c.name}</p>
                    <p className="text-xs text-brand-muted">{c.count} invoice{c.count !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">{formatCurrency(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h3 className="font-semibold text-brand-dark">Invoices ({filtered.length})</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-brand-muted">No invoices in this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-beige text-xs font-semibold text-brand-muted uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">GST</th>
                  <th className="text-right px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-brand-beige transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/invoices/${inv.id}`} className="text-brand-brown hover:text-brand-dark font-semibold">
                        {inv.invoice_number ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-dark">{(inv.customers as any)?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-brand-muted">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-dark">{formatCurrency(Number(inv.grand_total))}</td>
                    <td className="px-4 py-3 text-right text-brand-muted">{formatCurrency(Number(inv.gst_amount))}</td>
                    <td className="px-5 py-3 text-right"><PaymentStatusBadge status={inv.payment_status} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-brand-beige font-semibold text-sm border-t border-brand-border">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-brand-dark">Total</td>
                  <td className="px-4 py-3 text-right text-brand-dark">{formatCurrency(totalBilled)}</td>
                  <td className="px-4 py-3 text-right text-brand-dark">{formatCurrency(totalGst)}</td>
                  <td className="px-5 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, gold, green, warn }: { label: string; value: string; gold?: boolean; green?: boolean; warn?: boolean }) {
  return (
    <div className="bg-surface rounded-xl border border-brand-border shadow-card p-4 lg:p-5">
      <p className="text-xs text-brand-muted mb-1">{label}</p>
      <p className={`text-lg font-bold ${gold ? "text-brand-copper" : green ? "text-green-700" : warn ? "text-amber-700" : "text-brand-dark"}`}>
        {value}
      </p>
    </div>
  );
}
