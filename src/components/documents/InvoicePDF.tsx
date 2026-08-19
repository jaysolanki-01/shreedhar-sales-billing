import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { amountToWords } from "@/lib/number-to-words";
import { CompanySettings, DocSettings, Invoice } from "@/types";
import path from "path";

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"),    fontWeight: 700 },
  ],
});

const C = {
  dark: "#2F1D13", brown: "#7E441C", gold: "#E6AE73", beige: "#F7F2EC",
  border: "#E0D5C9", muted: "#9A7B62", white: "#FFFFFF",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "PAYMENT PENDING", partially_paid: "PARTIALLY PAID",
  paid: "PAID", overdue: "OVERDUE",
};

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

const styles = StyleSheet.create({
  page: { fontFamily: "Roboto", backgroundColor: C.white, paddingBottom: 60 },
  header: { backgroundColor: C.dark, padding: 28, flexDirection: "row", justifyContent: "space-between" },
  companyName: { color: C.gold, fontSize: 14, fontFamily: "Roboto", fontWeight: 700, marginBottom: 4 },
  companyDetail: { color: "#FFFFFF99", fontSize: 8, marginBottom: 2 },
  content: { paddingHorizontal: 32, paddingTop: 24 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  docTitle: { color: C.dark, fontSize: 22, fontFamily: "Roboto", fontWeight: 700, letterSpacing: 1 },
  statusBadge: { backgroundColor: C.beige, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  statusText: { color: C.muted, fontSize: 9, fontFamily: "Roboto", fontWeight: 700 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 },
  metaLabel: { color: C.muted, fontSize: 8, marginRight: 6 },
  metaValue: { color: C.dark, fontSize: 9, fontFamily: "Roboto", fontWeight: 700 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  sectionLabel: { color: C.muted, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  billToName: { color: C.dark, fontSize: 11, fontFamily: "Roboto", fontWeight: 700, marginBottom: 2 },
  billToDetail: { color: C.muted, fontSize: 9, marginBottom: 1.5 },
  tableHeader: { backgroundColor: C.dark, flexDirection: "row", paddingVertical: 8 },
  tableHeaderCell: { color: C.gold, fontSize: 8, fontFamily: "Roboto", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 8 },
  tableRowAlt: { backgroundColor: C.beige },
  tableCell: { fontSize: 9, color: C.dark },
  colDesc: { flex: 3, paddingLeft: 10 },
  colQty: { width: 50, textAlign: "right" },
  colRate: { width: 70, textAlign: "right" },
  colDisc: { width: 50, textAlign: "right" },
  colGst: { width: 50, textAlign: "right" },
  colAmt: { width: 75, paddingRight: 10, textAlign: "right" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalsLabel: { width: 130, textAlign: "right", color: C.muted, fontSize: 9 },
  totalsValue: { width: 90, textAlign: "right", color: C.dark, fontSize: 9 },
  grandTotalBox: { backgroundColor: C.beige, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  grandTotalLabel: { color: C.dark, fontSize: 10, fontFamily: "Roboto", fontWeight: 700 },
  grandTotalValue: { color: C.brown, fontSize: 14, fontFamily: "Roboto", fontWeight: 700 },
  amountWords: { backgroundColor: C.beige, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, marginBottom: 16 },
  amountWordsLabel: { color: C.muted, fontSize: 7.5 },
  amountWordsValue: { color: C.dark, fontSize: 9.5, fontFamily: "Roboto", fontWeight: 700, marginTop: 2 },
  smallLabel: { color: C.muted, fontSize: 7.5, fontFamily: "Roboto", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  smallText: { color: C.dark, fontSize: 8.5 },
  bankGrid: { flexDirection: "row", flexWrap: "wrap" },
  bankItem: { width: "50%", marginBottom: 3 },
  bankLabel: { color: C.muted, fontSize: 7.5 },
  bankValue: { color: C.dark, fontSize: 8.5, fontFamily: "Roboto", fontWeight: 700 },
  footer: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 20, paddingTop: 12, alignItems: "center" },
  footerText: { color: C.muted, fontSize: 8 },
  footerBrand: { color: C.dark, fontSize: 9, fontFamily: "Roboto", fontWeight: 700, marginTop: 2 },
  pageNumber: { position: "absolute", bottom: 20, right: 32, color: C.muted, fontSize: 8 },
  paidStamp: { borderWidth: 2, borderColor: "#276A3A", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  paidStampText: { color: "#276A3A", fontSize: 9, fontFamily: "Roboto", fontWeight: 700 },
});

interface Props {
  invoice: Invoice & { invoice_items: any[]; customers: any };
  company: CompanySettings | null;
  docSettings: DocSettings | null;
  logoBase64?: string | null;
}

export function InvoicePDF({ invoice, company, docSettings }: Props) {
  const customer = invoice.customers;
  const items = invoice.invoice_items ?? [];
  const hasBankDetails = docSettings?.bank_account_number;

  return (
    <Document title={invoice.invoice_number} author={company?.company_name ?? "Shreedhar Sales"}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{company?.company_name ?? "SHREEDHAR SALES"}</Text>
            {company?.address && <Text style={styles.companyDetail}>{company.address}</Text>}
            {company?.phone && <Text style={styles.companyDetail}>{company.phone}</Text>}
            {company?.email && <Text style={styles.companyDetail}>{company.email}</Text>}
            {company?.gstin && <Text style={styles.companyDetail}>GSTIN: {company.gstin}</Text>}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.docTitle}>INVOICE</Text>
              {invoice.payment_status === "paid" ? (
                <View style={styles.paidStamp}><Text style={styles.paidStampText}>✓ PAID</Text></View>
              ) : (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{STATUS_LABELS[invoice.payment_status] ?? invoice.payment_status.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice No:</Text>
                <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>{fmtDate(invoice.date)}</Text>
              </View>
              {invoice.due_date && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Due Date:</Text>
                  <Text style={styles.metaValue}>{fmtDate(invoice.due_date)}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.billToName}>{customer?.name}</Text>
            {customer?.company_name && <Text style={styles.billToDetail}>{customer.company_name}</Text>}
            {customer?.address && <Text style={styles.billToDetail}>{customer.address}</Text>}
            {customer?.phone && <Text style={styles.billToDetail}>{customer.phone}</Text>}
            {customer?.gstin && <Text style={styles.billToDetail}>GSTIN: {customer.gstin}</Text>}
          </View>

          <View style={styles.divider} />

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
              <Text style={[styles.tableCell, styles.colAmt, { fontFamily: "Roboto", fontWeight: 700 }]}>{fmt(Number(item.amount))}</Text>
            </View>
          ))}

          <View style={{ marginTop: 16, alignItems: "flex-end" }}>
            <View style={{ width: 240 }}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>{fmt(Number(invoice.subtotal))}</Text>
              </View>
              {Number(invoice.discount_amount) > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Discount</Text>
                  <Text style={styles.totalsValue}>-{fmt(Number(invoice.discount_amount))}</Text>
                </View>
              )}
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>GST</Text>
                <Text style={styles.totalsValue}>{fmt(Number(invoice.gst_amount))}</Text>
              </View>
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>TOTAL</Text>
                <Text style={styles.grandTotalValue}>{fmt(Number(invoice.grand_total))}</Text>
              </View>
              {Number(invoice.amount_paid) > 0 && (
                <>
                  <View style={[styles.totalsRow, { marginTop: 6 }]}>
                    <Text style={styles.totalsLabel}>Amount Paid</Text>
                    <Text style={styles.totalsValue}>{fmt(Number(invoice.amount_paid))}</Text>
                  </View>
                  <View style={styles.totalsRow}>
                    <Text style={[styles.totalsLabel, { fontFamily: "Roboto", fontWeight: 700 }]}>Balance Due</Text>
                    <Text style={[styles.totalsValue, { fontFamily: "Roboto", fontWeight: 700, color: "#9A6800" }]}>{fmt(Number(invoice.balance_due))}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.amountWords}>
            <Text style={styles.amountWordsLabel}>Amount in Words</Text>
            <Text style={styles.amountWordsValue}>{amountToWords(Number(invoice.grand_total))}</Text>
          </View>

          {invoice.notes ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.smallLabel}>Notes</Text>
              <Text style={styles.smallText}>{invoice.notes}</Text>
            </View>
          ) : null}

          {invoice.terms ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.smallLabel}>Terms & Conditions</Text>
              <Text style={styles.smallText}>{invoice.terms}</Text>
            </View>
          ) : null}

          {hasBankDetails && (
            <View style={{ marginBottom: 12 }}>
              <View style={styles.divider} />
              <Text style={styles.smallLabel}>Bank Details</Text>
              <View style={styles.bankGrid}>
                {docSettings?.bank_account_name && <View style={styles.bankItem}><Text style={styles.bankLabel}>Account Name</Text><Text style={styles.bankValue}>{docSettings.bank_account_name}</Text></View>}
                {docSettings?.bank_name && <View style={styles.bankItem}><Text style={styles.bankLabel}>Bank</Text><Text style={styles.bankValue}>{docSettings.bank_name}</Text></View>}
                {docSettings?.bank_account_number && <View style={styles.bankItem}><Text style={styles.bankLabel}>Account Number</Text><Text style={styles.bankValue}>{docSettings.bank_account_number}</Text></View>}
                {docSettings?.bank_ifsc && <View style={styles.bankItem}><Text style={styles.bankLabel}>IFSC</Text><Text style={styles.bankValue}>{docSettings.bank_ifsc}</Text></View>}
                {docSettings?.bank_upi && <View style={styles.bankItem}><Text style={styles.bankLabel}>UPI</Text><Text style={styles.bankValue}>{docSettings.bank_upi}</Text></View>}
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your business.</Text>
            <Text style={styles.footerBrand}>{company?.company_name?.toUpperCase() ?? "SHREEDHAR SALES"}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}
