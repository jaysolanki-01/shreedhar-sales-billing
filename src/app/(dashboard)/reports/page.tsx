import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { ReportsContent } from "@/components/reports/ReportsContent";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, date, grand_total, gst_amount, amount_paid, balance_due, payment_status, customers(name, company_name)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Reports" />
      <ReportsContent invoices={invoices ?? []} />
    </div>
  );
}

