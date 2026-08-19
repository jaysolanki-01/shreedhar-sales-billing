import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const { customer } = await searchParams;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: customers }, { data: settings }] = await Promise.all([
    supabase.from("customers").select("id, name, company_name, address, gstin").eq("user_id", userId).order("name"),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="New Invoice"
        actions={
          <Link href="/invoices">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
        }
      />
      <InvoiceForm
        customers={customers ?? []}
        defaultSettings={settings}
        userId={userId}
        preselectedCustomerId={customer}
      />
    </div>
  );
}
