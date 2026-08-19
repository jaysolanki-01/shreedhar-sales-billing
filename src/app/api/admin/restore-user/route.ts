import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const supabase = createAdminClient();
  await supabase.auth.admin.updateUserById(userId, { ban_duration: "none" });

  return NextResponse.json({ ok: true });
}
