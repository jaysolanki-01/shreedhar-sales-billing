import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewInvoicePage({ searchParams }: { searchParams: { customer?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: customers }, { data: settings }] = await Promise.all([
    supabase.from("customers").select("id, name, company_name, address, gstin").eq("user_id", user.id).order("name"),
    supabase.from("doc_settings").select("*").eq("user_id", user.id).single(),
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
        userId={user.id}
        preselectedCustomerId={searchParams.customer}
      />
    </div>
  );
}
