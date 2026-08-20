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
import { ArrowLeft, Download, Printer, Edit2, RefreshCw, FileCheck, MessageCircle, Trash2 } from "lucide-react";
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
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
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
          prepared_by: quotation.prepared_by,
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

  async function deleteQuotation() {
    setDeleting(true);
    const supabase = createClient();
    try {
      await supabase.from("quotation_items").delete().eq("quotation_id", quotation.id);
      const { error } = await supabase.from("quotations").delete().eq("id", quotation.id);
      if (error) throw error;
      toast.success("Quotation deleted");
      router.push("/quotations");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete");
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  async function openWhatsApp() {
    const phone = customer?.phone;
    if (!phone) return;

    const pdfUrl = `/api/pdf/quotation/${quotation.id}`;
    const filename = `${quotation.quotation_number}.pdf`;

    // On mobile: try sharing the actual PDF file via native share sheet
    if (typeof navigator.share === "function") {
      try {
        setSharing(true);
        const res = await fetch(pdfUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Quotation ${quotation.quotation_number}`,
            text: `Hi ${customer?.name ?? ""},\n\nPlease find your quotation *${quotation.quotation_number}* for *${formatCurrency(Number(quotation.grand_total))}* from ${company?.company_name ?? "Shreedhar Sales"}.\n\nValid until: ${formatDate(quotation.valid_until)}\n\nThank you!`,
          });
          setSharing(false);
          return;
        }
      } catch {
        // user cancelled or share failed — fall through
      } finally {
        setSharing(false);
      }
    }

    // Desktop fallback: WhatsApp text message with link
    const digits = phone.replace(/\D/g, "");
    const wa = digits.startsWith("91") && digits.length >= 12 ? digits : `91${digits}`;
    const pdfLink = `${window.location.origin}${pdfUrl}`;
    const text = `Hi ${customer?.name ?? ""},\n\nPlease find your quotation *${quotation.quotation_number}* for *${formatCurrency(Number(quotation.grand_total))}* from ${company?.company_name ?? "Shreedhar Sales"}.\n\n📄 Download PDF: ${pdfLink}\n\nValid until: ${formatDate(quotation.valid_until)}\n\nThank you!`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
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

          {deleteConfirm ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-600 font-medium">Delete?</span>
              <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(false)} className="text-xs">Cancel</Button>
              <Button size="sm" variant="outline" loading={deleting} onClick={deleteQuotation} className="border-red-300 text-red-600 hover:bg-red-50 text-xs">Yes, Delete</Button>
            </div>
          ) : (
            <Button variant="outline" size="md" onClick={() => setDeleteConfirm(true)} className="border-red-200 text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />Delete
            </Button>
          )}

          {customer?.phone && (
            <Button
              variant="outline"
              size="md"
              loading={sharing}
              onClick={openWhatsApp}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" />{sharing ? "Preparing…" : "WhatsApp"}
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

      {/* Document Preview — clean B&W */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Company header */}
        <div className="px-4 sm:px-8 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 w-16 object-contain flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div>
                <p className="text-base font-bold text-gray-900">{company?.company_name ?? "Shreedhar Sales"}</p>
                {company?.gstin && <p className="text-xs text-gray-500">GSTIN: {company.gstin}</p>}
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5 sm:text-right">
              {company?.address && <p>{company.address}</p>}
              {company?.phone && <p>{company.phone}</p>}
              {company?.email && <p>{company.email}</p>}
            </div>
          </div>
        </div>

        {/* Title bar */}
        <div className="px-4 sm:px-8 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-widest text-gray-900">QUOTATION</h1>
          <div className="text-sm space-y-0.5 sm:text-right">
            <p><span className="text-gray-400">No:</span> <span className="font-semibold text-gray-900">{quotation.quotation_number}</span></p>
            <p><span className="text-gray-400">Date:</span> <span className="text-gray-700">{formatDate(quotation.date)}</span></p>
            <p><span className="text-gray-400">Valid until:</span> <span className="text-gray-700">{formatDate(quotation.valid_until)}</span></p>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-6">

          {/* Bill To / From */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bill To</p>
              <p className="font-semibold text-gray-900">{customer?.name}</p>
              {customer?.company_name && <p className="text-sm text-gray-600">{customer.company_name}</p>}
              {customer?.address && <p className="text-sm text-gray-500">{customer.address}</p>}
              {customer?.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
              {customer?.gstin && <p className="text-sm text-gray-500">GSTIN: {customer.gstin}</p>}
            </div>
            {quotation.prepared_by && (
              <div className="sm:text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">From</p>
                <p className="text-sm font-semibold text-gray-900">{quotation.prepared_by}</p>
                <p className="text-sm text-gray-500">{company?.company_name ?? "Shreedhar Sales"}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Mobile: card per item */}
            <div className="sm:hidden">
              <div className="bg-gray-900 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-widest">Items</div>
              <div className="divide-y divide-gray-100">
                {quotation.quotation_items.map((item: any) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm font-medium text-gray-900 flex-1">{item.description}</p>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(Number(item.amount))}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
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
              <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1fr_1.5fr] bg-gray-900 text-white text-xs font-bold uppercase tracking-widest">
                <div className="px-4 py-3">Description</div>
                <div className="px-3 py-3 text-right">Qty</div>
                <div className="px-3 py-3 text-right">Rate</div>
                <div className="px-3 py-3 text-right">Disc %</div>
                <div className="px-3 py-3 text-right">GST %</div>
                <div className="px-4 py-3 text-right">Amount</div>
              </div>
              <div className="divide-y divide-gray-100">
                {quotation.quotation_items.map((item: any, idx: number) => (
                  <div key={item.id} className={`grid grid-cols-[3fr_1fr_1.5fr_1fr_1fr_1.5fr] items-center ${idx % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                    <div className="px-4 py-3 text-sm text-gray-900">{item.description}</div>
                    <div className="px-3 py-3 text-right text-sm text-gray-700">{item.quantity}</div>
                    <div className="px-3 py-3 text-right text-sm text-gray-700">{formatCurrency(Number(item.rate))}</div>
                    <div className="px-3 py-3 text-right text-sm text-gray-400">{item.discount_percent}%</div>
                    <div className="px-3 py-3 text-right text-sm text-gray-400">{item.gst_percent}%</div>
                    <div className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(Number(item.amount))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <TotalLine label="Subtotal" value={formatCurrency(Number(quotation.subtotal))} />
              {Number(quotation.discount_amount) > 0 && (
                <TotalLine label="Discount" value={`-${formatCurrency(Number(quotation.discount_amount))}`} />
              )}
              {Number(quotation.discount_amount) > 0 && (
                <TotalLine label="Taxable Amount" value={formatCurrency(Number(quotation.taxable_amount))} />
              )}
              <TotalLine label="GST" value={formatCurrency(Number(quotation.gst_amount))} />
              <div className="border-t-2 border-gray-900 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Grand Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(Number(quotation.grand_total))}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Amount in Words</p>
            <p className="text-sm font-medium text-gray-800">{amountToWords(Number(quotation.grand_total))}</p>
          </div>

          {/* Notes + Terms */}
          {quotation.notes && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{quotation.notes}</p>
            </div>
          )}
          {quotation.terms && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Terms & Conditions</p>
              <p className="text-sm text-gray-500 whitespace-pre-line">{quotation.terms}</p>
            </div>
          )}

          {/* Bank details */}
          {docSettings?.bank_account_number && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bank Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {docSettings.bank_account_name && <div><span className="text-gray-400 text-xs">Account Name</span><p className="text-gray-800 font-medium">{docSettings.bank_account_name}</p></div>}
                {docSettings.bank_name && <div><span className="text-gray-400 text-xs">Bank</span><p className="text-gray-800 font-medium">{docSettings.bank_name}</p></div>}
                {docSettings.bank_account_number && <div><span className="text-gray-400 text-xs">Account No.</span><p className="text-gray-800 font-medium">{docSettings.bank_account_number}</p></div>}
                {docSettings.bank_ifsc && <div><span className="text-gray-400 text-xs">IFSC</span><p className="text-gray-800 font-medium">{docSettings.bank_ifsc}</p></div>}
                {docSettings.bank_upi && <div><span className="text-gray-400 text-xs">UPI</span><p className="text-gray-800 font-medium">{docSettings.bank_upi}</p></div>}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-400">Thank you for your business.</p>
            <p className="text-xs font-bold text-gray-600 mt-0.5 uppercase tracking-widest">{company?.company_name ?? "SHREEDHAR SALES"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  );
}
