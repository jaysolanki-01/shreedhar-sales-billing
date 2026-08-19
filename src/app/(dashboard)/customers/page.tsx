import { Header } from "@/components/layout/Header";
import { CustomersContent } from "@/components/customers/CustomersContent";

export default function CustomersPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header title="Customers" />
      <CustomersContent />
    </div>
  );
}
