import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
import { Header } from "@/components/layout/Header";
import { CustomerProfileContent } from "@/components/customers/CustomerProfileContent";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: customer }, { data: quotations }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).eq("user_id", userId).single(),
    supabase.from("quotations").select("*").eq("customer_id", id).eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("invoices").select("*").eq("customer_id", id).eq("user_id", userId).order("date", { ascending: false }),
  ]);

  if (!customer) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <Header title={customer.name} subtitle={customer.company_name || "Customer Profile"} />
      <CustomerProfileContent customer={customer} quotations={quotations ?? []} invoices={invoices ?? []} userId={userId} />
    </div>
  );
}
