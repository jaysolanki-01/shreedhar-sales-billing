"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useFieldArray, Control, UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeItem } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

// Using `any` here intentionally — ItemsEditor is shared between QuotationForm and InvoiceForm
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ItemsEditorProps {
  control: Control<any, any, any>;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  defaultGst: number;
  errors?: any;
}

export function ItemsEditor({ control, register, watch, setValue, defaultGst, errors }: ItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items") ?? [];

  function addItem() {
    append({
      description: "",
      hsn_code: "",
      quantity: "1",
      rate: "",
      discount_percent: "0",
      gst_percent: String(defaultGst),
    });
  }

  return (
    <div>
      {/* Table Header */}
      <div className="hidden sm:grid sm:grid-cols-[3fr_80px_80px_100px_80px_80px_100px_40px] gap-2 px-3 py-2 bg-[#1A1740] rounded-t-lg text-xs font-semibold text-amber-300 uppercase tracking-wide">
        <span>Description</span>
        <span className="text-right">HSN</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Rate (₹)</span>
        <span className="text-right">Disc %</span>
        <span className="text-right">GST %</span>
        <span className="text-right">Amount</span>
        <span></span>
      </div>

      <div className="border border-brand-border border-t-0 rounded-b-lg overflow-hidden divide-y divide-brand-border">
        {fields.map((field, index) => {
          const item = watchedItems[index] ?? {};
          const computed = computeItem({
            description: item.description ?? "",
            quantity: item.quantity ?? "0",
            rate: item.rate ?? "0",
            discount_percent: item.discount_percent ?? "0",
            gst_percent: item.gst_percent ?? "0",
          });

          return (
            <div key={field.id} className="grid grid-cols-2 sm:grid-cols-[3fr_80px_80px_100px_80px_80px_100px_40px] gap-2 p-3 items-start sm:items-center bg-surface hover:bg-brand-beige/50 transition-colors">
              {/* Description — full width on mobile */}
              <div className="col-span-2 sm:col-span-1">
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">Description</label>
                <input
                  {...register(`items.${index}.description`)}
                  placeholder="Item description"
                  className="w-full h-8 rounded border border-brand-border bg-surface px-2 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:border-brand-brown"
                />
              </div>

              {/* HSN — col 2, row 1 on mobile */}
              <div>
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">HSN</label>
                <input
                  {...register(`items.${index}.hsn_code`)}
                  placeholder="HSN"
                  className="w-full h-8 rounded border border-brand-border bg-surface px-2 text-sm text-right text-brand-dark focus:outline-none focus:border-brand-brown"
                />
              </div>

              {/* Qty — col 1, row 2 on mobile */}
              <div>
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">Qty</label>
                <input
                  {...register(`items.${index}.quantity`)}
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="1"
                  className="w-full h-8 rounded border border-brand-border bg-surface px-2 text-sm text-right text-brand-dark focus:outline-none focus:border-brand-brown"
                />
              </div>

              {/* Rate — col 2, row 2 on mobile */}
              <div>
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">Rate (₹)</label>
                <input
                  {...register(`items.${index}.rate`)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full h-8 rounded border border-brand-border bg-surface px-2 text-sm text-right text-brand-dark focus:outline-none focus:border-brand-brown"
                />
              </div>

              {/* Disc % — col 1, row 3 on mobile */}
              <div>
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">Disc %</label>
                <input
                  {...register(`items.${index}.discount_percent`)}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="w-full h-8 rounded border border-brand-border bg-surface px-2 text-sm text-right text-brand-dark focus:outline-none focus:border-brand-brown"
                />
              </div>

              {/* GST % — col 2, row 3 on mobile */}
              <div>
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">GST %</label>
                <input
                  {...register(`items.${index}.gst_percent`)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="18"
                  className="w-full h-8 rounded border border-brand-border bg-surface px-2 text-sm text-right text-brand-dark focus:outline-none focus:border-brand-brown"
                />
              </div>

              {/* Amount — col 1, row 4 on mobile */}
              <div>
                <label className="sm:hidden text-xs font-semibold text-brand-muted uppercase mb-1 block">Amount</label>
                <span className="text-sm font-bold text-brand-dark sm:block sm:text-right">
                  {computed.amount > 0 ? formatCurrency(computed.amount) : "—"}
                </span>
                {computed.discount_amount > 0 && (
                  <p className="text-xs text-brand-muted sm:text-right">
                    -{formatCurrency(computed.discount_amount)} disc
                  </p>
                )}
              </div>

              {/* Delete — col 2, row 4 on mobile */}
              <div className="flex justify-end items-end sm:items-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors disabled:opacity-30"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 flex items-center gap-2 text-sm text-brand-brown hover:text-brand-dark font-medium transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}
