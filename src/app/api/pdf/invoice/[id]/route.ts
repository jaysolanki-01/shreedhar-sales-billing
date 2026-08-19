import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerId } from "@/lib/owner";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/documents/InvoicePDF";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = await getOwnerId();

  const [{ data: invoice }, { data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("invoices").select("*, customers(*), invoice_items(*)").eq("id", id).eq("user_id", userId).single(),
    supabase.from("company_settings").select("*").eq("user_id", userId).single(),
    supabase.from("doc_settings").select("*").eq("user_id", userId).single(),
  ]);

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (invoice.invoice_items) {
    invoice.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, { invoice: invoice as any, company, docSettings }) as any
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
