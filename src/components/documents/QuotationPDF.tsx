import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Image, Font,
} from "@react-pdf/renderer";
import { amountToWords } from "@/lib/number-to-words";
import { CompanySettings, DocSettings, Quotation } from "@/types";
import path from "path";

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"),    fontWeight: 700 },
  ],
});

const C = {
  navy:   "#1E1B4B",
  dark:   "#111827",
  mid:    "#374151",
  slate:  "#6B7280",
  light:  "#9CA3AF",
  border: "#9CA3AF",
  bg:     "#F3F4F6",
  white:  "#FFFFFF",
  purple: "#A5B4FC",
};

const PX = 20; // page horizontal padding

// Column widths — total must equal 595 - PX*2 = 555pt
const W = {
  sr:      22,   // Sn.
  desc:    150,  // Description of Goods
  qty:     42,   // Qty
  rate:    56,   // Rate (₹)
  disc:    54,   // Discount
  taxable: 65,   // Taxable Value (₹)
  sgst:    57,   // SGST (₹)
  cgst:    57,   // CGST (₹)
  amt:     52,   // Amount (₹)
  // 22+150+42+56+54+65+57+57+52 = 555 ✓
};

/** Plain number formatter (no ₹ symbol — column headers carry it) */
function n(x: number, d = 2) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(x);
}

/** Number with ₹ symbol */
function c(x: number, d = 2) {
  return `₹ ${n(x, d)}`;
}

function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#94A3B8", sent: "#4F46E5", accepted: "#059669", rejected: "#DC2626", expired: "#94A3B8",
};

// Common border color shorthand
const B = { borderColor: C.border };

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: C.white,
    fontSize: 7.5,
    color: C.dark,
    paddingHorizontal: PX,
    paddingTop: 14,
    paddingBottom: 28,
  },

  // ── Title bar ──────────────────────────────────────────────────
  titleBar: {
    backgroundColor: C.navy,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  titleSpacer: { width: 80 },
  titleText: {
    color: C.white, fontSize: 13, fontFamily: "Roboto", fontWeight: 700,
    letterSpacing: 3, textAlign: "center", flex: 1,
  },
  titleBadge: {
    width: 80, alignItems: "flex-end",
  },
  titleBadgeText: {
    color: C.purple, fontSize: 7, fontFamily: "Roboto", fontWeight: 700, textAlign: "right",
  },

  // ── Header box ─────────────────────────────────────────────────
  headerBox: {
    borderWidth: 1, ...B,
    flexDirection: "row",
  },
  headerLeft: {
    flex: 1, padding: 10,
    borderRightWidth: 1, ...B,
    flexDirection: "row", gap: 8,
  },
  logoBox: {
    width: 42, height: 42, flexShrink: 0, overflow: "hidden",
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center", borderRadius: 4,
  },
  logoImg:  { width: 42, height: 42, objectFit: "contain" },
  logoChar: { color: C.navy, fontSize: 16, fontFamily: "Roboto", fontWeight: 700 },
  companyName: { color: C.navy, fontSize: 10.5, fontFamily: "Roboto", fontWeight: 700, marginBottom: 2 },
  companyLine: { color: C.mid, fontSize: 7, marginBottom: 1, lineHeight: 1.4 },
  companyGstin: { color: C.dark, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, marginTop: 3 },

  headerRight: { width: 190, padding: 10 },
  metaRow: {
    flexDirection: "row",
    borderBottomWidth: 1, ...B,
    paddingBottom: 4, marginBottom: 4,
  },
  metaRowLast: { flexDirection: "row" },
  metaLabel:   { color: C.slate, fontSize: 7.5, width: 72 },
  metaValue:   { color: C.dark, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, flex: 1 },

  // ── Place of supply ────────────────────────────────────────────
  placeRow: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
    paddingVertical: 4, paddingHorizontal: 10,
    flexDirection: "row", gap: 4,
  },
  placeLabel: { color: C.mid, fontSize: 7.5 },
  placeValue: { color: C.dark, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Customer section ───────────────────────────────────────────
  customerBox: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
    flexDirection: "row",
  },
  customerCol: { flex: 1, padding: 8 },
  customerDivider: { borderRightWidth: 1, ...B },
  custLabel: {
    color: C.navy, fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },
  custName: {
    color: C.dark, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700, marginBottom: 2,
  },
  custLine:  { color: C.mid,  fontSize: 7, marginBottom: 1.5, lineHeight: 1.4 },
  custGstin: { color: C.dark, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, marginTop: 3 },

  // ── Items table ────────────────────────────────────────────────
  tableWrap: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderBottomWidth: 1, ...B,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1, ...B,
  },
  tableRowLast: { flexDirection: "row" },
  tableTotals: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderTopWidth: 1, ...B,
  },

  // Header cells
  th: {
    fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    paddingVertical: 6, paddingHorizontal: 3,
    borderRightWidth: 1, ...B,
    textAlign: "center",
  },
  thLast: {
    fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    paddingVertical: 6, paddingHorizontal: 4,
    textAlign: "right",
  },

  // Data cells
  td: {
    fontSize: 7.5,
    paddingVertical: 7, paddingHorizontal: 3,
    borderRightWidth: 1, ...B,
  },
  tdLast: {
    fontSize: 7.5,
    paddingVertical: 7, paddingHorizontal: 4,
    textAlign: "right",
  },
  tdBold: { fontFamily: "Roboto", fontWeight: 700 },
  tdMuted: { color: C.mid, fontSize: 7 },
  tdRight: { textAlign: "right" },
  tdCenter: { textAlign: "center" },

  // Column width helpers
  wSr:      { width: W.sr },
  wDesc:    { width: W.desc },
  wQty:     { width: W.qty },
  wRate:    { width: W.rate },
  wDisc:    { width: W.disc },
  wTaxable: { width: W.taxable },
  wSgst:    { width: W.sgst },
  wCgst:    { width: W.cgst },
  wAmt:     { width: W.amt },

  // Totals row span (Sr + Desc = 22+150 = 172)
  wSpan2: { width: W.sr + W.desc },

  // ── Tax Bifurcation ────────────────────────────────────────────
  taxSection: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
  },
  taxTitle: {
    backgroundColor: C.bg,
    textAlign: "center", paddingVertical: 5,
    fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700,
    borderBottomWidth: 1, ...B,
  },
  taxHeadRow: {
    flexDirection: "row",
    borderBottomWidth: 1, ...B,
    backgroundColor: C.bg,
  },
  taxDataRow: {
    flexDirection: "row",
  },
  taxTh: {
    flex: 1, fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    paddingVertical: 5, paddingHorizontal: 6,
    borderRightWidth: 1, ...B,
    textAlign: "center",
  },
  taxThLast: {
    flex: 1, fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    paddingVertical: 5, paddingHorizontal: 6,
    textAlign: "right",
  },
  taxTd: {
    flex: 1, fontSize: 7.5,
    paddingVertical: 5, paddingHorizontal: 6,
    borderRightWidth: 1, ...B,
    textAlign: "right",
  },
  taxTdLast: {
    flex: 1, fontSize: 7.5,
    paddingVertical: 5, paddingHorizontal: 6,
    textAlign: "right",
  },
  taxTdCenter: { textAlign: "center" },

  // ── Bottom row: words + bank | summary ─────────────────────────
  bottomRow: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
    flexDirection: "row",
  },
  bottomLeft: {
    flex: 1, padding: 8,
    borderRightWidth: 1, ...B,
  },
  bottomRight: { width: 190 },

  wordsTitle: {
    color: C.mid, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, marginBottom: 3,
  },
  wordsValue: {
    color: C.dark, fontSize: 8, fontFamily: "Roboto", fontWeight: 700, lineHeight: 1.4,
  },
  bankSection: {
    marginTop: 8, paddingTop: 6,
    borderTopWidth: 1, ...B,
  },
  bankTitle: { color: C.mid, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, marginBottom: 4 },
  bankRow: { flexDirection: "row", marginBottom: 2.5 },
  bankLabel: { color: C.slate, fontSize: 7, width: 66 },
  bankValue: { color: C.dark, fontSize: 7, fontFamily: "Roboto", fontWeight: 700 },

  sumRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 4, paddingHorizontal: 8,
    borderBottomWidth: 1, ...B,
  },
  sumLabel: { color: C.mid, fontSize: 7.5 },
  sumValue: { color: C.dark, fontSize: 7.5 },
  sumRowGrand: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 7, paddingHorizontal: 8,
    backgroundColor: C.navy,
  },
  sumGrandLabel: { color: C.white, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700 },
  sumGrandValue: { color: C.purple, fontSize: 10, fontFamily: "Roboto", fontWeight: 700 },

  // ── Terms + Signatory ──────────────────────────────────────────
  termsRow: {
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
    flexDirection: "row", minHeight: 52,
  },
  termsLeft: { flex: 1, padding: 8, borderRightWidth: 1, ...B },
  termsRight: { width: 190, padding: 8, alignItems: "flex-end", justifyContent: "space-between" },
  termsLabel: {
    color: C.mid, fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    textTransform: "uppercase", marginBottom: 3,
  },
  termsText: { color: C.mid, fontSize: 7, lineHeight: 1.5 },
  sigFor:    { color: C.mid, fontSize: 7.5 },
  sigName:   { color: C.dark, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700 },
  sigLine:   { color: C.slate, fontSize: 7, marginTop: 18 },

  // ── Footer ─────────────────────────────────────────────────────
  footerBar: {
    marginTop: 8, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
  },
  footerLeft:  { color: C.light, fontSize: 6.5 },
  footerRight: { color: C.slate, fontSize: 7, textAlign: "right" },

  pageNum: { position: "absolute", bottom: 8, right: PX, color: C.light, fontSize: 7 },
});

interface Props {
  quotation: Quotation & { quotation_items: any[]; customers: any };
  company: CompanySettings | null;
  docSettings: DocSettings | null;
  logoBase64?: string | null;
}

export function QuotationPDF({ quotation, company, docSettings, logoBase64 }: Props) {
  const customer = quotation.customers;
  const items = quotation.quotation_items ?? [];
  const companyName = company?.company_name ?? "Shreedhar Sales";
  const statusColor = STATUS_COLOR[quotation.status] ?? C.light;

  // Totals
  const grandTotal   = Number(quotation.grand_total);
  const totalCgst    = Number(quotation.gst_amount) / 2;
  const totalSgst    = Number(quotation.gst_amount) / 2;
  const totalTaxable = Number(quotation.taxable_amount);

  // Tax bifurcation — group by GST rate
  const taxMap: Record<number, { taxable: number; cgst: number; sgst: number }> = {};
  for (const item of items) {
    const rate = Number(item.gst_percent ?? 0);
    if (!taxMap[rate]) taxMap[rate] = { taxable: 0, cgst: 0, sgst: 0 };
    taxMap[rate].taxable += Number(item.taxable_amount ?? 0);
    taxMap[rate].cgst    += Number(item.gst_amount ?? 0) / 2;
    taxMap[rate].sgst    += Number(item.gst_amount ?? 0) / 2;
  }
  const taxGroups = Object.entries(taxMap)
    .map(([rate, v]) => ({ rate: Number(rate), ...v }))
    .sort((a, b) => a.rate - b.rate);

  // Column qty/discount/taxable/sgst/cgst totals
  const totQty     = items.reduce((s, i) => s + Number(i.quantity ?? 0), 0);
  const totDisc    = items.reduce((s, i) => s + Number(i.discount_amount ?? 0), 0);

  return (
    <Document title={quotation.quotation_number} author={companyName}>
      <Page size="A4" style={s.page} wrap>

        {/* ── Title bar ── */}
        <View style={s.titleBar}>
          <View style={s.titleSpacer} />
          <Text style={s.titleText}>QUOTATION</Text>
          <View style={s.titleBadge}>
            <Text style={s.titleBadgeText}>{quotation.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Header: Company | Doc Details ── */}
        <View style={s.headerBox}>
          {/* Left — logo + company */}
          <View style={s.headerLeft}>
            <View style={s.logoBox}>
              {logoBase64
                ? <Image src={logoBase64} style={s.logoImg} />
                : <Text style={s.logoChar}>{companyName.charAt(0).toUpperCase()}</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.companyName}>{companyName}</Text>
              {company?.address && <Text style={s.companyLine}>{company.address}</Text>}
              {company?.phone   && <Text style={s.companyLine}>Phone: {company.phone}</Text>}
              {company?.email   && <Text style={s.companyLine}>Email: {company.email}</Text>}
              {company?.gstin   && <Text style={s.companyGstin}>GSTIN: {company.gstin}</Text>}
            </View>
          </View>

          {/* Right — quotation meta */}
          <View style={s.headerRight}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Quotation No.</Text>
              <Text style={s.metaValue}>{quotation.quotation_number}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaValue}>{fmtDate(quotation.date)}</Text>
            </View>
            <View style={s.metaRowLast}>
              <Text style={s.metaLabel}>Valid Until</Text>
              <Text style={s.metaValue}>{fmtDate(quotation.valid_until)}</Text>
            </View>
          </View>
        </View>

        {/* ── Place of Supply ── */}
        <View style={s.placeRow}>
          <Text style={s.placeLabel}>Place of Supply:</Text>
          <Text style={s.placeValue}>{company?.address?.includes("Gujarat") || company?.gstin?.startsWith("24") ? "Gujarat (24)" : "—"}</Text>
        </View>

        {/* ── Bill To | Ship To ── */}
        <View style={s.customerBox}>
          <View style={[s.customerCol, s.customerDivider]}>
            <Text style={s.custLabel}>Bill To</Text>
            <Text style={s.custName}>{customer?.name ?? "—"}</Text>
            {customer?.company_name && <Text style={s.custLine}>{customer.company_name}</Text>}
            {customer?.address      && <Text style={s.custLine}>Address: {customer.address}</Text>}
            {customer?.phone        && <Text style={s.custLine}>Phone: {customer.phone}</Text>}
            {customer?.gstin        && <Text style={s.custGstin}>GSTIN: {customer.gstin}</Text>}
          </View>
          <View style={s.customerCol}>
            <Text style={s.custLabel}>Ship To</Text>
            <Text style={s.custName}>{customer?.name ?? "—"}</Text>
            {customer?.company_name && <Text style={s.custLine}>{customer.company_name}</Text>}
            {customer?.address      && <Text style={s.custLine}>{customer.address}</Text>}
            {customer?.phone        && <Text style={s.custLine}>{customer.phone}</Text>}
            {customer?.gstin        && <Text style={s.custGstin}>GSTIN: {customer.gstin}</Text>}
          </View>
        </View>

        {/* ── Items Table ── */}
        <View style={s.tableWrap}>
          {/* Header row */}
          <View style={s.tableHead}>
            <Text style={[s.th, s.wSr]}>Sn.</Text>
            <Text style={[s.th, s.wDesc]}>Description of Goods</Text>
            <Text style={[s.th, s.wQty]}>Qty</Text>
            <Text style={[s.th, s.wRate]}>Rate ({"₹"})</Text>
            <Text style={[s.th, s.wDisc]}>Discount</Text>
            <Text style={[s.th, s.wTaxable]}>Taxable Value ({"₹"})</Text>
            <Text style={[s.th, s.wSgst]}>SGST ({"₹"})</Text>
            <Text style={[s.th, s.wCgst]}>CGST ({"₹"})</Text>
            <Text style={[s.thLast, s.wAmt]}>Amount ({"₹"})</Text>
          </View>

          {/* Data rows */}
          {items.map((item: any, idx: number) => {
            const sgst    = Number(item.gst_amount ?? 0) / 2;
            const cgst    = Number(item.gst_amount ?? 0) / 2;
            const gstRate = Number(item.gst_percent ?? 0);
            const halfRate = gstRate / 2;
            const taxable = Number(item.taxable_amount ?? 0);
            const discAmt = Number(item.discount_amount ?? 0);
            const discPct = Number(item.discount_percent ?? 0);
            const isLast  = idx === items.length - 1;

            return (
              <View key={item.id ?? idx} style={isLast ? s.tableRowLast : s.tableRow} wrap={false}>
                <View style={[s.td, s.wSr, s.tdCenter]}>
                  <Text>{idx + 1}</Text>
                </View>
                <View style={[s.td, s.wDesc]}>
                  <Text style={s.tdBold}>{item.description}</Text>
                  {item.hsn_code ? <Text style={s.tdMuted}>HSN: {item.hsn_code}</Text> : null}
                </View>
                <View style={[s.td, s.wQty, s.tdCenter]}>
                  <Text>{n(Number(item.quantity), 0)} NOS</Text>
                </View>
                <View style={[s.td, s.wRate, s.tdRight]}>
                  <Text>{n(Number(item.rate))}</Text>
                </View>
                <View style={[s.td, s.wDisc, s.tdRight]}>
                  <Text>{n(discAmt)}</Text>
                  <Text style={s.tdMuted}>({discPct}%)</Text>
                </View>
                <View style={[s.td, s.wTaxable, s.tdRight]}>
                  <Text>{n(taxable)}</Text>
                </View>
                <View style={[s.td, s.wSgst, s.tdRight]}>
                  <Text>{n(sgst)}</Text>
                  <Text style={s.tdMuted}>({halfRate}%)</Text>
                </View>
                <View style={[s.td, s.wCgst, s.tdRight]}>
                  <Text>{n(cgst)}</Text>
                  <Text style={s.tdMuted}>({halfRate}%)</Text>
                </View>
                <View style={[s.tdLast, s.wAmt]}>
                  <Text style={s.tdBold}>{n(Number(item.amount))}</Text>
                </View>
              </View>
            );
          })}

          {/* Totals row */}
          <View style={s.tableTotals}>
            <View style={[s.td, s.wSpan2]}>
              <Text style={s.tdBold}>Totals</Text>
            </View>
            <View style={[s.td, s.wQty, s.tdCenter]}>
              <Text style={s.tdBold}>{n(totQty, 0)}</Text>
            </View>
            <View style={[s.td, s.wRate]}>
              <Text> </Text>
            </View>
            <View style={[s.td, s.wDisc, s.tdRight]}>
              <Text style={s.tdBold}>{n(totDisc)}</Text>
            </View>
            <View style={[s.td, s.wTaxable, s.tdRight]}>
              <Text style={s.tdBold}>{n(totalTaxable)}</Text>
            </View>
            <View style={[s.td, s.wSgst, s.tdRight]}>
              <Text style={s.tdBold}>{n(totalSgst)}</Text>
            </View>
            <View style={[s.td, s.wCgst, s.tdRight]}>
              <Text style={s.tdBold}>{n(totalCgst)}</Text>
            </View>
            <View style={[s.tdLast, s.wAmt]}>
              <Text style={s.tdBold}>{n(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* ── Tax Bifurcation ── */}
        <View style={s.taxSection}>
          <Text style={s.taxTitle}>Tax Bifurcation</Text>
          {/* Header */}
          <View style={s.taxHeadRow}>
            <Text style={[s.taxTh, s.taxTdCenter]}>GST Rate</Text>
            <Text style={s.taxTh}>Taxable Value</Text>
            <Text style={s.taxTh}>CGST</Text>
            <Text style={s.taxTh}>SGST</Text>
            <Text style={s.taxThLast}>Total Tax</Text>
          </View>
          {/* Data */}
          {taxGroups.map((g, i) => (
            <View key={i} style={i < taxGroups.length - 1 ? { ...s.taxDataRow, borderBottomWidth: 1, borderBottomColor: C.border } : s.taxDataRow}>
              <Text style={[s.taxTd, s.taxTdCenter]}>{g.rate}%</Text>
              <Text style={s.taxTd}>{n(g.taxable)}</Text>
              <Text style={s.taxTd}>{n(g.cgst)}</Text>
              <Text style={s.taxTd}>{n(g.sgst)}</Text>
              <Text style={s.taxTdLast}>{n(g.cgst + g.sgst)}</Text>
            </View>
          ))}
        </View>

        {/* ── Bottom: Words + Bank | Summary ── */}
        <View style={s.bottomRow}>
          {/* Left: Amount in words + Bank details */}
          <View style={s.bottomLeft}>
            <Text style={s.wordsTitle}>Amount in Words:</Text>
            <Text style={s.wordsValue}>{amountToWords(grandTotal)}</Text>

            {docSettings?.bank_account_number ? (
              <View style={s.bankSection}>
                <Text style={s.bankTitle}>Bank Details:</Text>
                {docSettings.bank_account_name && (
                  <View style={s.bankRow}>
                    <Text style={s.bankLabel}>Account Name</Text>
                    <Text style={s.bankValue}>{docSettings.bank_account_name}</Text>
                  </View>
                )}
                {docSettings.bank_name && (
                  <View style={s.bankRow}>
                    <Text style={s.bankLabel}>Bank Name</Text>
                    <Text style={s.bankValue}>{docSettings.bank_name}</Text>
                  </View>
                )}
                {docSettings.bank_account_number && (
                  <View style={s.bankRow}>
                    <Text style={s.bankLabel}>A/C No</Text>
                    <Text style={s.bankValue}>{docSettings.bank_account_number}</Text>
                  </View>
                )}
                {docSettings.bank_ifsc && (
                  <View style={s.bankRow}>
                    <Text style={s.bankLabel}>IFSC</Text>
                    <Text style={s.bankValue}>{docSettings.bank_ifsc}</Text>
                  </View>
                )}
                {docSettings.bank_upi && (
                  <View style={s.bankRow}>
                    <Text style={s.bankLabel}>UPI</Text>
                    <Text style={s.bankValue}>{docSettings.bank_upi}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {/* Right: Summary */}
          <View style={s.bottomRight}>
            <View style={s.sumRow}>
              <Text style={s.sumLabel}>Subtotal</Text>
              <Text style={s.sumValue}>{c(Number(quotation.subtotal))}</Text>
            </View>
            {Number(quotation.discount_amount) > 0 && (
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Discount</Text>
                <Text style={s.sumValue}>− {c(Number(quotation.discount_amount))}</Text>
              </View>
            )}
            <View style={s.sumRow}>
              <Text style={s.sumLabel}>Taxable Value</Text>
              <Text style={s.sumValue}>{c(totalTaxable)}</Text>
            </View>
            <View style={s.sumRow}>
              <Text style={s.sumLabel}>CGST</Text>
              <Text style={s.sumValue}>{c(totalCgst)}</Text>
            </View>
            <View style={s.sumRow}>
              <Text style={s.sumLabel}>SGST</Text>
              <Text style={s.sumValue}>{c(totalSgst)}</Text>
            </View>
            <View style={s.sumRow}>
              <Text style={s.sumLabel}>Total GST</Text>
              <Text style={s.sumValue}>{c(Number(quotation.gst_amount))}</Text>
            </View>
            <View style={s.sumRowGrand}>
              <Text style={s.sumGrandLabel}>GRAND TOTAL</Text>
              <Text style={s.sumGrandValue}>{c(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* ── Terms + Authorised Signatory ── */}
        <View style={s.termsRow}>
          <View style={s.termsLeft}>
            <Text style={s.termsLabel}>Terms & Conditions:</Text>
            {quotation.terms
              ? <Text style={s.termsText}>{quotation.terms}</Text>
              : <Text style={s.termsText}> </Text>
            }
          </View>
          <View style={s.termsRight}>
            <Text style={s.sigFor}>For <Text style={s.sigName}>{companyName.toUpperCase()}</Text></Text>
            <Text style={s.sigLine}>(Authorised Signatory)</Text>
          </View>
        </View>

        {/* Notes (if any) */}
        {quotation.notes ? (
          <View style={{
            borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, ...B,
            padding: 8,
          }}>
            <Text style={[s.termsLabel, { marginBottom: 3 }]}>Notes:</Text>
            <Text style={s.termsText}>{quotation.notes}</Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={s.footerBar}>
          <Text style={s.footerLeft}>+91 79848 41640  |  +91 79847 17501  |  shreedharsales056@gmail.com</Text>
          <Text style={s.footerRight}>802 B Wing, Gopal Palace, Opp. Ocean Park, Nehru Nagar, Ahmedabad</Text>
        </View>

        {/* Page number */}
        <Text
          style={s.pageNum}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />

      </Page>
    </Document>
  );
}
