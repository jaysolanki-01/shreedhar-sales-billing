import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPDF } from "@/components/documents/QuotationPDF";
import React from "react";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch quotation by UUID — publicly accessible (UUID is unguessable)
  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, customers(*), quotation_items(*)")
    .eq("id", id)
    .single();

  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("company_settings").select("*").eq("user_id", quotation.user_id).single(),
    supabase.from("doc_settings").select("*").eq("user_id", quotation.user_id).single(),
  ]);

  if (quotation.quotation_items) {
    quotation.quotation_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  // Read logo from public folder as base64
  let logoBase64: string | null = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
    }
  } catch {}

  const buffer = await renderToBuffer(
    React.createElement(QuotationPDF, { quotation: quotation as any, company, docSettings, logoBase64 }) as any
  );

  const disposition = new URL(request.url).searchParams.get("dl") === "1"
    ? `attachment; filename="${quotation.quotation_number}.pdf"`
    : `inline; filename="${quotation.quotation_number}.pdf"`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    },
  });
}
