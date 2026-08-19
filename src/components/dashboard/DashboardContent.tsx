"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Receipt, TrendingUp, Clock, ChevronRight, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Invoice } from "@/types";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, subMonths } from "date-fns";

interface Stats {
  total_quotations: number;
  total_invoices: number;
  month_billing: number;
  pending_payments: number;
}

interface WeekSummary {
  label: string;
  count: number;
  total: number;
  from: string;
  to: string;
}

interface DashboardContentProps {
  stats: Stats;
  userId: string;
}

type PeriodKey = "today" | "this_week" | "this_month" | "last_month";

const PERIODS: { label: string; value: PeriodKey }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

function getPeriodDates(period: PeriodKey) {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: format(now, "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd") };
    case "this_week": {
      const ws = startOfWeek(now, { weekStartsOn: 1 });
      const we = endOfWeek(now, { weekStartsOn: 1 });
      return { from: format(ws, "yyyy-MM-dd"), to: format(we, "yyyy-MM-dd") };
    }
    case "this_month":
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    case "last_month": {
      const lm = subMonths(now, 1);
      return {
        from: format(startOfMonth(lm), "yyyy-MM-dd"),
        to: format(endOfMonth(lm), "yyyy-MM-dd"),
      };
    }
  }
}

export function DashboardContent({ stats, userId }: DashboardContentProps) {
  const [period, setPeriod] = useState<PeriodKey>("this_month");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [weekInvoices, setWeekInvoices] = useState<Invoice[]>([]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    fetchPeriodData();
  }, [period]);

  async function fetchPeriodData() {
    setLoading(true);
    setSelectedWeek(null);
    const supabase = createClient();
    const { from, to } = getPeriodDates(period);

    const { data } = await supabase
      .from("invoices")
      .select("*, customers(name, company_name)")
      .eq("user_id", userId)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false });

    setInvoices((data as Invoice[]) ?? []);

    // Build weekly breakdown for month views
    if (period === "this_month" || period === "last_month") {
      const base = period === "this_month" ? now : subMonths(now, 1);
      const monthStart = startOfMonth(base);
      const monthEnd = endOfMonth(base);

      const weekSummaries: WeekSummary[] = [];
      let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      let weekNum = 1;

      while (weekStart <= monthEnd) {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const clampedStart = weekStart < monthStart ? monthStart : weekStart;
        const clampedEnd = weekEnd > monthEnd ? monthEnd : weekEnd;

        const fromStr = format(clampedStart, "yyyy-MM-dd");
        const toStr = format(clampedEnd, "yyyy-MM-dd");

        const weekItems = ((data as Invoice[]) ?? []).filter(
          (inv) => inv.date >= fromStr && inv.date <= toStr
        );

        weekSummaries.push({
          label: `Week ${weekNum}`,
          count: weekItems.length,
          total: weekItems.reduce((s, i) => s + Number(i.grand_total), 0),
          from: fromStr,
          to: toStr,
        });

        weekStart = addWeeks(weekStart, 1);
        weekNum++;
        if (weekNum > 6) break;
      }

      setWeeks(weekSummaries);
    } else {
      setWeeks([]);
    }

    setLoading(false);
  }

  function handleWeekClick(week: WeekSummary) {
    if (selectedWeek === week.label) {
      setSelectedWeek(null);
      setWeekInvoices([]);
      return;
    }
    setSelectedWeek(week.label);
    const filtered = invoices.filter((inv) => inv.date >= week.from && inv.date <= week.to);
    setWeekInvoices(filtered);
  }

  const periodStats = {
    count: invoices.length,
    total: invoices.reduce((s, i) => s + Number(i.grand_total), 0),
    paid: invoices.filter((i) => i.payment_status === "paid").reduce((s, i) => s + Number(i.grand_total), 0),
    pending: invoices.filter((i) => i.payment_status !== "paid").reduce((s, i) => s + Number(i.balance_due), 0),
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-brand-muted">{greeting}</p>
        <h2 className="text-2xl font-bold text-brand-dark">Shreedhar Sales</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<FileText className="h-5 w-5" />} label="Total Quotations" value={stats.total_quotations.toString()} href="/quotations" />
        <SummaryCard icon={<Receipt className="h-5 w-5" />} label="Total Invoices" value={stats.total_invoices.toString()} href="/invoices" />
        <SummaryCard icon={<TrendingUp className="h-5 w-5" />} label="This Month" value={formatCurrency(stats.month_billing)} href="/invoices" gold />
        <SummaryCard icon={<Clock className="h-5 w-5" />} label="Pending" value={formatCurrency(stats.pending_payments)} href="/payments" warn />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/quotations/new">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </Link>
        <Link href="/invoices/new">
          <Button variant="secondary" size="md">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Period filter */}
      <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between gap-4 flex-wrap">
          <h3 className="font-semibold text-brand-dark">Invoice Activity</h3>
          <div className="flex gap-1 bg-brand-beige rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  period === p.value
                    ? "bg-brand-dark text-brand-gold shadow-sm"
                    : "text-brand-muted hover:text-brand-dark"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-border border-b border-brand-border">
          <PeriodStat label="Invoices" value={periodStats.count.toString()} />
          <PeriodStat label="Total Billed" value={formatCurrency(periodStats.total)} />
          <PeriodStat label="Collected" value={formatCurrency(periodStats.paid)} />
          <PeriodStat label="Outstanding" value={formatCurrency(periodStats.pending)} />
        </div>

        {/* Weekly breakdown */}
        {weeks.length > 0 && (
          <div className="border-b border-brand-border">
            <div className="px-6 py-3">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">Weekly Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weeks.map((week) => (
                  <button
                    key={week.label}
                    onClick={() => handleWeekClick(week)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedWeek === week.label
                        ? "border-brand-brown bg-brand-beige-dark"
                        : "border-brand-border hover:border-brand-brown hover:bg-brand-beige"
                    }`}
                  >
                    <p className="text-xs font-semibold text-brand-muted">{week.label}</p>
                    <p className="text-sm font-bold text-brand-dark mt-0.5">{week.count} invoices</p>
                    <p className="text-xs text-brand-brown font-medium">{formatCurrency(week.total)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invoice list */}
        <div className="divide-y divide-brand-border">
          {loading ? (
            <div className="py-12 text-center text-sm text-brand-muted">Loading...</div>
          ) : (selectedWeek ? weekInvoices : invoices).length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-brand-muted">No invoices in this period</p>
            </div>
          ) : (
            (selectedWeek ? weekInvoices : invoices).slice(0, 8).map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-brand-beige transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-beige-dark flex items-center justify-center flex-shrink-0">
                    <Receipt className="h-3.5 w-3.5 text-brand-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{inv.invoice_number}</p>
                    <p className="text-xs text-brand-muted">{(inv.customers as any)?.name ?? ""} · {formatDate(inv.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-dark">{formatCurrency(Number(inv.grand_total))}</p>
                    <PaymentStatusBadge status={inv.payment_status} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))
          )}
        </div>

        {!loading && invoices.length > 8 && (
          <div className="px-6 py-3 border-t border-brand-border text-center">
            <Link href="/invoices" className="text-sm text-brand-brown hover:text-brand-dark font-medium">
              View all {invoices.length} invoices →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, href, gold, warn }: {
  icon: React.ReactNode; label: string; value: string; href: string; gold?: boolean; warn?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <div className={`bg-surface rounded-xl border shadow-card p-4 lg:p-5 transition-all group-hover:shadow-dropdown ${
        gold ? "border-brand-gold/40" : warn ? "border-amber-200" : "border-brand-border"
      }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
          gold ? "bg-brand-gold/20 text-brand-copper" : warn ? "bg-amber-50 text-amber-600" : "bg-brand-beige text-brand-muted"
        }`}>
          {icon}
        </div>
        <p className="text-xs text-brand-muted font-medium">{label}</p>
        <p className={`text-lg font-bold mt-0.5 ${gold ? "text-brand-copper" : warn ? "text-amber-700" : "text-brand-dark"}`}>
          {value}
        </p>
      </div>
    </Link>
  );
}

function PeriodStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 lg:px-6 py-3">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className="text-base font-bold text-brand-dark">{value}</p>
    </div>
  );
}
