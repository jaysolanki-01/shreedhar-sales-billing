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

export function ItemsEditor({ control, register, watch, setValue, defaultGst }: ItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items") ?? [];

  function addItem() {
    append({ description: "", hsn_code: "", quantity: "1", rate: "", discount_percent: "0", gst_percent: String(defaultGst) });
  }

  return (
    <div className="space-y-2">
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
          <div key={field.id} className="rounded-xl border border-brand-border bg-white overflow-hidden">
            {/* Item header bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-brand-border">
              <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide">
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Description — full width */}
            <div className="px-3 pt-3 pb-2">
              <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wide block mb-1">
                Description
              </label>
              <input
                {...register(`items.${index}.description`)}
                placeholder="Item description"
                className="w-full h-9 rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
              />
            </div>

            {/* Numeric fields row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 pb-3">
              <div>
                <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wide block mb-1">HSN</label>
                <input
                  {...register(`items.${index}.hsn_code`)}
                  placeholder="HSN"
                  className="w-full h-9 rounded-lg border border-brand-border bg-white px-2.5 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wide block mb-1">Qty</label>
                <input
                  {...register(`items.${index}.quantity`)}
                  type="number" step="0.001" min="0" placeholder="1"
                  className="w-full h-9 rounded-lg border border-brand-border bg-white px-2.5 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wide block mb-1">Rate (₹)</label>
                <input
                  {...register(`items.${index}.rate`)}
                  type="number" step="0.01" min="0" placeholder="0.00"
                  className="w-full h-9 rounded-lg border border-brand-border bg-white px-2.5 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wide block mb-1">Disc %</label>
                <input
                  {...register(`items.${index}.discount_percent`)}
                  type="number" step="0.01" min="0" max="100" placeholder="0"
                  className="w-full h-9 rounded-lg border border-brand-border bg-white px-2.5 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-brand-muted uppercase tracking-wide block mb-1">GST %</label>
                <input
                  {...register(`items.${index}.gst_percent`)}
                  type="number" step="0.01" min="0" placeholder="18"
                  className="w-full h-9 rounded-lg border border-brand-border bg-white px-2.5 text-sm text-right text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-colors"
                />
              </div>
            </div>

            {/* Amount footer */}
            <div className="flex items-center justify-end gap-2 px-3 py-2 bg-gray-50 border-t border-brand-border">
              <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wide">Amount</span>
              <span className="text-sm font-bold text-brand-dark min-w-[80px] text-right">
                {computed.amount > 0 ? formatCurrency(computed.amount) : <span className="text-brand-placeholder font-normal">—</span>}
              </span>
            </div>
          </div>
        );
      })}

      {/* Add Item */}
      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-brand-border text-sm font-medium text-brand-muted hover:text-brand-brown hover:border-brand-brown hover:bg-brand-beige transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}
