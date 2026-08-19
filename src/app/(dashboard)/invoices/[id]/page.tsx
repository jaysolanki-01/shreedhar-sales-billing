import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
import { Header } from "@/components/layout/Header";
import { InvoiceDetailContent } from "@/components/invoices/InvoiceDetailContent";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: invoice }, { data: company }, { data: docSettings }, { data: payments }] = await Promise.all([
    supabase.from("invoices").select("*, customers(*), invoice_items(*)").eq("id", id).eq("user_id", userId).single(),
    supabase.from("company_settings").select("*").eq("user_id", userId).single(),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
    supabase.from("payments").select("*").eq("invoice_id", id).order("payment_date", { ascending: false }),
  ]);

  if (!invoice) notFound();

  if (invoice.invoice_items) {
    invoice.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title={invoice.invoice_number} subtitle={(invoice.customers as any)?.name ?? ""} />
      <InvoiceDetailContent invoice={invoice as any} company={company} docSettings={docSettings} payments={payments ?? []} userId={userId} />
    </div>
  );
}
