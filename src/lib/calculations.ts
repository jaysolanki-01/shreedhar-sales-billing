import { DocumentItemForm } from "@/types";

export interface ComputedItem {
  description: string;
  quantity: number;
  rate: number;
  discount_percent: number;
  gst_percent: number;
  base_amount: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  amount: number;
}

export interface DocumentTotals {
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeItem(item: DocumentItemForm): ComputedItem {
  const quantity = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const discount_percent = parseFloat(item.discount_percent) || 0;
  const gst_percent = parseFloat(item.gst_percent) || 0;

  const base_amount = round2(quantity * rate);
  const discount_amount = round2(base_amount * discount_percent / 100);
  const taxable_amount = round2(base_amount - discount_amount);
  const gst_amount = round2(taxable_amount * gst_percent / 100);
  const amount = round2(taxable_amount + gst_amount);

  return {
    description: item.description,
    quantity,
    rate,
    discount_percent,
    gst_percent,
    base_amount,
    discount_amount,
    taxable_amount,
    gst_amount,
    amount,
  };
}

export function computeTotals(items: ComputedItem[]): DocumentTotals {
  const subtotal = round2(items.reduce((s, i) => s + i.base_amount, 0));
  const discount_amount = round2(items.reduce((s, i) => s + i.discount_amount, 0));
  const taxable_amount = round2(items.reduce((s, i) => s + i.taxable_amount, 0));
  const gst_amount = round2(items.reduce((s, i) => s + i.gst_amount, 0));
  const grand_total = round2(items.reduce((s, i) => s + i.amount, 0));

  return { subtotal, discount_amount, taxable_amount, gst_amount, grand_total };
}

export function computeItemsAndTotals(formItems: DocumentItemForm[]) {
  const items = formItems.map(computeItem);
  const totals = computeTotals(items);
  return { items, totals };
}
