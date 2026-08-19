"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Customer, Quotation, Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuotationStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, FileText, Receipt, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Props {
  customer: Customer;
  quotations: Quotation[];
  invoices: Invoice[];
  userId: string;
}

export function CustomerProfileContent({ customer, quotations, invoices }: Props) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalBilling = invoices.reduce((s, i) => s + Number(i.grand_total), 0);
  const amountPaid = invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
  const pendingAmount = invoices.reduce((s, i) => s + Number(i.balance_due), 0);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("customers").delete().eq("id", customer.id);
    router.push("/customers");
    router.refresh();
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to Customers
          </Button>
        </Link>

        {deleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">Delete this customer?</span>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="danger-outline" size="sm" onClick={() => setDeleteConfirm(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete Customer
          </Button>
        )}
      </div>

      {/* Customer Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-beige-dark border border-brand-border flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-brand-brown">{customer.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-brand-dark">{customer.name}</h2>
              {customer.company_name && <p className="text-sm text-brand-muted">{customer.company_name}</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {customer.phone && (
                  <span className="text-sm text-brand-muted flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />{customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span className="text-sm text-brand-muted flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />{customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="text-sm text-brand-muted flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />{customer.address}
                  </span>
                )}
              </div>
              {customer.gstin && <p className="text-xs text-brand-muted mt-1">GSTIN: {customer.gstin}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Quotations" value={quotations.length.toString()} />
        <StatCard label="Invoices" value={invoices.length.toString()} />
        <StatCard label="Total Billed" value={formatCurrency(totalBilling)} />
        <StatCard label="Pending" value={formatCurrency(pendingAmount)} warn />
      </div>

      {/* Quotations */}
      {quotations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quotations ({quotations.length})</CardTitle>
              <Link href={`/quotations/new?customer=${customer.id}`}>
                <Button variant="outline" size="sm">New Quotation</Button>
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-brand-border">
            {quotations.map((q) => (
              <Link key={q.id} href={`/quotations/${q.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-brand-beige transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-brand-muted" />
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{q.quotation_number}</p>
                    <p className="text-xs text-brand-muted">{formatDate(q.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-dark">{formatCurrency(Number(q.grand_total))}</span>
                  <QuotationStatusBadge status={q.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoices ({invoices.length})</CardTitle>
              <Link href={`/invoices/new?customer=${customer.id}`}>
                <Button variant="outline" size="sm">New Invoice</Button>
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-brand-border">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-brand-beige transition-colors">
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-brand-muted" />
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{inv.invoice_number}</p>
                    <p className="text-xs text-brand-muted">{formatDate(inv.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-dark">{formatCurrency(Number(inv.grand_total))}</span>
                  <PaymentStatusBadge status={inv.payment_status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-surface rounded-xl border border-brand-border shadow-card p-4">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${warn ? "text-amber-700" : "text-brand-dark"}`}>{value}</p>
    </div>
  );
}
