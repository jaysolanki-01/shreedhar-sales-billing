import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: invoice }, { data: customers }, { data: settings }] = await Promise.all([
    supabase.from("invoices").select("*, invoice_items(*)").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("customers").select("id, name, company_name, address, gstin").eq("user_id", user.id).order("name"),
    supabase.from("doc_settings").select("*").eq("user_id", user.id).single(),
  ]);

  if (!invoice) notFound();
  if (invoice.invoice_items) invoice.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={`Edit ${invoice.invoice_number}`}
        actions={
          <Link href={`/invoices/${id}`}>
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
        }
      />
      <InvoiceForm customers={customers ?? []} defaultSettings={settings} userId={user.id} existingInvoice={invoice as any} />
    </div>
  );
}
