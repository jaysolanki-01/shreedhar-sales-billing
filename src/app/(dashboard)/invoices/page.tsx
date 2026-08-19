import { Header } from "@/components/layout/Header";
import { InvoicesContent } from "@/components/invoices/InvoicesContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Invoices"
        actions={
          <Link href="/invoices/new">
            <Button variant="primary" size="md"><Plus className="h-4 w-4" />New Invoice</Button>
          </Link>
        }
      />
      <InvoicesContent />
    </div>
  );
}
