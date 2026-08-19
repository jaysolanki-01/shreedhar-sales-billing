import * as React from "react";
import { cn } from "@/lib/utils";
import { QuotationStatus, InvoicePaymentStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

const quotationStatusStyles: Record<QuotationStatus, string> = {
  draft: "bg-gray-100 text-gray-500 border border-gray-200",
  sent: "bg-blue-50 text-blue-700 border border-blue-200",
  accepted: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
  expired: "bg-amber-50 text-amber-700 border border-amber-200",
};

const paymentStatusStyles: Record<InvoicePaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  partially_paid: "bg-blue-50 text-blue-700 border border-blue-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  overdue: "bg-red-50 text-red-600 border border-red-200",
};

const quotationStatusLabels: Record<QuotationStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

const paymentStatusLabels: Record<InvoicePaymentStatus, string> = {
  pending: "Pending",
  partially_paid: "Partial",
  paid: "Paid",
  overdue: "Overdue",
};

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge className={quotationStatusStyles[status]}>
      {quotationStatusLabels[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: InvoicePaymentStatus }) {
  return (
    <Badge className={paymentStatusStyles[status]}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}
