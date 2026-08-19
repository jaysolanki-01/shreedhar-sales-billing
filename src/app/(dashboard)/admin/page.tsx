export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { AdminContent } from "@/components/admin/AdminContent";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header title="Admin" subtitle="Access & Devices" />
      <div className="flex-1 overflow-y-auto">
        <AdminContent currentUserId={user.id} />
      </div>
    </div>
  );
}
