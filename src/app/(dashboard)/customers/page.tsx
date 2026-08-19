import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { CustomersContent } from "@/components/customers/CustomersContent";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Customers" subtitle={`${customers?.length ?? 0} customers`} />
      <CustomersContent customers={customers ?? []} userId={userId} />
    </div>
  );
}

