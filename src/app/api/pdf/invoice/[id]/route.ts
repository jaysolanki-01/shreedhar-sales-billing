import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/documents/InvoicePDF";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: invoice }, { data: company }, { data: docSettings }] = await Promise.all([
    supabase.from("invoices").select("*, customers(*), invoice_items(*)").eq("id", params.id).eq("user_id", user.id).single(),
    supabase.from("company_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("doc_settings").select("*").eq("user_id", user.id).single(),
  ]);

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (invoice.invoice_items) {
    invoice.invoice_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, { invoice: invoice as any, company, docSettings }) as any
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
