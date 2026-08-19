import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { QuotationForm } from "@/components/quotations/QuotationForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: quotation }, { data: customers }, { data: settings }] = await Promise.all([
    supabase.from("quotations").select("*, quotation_items(*)").eq("id", id).eq("user_id", userId).single(),
    supabase.from("customers").select("id, name, company_name, address, gstin").eq("user_id", userId).order("name"),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
  ]);

  if (!quotation) notFound();

  if (quotation.quotation_items) {
    quotation.quotation_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={`Edit ${quotation.quotation_number}`}
        actions={
          <Link href={`/quotations/${id}`}>
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
        }
      />
      <QuotationForm
        customers={customers ?? []}
        defaultSettings={settings}
        userId={userId}
        existingQuotation={quotation as any}
      />
    </div>
  );
}
