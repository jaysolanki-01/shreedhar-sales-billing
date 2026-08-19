"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Quotation, CompanySettings, DocSettings, QuotationStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuotationStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Printer, Edit2, RefreshCw, FileCheck, MessageCircle } from "lucide-react";
import { amountToWords } from "@/lib/number-to-words";

interface Props {
  quotation: Quotation & { quotation_items: any[] };
  company: CompanySettings | null;
  docSettings: DocSettings | null;
  userId: string;
}

export function QuotationDetailContent({ quotation: initial, company, docSettings, userId }: Props) {
  const [quotation, setQuotation] = useState(initial);
  const [converting, setConverting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(status: QuotationStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("quotations").update({ status }).eq("id", quotation.id);
    if (error) { toast.error("Failed to update status"); return; }
    setQuotation((q) => ({ ...q, status }));
    toast.success(`Status updated to ${status}`);
  }

  async function convertToInvoice() {
    setConverting(true);
    const supabase = createClient();
    try {
      const { data: numData, error: numErr } = await supabase.rpc("get_next_doc_number", {
        p_user_id: userId,
        p_type: "invoice",
      });
      if (numErr) throw numErr;

      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          customer_id: quotation.customer_id,
          quotation_id: quotation.id,
          invoice_number: numData,
          date: new Date().toISOString().split("T")[0],
          due_date: docSettings?.inv_payment_days
            ? new Date(Date.now() + docSettings.inv_payment_days * 86400000).toISOString().split("T")[0]
            : null,
          notes: quotation.notes,
          terms: docSettings?.inv_terms ?? quotation.terms,
        })
        .select()
        .single();
      if (invErr) throw invErr;

      // Copy items
      const items = quotation.quotation_items.map((item: any, idx: number) => ({
        invoice_id: inv.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount_percent: item.discount_percent,
        gst_percent: item.gst_percent,
        sort_order: idx,
      }));
      const { error: itemErr } = await supabase.from("invoice_items").insert(items);
      if (itemErr) throw itemErr;

      // Mark quotation as accepted
      await supabase.from("quotations").update({ status: "accepted" }).eq("id", quotation.id);

      toast.success(`Invoice ${numData} created!`);
      router.push(`/invoices/${inv.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to convert to invoice");
    } finally {
      setConverting(false);
    }
  }

  const customer = quotation.customers as any;

  function openWhatsApp() {
    const phone = customer?.phone;
    if (!phone) return;
    // Strip non-digits, prepend 91 (India) if not already an international number
    const digits = phone.replace(/\D/g, "");
    const wa = digits.startsWith("91") && digits.length >= 12 ? digits : `91${digits}`;
    const msg = encodeURIComponent(
      `Hi ${customer?.name ?? ""},\n\nPlease find your quotation *${quotation.quotation_number}* for *${formatCurrency(Number(quotation.grand_total))}* from ${company?.company_name ?? "Shreedhar Sales"}.\n\nValid until: ${formatDate(quotation.valid_until)}\n\nThank you!`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/quotations">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          <Select
            value={quotation.status}
            onValueChange={(v) => updateStatus(v as QuotationStatus)}
          >
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </Select>

          <Link href={`/quotations/${quotation.id}/edit`}>
            <Button variant="outline" size="md"><Edit2 className="h-4 w-4" />Edit</Button>
          </Link>

          {customer?.phone && (
            <Button
              variant="outline"
              size="md"
              onClick={openWhatsApp}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" />WhatsApp
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            loading={pdfLoading}
            onClick={async () => {
              setPdfLoading(true);
              window.open(`/api/pdf/quotation/${quotation.id}`, "_blank");
              setTimeout(() => setPdfLoading(false), 4000);
            }}
          >
            <Download className="h-4 w-4" />{pdfLoading ? "Generating…" : "PDF"}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={convertToInvoice}
            loading={converting}
          >
            <FileCheck className="h-4 w-4" />
            Convert to Invoice
          </Button>
        </div>
      </div>

      {/* Document Preview */}
      <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1740] px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div>
              <div className="w-12 h-12 rounded-lg bg-amber-400 flex items-center justify-center mb-2 overflow-hidden">
                <img src="/logo.png" alt="SS" className="w-full h-full object-contain" onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-[#1A1740] font-bold text-sm">SS</span>';
                }} />
              </div>
              <h2 className="text-lg font-bold text-white">
                {company?.company_name ?? "Shreedhar Sales"}
              </h2>
            </div>
            <div className="text-xs text-white/60 space-y-0.5 sm:text-right">
              {company?.address && <p>{company.address}</p>}
              {company?.phone && <p>{company.phone}</p>}
              {company?.email && <p>{company.email}</p>}
              {company?.gstin && <p>GSTIN: {company.gstin}</p>}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-6">
          {/* Title + Meta */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark tracking-wide">QUOTATION</h1>
            </div>
            <div className="text-sm space-y-1 sm:text-right">
              <p><span className="text-brand-muted">Quotation No:</span> <span className="font-semibold text-brand-dark">{quotation.quotation_number}</span></p>
              <p><span className="text-brand-muted">Date:</span> <span className="text-brand-dark">{formatDate(quotation.date)}</span></p>
              <p><span className="text-brand-muted">Valid Until:</span> <span className="text-brand-dark">{formatDate(quotation.valid_until)}</span></p>
            </div>
          </div>

          {/* Bill To */}
          <div className="border-t border-brand-border pt-4">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Bill To</p>
            <p className="font-semibold text-brand-dark">{customer?.name}</p>
            {customer?.company_name && <p className="text-sm text-brand-muted">{customer.company_name}</p>}
            {customer?.address && <p className="text-sm text-brand-muted">{customer.address}</p>}
            {customer?.phone && <p className="text-sm text-brand-muted">{customer.phone}</p>}
            {customer?.gstin && <p className="text-sm text-brand-muted">GSTIN: {customer.gstin}</p>}
          </div>

          {/* Items Table */}
          <div className="border border-brand-border rounded-lg overflow-hidden">
            {/* Mobile: card per item */}
            <div className="sm:hidden">
              <div className="bg-[#1A1740] px-4 py-2.5 text-xs font-semibold text-amber-300 uppercase tracking-wide">Items</div>
              <div className="divide-y divide-brand-border">
                {quotation.quotation_items.map((item: any) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm font-medium text-brand-dark flex-1">{item.description}</p>
                      <p className="text-sm font-bold text-brand-dark whitespace-nowrap">{formatCurrency(Number(item.amount))}</p>
                    </div>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {item.quantity} × {formatCurrency(Number(item.rate))}
                      {Number(item.gst_percent) > 0 ? ` · GST ${item.gst_percent}%` : ""}
                      {Number(item.discount_percent) > 0 ? ` · Disc ${item.discount_percent}%` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: full table */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1fr_1.5fr] bg-[#1A1740] text-amber-300 text-xs font-semibold uppercase tracking-wide">
                <div className="px-4 py-3">Description</div>
                <div className="px-3 py-3 text-right">Qty</div>
                <div className="px-3 py-3 text-right">Rate</div>
                <div className="px-3 py-3 text-right">Disc %</div>
                <div className="px-3 py-3 text-right">GST %</div>
                <div className="px-4 py-3 text-right">Amount</div>
              </div>
              <div className="divide-y divide-brand-border">
                {quotation.quotation_items.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1fr_1.5fr] items-center">
                    <div className="px-4 py-3"><p className="text-sm text-brand-dark">{item.description}</p></div>
                    <div className="px-3 py-3 text-right text-sm text-brand-dark">{item.quantity}</div>
                    <div className="px-3 py-3 text-right text-sm text-brand-dark">{formatCurrency(Number(item.rate))}</div>
                    <div className="px-3 py-3 text-right text-sm text-brand-muted">{item.discount_percent}%</div>
                    <div className="px-3 py-3 text-right text-sm text-brand-muted">{item.gst_percent}%</div>
                    <div className="px-4 py-3 text-right text-sm font-semibold text-brand-dark">{formatCurrency(Number(item.amount))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <TotalLine label="Subtotal" value={formatCurrency(Number(quotation.subtotal))} />
              {Number(quotation.discount_amount) > 0 && (
                <TotalLine label="Discount" value={`-${formatCurrency(Number(quotation.discount_amount))}`} />
              )}
              {Number(quotation.discount_amount) > 0 && (
                <TotalLine label="Taxable Amount" value={formatCurrency(Number(quotation.taxable_amount))} />
              )}
              <TotalLine label="GST" value={formatCurrency(Number(quotation.gst_amount))} />
              <div className="border-t border-brand-border-strong pt-3 flex items-center justify-between bg-brand-beige rounded-lg px-3 py-2">
                <span className="text-sm font-bold text-brand-dark">Grand Total</span>
                <span className="text-xl font-bold text-brand-brown">{formatCurrency(Number(quotation.grand_total))}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="bg-brand-beige rounded-lg px-4 py-3">
            <p className="text-xs text-brand-muted">Amount in Words</p>
            <p className="text-sm font-medium text-brand-dark mt-0.5">
              {amountToWords(Number(quotation.grand_total))}
            </p>
          </div>

          {/* Notes + Terms */}
          {quotation.notes && (
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-brand-dark whitespace-pre-line">{quotation.notes}</p>
            </div>
          )}
          {quotation.terms && (
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1">Terms & Conditions</p>
              <p className="text-sm text-brand-muted whitespace-pre-line">{quotation.terms}</p>
            </div>
          )}

          {/* Bank details */}
          {docSettings?.bank_account_number && (
            <div className="border-t border-brand-border pt-4">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Bank Details</p>
              <div className="text-sm text-brand-dark space-y-0.5">
                {docSettings.bank_account_name && <p><span className="text-brand-muted">Name:</span> {docSettings.bank_account_name}</p>}
                {docSettings.bank_name && <p><span className="text-brand-muted">Bank:</span> {docSettings.bank_name}</p>}
                {docSettings.bank_account_number && <p><span className="text-brand-muted">A/C:</span> {docSettings.bank_account_number}</p>}
                {docSettings.bank_ifsc && <p><span className="text-brand-muted">IFSC:</span> {docSettings.bank_ifsc}</p>}
                {docSettings.bank_upi && <p><span className="text-brand-muted">UPI:</span> {docSettings.bank_upi}</p>}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-brand-border pt-4 text-center text-xs text-brand-muted">
            <p>Thank you for your business.</p>
            <p className="font-semibold text-brand-dark mt-0.5">{company?.company_name ?? "SHREEDHAR SALES"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-brand-muted">{label}</span>
      <span className="text-sm text-brand-dark">{value}</span>
    </div>
  );
}
