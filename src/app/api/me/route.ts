import { getOwnerId } from "@/lib/owner";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getOwnerId();
  return NextResponse.json({ userId });
}
