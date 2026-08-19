import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { InvoicesContent } from "@/components/invoices/InvoicesContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, customers(name, company_name)")
    .eq("user_id", user.id)
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
