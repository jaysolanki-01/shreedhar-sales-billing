import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();

  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch active sessions from auth.sessions
  let sessions: any[] = [];
  try {
    const { data } = await (supabase as any)
      .schema("auth")
      .from("sessions")
      .select("id, user_id, created_at, updated_at, user_agent, ip");
    sessions = data ?? [];
  } catch {}

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    banned_until: (u as any).banned_until ?? null,
    sessions: sessions
      .filter((s) => s.user_id === u.id)
      .map((s) => ({
        id: s.id,
        created_at: s.created_at,
        updated_at: s.updated_at,
        user_agent: s.user_agent ?? "",
        ip: s.ip ?? "",
      })),
  }));

  return NextResponse.json(result);
}
