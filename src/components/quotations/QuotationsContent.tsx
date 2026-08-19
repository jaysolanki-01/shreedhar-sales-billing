"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, Download } from "lucide-react";
import { Quotation, QuotationStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuotationStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useOwnerId } from "@/lib/use-owner";

const STATUS_FILTERS: { label: string; value: QuotationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

export function QuotationsContent() {
  const userId = useOwnerId();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all");

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("quotations")
      .select("*, customers(name, company_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setQuotations((data as Quotation[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  const filtered = quotations.filter((q) => {
    const matchSearch = search
      ? `${q.quotation_number} ${(q.customers as any)?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-md border border-brand-border bg-surface pl-9 pr-3 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
          />
        </div>
        <div className="flex gap-1 bg-brand-beige rounded-lg p-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === f.value ? "bg-brand-dark text-brand-gold" : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-brand-muted">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title={search || statusFilter !== "all" ? "No quotations match your filter" : "No quotations yet"}
          description={!search && statusFilter === "all" ? "Create your first quotation to get started." : undefined}
          action={!search && statusFilter === "all" ? { label: "Create Quotation", href: "/quotations/new" } : undefined}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-brand-border bg-brand-beige text-xs font-semibold text-brand-muted uppercase tracking-wide">
            <span>Quotation</span><span>Customer</span><span>Date</span><span>Amount</span><span>Status</span><span></span>
          </div>
          <div className="divide-y divide-brand-border">
            {filtered.map((q) => (
              <div key={q.id} className="flex items-center lg:grid lg:grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3.5 hover:bg-brand-beige transition-colors group">
                <Link href={`/quotations/${q.id}`} className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-beige-dark flex items-center justify-center flex-shrink-0">
                    <FileText className="h-3.5 w-3.5 text-brand-muted" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">{q.quotation_number}</span>
                </Link>
                <Link href={`/quotations/${q.id}`} className="text-sm text-brand-dark truncate hidden lg:block">{(q.customers as any)?.name ?? "—"}</Link>
                <Link href={`/quotations/${q.id}`} className="text-sm text-brand-muted hidden lg:block">{formatDate(q.date)}</Link>
                <Link href={`/quotations/${q.id}`} className="text-sm font-semibold text-brand-dark ml-auto lg:ml-0">{formatCurrency(Number(q.grand_total))}</Link>
                <div className="hidden lg:block"><QuotationStatusBadge status={q.status} /></div>
                <button
                  title="View / Download PDF"
                  onClick={() => window.open(`/api/pdf/quotation/${q.id}`, "_blank")}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-brand-muted hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
