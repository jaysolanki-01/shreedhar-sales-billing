"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Receipt, TrendingUp, Clock, ChevronRight, Plus, ArrowUpRight } from "lucide-react";
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
      return { from: format(startOfMonth(now), "yyyy-MM-dd"), to: format(endOfMonth(now), "yyyy-MM-dd") };
    case "last_month": {
      const lm = subMonths(now, 1);
      return { from: format(startOfMonth(lm), "yyyy-MM-dd"), to: format(endOfMonth(lm), "yyyy-MM-dd") };
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

  useEffect(() => { fetchPeriodData(); }, [period]);

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
        const weekItems = ((data as Invoice[]) ?? []).filter(inv => inv.date >= fromStr && inv.date <= toStr);
        weekSummaries.push({ label: `Week ${weekNum}`, count: weekItems.length, total: weekItems.reduce((s, i) => s + Number(i.grand_total), 0), from: fromStr, to: toStr });
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
    if (selectedWeek === week.label) { setSelectedWeek(null); setWeekInvoices([]); return; }
    setSelectedWeek(week.label);
    setWeekInvoices(invoices.filter(inv => inv.date >= week.from && inv.date <= week.to));
  }

  const periodStats = {
    count: invoices.length,
    total: invoices.reduce((s, i) => s + Number(i.grand_total), 0),
    paid: invoices.filter(i => i.payment_status === "paid").reduce((s, i) => s + Number(i.grand_total), 0),
    pending: invoices.filter(i => i.payment_status !== "paid").reduce((s, i) => s + Number(i.balance_due), 0),
  };

  const displayInvoices = selectedWeek ? weekInvoices : invoices;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-5">

      {/* Greeting */}
      <div className="pt-1">
        <p style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.02em" }}>{greeting}</p>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1.2, marginTop: 2 }}>Shreedhar Sales</h2>
      </div>

      {/* Summary Cards — no borders, shadow only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Quotations" value={stats.total_quotations.toString()} href="/quotations" color="#4F46E5" bg="#EEF2FF" />
        <StatCard icon={<Receipt className="h-4 w-4" />} label="Invoices" value={stats.total_invoices.toString()} href="/invoices" color="#4F46E5" bg="#EEF2FF" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="This Month" value={formatCurrency(stats.month_billing)} href="/invoices" color="#059669" bg="#ECFDF5" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={formatCurrency(stats.pending_payments)} href="/payments" color="#D97706" bg="#FFFBEB" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2.5 flex-wrap">
        <Link href="/quotations/new">
          <Button variant="primary" size="md"><Plus className="h-4 w-4" />New Quotation</Button>
        </Link>
        <Link href="/invoices/new">
          <Button variant="secondary" size="md"><Plus className="h-4 w-4" />New Invoice</Button>
        </Link>
      </div>

      {/* Invoice Activity — clean card, no border */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>

        {/* Header row */}
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", letterSpacing: "-0.01em" }}>Invoice Activity</p>
          {/* Period tabs */}
          <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 3, overflowX: "auto", scrollbarWidth: "none" as any }}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 600,
                  whiteSpace: "nowrap" as any,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: period === p.value ? "#111827" : "transparent",
                  color: period === p.value ? "#fff" : "#9CA3AF",
                  boxShadow: "none",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period Stats — 4 pills in a row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
          <MiniStat label="Invoices" value={periodStats.count.toString()} />
          <MiniStat label="Total Billed" value={formatCurrency(periodStats.total)} accent />
          <MiniStat label="Collected" value={formatCurrency(periodStats.paid)} green />
          <MiniStat label="Outstanding" value={formatCurrency(periodStats.pending)} warn />
        </div>

        {/* Weekly breakdown */}
        {weeks.length > 0 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#D1D5DB", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Weekly Breakdown</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }} className="sm:grid-cols-4" >
              {weeks.map(week => (
                <button
                  key={week.label}
                  onClick={() => handleWeekClick(week)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: selectedWeek === week.label ? "#EEF2FF" : "#F9FAFB",
                    boxShadow: selectedWeek === week.label ? "inset 0 0 0 1.5px #4F46E5" : "none",
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF" }}>{week.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginTop: 2 }}>{week.count} invoices</p>
                  <p style={{ fontSize: 11, color: "#4F46E5", fontWeight: 600, marginTop: 1 }}>{formatCurrency(week.total)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Invoice list */}
        <div>
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>Loading…</div>
          ) : displayInvoices.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#D1D5DB" }}>No invoices in this period</p>
            </div>
          ) : (
            displayInvoices.slice(0, 8).map((inv, i) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 20px",
                  borderTop: i === 0 ? "none" : "1px solid #F9FAFB",
                  transition: "background 0.12s",
                  textDecoration: "none",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Receipt style={{ width: 13, height: 13, color: "#818CF8" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.invoice_number}</p>
                    <p style={{ fontSize: 11.5, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(inv.customers as any)?.name ?? ""} · {formatDate(inv.date)}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{formatCurrency(Number(inv.grand_total))}</p>
                    <PaymentStatusBadge status={inv.payment_status} />
                  </div>
                  <ArrowUpRight style={{ width: 13, height: 13, color: "#D1D5DB" }} className="hidden lg:block" />
                </div>
              </Link>
            ))
          )}
        </div>

        {!loading && invoices.length > 8 && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
            <Link href="/invoices" style={{ fontSize: 12.5, color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>
              View all {invoices.length} invoices →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href, color, bg }: {
  icon: React.ReactNode; label: string; value: string; href: string; color: string; bg: string;
}) {
  return (
    <Link href={href} style={{ display: "block", textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 16px 14px",
          border: "1px solid #E5E7EB",
          transition: "background 0.1s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color }}>
          {icon}
        </div>
        <p style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.01em" }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em", marginTop: 2, lineHeight: 1.1 }}>{value}</p>
      </div>
    </Link>
  );
}

function MiniStat({ label, value, accent, green, warn }: { label: string; value: string; accent?: boolean; green?: boolean; warn?: boolean }) {
  const color = green ? "#059669" : warn ? "#D97706" : accent ? "#4F46E5" : "#111827";
  return (
    <div style={{ padding: "6px 8px" }}>
      <p style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: "-0.02em", marginTop: 1 }}>{value}</p>
    </div>
  );
}
