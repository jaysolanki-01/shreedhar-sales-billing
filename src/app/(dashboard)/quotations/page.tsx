import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { QuotationsContent } from "@/components/quotations/QuotationsContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quotations } = await supabase
    .from("quotations")
    .select("*, customers(name, company_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Quotations"
        subtitle={`${quotations?.length ?? 0} total`}
        actions={
          <Link href="/quotations/new">
            <Button variant="primary" size="md"><Plus className="h-4 w-4" />New Quotation</Button>
          </Link>
        }
      />
      <QuotationsContent quotations={quotations ?? []} />
    </div>
  );
}
