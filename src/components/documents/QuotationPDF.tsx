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
  navy:    "#1E1B4B",
  indigo:  "#4F46E5",
  indigoL: "#EEF2FF",
  slate:   "#64748B",
  muted:   "#94A3B8",
  border:  "#E2E8F0",
  bg:      "#F8FAFC",
  white:   "#FFFFFF",
  green:   "#059669",
  purple:  "#A5B4FC",
};

// Horizontal page padding
const PX = 28;

// Column widths — must sum to 595 - PX*2 = 539pt
const COL = {
  sr:      20,
  desc:    130,
  hsn:     40,
  qty:     28,
  rate:    60,
  disc:    34,
  taxable: 64,
  cgst:    50,
  sgst:    50,
  amt:     63,
  // total: 20+130+40+28+60+34+64+50+50+63 = 539 ✓
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: C.white,
    paddingBottom: 54,
    fontSize: 8,
    color: C.navy,
  },
  stripe: { height: 5, backgroundColor: C.indigo },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: PX,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoBox: {
    width: 42, height: 42, borderRadius: 8,
    backgroundColor: C.indigoL,
    alignItems: "center", justifyContent: "center",
    marginBottom: 5, overflow: "hidden",
  },
  logoImg: { width: 42, height: 42, objectFit: "contain" },
  logoText: { color: C.indigo, fontSize: 16, fontFamily: "Roboto", fontWeight: 700 },
  companyName: { color: C.navy, fontSize: 12, fontFamily: "Roboto", fontWeight: 700, marginBottom: 3 },
  companyLine: { color: C.slate, fontSize: 7.5, marginBottom: 1.5, lineHeight: 1.4 },
  headerRight: { alignItems: "flex-end" },
  docBadge: {
    backgroundColor: C.indigo, borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  docBadgeText: { color: C.white, fontSize: 9, fontFamily: "Roboto", fontWeight: 700, letterSpacing: 2 },
  metaRow: { flexDirection: "row", marginBottom: 3, justifyContent: "flex-end" },
  metaLabel: { color: C.muted, fontSize: 7.5, width: 74, textAlign: "right", marginRight: 8 },
  metaValue: { color: C.navy, fontSize: 8, fontFamily: "Roboto", fontWeight: 700, textAlign: "right", minWidth: 88 },
  statusBadge: {
    borderRadius: 3, paddingHorizontal: 7, paddingVertical: 2, alignSelf: "flex-start", marginTop: 6,
  },
  statusText: { fontSize: 6.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Body ─────────────────────────────────────────────────────────
  body: { paddingHorizontal: PX, paddingTop: 16 },

  // ── Bill To / Ship To ─────────────────────────────────────────
  twoCol: { flexDirection: "row", marginBottom: 16, gap: 12 },
  colBlock: {
    flex: 1, backgroundColor: C.bg, borderRadius: 5,
    padding: 10, borderWidth: 1, borderColor: C.border,
  },
  sectionLabel: {
    color: C.indigo, fontSize: 6.5, fontFamily: "Roboto", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5,
    borderBottomWidth: 1, borderBottomColor: C.indigoL, paddingBottom: 3,
  },
  contactName: { color: C.navy, fontSize: 9, fontFamily: "Roboto", fontWeight: 700, marginBottom: 2 },
  contactLine: { color: C.slate, fontSize: 7.5, marginBottom: 1.5, lineHeight: 1.4 },

  // ── Table ────────────────────────────────────────────────────────
  tableWrap: {
    borderRadius: 5, overflow: "hidden",
    borderWidth: 1, borderColor: C.border, marginBottom: 12,
  },
  tableHead: { backgroundColor: C.navy, flexDirection: "row", paddingVertical: 7 },
  tableHeadCell: {
    color: C.white, fontSize: 6.5, fontFamily: "Roboto", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row", paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.bg },
  tableCell: { fontSize: 7.5, color: C.navy },
  tableCellMuted: { fontSize: 7.5, color: C.slate },

  colSr:      { width: COL.sr,      paddingLeft: 8,  textAlign: "center" },
  colDesc:    { width: COL.desc,    paddingLeft: 6,  paddingRight: 4 },
  colHsn:     { width: COL.hsn,    textAlign: "center" },
  colQty:     { width: COL.qty,    textAlign: "right" },
  colRate:    { width: COL.rate,   textAlign: "right" },
  colDisc:    { width: COL.disc,   textAlign: "right" },
  colTaxable: { width: COL.taxable, textAlign: "right" },
  colCgst:    { width: COL.cgst,   textAlign: "right" },
  colSgst:    { width: COL.sgst,   textAlign: "right" },
  colAmt:     { width: COL.amt,    textAlign: "right", paddingRight: 8 },

  // ── Totals ───────────────────────────────────────────────────────
  totalsWrap: { alignItems: "flex-end", marginBottom: 12 },
  totalsBox: { width: 240 },
  grandRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: C.navy, borderRadius: 5,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 10,
  },
  grandLabel: { color: C.white, fontSize: 9, fontFamily: "Roboto", fontWeight: 700, letterSpacing: 0.5 },
  grandValue: { color: C.purple, fontSize: 13, fontFamily: "Roboto", fontWeight: 700 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { color: C.slate, fontSize: 8 },
  totalValue: { color: C.navy, fontSize: 8 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 6 },
  totalFinalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 2 },
  totalFinalLabel: { color: C.navy, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700 },
  totalFinalValue: { color: C.navy, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Amount in words ──────────────────────────────────────────────
  wordsBox: {
    backgroundColor: C.bg, borderRadius: 5,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 7, marginBottom: 12,
  },
  wordsLabel: { color: C.muted, fontSize: 6.5, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
  wordsValue: { color: C.navy, fontSize: 8, fontFamily: "Roboto", fontWeight: 700 },

  // ── Notes / Terms ────────────────────────────────────────────────
  noteLabel: {
    color: C.indigo, fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
  },
  noteText: { color: C.slate, fontSize: 7.5, lineHeight: 1.5 },
  noteBlock: { marginBottom: 10 },

  // ── Bank Details ─────────────────────────────────────────────────
  bankGrid: { flexDirection: "row", flexWrap: "wrap" },
  bankItem: { width: "50%", marginBottom: 5 },
  bankLabel: { color: C.muted, fontSize: 6.5 },
  bankValue: { color: C.navy, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Fixed Footer Bar ─────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 46,
    backgroundColor: C.navy,
    paddingHorizontal: PX,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { color: C.purple, fontSize: 6.5, marginBottom: 2 },
  footerRight: { alignItems: "flex-end" },
  footerEmail: { color: C.white, fontSize: 6.5, marginBottom: 2 },
  footerCompany: { color: C.purple, fontSize: 6.5, fontFamily: "Roboto", fontWeight: 700 },

  pageNum: { position: "absolute", bottom: 52, right: PX, color: C.muted, fontSize: 7 },
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#94A3B8", sent: "#4F46E5", accepted: "#059669", rejected: "#DC2626", expired: "#94A3B8",
};

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
  const statusColor = STATUS_COLOR[quotation.status] ?? C.slate;

  const totalCgst = Number(quotation.gst_amount) / 2;
  const totalSgst = Number(quotation.gst_amount) / 2;

  return (
    <Document title={quotation.quotation_number} author={companyName}>
      <Page size="A4" style={s.page} wrap>

        {/* Top indigo stripe */}
        <View style={s.stripe} />

        {/* ── Header ── */}
        <View style={s.header}>
          {/* Left — Logo + Company */}
          <View>
            <View style={s.logoBox}>
              {logoBase64 ? (
                <Image src={logoBase64} style={s.logoImg} />
              ) : (
                <Text style={s.logoText}>{companyName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={s.companyName}>{companyName}</Text>
            {company?.address && <Text style={s.companyLine}>{company.address}</Text>}
            {company?.phone  && <Text style={s.companyLine}>{company.phone}</Text>}
            {company?.email  && <Text style={s.companyLine}>{company.email}</Text>}
            {company?.gstin  && <Text style={s.companyLine}>GSTIN: {company.gstin}</Text>}
          </View>

          {/* Right — Doc type + meta */}
          <View style={s.headerRight}>
            <View style={s.docBadge}>
              <Text style={s.docBadgeText}>QUOTATION</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Quotation No.</Text>
              <Text style={s.metaValue}>{quotation.quotation_number}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaValue}>{fmtDate(quotation.date)}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Valid Until</Text>
              <Text style={s.metaValue}>{fmtDate(quotation.valid_until)}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: statusColor + "18" }]}>
              <Text style={[s.statusText, { color: statusColor }]}>{quotation.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Bill To & Ship To */}
          <View style={s.twoCol}>
            <View style={s.colBlock}>
              <Text style={s.sectionLabel}>Bill To</Text>
              <Text style={s.contactName}>{customer?.name ?? "—"}</Text>
              {customer?.company_name && <Text style={s.contactLine}>{customer.company_name}</Text>}
              {customer?.address      && <Text style={s.contactLine}>{customer.address}</Text>}
              {customer?.phone        && <Text style={s.contactLine}>{customer.phone}</Text>}
              {customer?.email        && <Text style={s.contactLine}>{customer.email}</Text>}
              {customer?.gstin        && <Text style={s.contactLine}>GSTIN: {customer.gstin}</Text>}
            </View>
            <View style={s.colBlock}>
              <Text style={s.sectionLabel}>Ship To</Text>
              <Text style={s.contactName}>{customer?.name ?? "—"}</Text>
              {customer?.company_name && <Text style={s.contactLine}>{customer.company_name}</Text>}
              {customer?.address      && <Text style={s.contactLine}>{customer.address}</Text>}
              {customer?.phone        && <Text style={s.contactLine}>{customer.phone}</Text>}
              {customer?.email        && <Text style={s.contactLine}>{customer.email}</Text>}
              {customer?.gstin        && <Text style={s.contactLine}>GSTIN: {customer.gstin}</Text>}
            </View>
          </View>

          {/* ── Items Table ── */}
          <View style={s.tableWrap}>
            {/* Header row */}
            <View style={s.tableHead}>
              <Text style={[s.tableHeadCell, s.colSr]}>Sr.</Text>
              <Text style={[s.tableHeadCell, s.colDesc]}>Description</Text>
              <Text style={[s.tableHeadCell, s.colHsn]}>HSN</Text>
              <Text style={[s.tableHeadCell, s.colQty]}>Qty</Text>
              <Text style={[s.tableHeadCell, s.colRate]}>Rate</Text>
              <Text style={[s.tableHeadCell, s.colDisc]}>Disc%</Text>
              <Text style={[s.tableHeadCell, s.colTaxable]}>Taxable</Text>
              <Text style={[s.tableHeadCell, s.colCgst]}>CGST</Text>
              <Text style={[s.tableHeadCell, s.colSgst]}>SGST</Text>
              <Text style={[s.tableHeadCell, s.colAmt]}>Amount</Text>
            </View>

            {/* Data rows */}
            {items.map((item: any, idx: number) => {
              const cgst = Number(item.gst_amount ?? 0) / 2;
              const sgst = Number(item.gst_amount ?? 0) / 2;
              const taxable = Number(item.taxable_amount ?? 0);
              const isLast = idx === items.length - 1;
              return (
                <View
                  key={item.id ?? idx}
                  style={[
                    s.tableRow,
                    idx % 2 === 1 ? s.tableRowAlt : {},
                    isLast ? { borderBottomWidth: 0 } : {},
                  ]}
                  wrap={false}
                >
                  <Text style={[s.tableCellMuted, s.colSr]}>{idx + 1}</Text>
                  <Text style={[s.tableCell, s.colDesc]}>{item.description}</Text>
                  <Text style={[s.tableCellMuted, s.colHsn]}>{item.hsn_code ?? ""}</Text>
                  <Text style={[s.tableCellMuted, s.colQty]}>{item.quantity}</Text>
                  <Text style={[s.tableCellMuted, s.colRate]}>{fmt(Number(item.rate))}</Text>
                  <Text style={[s.tableCellMuted, s.colDisc]}>{item.discount_percent ?? 0}%</Text>
                  <Text style={[s.tableCellMuted, s.colTaxable]}>{fmt(taxable)}</Text>
                  <Text style={[s.tableCellMuted, s.colCgst]}>{fmt(cgst)}</Text>
                  <Text style={[s.tableCellMuted, s.colSgst]}>{fmt(sgst)}</Text>
                  <Text style={[s.tableCell, s.colAmt, { fontFamily: "Roboto", fontWeight: 700 }]}>
                    {fmt(Number(item.amount))}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ── Totals ── */}
          <View style={s.totalsWrap}>
            <View style={s.totalsBox}>
              {/* Grand Total — prominent first */}
              <View style={s.grandRow}>
                <Text style={s.grandLabel}>GRAND TOTAL</Text>
                <Text style={s.grandValue}>{fmt(Number(quotation.grand_total))}</Text>
              </View>

              {/* Breakdown */}
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Taxable Value</Text>
                <Text style={s.totalValue}>{fmt(Number(quotation.taxable_amount))}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>CGST</Text>
                <Text style={s.totalValue}>{fmt(totalCgst)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>SGST</Text>
                <Text style={s.totalValue}>{fmt(totalSgst)}</Text>
              </View>
              {Number(quotation.discount_amount) > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Discount</Text>
                  <Text style={[s.totalValue, { color: C.green }]}>
                    − {fmt(Number(quotation.discount_amount))}
                  </Text>
                </View>
              )}
              <View style={s.divider} />
              <View style={s.totalFinalRow}>
                <Text style={s.totalFinalLabel}>Total Amount</Text>
                <Text style={s.totalFinalValue}>{fmt(Number(quotation.grand_total))}</Text>
              </View>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={s.wordsBox}>
            <Text style={s.wordsLabel}>Amount in Words</Text>
            <Text style={s.wordsValue}>{amountToWords(Number(quotation.grand_total))}</Text>
          </View>

          {/* Notes */}
          {quotation.notes ? (
            <View style={s.noteBlock}>
              <Text style={s.noteLabel}>Notes</Text>
              <Text style={s.noteText}>{quotation.notes}</Text>
            </View>
          ) : null}

          {/* Terms */}
          {quotation.terms ? (
            <View style={s.noteBlock}>
              <Text style={s.noteLabel}>Terms & Conditions</Text>
              <Text style={s.noteText}>{quotation.terms}</Text>
            </View>
          ) : null}

          {/* Bank Details */}
          {docSettings?.bank_account_number ? (
            <View style={s.noteBlock}>
              <View style={s.divider} />
              <Text style={[s.noteLabel, { marginTop: 10, marginBottom: 6 }]}>Bank Details</Text>
              <View style={s.bankGrid}>
                {docSettings.bank_account_name && (
                  <View style={s.bankItem}>
                    <Text style={s.bankLabel}>Account Name</Text>
                    <Text style={s.bankValue}>{docSettings.bank_account_name}</Text>
                  </View>
                )}
                {docSettings.bank_name && (
                  <View style={s.bankItem}>
                    <Text style={s.bankLabel}>Bank</Text>
                    <Text style={s.bankValue}>{docSettings.bank_name}</Text>
                  </View>
                )}
                {docSettings.bank_account_number && (
                  <View style={s.bankItem}>
                    <Text style={s.bankLabel}>Account Number</Text>
                    <Text style={s.bankValue}>{docSettings.bank_account_number}</Text>
                  </View>
                )}
                {docSettings.bank_ifsc && (
                  <View style={s.bankItem}>
                    <Text style={s.bankLabel}>IFSC</Text>
                    <Text style={s.bankValue}>{docSettings.bank_ifsc}</Text>
                  </View>
                )}
                {docSettings.bank_upi && (
                  <View style={s.bankItem}>
                    <Text style={s.bankLabel}>UPI</Text>
                    <Text style={s.bankValue}>{docSettings.bank_upi}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null}
        </View>

        {/* Page Number */}
        <Text
          style={s.pageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />

        {/* Fixed Footer — contact info */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerText}>+91 79848 41640  |  +91 79847 17501</Text>
            <Text style={s.footerText}>802 B Wing, Gopal Palace, Opp. Ocean Park, Nehru Nagar, Ahmedabad</Text>
          </View>
          <View style={s.footerRight}>
            <Text style={s.footerEmail}>shreedharsales056@gmail.com</Text>
            <Text style={s.footerCompany}>{companyName.toUpperCase()}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
