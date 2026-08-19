"use client";

import { useState } from "react";
import { Plus, Search, User, Phone, Mail, Building2, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { CustomerFormDialog } from "./CustomerFormDialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  customers: Customer[];
  userId: string;
}

export function CustomersContent({ customers: initial, userId }: Props) {
  const [customers, setCustomers] = useState(initial);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const router = useRouter();

  const filtered = customers.filter((c) =>
    `${c.name} ${c.company_name} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(data: Omit<Customer, "id" | "user_id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    if (editCustomer) {
      const { data: updated, error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", editCustomer.id)
        .select()
        .single();
      if (error) { toast.error("Failed to update customer"); return; }
      setCustomers((prev) => prev.map((c) => (c.id === editCustomer.id ? updated : c)));
      toast.success("Customer updated");
    } else {
      const { data: created, error } = await supabase
        .from("customers")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (error) { toast.error("Failed to add customer"); return; }
      setCustomers((prev) => [...prev, created]);
      toast.success("Customer added");
    }
    setDialogOpen(false);
    setEditCustomer(null);
  }

  async function handleDelete(customer: Customer) {
    if (!confirm(`Delete ${customer.name}? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("customers").delete().eq("id", customer.id);
    if (error) { toast.error("Cannot delete — customer has existing invoices or quotations"); return; }
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    toast.success("Customer deleted");
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-md border border-brand-border bg-surface pl-9 pr-3 py-2 text-sm text-brand-dark placeholder:text-brand-placeholder focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditCustomer(null); setDialogOpen(true); }}
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<User className="h-6 w-6" />}
          title={search ? "No customers match your search" : "No customers yet"}
          description={search ? "Try a different name or phone number" : "Add your first customer to get started"}
          action={!search ? { label: "Add Customer", onClick: () => setDialogOpen(true) } : undefined}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-brand-border shadow-card overflow-hidden">
          <div className="divide-y divide-brand-border">
            {filtered.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between px-5 py-4 hover:bg-brand-beige transition-colors group">
                <Link href={`/customers/${customer.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand-beige-dark border border-brand-border flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-brand-brown">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-brand-dark truncate">{customer.name}</p>
                      {customer.company_name && (
                        <span className="text-xs text-brand-muted truncate hidden sm:block">· {customer.company_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      {customer.phone && (
                        <span className="text-xs text-brand-muted flex items-center gap-1">
                          <Phone className="h-3 w-3" />{customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="text-xs text-brand-muted flex items-center gap-1 hidden sm:flex">
                          <Mail className="h-3 w-3" />{customer.email}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => { setEditCustomer(customer); setDialogOpen(true); }}
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(customer)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                  <Link href={`/customers/${customer.id}`}>
                    <Button variant="ghost" size="icon-sm" title="View profile">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditCustomer(null); }}
        onSave={handleSave}
        customer={editCustomer}
      />
    </div>
  );
}
