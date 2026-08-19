"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Customer, DocSettings, Quotation, QuotationItem } from "@/types";
import { computeItemsAndTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { ItemsEditor } from "./ItemsEditor";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { Plus, Eye, Download, Save } from "lucide-react";

interface Props {
  customers: Pick<Customer, "id" | "name" | "company_name" | "address" | "gstin">[];
  defaultSettings: DocSettings | null;
  userId: string;
  preselectedCustomerId?: string;
  existingQuotation?: Quotation & { quotation_items: QuotationItem[] };
}

interface FormValues {
  customer_id: string;
  date: string;
  valid_until: string;
  notes: string;
  terms: string;
  items: Array<{
    id?: string;
    description: string;
    quantity: string;
    rate: string;
    discount_percent: string;
    gst_percent: string;
  }>;
}

export function QuotationForm({ customers: initialCustomers, defaultSettings, userId, preselectedCustomerId, existingQuotation }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const validDays = defaultSettings?.qtn_validity_days ?? 10;

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: existingQuotation ? {
      customer_id: existingQuotation.customer_id,
      date: existingQuotation.date,
      valid_until: existingQuotation.valid_until,
      notes: existingQuotation.notes,
      terms: existingQuotation.terms,
      items: existingQuotation.quotation_items.map((item) => ({
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
      valid_until: format(addDays(new Date(), validDays), "yyyy-MM-dd"),
      notes: "",
      terms: defaultSettings?.qtn_terms ?? "",
      items: [{ description: "", quantity: "1", rate: "", discount_percent: "0", gst_percent: String(defaultSettings?.default_gst_percent ?? 18) }],
    },
  });

  const watchedItems = watch("items");
  const watchedCustomerId = watch("customer_id");

  const { items: computedItems, totals } = computeItemsAndTotals(watchedItems ?? []);

  async function save(formData: FormValues, redirectTo?: string) {
    const supabase = createClient();
    setSaving(true);

    try {
      const { items: computedItems, totals } = computeItemsAndTotals(formData.items);

      if (existingQuotation) {
        // Update
        const { error: qErr } = await supabase
          .from("quotations")
          .update({
            customer_id: formData.customer_id,
            date: formData.date,
            valid_until: formData.valid_until,
            notes: formData.notes,
            terms: formData.terms,
          })
          .eq("id", existingQuotation.id);
        if (qErr) throw qErr;

        // Delete existing items and re-insert
        await supabase.from("quotation_items").delete().eq("quotation_id", existingQuotation.id);
        const itemsToInsert = computedItems.map((item, idx) => ({
          quotation_id: existingQuotation.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          discount_percent: item.discount_percent,
          gst_percent: item.gst_percent,
          sort_order: idx,
        }));
        const { error: iErr } = await supabase.from("quotation_items").insert(itemsToInsert);
        if (iErr) throw iErr;
        toast.success("Quotation updated");
        router.push(`/quotations/${existingQuotation.id}`);
      } else {
        // Get next number
        const { data: numData, error: numErr } = await supabase
          .rpc("get_next_doc_number", { p_user_id: userId, p_type: "quotation" });
        if (numErr) throw numErr;

        // Insert quotation
        const { data: q, error: qErr } = await supabase
          .from("quotations")
          .insert({
            user_id: userId,
            customer_id: formData.customer_id,
            quotation_number: numData,
            date: formData.date,
            valid_until: formData.valid_until,
            notes: formData.notes,
            terms: formData.terms,
          })
          .select()
          .single();
        if (qErr) throw qErr;

        const itemsToInsert = computedItems.map((item, idx) => ({
          quotation_id: q.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          discount_percent: item.discount_percent,
          gst_percent: item.gst_percent,
          sort_order: idx,
        }));
        const { error: iErr } = await supabase.from("quotation_items").insert(itemsToInsert);
        if (iErr) throw iErr;

        toast.success(`Quotation ${numData} created`);
        router.push(redirectTo ?? `/quotations/${q.id}`);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save quotation");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCustomer(data: any) {
    const supabase = createClient();
    const { data: created, error } = await supabase
      .from("customers")
      .insert({ ...data, user_id: userId })
      .select("id, name, company_name, address, gstin")
      .single();
    if (error) { toast.error("Failed to add customer"); return; }
    setCustomers((prev) => [...prev, created]);
    setValue("customer_id", created.id);
    setNewCustomerOpen(false);
    toast.success("Customer added");
  }

  const selectedCustomer = customers.find((c) => c.id === watchedCustomerId);

  const hasItems = watchedItems?.some((i) => i.description || i.rate);
  const isValid = watchedCustomerId && hasItems;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      <form onSubmit={handleSubmit((data) => save(data))}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">

          {/* Main form */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-dark mb-4">Customer</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={watchedCustomerId}
                    onValueChange={(v) => setValue("customer_id", v)}
                    placeholder="Select customer..."
                    label="Bill To"
                  >
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.company_name ? ` — ${c.company_name}` : ""}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" size="md" onClick={() => setNewCustomerOpen(true)} title="New customer">
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
              <h3 className="text-sm font-semibold text-brand-dark mb-4">Quotation Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date" type="date" {...register("date")} />
                <Input label="Valid Until" type="date" {...register("valid_until")} />
              </div>
            </div>

            {/* Items */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-brand-dark mb-4">Items</h3>
              <ItemsEditor
                control={control as any}
                register={register as any}
                watch={watch as any}
                setValue={setValue as any}
                defaultGst={defaultSettings?.default_gst_percent ?? 18}
                errors={errors}
              />

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
                  {totals.discount_amount > 0 && (
                    <TotalRow label="Discount" value={`-${formatCurrency(totals.discount_amount)}`} />
                  )}
                  {totals.discount_amount > 0 && (
                    <TotalRow label="Taxable Amount" value={formatCurrency(totals.taxable_amount)} />
                  )}
                  <TotalRow label="GST" value={formatCurrency(totals.gst_amount)} />
                  <div className="border-t border-brand-border pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-brand-dark">Grand Total</span>
                      <span className="text-lg font-bold text-brand-brown">{formatCurrency(totals.grand_total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5 space-y-4">
              <Textarea label="Notes" placeholder="Any notes for this quotation..." rows={3} {...register("notes")} />
              <Textarea label="Terms & Conditions" rows={4} {...register("terms")} />
            </div>
          </div>

          {/* Sticky sidebar actions */}
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5 space-y-3 lg:sticky lg:top-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                disabled={!isValid}
                className="w-full"
              >
                <Save className="h-4 w-4" />
                {existingQuotation ? "Save Changes" : "Save Quotation"}
              </Button>

              {existingQuotation && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={async () => {
                    setDownloading(true);
                    window.open(`/api/pdf/quotation/${existingQuotation.id}`, "_blank");
                    setDownloading(false);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}

              <div className="pt-2 border-t border-brand-border text-xs text-brand-muted space-y-1">
                <p>Items: {watchedItems?.filter((i) => i.description).length ?? 0}</p>
                <p>Total: {formatCurrency(totals.grand_total)}</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <CustomerFormDialog
        open={newCustomerOpen}
        onOpenChange={setNewCustomerOpen}
        onSave={handleAddCustomer}
        customer={null}
      />
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
