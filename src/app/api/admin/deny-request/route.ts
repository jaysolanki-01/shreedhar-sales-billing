import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { requestId } = await request.json();
  if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

  const supabase = createAdminClient();
  await supabase
    .from("access_requests")
    .update({ status: "denied", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  return NextResponse.json({ ok: true });
}
