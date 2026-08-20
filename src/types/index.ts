export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type InvoicePaymentStatus = "pending" | "partially_paid" | "paid" | "overdue";
export type PaymentMethod = "cash" | "bank_transfer" | "upi" | "cheque" | "card" | "other";

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  created_at: string;
  updated_at: string;
}

export interface DocSettings {
  id: string;
  user_id: string;
  qtn_prefix: string;
  qtn_next_number: number;
  qtn_validity_days: number;
  qtn_terms: string;
  inv_prefix: string;
  inv_next_number: number;
  inv_payment_days: number;
  inv_terms: string;
  default_gst_percent: number;
  allow_item_level_gst: boolean;
  bank_account_name: string;
  bank_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_upi: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  ship_to_address: string;
  gstin: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  description: string;
  hsn_code?: string;
  quantity: number;
  rate: number;
  discount_percent: number;
  gst_percent: number;
  base_amount: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  amount: number;
  sort_order: number;
}

export interface Quotation {
  id: string;
  user_id: string;
  customer_id: string;
  quotation_number: string;
  date: string;
  valid_until: string;
  status: QuotationStatus;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
  notes: string;
  terms: string;
  prepared_by: string | null;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  quotation_items?: QuotationItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  hsn_code?: string;
  quantity: number;
  rate: number;
  discount_percent: number;
  gst_percent: number;
  base_amount: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  amount: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  quotation_id: string | null;
  invoice_number: string;
  date: string;
  due_date: string | null;
  payment_status: InvoicePaymentStatus;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  notes: string;
  terms: string;
  prepared_by: string | null;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  invoice_items?: InvoiceItem[];
}

export interface Payment {
  id: string;
  user_id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string;
  notes: string;
  created_at: string;
  invoices?: Pick<Invoice, "invoice_number" | "grand_total" | "customers">;
}

// Form types (for React Hook Form)
export interface DocumentItemForm {
  id?: string;
  description: string;
  hsn_code?: string;
  quantity: string;
  rate: string;
  discount_percent: string;
  gst_percent: string;
}

export interface QuotationForm {
  customer_id: string;
  date: string;
  valid_until: string;
  notes: string;
  terms: string;
  items: DocumentItemForm[];
}

export interface InvoiceForm {
  customer_id: string;
  date: string;
  due_date: string;
  notes: string;
  terms: string;
  items: DocumentItemForm[];
}

export interface CustomerForm {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  notes: string;
}

// Dashboard stats
export interface DashboardStats {
  total_quotations: number;
  total_invoices: number;
  month_billing: number;
  pending_payments: number;
}

export interface PeriodFilter {
  label: string;
  value: "today" | "this_week" | "this_month" | "last_month" | "custom";
}
