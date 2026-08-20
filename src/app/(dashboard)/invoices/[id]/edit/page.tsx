import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: invoice }, { data: customers }, { data: settings }] = await Promise.all([
    supabase.from("invoices").select("*, invoice_items(*)").eq("id", id).eq("user_id", userId).single(),
    supabase.from("customers").select("id, name, company_name, address, ship_to_address, gstin").eq("user_id", userId).order("name"),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
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
      <InvoiceForm customers={customers ?? []} defaultSettings={settings} userId={userId} existingInvoice={invoice as any} />
    </div>
  );
}
