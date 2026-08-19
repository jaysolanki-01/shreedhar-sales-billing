"use client";

import Link from "next/link";
import { Payment } from "@/types";
import { formatCurrency, formatDate, paymentMethodLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  payments: (Payment & { invoices?: any })[];
  pendingInvoices: any[];
}

export function PaymentsContent({ payments, pendingInvoices }: Props) {
  const totalReceived = payments.reduce((s, p) => s + Number(p.amount), 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const thisMonthTotal = payments.filter((p) => p.payment_date >= monthStart).reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = pendingInvoices.reduce((s, inv) => s + Number(inv.balance_due), 0);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-brand-border shadow-card p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-xs text-brand-muted">Total Received</p>
          </div>
          <p className="text-xl font-bold text-brand-dark">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="bg-surface rounded-xl border border-brand-border shadow-card p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-brand-brown" />
            <p className="text-xs text-brand-muted">This Month</p>
          </div>
          <p className="text-xl font-bold text-brand-dark">{formatCurrency(thisMonthTotal)}</p>
        </div>
        <div className="bg-surface rounded-xl border border-amber-200 shadow-card p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-brand-muted">Pending</p>
          </div>
          <p className="text-xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-brand-dark">Awaiting Payment ({pendingInvoices.length})</h3>
          </div>
          <div className="divide-y divide-brand-border">
            {pendingInvoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-beige transition-colors">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{inv.invoice_number}</p>
                  <p className="text-xs text-brand-muted">{(inv.customers as any)?.name ?? ""} · {formatDate(inv.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-700">{formatCurrency(Number(inv.balance_due))}</p>
                    <PaymentStatusBadge status={inv.payment_status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h3 className="font-semibold text-brand-dark">Payment History ({payments.length})</h3>
        </div>
        {payments.length === 0 ? (
          <div className="py-12 text-center text-sm text-brand-muted">No payments recorded yet</div>
        ) : (
          <div className="divide-y divide-brand-border">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{formatCurrency(Number(p.amount))}</p>
                    <p className="text-xs text-brand-muted">
                      {formatDate(p.payment_date)} · {paymentMethodLabel(p.payment_method)}
                      {p.invoices?.invoice_number ? ` · ${p.invoices.invoice_number}` : ""}
                    </p>
                  </div>
                </div>
                {p.invoices?.invoice_number && (
                  <Link href={`/invoices/${p.invoice_id}`}>
                    <span className="text-xs text-brand-brown hover:text-brand-dark">{p.invoices.invoice_number}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
