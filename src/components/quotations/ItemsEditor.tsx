"use client";

import { useFieldArray, Control, UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { computeItem } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

interface ItemsEditorProps {
  control: Control<any, any, any>;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  defaultGst: number;
  errors?: any;
}

const COL = "sm:grid-cols-[minmax(0,3fr)_72px_72px_90px_72px_72px_96px_36px]";

export function ItemsEditor({ control, register, watch, setValue, defaultGst }: ItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items") ?? [];

  function addItem() {
    append({ description: "", hsn_code: "", quantity: "1", rate: "", discount_percent: "0", gst_percent: String(defaultGst) });
  }

  return (
    <div className="rounded-xl border border-brand-border overflow-hidden">
      {/* Header */}
      <div className={`hidden sm:grid ${COL} gap-x-2 px-3 py-2.5 bg-gray-50 border-b border-brand-border`}>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide">Description</span>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide text-right">HSN</span>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide text-right">Qty</span>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide text-right">Rate (₹)</span>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide text-right">Disc %</span>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide text-right">GST %</span>
        <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide text-right">Amount</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-brand-border">
        {fields.map((field, index) => {
          const item = watchedItems[index] ?? {};
          const computed = computeItem({
            description: item.description ?? "",
            hsn_code: item.hsn_code ?? "",
            quantity: item.quantity ?? "0",
            rate: item.rate ?? "0",
            discount_percent: item.discount_percent ?? "0",
            gst_percent: item.gst_percent ?? "0",
          });

          return (
            <div
              key={field.id}
              className={`grid grid-cols-2 ${COL} gap-x-2 gap-y-2 px-3 py-3 items-center bg-white hover:bg-gray-50/70 transition-colors`}
            >
              {/* Description */}
              <div className="col-span-2 sm:col-span-1">
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Description</label>
                <input
                  {...register(`items.${index}.description`)}
                  placeholder="Item description"
                  className="w-full h-8 rounded-lg border border-brand-border bg-white px-2.5 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>

              {/* HSN */}
              <div>
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">HSN</label>
                <input
                  {...register(`items.${index}.hsn_code`)}
                  placeholder="HSN"
                  className="w-full h-8 rounded-lg border border-brand-border bg-white px-2 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>

              {/* Qty */}
              <div>
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Qty</label>
                <input
                  {...register(`items.${index}.quantity`)}
                  type="number" step="0.001" min="0" placeholder="1"
                  className="w-full h-8 rounded-lg border border-brand-border bg-white px-2 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>

              {/* Rate */}
              <div>
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Rate (₹)</label>
                <input
                  {...register(`items.${index}.rate`)}
                  type="number" step="0.01" min="0" placeholder="0.00"
                  className="w-full h-8 rounded-lg border border-brand-border bg-white px-2 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>

              {/* Disc % */}
              <div>
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Disc %</label>
                <input
                  {...register(`items.${index}.discount_percent`)}
                  type="number" step="0.01" min="0" max="100" placeholder="0"
                  className="w-full h-8 rounded-lg border border-brand-border bg-white px-2 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>

              {/* GST % */}
              <div>
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">GST %</label>
                <input
                  {...register(`items.${index}.gst_percent`)}
                  type="number" step="0.01" min="0" placeholder="18"
                  className="w-full h-8 rounded-lg border border-brand-border bg-white px-2 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>

              {/* Amount (read-only) */}
              <div>
                <label className="sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Amount</label>
                <div className="h-8 flex items-center justify-end px-2 rounded-lg bg-gray-50 border border-brand-border">
                  <span className="text-sm font-semibold text-brand-dark">
                    {computed.amount > 0 ? formatCurrency(computed.amount) : <span className="text-brand-placeholder font-normal">—</span>}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item */}
      <div className="px-3 py-2.5 border-t border-brand-border bg-gray-50/50">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-brown hover:text-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>
    </div>
  );
}
