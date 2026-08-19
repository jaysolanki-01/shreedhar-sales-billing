import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { Header } from "@/components/layout/Header";
import { SettingsContent } from "@/components/settings/SettingsContent";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("company_settings").select("*").eq("user_id", userId).single(),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" />
      <SettingsContent company={company} docSettings={docSettings} userId={userId} />
    </div>
  );
}

