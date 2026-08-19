import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/documents/InvoicePDF";
import React from "react";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch invoice by UUID — publicly accessible (UUID is unguessable)
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(*), invoice_items(*)")
    .eq("id", id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("company_settings").select("*").eq("user_id", invoice.user_id).single(),
    supabase.from("doc_settings").select("*").eq("user_id", invoice.user_id).single(),
  ]);

  if (invoice.invoice_items) {
    invoice.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  let logoBase64: string | null = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
    }
  } catch {}

  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, { invoice: invoice as any, company, docSettings, logoBase64 }) as any
  );

  const disposition = new URL(request.url).searchParams.get("dl") === "1"
    ? `attachment; filename="${invoice.invoice_number}.pdf"`
    : `inline; filename="${invoice.invoice_number}.pdf"`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    },
  });
}
