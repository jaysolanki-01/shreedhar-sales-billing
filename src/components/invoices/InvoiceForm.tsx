"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Customer, DocSettings, Invoice, InvoiceItem } from "@/types";
import { computeItemsAndTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { ItemsEditor } from "@/components/quotations/ItemsEditor";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { Plus, Save, Download } from "lucide-react";

interface Props {
  customers: Pick<Customer, "id" | "name" | "company_name" | "address" | "gstin">[];
  defaultSettings: DocSettings | null;
  userId: string;
  preselectedCustomerId?: string;
  existingInvoice?: Invoice & { invoice_items: InvoiceItem[] };
}

const PREPARERS = ["Shreedhar Patel", "Pallav Patel"] as const;

interface FormValues {
  customer_id: string;
  date: string;
  due_date: string;
  notes: string;
  terms: string;
  prepared_by: string;
  items: Array<{
    id?: string;
    description: string;
    quantity: string;
    rate: string;
    discount_percent: string;
    gst_percent: string;
  }>;
}

export function InvoiceForm({ customers: initialCustomers, defaultSettings, userId, preselectedCustomerId, existingInvoice }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const paymentDays = defaultSettings?.inv_payment_days ?? 30;

  const { register, control, watch, setValue, handleSubmit } = useForm<FormValues>({
    defaultValues: existingInvoice ? {
      customer_id: existingInvoice.customer_id,
      date: existingInvoice.date,
      due_date: existingInvoice.due_date ?? "",
      notes: existingInvoice.notes,
      terms: existingInvoice.terms,
      prepared_by: existingInvoice.prepared_by ?? "",
      items: existingInvoice.invoice_items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: String(item.quantity),
        rate: String(item.rate),
        discount_percent: String(item.discount_percent),
        gst_percent: String(item.gst_percent),
      })),
    } : {
      customer_id: preselectedCustomerId ?? "",
      date: today,
      due_date: format(addDays(new Date(), paymentDays), "yyyy-MM-dd"),
      notes: "",
      terms: defaultSettings?.inv_terms ?? "",
      prepared_by: "",
      items: [{ description: "", quantity: "1", rate: "", discount_percent: "0", gst_percent: String(defaultSettings?.default_gst_percent ?? 18) }],
    },
  });

  const watchedItems = watch("items");
  const watchedCustomerId = watch("customer_id");
  const watchedPreparedBy = watch("prepared_by");
  const { totals } = computeItemsAndTotals(watchedItems ?? []);
  const selectedCustomer = customers.find((c) => c.id === watchedCustomerId);
  const isValid = watchedCustomerId && watchedItems?.some((i) => i.description || i.rate);

  async function save(formData: FormValues) {
    setSaving(true);
    const supabase = createClient();
    try {
      const { items: computedItems } = computeItemsAndTotals(formData.items);

      if (existingInvoice) {
        await supabase.from("invoices").update({
          customer_id: formData.customer_id,
          date: formData.date,
          due_date: formData.due_date || null,
          notes: formData.notes,
          terms: formData.terms,
          prepared_by: formData.prepared_by || null,
        }).eq("id", existingInvoice.id);

        await supabase.from("invoice_items").delete().eq("invoice_id", existingInvoice.id);
        await supabase.from("invoice_items").insert(
          computedItems.map((item, idx) => ({
            invoice_id: existingInvoice.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            discount_percent: item.discount_percent,
            gst_percent: item.gst_percent,
            sort_order: idx,
          }))
        );
        toast.success("Invoice updated");
        router.push(`/invoices/${existingInvoice.id}`);
      } else {
        const { data: numData, error: numErr } = await supabase.rpc("get_next_doc_number", { p_user_id: userId, p_type: "invoice" });
        if (numErr) throw numErr;

        const { data: inv, error: invErr } = await supabase.from("invoices").insert({
          user_id: userId,
          customer_id: formData.customer_id,
          invoice_number: numData,
          date: formData.date,
          due_date: formData.due_date || null,
          notes: formData.notes,
          terms: formData.terms,
          prepared_by: formData.prepared_by || null,
        }).select().single();
        if (invErr) throw invErr;

        await supabase.from("invoice_items").insert(
          computedItems.map((item, idx) => ({
            invoice_id: inv.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            discount_percent: item.discount_percent,
            gst_percent: item.gst_percent,
            sort_order: idx,
          }))
        );
        toast.success(`Invoice ${numData} created`);
        router.push(`/invoices/${inv.id}`);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCustomer(data: any) {
    const supabase = createClient();
    const { data: created, error } = await supabase.from("customers").insert({ ...data, user_id: userId }).select("id, name, company_name, address, gstin").single();
    if (error) { toast.error("Failed to add customer"); return; }
    setCustomers((prev) => [...prev, created]);
    setValue("customer_id", created.id);
    setNewCustomerOpen(false);
    toast.success("Customer added");
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      <form onSubmit={handleSubmit(save)}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-dark mb-4">Customer</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={watchedCustomerId} onValueChange={(v) => setValue("customer_id", v)} placeholder="Select customer..." label="Bill To">
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.company_name ? ` — ${c.company_name}` : ""}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" size="md" onClick={() => setNewCustomerOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {selectedCustomer && (
                <div className="mt-3 p-3 rounded-lg bg-brand-beige text-xs text-brand-muted space-y-0.5">
                  {selectedCustomer.company_name && <p className="font-medium text-brand-dark">{selectedCustomer.company_name}</p>}
                  {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                  {selectedCustomer.gstin && <p>GSTIN: {selectedCustomer.gstin}</p>}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-dark mb-4">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Invoice Date" type="date" {...register("date")} />
                <Input label="Due Date" type="date" {...register("due_date")} />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-brand-muted mb-2">Prepared by</p>
                <div className="flex gap-2">
                  {PREPARERS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setValue("prepared_by", watchedPreparedBy === name ? "" : name)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        watchedPreparedBy === name
                          ? "bg-brand-dark text-white border-brand-dark"
                          : "bg-surface text-brand-muted border-brand-border hover:border-brand-brown hover:text-brand-dark"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-dark mb-4">Items</h3>
              <ItemsEditor control={control as any} register={register as any} watch={watch as any} setValue={setValue as any} defaultGst={defaultSettings?.default_gst_percent ?? 18} />
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
                  {totals.discount_amount > 0 && <TotalRow label="Discount" value={`-${formatCurrency(totals.discount_amount)}`} />}
                  <TotalRow label="GST" value={formatCurrency(totals.gst_amount)} />
                  <div className="border-t border-brand-border pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-dark">Grand Total</span>
                    <span className="text-lg font-bold text-brand-brown">{formatCurrency(totals.grand_total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5 space-y-4">
              <Textarea label="Notes" placeholder="Any notes for this invoice..." rows={3} {...register("notes")} />
              <Textarea label="Terms & Conditions" rows={4} {...register("terms")} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5 space-y-3 lg:sticky lg:top-4">
              <Button type="submit" variant="primary" size="lg" loading={saving} disabled={!isValid} className="w-full">
                <Save className="h-4 w-4" />
                {existingInvoice ? "Save Changes" : "Save Invoice"}
              </Button>
              {existingInvoice && (
                <Button type="button" variant="secondary" size="lg" className="w-full"
                  onClick={() => window.open(`/api/pdf/invoice/${existingInvoice.id}`, "_blank")}>
                  <Download className="h-4 w-4" />Download PDF
                </Button>
              )}
              <div className="pt-2 border-t border-brand-border text-xs text-brand-muted space-y-1">
                <p>Total: {formatCurrency(totals.grand_total)}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
      <CustomerFormDialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen} onSave={handleAddCustomer} customer={null} />
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-brand-muted">{label}</span>
      <span className="text-sm text-brand-dark">{value}</span>
    </div>
  );
}
