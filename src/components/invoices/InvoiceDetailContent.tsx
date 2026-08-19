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
import { ArrowLeft, Download, Edit2, Plus, CreditCard, CheckCircle2 } from "lucide-react";
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

      {/* Invoice Document Preview */}
      <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
        <div className="bg-brand-dark px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-gold flex items-center justify-center mb-2 overflow-hidden">
                <img src="/logo.png" alt="SS" className="w-full h-full object-contain" onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-brand-dark font-bold">SS</span>';
                }} />
              </div>
              <h2 className="text-lg font-bold text-brand-gold">{company?.company_name ?? "Shreedhar Sales"}</h2>
            </div>
            <div className="text-right text-xs text-white/60 space-y-0.5">
              {company?.address && <p>{company.address}</p>}
              {company?.phone && <p>{company.phone}</p>}
              {company?.email && <p>{company.email}</p>}
              {company?.gstin && <p>GSTIN: {company.gstin}</p>}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark tracking-wide">INVOICE</h1>
              <PaymentStatusBadge status={invoice.payment_status} />
            </div>
            <div className="text-right text-sm space-y-1">
              <p><span className="text-brand-muted">Invoice No:</span> <span className="font-semibold text-brand-dark">{invoice.invoice_number}</span></p>
              <p><span className="text-brand-muted">Date:</span> <span className="text-brand-dark">{formatDate(invoice.date)}</span></p>
              {invoice.due_date && <p><span className="text-brand-muted">Due:</span> <span className="text-brand-dark">{formatDate(invoice.due_date)}</span></p>}
              {invoice.quotation_id && <p className="text-xs text-brand-muted">Ref: Quotation</p>}
            </div>
          </div>

          <div className="border-t border-brand-border pt-4">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">Bill To</p>
            <p className="font-semibold text-brand-dark">{customer?.name}</p>
            {customer?.company_name && <p className="text-sm text-brand-muted">{customer.company_name}</p>}
            {customer?.address && <p className="text-sm text-brand-muted">{customer.address}</p>}
            {customer?.phone && <p className="text-sm text-brand-muted">{customer.phone}</p>}
            {customer?.gstin && <p className="text-sm text-brand-muted">GSTIN: {customer.gstin}</p>}
          </div>

          <div className="border border-brand-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1fr_1.5fr] bg-brand-dark text-brand-gold text-xs font-semibold uppercase tracking-wide">
              <div className="px-4 py-3">Description</div>
              <div className="px-3 py-3 text-right">Qty</div>
              <div className="px-3 py-3 text-right">Rate</div>
              <div className="px-3 py-3 text-right">Disc %</div>
              <div className="px-3 py-3 text-right">GST %</div>
              <div className="px-4 py-3 text-right">Amount</div>
            </div>
            <div className="divide-y divide-brand-border">
              {invoice.invoice_items.map((item: any) => (
                <div key={item.id} className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1fr_1.5fr] items-center">
                  <div className="px-4 py-3 text-sm text-brand-dark">{item.description}</div>
                  <div className="px-3 py-3 text-right text-sm text-brand-dark">{item.quantity}</div>
                  <div className="px-3 py-3 text-right text-sm text-brand-dark">{formatCurrency(Number(item.rate))}</div>
                  <div className="px-3 py-3 text-right text-sm text-brand-muted">{item.discount_percent}%</div>
                  <div className="px-3 py-3 text-right text-sm text-brand-muted">{item.gst_percent}%</div>
                  <div className="px-4 py-3 text-right text-sm font-semibold text-brand-dark">{formatCurrency(Number(item.amount))}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <TotalLine label="Subtotal" value={formatCurrency(Number(invoice.subtotal))} />
              {Number(invoice.discount_amount) > 0 && <TotalLine label="Discount" value={`-${formatCurrency(Number(invoice.discount_amount))}`} />}
              <TotalLine label="GST" value={formatCurrency(Number(invoice.gst_amount))} />
              <div className="border-t border-brand-border pt-3 flex items-center justify-between bg-brand-beige rounded-lg px-3 py-2">
                <span className="text-sm font-bold text-brand-dark">Grand Total</span>
                <span className="text-xl font-bold text-brand-brown">{formatCurrency(Number(invoice.grand_total))}</span>
              </div>
              {Number(invoice.amount_paid) > 0 && (
                <>
                  <TotalLine label="Amount Paid" value={formatCurrency(Number(invoice.amount_paid))} />
                  <div className="border-t border-brand-border pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-dark">Balance Due</span>
                    <span className="text-lg font-bold text-amber-700">{formatCurrency(Number(invoice.balance_due))}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-brand-beige rounded-lg px-4 py-3">
            <p className="text-xs text-brand-muted">Amount in Words</p>
            <p className="text-sm font-medium text-brand-dark mt-0.5">{amountToWords(Number(invoice.grand_total))}</p>
          </div>

          {invoice.notes && (
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-brand-dark whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-1">Terms & Conditions</p>
              <p className="text-sm text-brand-muted whitespace-pre-line">{invoice.terms}</p>
            </div>
          )}

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

          <div className="border-t border-brand-border pt-4 text-center text-xs text-brand-muted">
            <p>Thank you for your business.</p>
            <p className="font-semibold text-brand-dark mt-0.5">{company?.company_name ?? "SHREEDHAR SALES"}</p>
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
      <span className="text-xs text-brand-muted">{label}</span>
      <span className="text-sm text-brand-dark">{value}</span>
    </div>
  );
}
