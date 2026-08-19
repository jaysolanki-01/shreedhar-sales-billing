import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function getDateRange(filter: "today" | "this_week" | "this_month" | "last_month") {
  const now = new Date();
  switch (filter) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "this_week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month":
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }
}

export function getWeeksInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: { label: string; from: Date; to: Date; week: number }[] = [];
  let current = startOfWeek(firstDay, { weekStartsOn: 1 });
  let weekNum = 1;

  while (current <= lastDay) {
    const weekStart = current < firstDay ? firstDay : current;
    const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
    const clampedEnd = weekEnd > lastDay ? lastDay : weekEnd;
    weeks.push({
      label: `Week ${weekNum}`,
      from: weekStart,
      to: clampedEnd,
      week: weekNum,
    });
    current = new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000);
    weekNum++;
  }
  return weeks;
}

export function quotationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
  };
  return map[status] ?? status;
}

export function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    partially_paid: "Partial",
    paid: "Paid",
    overdue: "Overdue",
  };
  return map[status] ?? status;
}

export function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    upi: "UPI",
    cheque: "Cheque",
    card: "Card",
    other: "Other",
  };
  return map[method] ?? method;
}
