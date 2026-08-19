import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [
    { count: totalQuotations },
    { count: totalInvoices },
    { data: monthInvoices },
    { data: pendingInvoices },
  ] = await Promise.all([
    supabase.from("quotations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("invoices").select("grand_total").eq("user_id", user.id).gte("date", monthStart).lte("date", monthEnd),
    supabase.from("invoices").select("balance_due").eq("user_id", user.id).in("payment_status", ["pending", "partially_paid", "overdue"]),
  ]);

  const monthBilling = (monthInvoices ?? []).reduce((s, i) => s + Number(i.grand_total), 0);
  const pendingPayments = (pendingInvoices ?? []).reduce((s, i) => s + Number(i.balance_due), 0);

  const stats = {
    total_quotations: totalQuotations ?? 0,
    total_invoices: totalInvoices ?? 0,
    month_billing: monthBilling,
    pending_payments: pendingPayments,
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Dashboard"
        subtitle={`${now.toLocaleString("en-IN", { month: "long" })} ${now.getFullYear()}`}
      />
      <DashboardContent stats={stats} userId={user.id} />
    </div>
  );
}
