import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { InvoiceDetailContent } from "@/components/invoices/InvoiceDetailContent";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: invoice }, { data: company }, { data: docSettings }, { data: payments }] = await Promise.all([
    supabase.from("invoices").select("*, customers(*), invoice_items(*)").eq("id", params.id).eq("user_id", user.id).single(),
    supabase.from("company_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("doc_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("payments").select("*").eq("invoice_id", params.id).order("payment_date", { ascending: false }),
  ]);

  if (!invoice) notFound();

  if (invoice.invoice_items) {
    invoice.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title={invoice.invoice_number} subtitle={(invoice.customers as any)?.name ?? ""} />
      <InvoiceDetailContent invoice={invoice as any} company={company} docSettings={docSettings} payments={payments ?? []} userId={user.id} />
    </div>
  );
}
