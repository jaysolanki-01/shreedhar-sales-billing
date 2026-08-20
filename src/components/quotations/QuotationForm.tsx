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
import { Plus, Download, Save } from "lucide-react";

interface Props {
  customers: Pick<Customer, "id" | "name" | "company_name" | "address" | "ship_to_address" | "gstin">[];
  defaultSettings: DocSettings | null;
  userId: string;
  preselectedCustomerId?: string;
  existingQuotation?: Quotation & { quotation_items: QuotationItem[] };
}

const PREPARERS = ["Shreedhar Patel", "Pallav Patel"] as const;

const INDIAN_STATES = [
  "Andaman & Nicobar Islands (35)", "Andhra Pradesh (37)", "Arunachal Pradesh (12)",
  "Assam (18)", "Bihar (10)", "Chandigarh (04)", "Chhattisgarh (22)",
  "Dadra & Nagar Haveli / Daman & Diu (26)", "Delhi (07)", "Goa (30)", "Gujarat (24)",
  "Haryana (06)", "Himachal Pradesh (02)", "Jammu & Kashmir (01)", "Jharkhand (20)",
  "Karnataka (29)", "Kerala (32)", "Ladakh (38)", "Lakshadweep (31)", "Madhya Pradesh (23)",
  "Maharashtra (27)", "Manipur (14)", "Meghalaya (17)", "Mizoram (15)", "Nagaland (13)",
  "Odisha (21)", "Puducherry (34)", "Punjab (03)", "Rajasthan (08)", "Sikkim (11)",
  "Tamil Nadu (33)", "Telangana (36)", "Tripura (16)", "Uttar Pradesh (09)",
  "Uttarakhand (05)", "West Bengal (19)",
] as const;

interface FormValues {
  customer_id: string;
  date: string;
  valid_until: string;
  place_of_supply: string;
  notes: string;
  terms: string;
  prepared_by: string;
  items: Array<{
    id?: string;
    description: string;
    hsn_code?: string;
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
      place_of_supply: existingQuotation.place_of_supply ?? "Gujarat (24)",
      notes: existingQuotation.notes,
      terms: existingQuotation.terms,
      prepared_by: existingQuotation.prepared_by ?? "",
      items: existingQuotation.quotation_items.map((item) => ({
        id: item.id,
        description: item.description,
        hsn_code: item.hsn_code ?? "",
        quantity: String(item.quantity),
        rate: String(item.rate),
        discount_percent: String(item.discount_percent),
        gst_percent: String(item.gst_percent),
      })),
    } : {
      customer_id: preselectedCustomerId ?? "",
      date: today,
      valid_until: format(addDays(new Date(), validDays), "yyyy-MM-dd"),
      place_of_supply: "Gujarat (24)",
      notes: "",
      terms: defaultSettings?.qtn_terms ?? "",
      prepared_by: "",
      items: [{ description: "", hsn_code: "", quantity: "1", rate: "", discount_percent: "0", gst_percent: String(defaultSettings?.default_gst_percent ?? 18) }],
    },
  });

  const watchedItems = watch("items");
  const watchedCustomerId = watch("customer_id");
  const watchedPreparedBy = watch("prepared_by");
  const watchedPlaceOfSupply = watch("place_of_supply");

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
            place_of_supply: formData.place_of_supply || null,
            notes: formData.notes,
            terms: formData.terms,
            prepared_by: formData.prepared_by || null,
          })
          .eq("id", existingQuotation.id);
        if (qErr) throw qErr;

        // Delete existing items and re-insert
        await supabase.from("quotation_items").delete().eq("quotation_id", existingQuotation.id);
        const itemsToInsert = computedItems.map((item, idx) => ({
          quotation_id: existingQuotation.id,
          description: item.description,
          hsn_code: item.hsn_code ?? "",
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
            place_of_supply: formData.place_of_supply || null,
            notes: formData.notes,
            terms: formData.terms,
            prepared_by: formData.prepared_by || null,
          })
          .select()
          .single();
        if (qErr) throw qErr;

        const itemsToInsert = computedItems.map((item, idx) => ({
          quotation_id: q.id,
          description: item.description,
          hsn_code: item.hsn_code ?? "",
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
      .select("id, name, company_name, address, ship_to_address, gstin")
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
      <form onSubmit={handleSubmit((data: FormValues) => save(data))}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">

          {/* Main form */}
          <div className="space-y-6 min-w-0">
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
              <div className="mt-4">
                <Select
                  value={watchedPlaceOfSupply}
                  onValueChange={(v) => setValue("place_of_supply", v)}
                  label="Place of Supply"
                  placeholder="Select state..."
                >
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </Select>
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
              <div className="overflow-x-auto">
                <ItemsEditor
                  control={control as any}
                  register={register as any}
                  watch={watch as any}
                  setValue={setValue as any}
                  defaultGst={defaultSettings?.default_gst_percent ?? 18}
                  errors={errors}
                />
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="bg-surface rounded-xl border border-brand-border shadow-card p-5 space-y-4">
              <Textarea label="Notes" placeholder="Any notes for this quotation..." rows={3} {...register("notes")} />
              <Textarea label="Terms & Conditions" rows={4} {...register("terms")} />
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden lg:sticky lg:top-4">
              {/* Summary */}
              <div className="p-5 space-y-2.5">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Subtotal</span>
                  <span className="text-brand-dark">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Discount</span>
                    <span className="text-green-600">−{formatCurrency(totals.discount_amount)}</span>
                  </div>
                )}
                {totals.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Taxable</span>
                    <span className="text-brand-dark">{formatCurrency(totals.taxable_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">GST</span>
                  <span className="text-brand-dark">{formatCurrency(totals.gst_amount)}</span>
                </div>
                <div className="border-t border-brand-border pt-2.5 flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-dark">Grand Total</span>
                  <span className="text-lg font-bold text-brand-brown">{formatCurrency(totals.grand_total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 space-y-2.5">
                <button
                  type="submit"
                  disabled={!isValid || saving}
                  className="w-full h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: isValid && !saving ? "#1E1B4B" : "#6B7280" }}
                  onMouseEnter={e => { if (isValid && !saving) (e.currentTarget as HTMLElement).style.background = "#15133A"; }}
                  onMouseLeave={e => { if (isValid && !saving) (e.currentTarget as HTMLElement).style.background = "#1E1B4B"; }}
                >
                  {saving ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {existingQuotation ? "Save Changes" : "Save Quotation"}
                </button>

                {existingQuotation && (
                  <button
                    type="button"
                    onClick={() => { window.open(`/api/pdf/quotation/${existingQuotation.id}`, "_blank"); }}
                    className="w-full h-9 rounded-lg text-sm font-medium border border-brand-border bg-white text-brand-dark hover:bg-brand-beige flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                )}
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

