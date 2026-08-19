import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { PaymentsContent } from "@/components/payments/PaymentsContent";

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: payments }, { data: pendingInvoices }] = await Promise.all([
    supabase
      .from("payments")
      .select("*, invoices(invoice_number, grand_total, customers(name))")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, grand_total, balance_due, payment_status, date, customers(name)")
      .eq("user_id", userId)
      .in("payment_status", ["pending", "partially_paid", "overdue"])
      .order("date", { ascending: true }),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Payments" />
      <PaymentsContent payments={payments ?? []} pendingInvoices={pendingInvoices ?? []} />
    </div>
  );
}

