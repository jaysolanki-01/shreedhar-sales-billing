import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CustomerProfileContent } from "@/components/customers/CustomerProfileContent";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: customer }, { data: quotations }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("quotations").select("*").eq("customer_id", id).eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("invoices").select("*").eq("customer_id", id).eq("user_id", user.id).order("date", { ascending: false }),
  ]);

  if (!customer) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <Header title={customer.name} subtitle={customer.company_name || "Customer Profile"} />
      <CustomerProfileContent customer={customer} quotations={quotations ?? []} invoices={invoices ?? []} userId={user.id} />
    </div>
  );
}
