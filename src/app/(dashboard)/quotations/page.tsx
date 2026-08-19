import { Header } from "@/components/layout/Header";
import { QuotationsContent } from "@/components/quotations/QuotationsContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function QuotationsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Quotations"
        actions={
          <Link href="/quotations/new">
            <Button variant="primary" size="md"><Plus className="h-4 w-4" />New Quotation</Button>
          </Link>
        }
      />
      <QuotationsContent />
    </div>
  );
}
