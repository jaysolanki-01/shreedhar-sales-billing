import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { InvoicesContent } from "@/components/invoices/InvoicesContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function InvoicesPage() {
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, customers(name, company_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Invoices"
        subtitle={`${invoices?.length ?? 0} total`}
        actions={
          <Link href="/invoices/new">
            <Button variant="primary" size="md"><Plus className="h-4 w-4" />New Invoice</Button>
          </Link>
        }
      />
      <InvoicesContent invoices={invoices ?? []} />
    </div>
  );
}
