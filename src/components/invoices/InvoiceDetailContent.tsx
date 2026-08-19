"use client";

import { useState } from "react";
import Link from "next/link";
import { Invoice, CompanySettings, DocSettings, Payment, InvoicePaymentStatus } from "@/types";
import { formatCurrency, formatDate, paymentMethodLabel } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { amountToWords } from "@/lib/number-to-words";
import { ArrowLeft, Download, Edit2, Plus, CreditCard, CheckCircle2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  invoice: Invoice & { invoice_items: any[] };
  company: CompanySettings | null;
  docSettings: DocSettings | null;
  payments: Payment[];
  userId: string;
}

export function InvoiceDetailContent({ invoice: initial, company, docSettings, payments: initialPayments, userId }: Props) {
  const [invoice, setInvoice] = useState(initial);
  const [payments, setPayments] = useState(initialPayments);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(String(Number(initial.balance_due)));
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMethod, setPayMethod] = useState("cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const router = useRouter();
  const customer = invoice.customers as any;

  function openWhatsApp() {
    const phone = customer?.phone;
    if (!phone) return;
    const digits = phone.replace(/\D/g, "");
    const wa = digits.startsWith("91") && digits.length >= 12 ? digits : `91${digits}`;
    const balanceLine = Number(invoice.balance_due) > 0
      ? `\n\nBalance Due: *${formatCurrency(Number(invoice.balance_due))}*`
      : "\n\n✅ *Fully Paid — Thank you!*";
    const msg = encodeURIComponent(
      `Hi ${customer?.name ?? ""},\n\nPlease find your invoice *${invoice.invoice_number}* for *${formatCurrency(Number(invoice.grand_total))}* from ${company?.company_name ?? "Shreedhar Sales"}.${balanceLine}\n\nThank you!`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
  }

  async function recordPayment() {
    setPaying(true);
    const supabase = createClient();
    try {
      const { data: payment, error } = await supabase.from("payments").insert({
        user_id: userId,
        invoice_id: invoice.id,
        amount: parseFloat(payAmount),
        payment_date: payDate,
        payment_method: payMethod,
        reference_number: payRef,
        notes: payNotes,
      }).select().single();
      if (error) throw error;

      // Refetch invoice to get updated totals
      const { data: updated } = await supabase.from("invoices").select("*, customers(*), invoice_items(*)").eq("id", invoice.id).single();
      if (updated) {
        if (updated.invoice_items) updated.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
        setInvoice(updated as any);
      }
      setPayments((prev) => [payment, ...prev]);
      setPaymentOpen(false);
      toast.success(`Payment of ${formatCurrency(parseFloat(payAmount))} recorded`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to record payment");
    } finally {
      setPaying(false);
    }
  }

  async function deletePayment(paymentId: string) {
    if (!confirm("Remove this payment?")) return;
    const supabase = createClient();
    await supabase.from("payments").delete().eq("id", paymentId);
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    const { data: updated } = await supabase.from("invoices").select("*, customers(*), invoice_items(*)").eq("id", invoice.id).single();
    if (updated) setInvoice(updated as any);
    toast.success("Payment removed");
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/invoices">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invoices/${invoice.id}/edit`}>
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
          <Button variant="outline" size="md" onClick={() => window.open(`/api/pdf/invoice/${invoice.id}`, "_blank")}>
            <Download className="h-4 w-4" />PDF
          </Button>
          {invoice.payment_status !== "paid" && (
            <Button variant="primary" size="md" onClick={() => { setPayAmount(String(Number(invoice.balance_due))); setPaymentOpen(true); }}>
              <CreditCard className="h-4 w-4" />Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payment status banner */}
      {invoice.payment_status === "paid" && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Fully Paid</p>
            <p className="text-xs text-green-600">Total collected: {formatCurrency(Number(invoice.amount_paid))}</p>
          </div>
        </div>
      )}
      {invoice.payment_status === "partially_paid" && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-blue-800">Partially Paid — Balance Due: {formatCurrency(Number(invoice.balance_due))}</p>
            <p className="text-xs text-blue-600">Collected: {formatCurrency(Number(invoice.amount_paid))} of {formatCurrency(Number(invoice.grand_total))}</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setPayAmount(String(Number(invoice.balance_due))); setPaymentOpen(true); }}>
            Record Balance
          </Button>
        </div>
      )}
      {invoice.payment_status === "pending" && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">Payment Pending: {formatCurrency(Number(invoice.grand_total))}</p>
            {invoice.due_date && <p className="text-xs text-amber-600">Due: {formatDate(invoice.due_date)}</p>}
          </div>
          <Button variant="primary" size="sm" onClick={() => { setPayAmount(String(Number(invoice.balance_due))); setPaymentOpen(true); }}>
            <CreditCard className="h-4 w-4" />Pay Now
          </Button>
        </div>
      )}

      {/* Invoice Document Preview — clean B&W */}
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-widest text-gray-900">INVOICE</h1>
            <PaymentStatusBadge status={invoice.payment_status} />
          </div>
          <div className="text-sm space-y-0.5 sm:text-right">
            <p><span className="text-gray-400">No:</span> <span className="font-semibold text-gray-900">{invoice.invoice_number}</span></p>
            <p><span className="text-gray-400">Date:</span> <span className="text-gray-700">{formatDate(invoice.date)}</span></p>
            {invoice.due_date && <p><span className="text-gray-400">Due:</span> <span className="text-gray-700">{formatDate(invoice.due_date)}</span></p>}
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
            {invoice.prepared_by && (
              <div className="sm:text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">From</p>
                <p className="text-sm font-semibold text-gray-900">{invoice.prepared_by}</p>
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
                {invoice.invoice_items.map((item: any) => (
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
                {invoice.invoice_items.map((item: any, idx: number) => (
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
              <TotalLine label="Subtotal" value={formatCurrency(Number(invoice.subtotal))} />
              {Number(invoice.discount_amount) > 0 && <TotalLine label="Discount" value={`-${formatCurrency(Number(invoice.discount_amount))}`} />}
              <TotalLine label="GST" value={formatCurrency(Number(invoice.gst_amount))} />
              <div className="border-t-2 border-gray-900 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Grand Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(Number(invoice.grand_total))}</span>
              </div>
              {Number(invoice.amount_paid) > 0 && (
                <>
                  <TotalLine label="Amount Paid" value={formatCurrency(Number(invoice.amount_paid))} />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-gray-700">Balance Due</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(Number(invoice.balance_due))}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Amount in Words */}
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Amount in Words</p>
            <p className="text-sm font-medium text-gray-800">{amountToWords(Number(invoice.grand_total))}</p>
          </div>

          {invoice.notes && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Terms & Conditions</p>
              <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.terms}</p>
            </div>
          )}

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

          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-400">Thank you for your business.</p>
            <p className="text-xs font-bold text-gray-600 mt-0.5 uppercase tracking-widest">{company?.company_name ?? "SHREEDHAR SALES"}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h3 className="font-semibold text-brand-dark">Payment History</h3>
          </div>
          <div className="divide-y divide-brand-border">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{formatCurrency(Number(p.amount))}</p>
                  <p className="text-xs text-brand-muted">{formatDate(p.payment_date)} · {paymentMethodLabel(p.payment_method)}{p.reference_number ? ` · Ref: ${p.reference_number}` : ""}</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => deletePayment(p.id)} title="Remove payment">
                  <span className="text-xs text-red-500">✕</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent title="Record Payment" className="max-w-sm">
          <div className="space-y-4">
            <Input label="Amount (₹)" type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            <Input label="Payment Date" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            <Select label="Payment Method" value={payMethod} onValueChange={setPayMethod}>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </Select>
            <Input label="Reference / Transaction No." placeholder="Optional" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            <Textarea label="Notes" placeholder="Optional notes" rows={2} value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="md">Cancel</Button>
              </DialogClose>
              <Button variant="primary" size="md" loading={paying} onClick={recordPayment} disabled={!payAmount || parseFloat(payAmount) <= 0}>
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
