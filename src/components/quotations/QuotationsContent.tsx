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

      {loading ? (
        <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title={search || statusFilter !== "all" ? "No quotations match your filter" : "No quotations yet"}
          description={!search && statusFilter === "all" ? "Create your first quotation to get started." : undefined}
          action={!search && statusFilter === "all" ? { label: "Create Quotation", href: "/quotations/new" } : undefined}
        />
      ) : (
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          {/* Table header — desktop only */}
          <div className="hidden lg:grid" style={{
            gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1fr 40px",
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
            <span>Quotation</span><span>Customer</span><span>Date</span><span>Amount</span><span>Status</span><span></span>
          </div>

          <div style={{ divideColor: "#E5E7EB" }}>
            {filtered.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center lg:grid"
                style={{
                  gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1fr 40px",
                  gap: 16,
                  padding: "14px 20px",
                  borderTop: i === 0 ? "none" : "1px solid #F3F4F6",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <Link href={`/quotations/${q.id}`} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText style={{ width: 14, height: 14, color: "#9CA3AF" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{q.quotation_number}</span>
                </Link>
                <Link href={`/quotations/${q.id}`} className="hidden lg:block" style={{ fontSize: 13, color: "#374151", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(q.customers as any)?.name ?? "—"}</Link>
                <Link href={`/quotations/${q.id}`} className="hidden lg:block" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>{formatDate(q.date)}</Link>
                <Link href={`/quotations/${q.id}`} style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginLeft: "auto", textDecoration: "none" }} className="lg:m-0">{formatCurrency(Number(q.grand_total))}</Link>
                <div className="hidden lg:block"><QuotationStatusBadge status={q.status} /></div>
                <button
                  title="Download PDF"
                  onClick={() => window.open(`/api/pdf/quotation/${q.id}`, "_blank")}
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
