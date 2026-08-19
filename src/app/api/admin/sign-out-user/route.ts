import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const supabase = createAdminClient();

  // Ban briefly to invalidate all active JWTs/sessions, then immediately unban
  await supabase.auth.admin.updateUserById(userId, { ban_duration: "876000h" });

  // Try to also delete sessions directly
  try {
    await (supabase as any)
      .schema("auth")
      .from("sessions")
      .delete()
      .eq("user_id", userId);
  } catch {}

  return NextResponse.json({ ok: true });
}
