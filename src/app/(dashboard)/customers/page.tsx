import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CustomersContent } from "@/components/customers/CustomersContent";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Customers" subtitle={`${customers?.length ?? 0} customers`} />
      <CustomersContent customers={customers ?? []} userId={user.id} />
    </div>
  );
}
