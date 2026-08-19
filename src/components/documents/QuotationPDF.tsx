import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { amountToWords } from "@/lib/number-to-words";
import { CompanySettings, DocSettings, Quotation } from "@/types";

// Brand colors
const C = {
  dark: "#2F1D13",
  brown: "#7E441C",
  gold: "#E6AE73",
  beige: "#F7F2EC",
  beigeDark: "#EDE5D8",
  border: "#E0D5C9",
  muted: "#9A7B62",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: C.white, paddingBottom: 60 },
  // Header
  header: { backgroundColor: C.dark, padding: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  companyName: { color: C.gold, fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  companyDetail: { color: "#FFFFFF99", fontSize: 8, marginBottom: 2 },
  companyRight: { alignItems: "flex-end" },
  // Content
  content: { paddingHorizontal: 32, paddingTop: 24 },
  // Title row
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  docTitle: { color: C.dark, fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  statusBadge: { backgroundColor: C.beige, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  statusText: { color: C.muted, fontSize: 9, fontFamily: "Helvetica-Bold" },
  metaLabel: { color: C.muted, fontSize: 8 },
  metaValue: { color: C.dark, fontSize: 9, fontFamily: "Helvetica-Bold" },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 },
  // Bill To
  sectionLabel: { color: C.muted, fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  billToName: { color: C.dark, fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  billToDetail: { color: C.muted, fontSize: 9, marginBottom: 1.5 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  // Table
  tableHeader: { backgroundColor: C.dark, flexDirection: "row", paddingVertical: 8 },
  tableHeaderCell: { color: C.gold, fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 8 },
  tableRowAlt: { backgroundColor: C.beige },
  tableCell: { fontSize: 9, color: C.dark },
  // Cols
  colDesc: { flex: 3, paddingLeft: 10 },
  colQty: { width: 50, textAlign: "right" },
  colRate: { width: 70, textAlign: "right" },
  colDisc: { width: 50, textAlign: "right" },
  colGst: { width: 50, textAlign: "right" },
  colAmt: { width: 75, paddingRight: 10, textAlign: "right" },
  // Totals
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalsLabel: { width: 130, textAlign: "right", color: C.muted, fontSize: 9 },
  totalsValue: { width: 90, textAlign: "right", color: C.dark, fontSize: 9 },
  grandTotalBox: { backgroundColor: C.beige, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  grandTotalLabel: { color: C.dark, fontSize: 10, fontFamily: "Helvetica-Bold" },
  grandTotalValue: { color: C.brown, fontSize: 14, fontFamily: "Helvetica-Bold" },
  // Amount in words
  amountWords: { backgroundColor: C.beige, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, marginBottom: 16 },
  amountWordsLabel: { color: C.muted, fontSize: 7.5 },
  amountWordsValue: { color: C.dark, fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 2 },
  // Notes / Terms
  smallLabel: { color: C.muted, fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  smallText: { color: C.dark, fontSize: 8.5 },
  // Bank
  bankGrid: { flexDirection: "row", flexWrap: "wrap" },
  bankItem: { width: "50%", marginBottom: 3 },
  bankLabel: { color: C.muted, fontSize: 7.5 },
  bankValue: { color: C.dark, fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  // Footer
  footer: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 20, paddingTop: 12, alignItems: "center" },
  footerText: { color: C.muted, fontSize: 8 },
  footerBrand: { color: C.dark, fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 2 },
  pageNumber: { position: "absolute", bottom: 20, right: 32, color: C.muted, fontSize: 8 },
});

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  draft: "DRAFT", sent: "SENT", accepted: "ACCEPTED", rejected: "REJECTED", expired: "EXPIRED"
};

interface Props {
  quotation: Quotation & { quotation_items: any[]; customers: any };
  company: CompanySettings | null;
  docSettings: DocSettings | null;
}

export function QuotationPDF({ quotation, company, docSettings }: Props) {
  const customer = quotation.customers;
  const items = quotation.quotation_items ?? [];
  const hasBankDetails = docSettings?.bank_account_number;

  return (
    <Document title={quotation.quotation_number} author={company?.company_name ?? "Shreedhar Sales"}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{company?.company_name ?? "SHREEDHAR SALES"}</Text>
            {company?.address && <Text style={styles.companyDetail}>{company.address}</Text>}
            {company?.phone && <Text style={styles.companyDetail}>{company.phone}</Text>}
            {company?.email && <Text style={styles.companyDetail}>{company.email}</Text>}
            {company?.gstin && <Text style={styles.companyDetail}>GSTIN: {company.gstin}</Text>}
          </View>
          <View style={styles.companyRight}>
            <Text style={[styles.companyDetail, { textAlign: "right" }]}>Professional Billing</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title + Meta */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.docTitle}>QUOTATION</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{STATUS_LABELS[quotation.status] ?? quotation.status.toUpperCase()}</Text>
              </View>
            </View>
            <View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { marginRight: 6 }]}>Quotation No:</Text>
                <Text style={styles.metaValue}>{quotation.quotation_number}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { marginRight: 6 }]}>Date:</Text>
                <Text style={styles.metaValue}>{fmtDate(quotation.date)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { marginRight: 6 }]}>Valid Until:</Text>
                <Text style={styles.metaValue}>{fmtDate(quotation.valid_until)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bill To */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.billToName}>{customer?.name}</Text>
            {customer?.company_name && <Text style={styles.billToDetail}>{customer.company_name}</Text>}
            {customer?.address && <Text style={styles.billToDetail}>{customer.address}</Text>}
            {customer?.phone && <Text style={styles.billToDetail}>{customer.phone}</Text>}
            {customer?.gstin && <Text style={styles.billToDetail}>GSTIN: {customer.gstin}</Text>}
          </View>

          <View style={styles.divider} />

          {/* Items Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colDisc]}>Disc%</Text>
            <Text style={[styles.tableHeaderCell, styles.colGst]}>GST%</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmt]}>Amount</Text>
          </View>

          {items.map((item: any, idx: number) => (
            <View key={item.id ?? idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(Number(item.rate))}</Text>
              <Text style={[styles.tableCell, styles.colDisc]}>{item.discount_percent}%</Text>
              <Text style={[styles.tableCell, styles.colGst]}>{item.gst_percent}%</Text>
              <Text style={[styles.tableCell, styles.colAmt, { fontFamily: "Helvetica-Bold" }]}>{fmt(Number(item.amount))}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={{ marginTop: 16, alignItems: "flex-end" }}>
            <View style={{ width: 240 }}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>{fmt(Number(quotation.subtotal))}</Text>
              </View>
              {Number(quotation.discount_amount) > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Discount</Text>
                  <Text style={styles.totalsValue}>-{fmt(Number(quotation.discount_amount))}</Text>
                </View>
              )}
              {Number(quotation.discount_amount) > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Taxable Amount</Text>
                  <Text style={styles.totalsValue}>{fmt(Number(quotation.taxable_amount))}</Text>
                </View>
              )}
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>GST</Text>
                <Text style={styles.totalsValue}>{fmt(Number(quotation.gst_amount))}</Text>
              </View>
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>TOTAL</Text>
                <Text style={styles.grandTotalValue}>{fmt(Number(quotation.grand_total))}</Text>
              </View>
            </View>
          </View>

          {/* Amount in words */}
          <View style={styles.amountWords}>
            <Text style={styles.amountWordsLabel}>Amount in Words</Text>
            <Text style={styles.amountWordsValue}>{amountToWords(Number(quotation.grand_total))}</Text>
          </View>

          {/* Notes */}
          {quotation.notes ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.smallLabel}>Notes</Text>
              <Text style={styles.smallText}>{quotation.notes}</Text>
            </View>
          ) : null}

          {/* Terms */}
          {quotation.terms ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.smallLabel}>Terms & Conditions</Text>
              <Text style={styles.smallText}>{quotation.terms}</Text>
            </View>
          ) : null}

          {/* Bank Details */}
          {hasBankDetails && (
            <View style={{ marginBottom: 12 }}>
              <View style={styles.divider} />
              <Text style={styles.smallLabel}>Bank Details</Text>
              <View style={styles.bankGrid}>
                {docSettings?.bank_account_name && (
                  <View style={styles.bankItem}>
                    <Text style={styles.bankLabel}>Account Name</Text>
                    <Text style={styles.bankValue}>{docSettings.bank_account_name}</Text>
                  </View>
                )}
                {docSettings?.bank_name && (
                  <View style={styles.bankItem}>
                    <Text style={styles.bankLabel}>Bank</Text>
                    <Text style={styles.bankValue}>{docSettings.bank_name}</Text>
                  </View>
                )}
                {docSettings?.bank_account_number && (
                  <View style={styles.bankItem}>
                    <Text style={styles.bankLabel}>Account Number</Text>
                    <Text style={styles.bankValue}>{docSettings.bank_account_number}</Text>
                  </View>
                )}
                {docSettings?.bank_ifsc && (
                  <View style={styles.bankItem}>
                    <Text style={styles.bankLabel}>IFSC</Text>
                    <Text style={styles.bankValue}>{docSettings.bank_ifsc}</Text>
                  </View>
                )}
                {docSettings?.bank_upi && (
                  <View style={styles.bankItem}>
                    <Text style={styles.bankLabel}>UPI</Text>
                    <Text style={styles.bankValue}>{docSettings.bank_upi}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your business.</Text>
            <Text style={styles.footerBrand}>{company?.company_name?.toUpperCase() ?? "SHREEDHAR SALES"}</Text>
          </View>
        </View>

        {/* Page number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
