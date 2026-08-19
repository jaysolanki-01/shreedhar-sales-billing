import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ReportsContent } from "@/components/reports/ReportsContent";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, date, grand_total, gst_amount, amount_paid, balance_due, payment_status, customers(name, company_name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Reports" />
      <ReportsContent invoices={invoices ?? []} />
    </div>
  );
}
