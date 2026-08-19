import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { QuotationsContent } from "@/components/quotations/QuotationsContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function QuotationsPage() {
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const { data: quotations } = await supabase
    .from("quotations")
    .select("*, customers(name, company_name)")
    .eq("user_id", userId)
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

