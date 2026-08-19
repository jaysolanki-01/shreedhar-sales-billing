import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { QuotationDetailContent } from "@/components/quotations/QuotationDetailContent";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: quotation }, { data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("quotations").select("*, customers(*), quotation_items(*)").eq("id", id).eq("user_id", userId).single(),
    supabase.from("company_settings").select("*").eq("user_id", userId).single(),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
  ]);

  if (!quotation) notFound();

  if (quotation.quotation_items) {
    quotation.quotation_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title={quotation.quotation_number} subtitle={(quotation.customers as any)?.name ?? ""} />
      <QuotationDetailContent
        quotation={quotation}
        company={company}
        docSettings={docSettings}
        userId={userId}
      />
    </div>
  );
}
