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
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: C.white,
    paddingBottom: 48,
    fontSize: 9,
    color: C.navy,
  },

  // ── Top accent stripe ──
  stripe: { height: 4, backgroundColor: C.indigo },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoBox: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: C.indigoL,
    alignItems: "center", justifyContent: "center",
    marginBottom: 6,
    overflow: "hidden",
  },
  logoImg: { width: 44, height: 44, objectFit: "contain" },
  logoText: { color: C.indigo, fontSize: 16, fontFamily: "Roboto", fontWeight: 700 },
  companyName: { color: C.navy, fontSize: 13, fontFamily: "Roboto", fontWeight: 700, marginBottom: 3 },
  companyLine: { color: C.slate, fontSize: 8, marginBottom: 1.5, lineHeight: 1.4 },
  headerRight: { alignItems: "flex-end" },
  docBadge: {
    backgroundColor: C.indigoL, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  docBadgeText: { color: C.indigo, fontSize: 8, fontFamily: "Roboto", fontWeight: 700, letterSpacing: 1 },

  // ── Body ──
  body: { paddingHorizontal: 36, paddingTop: 22 },

  // ── Meta grid (Quotation No / Date / Valid Until) ──
  metaRow: { flexDirection: "row", marginBottom: 3, justifyContent: "flex-end" },
  metaLabel: { color: C.muted, fontSize: 8, width: 68, textAlign: "right", marginRight: 6 },
  metaValue: { color: C.navy, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700, textAlign: "right", minWidth: 90 },

  // ── Bill To / From two-col ──
  twoCol: { flexDirection: "row", marginBottom: 20, gap: 20 },
  colBlock: { flex: 1 },
  sectionLabel: {
    color: C.indigo, fontSize: 7, fontFamily: "Roboto", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6,
    borderBottomWidth: 1, borderBottomColor: C.indigoL, paddingBottom: 4,
  },
  contactName: { color: C.navy, fontSize: 10, fontFamily: "Roboto", fontWeight: 700, marginBottom: 2 },
  contactLine: { color: C.slate, fontSize: 8, marginBottom: 1.5, lineHeight: 1.4 },

  // ── Status badge ──
  statusBadge: {
    backgroundColor: C.bg, borderRadius: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: "flex-start", marginTop: 4,
  },
  statusText: { color: C.slate, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Table ──
  tableWrap: { borderRadius: 6, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  tableHead: { backgroundColor: C.navy, flexDirection: "row", paddingVertical: 9 },
  tableHeadCell: { color: C.white, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.bg },
  tableCell: { fontSize: 8.5, color: C.navy },
  tableCellMuted: { fontSize: 8.5, color: C.slate },

  colDesc: { flex: 3, paddingLeft: 12 },
  colQty:  { width: 42, textAlign: "right" },
  colRate: { width: 66, textAlign: "right" },
  colDisc: { width: 44, textAlign: "right" },
  colGst:  { width: 44, textAlign: "right" },
  colAmt:  { width: 72, paddingRight: 12, textAlign: "right" },

  // ── Totals ──
  totalsWrap: { alignItems: "flex-end", marginBottom: 16 },
  totalsBox: { width: 230 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { color: C.slate, fontSize: 8.5 },
  totalValue: { color: C.navy, fontSize: 8.5 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 6 },
  grandRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: C.navy, borderRadius: 5,
    paddingHorizontal: 12, paddingVertical: 9, marginTop: 6,
  },
  grandLabel: { color: C.white, fontSize: 9, fontFamily: "Roboto", fontWeight: 700, letterSpacing: 0.5 },
  grandValue: { color: "#A5B4FC", fontSize: 13, fontFamily: "Roboto", fontWeight: 700 },

  // ── Amount in words ──
  wordsBox: {
    backgroundColor: C.bg, borderRadius: 5, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16,
  },
  wordsLabel: { color: C.muted, fontSize: 7, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  wordsValue: { color: C.navy, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Notes / Terms ──
  noteLabel: { color: C.indigo, fontSize: 7, fontFamily: "Roboto", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  noteText: { color: C.slate, fontSize: 8.5, lineHeight: 1.5 },
  noteBlock: { marginBottom: 12 },

  // ── Bank ──
  bankGrid: { flexDirection: "row", flexWrap: "wrap" },
  bankItem: { width: "50%", marginBottom: 5 },
  bankLabel: { color: C.muted, fontSize: 7 },
  bankValue: { color: C.navy, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700 },

  // ── Footer ──
  footer: {
    borderTopWidth: 1, borderTopColor: C.border,
    marginTop: 20, paddingTop: 12, paddingHorizontal: 36,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerLeft: { color: C.muted, fontSize: 7.5 },
  footerRight: { color: C.indigo, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700 },

  pageNum: { position: "absolute", bottom: 16, right: 36, color: C.muted, fontSize: 7.5 },
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
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

  return (
    <Document title={quotation.quotation_number} author={companyName}>
      <Page size="A4" style={s.page} wrap>

        {/* Top indigo stripe */}
        <View style={s.stripe} />

        {/* Header */}
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
            {company?.phone && <Text style={s.companyLine}>{company.phone}</Text>}
            {company?.email && <Text style={s.companyLine}>{company.email}</Text>}
            {company?.gstin && <Text style={s.companyLine}>GSTIN: {company.gstin}</Text>}
          </View>

          {/* Right — Doc type + meta */}
          <View style={s.headerRight}>
            <View style={s.docBadge}>
              <Text style={s.docBadgeText}>QUOTATION</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Quotation No</Text>
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
            {/* Status */}
            <View style={[s.statusBadge, { backgroundColor: statusColor + "18", marginTop: 8 }]}>
              <Text style={[s.statusText, { color: statusColor }]}>{quotation.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>

          {/* Bill To / From */}
          <View style={s.twoCol}>
            <View style={s.colBlock}>
              <Text style={s.sectionLabel}>Bill To</Text>
              <Text style={s.contactName}>{customer?.name ?? "—"}</Text>
              {customer?.company_name && <Text style={s.contactLine}>{customer.company_name}</Text>}
              {customer?.address && <Text style={s.contactLine}>{customer.address}</Text>}
              {customer?.phone && <Text style={s.contactLine}>{customer.phone}</Text>}
              {customer?.email && <Text style={s.contactLine}>{customer.email}</Text>}
              {customer?.gstin && <Text style={s.contactLine}>GSTIN: {customer.gstin}</Text>}
            </View>
            <View style={s.colBlock}>
              <Text style={s.sectionLabel}>From</Text>
              <Text style={s.contactName}>{companyName}</Text>
              {company?.address && <Text style={s.contactLine}>{company.address}</Text>}
              {company?.phone && <Text style={s.contactLine}>{company.phone}</Text>}
              {company?.gstin && <Text style={s.contactLine}>GSTIN: {company.gstin}</Text>}
            </View>
          </View>

          {/* Items Table */}
          <View style={s.tableWrap}>
            <View style={s.tableHead}>
              <Text style={[s.tableHeadCell, s.colDesc]}>Description</Text>
              <Text style={[s.tableHeadCell, s.colQty]}>Qty</Text>
              <Text style={[s.tableHeadCell, s.colRate]}>Rate</Text>
              <Text style={[s.tableHeadCell, s.colDisc]}>Disc%</Text>
              <Text style={[s.tableHeadCell, s.colGst]}>GST%</Text>
              <Text style={[s.tableHeadCell, s.colAmt]}>Amount</Text>
            </View>
            {items.map((item: any, idx: number) => (
              <View key={item.id ?? idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}, idx === items.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
                <View style={[s.colDesc, { flexDirection: "column" }]}>
                  <Text style={s.tableCell}>{item.description}</Text>
                  {item.notes ? <Text style={[s.tableCellMuted, { fontSize: 7.5, marginTop: 1 }]}>{item.notes}</Text> : null}
                </View>
                <Text style={[s.tableCellMuted, s.colQty]}>{item.quantity}</Text>
                <Text style={[s.tableCellMuted, s.colRate]}>{fmt(Number(item.rate))}</Text>
                <Text style={[s.tableCellMuted, s.colDisc]}>{item.discount_percent ?? 0}%</Text>
                <Text style={[s.tableCellMuted, s.colGst]}>{item.gst_percent ?? 0}%</Text>
                <Text style={[s.tableCell, s.colAmt, { fontFamily: "Roboto", fontWeight: 700 }]}>{fmt(Number(item.amount))}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={s.totalsWrap}>
            <View style={s.totalsBox}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal</Text>
                <Text style={s.totalValue}>{fmt(Number(quotation.subtotal))}</Text>
              </View>
              {Number(quotation.discount_amount) > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Discount</Text>
                  <Text style={[s.totalValue, { color: C.green }]}>− {fmt(Number(quotation.discount_amount))}</Text>
                </View>
              )}
              {Number(quotation.discount_amount) > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Taxable Amount</Text>
                  <Text style={s.totalValue}>{fmt(Number(quotation.taxable_amount))}</Text>
                </View>
              )}
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>GST</Text>
                <Text style={s.totalValue}>{fmt(Number(quotation.gst_amount))}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.grandRow}>
                <Text style={s.grandLabel}>TOTAL AMOUNT</Text>
                <Text style={s.grandValue}>{fmt(Number(quotation.grand_total))}</Text>
              </View>
            </View>
          </View>

          {/* Amount in words */}
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
              <Text style={[s.noteLabel, { marginTop: 12 }]}>Bank Details</Text>
              <View style={s.bankGrid}>
                {docSettings.bank_account_name && (
                  <View style={s.bankItem}><Text style={s.bankLabel}>Account Name</Text><Text style={s.bankValue}>{docSettings.bank_account_name}</Text></View>
                )}
                {docSettings.bank_name && (
                  <View style={s.bankItem}><Text style={s.bankLabel}>Bank</Text><Text style={s.bankValue}>{docSettings.bank_name}</Text></View>
                )}
                {docSettings.bank_account_number && (
                  <View style={s.bankItem}><Text style={s.bankLabel}>Account Number</Text><Text style={s.bankValue}>{docSettings.bank_account_number}</Text></View>
                )}
                {docSettings.bank_ifsc && (
                  <View style={s.bankItem}><Text style={s.bankLabel}>IFSC</Text><Text style={s.bankValue}>{docSettings.bank_ifsc}</Text></View>
                )}
                {docSettings.bank_upi && (
                  <View style={s.bankItem}><Text style={s.bankLabel}>UPI</Text><Text style={s.bankValue}>{docSettings.bank_upi}</Text></View>
                )}
              </View>
            </View>
          ) : null}

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerLeft}>Thank you for your business.</Text>
            <Text style={s.footerRight}>{companyName.toUpperCase()}</Text>
          </View>
        </View>

        {/* Page number */}
        <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />

      </Page>
    </Document>
  );
}
