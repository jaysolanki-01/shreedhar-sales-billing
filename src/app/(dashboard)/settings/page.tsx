import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("company_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("doc_settings").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" />
      <SettingsContent company={company} docSettings={docSettings} userId={user.id} />
    </div>
  );
}
