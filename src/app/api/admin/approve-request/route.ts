import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(request: NextRequest) {
  const { requestId, email, name } = await request.json();
  if (!requestId || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createAdminClient();
  const tempPassword = generatePassword();

  // Create the Supabase user
  const { data: user, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: name ?? "" },
  });
  if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });

  // Mark request as approved in DB
  await supabase
    .from("access_requests")
    .update({ status: "approved", temp_password: tempPassword, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  return NextResponse.json({ ok: true, tempPassword, userId: user.user?.id });
}
