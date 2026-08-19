"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CompanySettings, DocSettings } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Building2, FileText, Receipt, Landmark, CreditCard } from "lucide-react";

interface Props {
  company: CompanySettings | null;
  docSettings: DocSettings | null;
  userId: string;
}

export function SettingsContent({ company, docSettings, userId }: Props) {
  const [activeTab, setActiveTab] = useState<"company" | "quotation" | "invoice" | "tax" | "bank">("company");

  const tabs = [
    { id: "company", label: "Company Profile", icon: Building2 },
    { id: "quotation", label: "Quotation", icon: FileText },
    { id: "invoice", label: "Invoice", icon: Receipt },
    { id: "bank", label: "Bank Details", icon: Landmark },
  ] as const;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto w-full">
      {/* Tab navigation */}
      <div className="flex gap-1 bg-brand-beige rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === id ? "bg-brand-dark text-brand-gold" : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "company" && <CompanyForm company={company} userId={userId} />}
      {activeTab === "quotation" && <QuotationSettingsForm docSettings={docSettings} userId={userId} />}
      {activeTab === "invoice" && <InvoiceSettingsForm docSettings={docSettings} userId={userId} />}
      {activeTab === "bank" && <BankDetailsForm docSettings={docSettings} userId={userId} />}
    </div>
  );
}

function CompanyForm({ company, userId }: { company: CompanySettings | null; userId: string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      company_name: company?.company_name ?? "Shreedhar Sales",
      address: company?.address ?? "802 B Wing, Gopal Palace, Opp. Ocean Park, Nehru Nagar, Ahmedabad",
      phone: company?.phone ?? "",
      email: company?.email ?? "",
      website: company?.website ?? "",
      gstin: company?.gstin ?? "",
    },
  });

  async function onSubmit(data: any) {
    const supabase = createClient();
    if (company) {
      const { error } = await supabase.from("company_settings").update(data).eq("user_id", userId);
      if (error) { toast.error("Failed to save"); return; }
    } else {
      const { error } = await supabase.from("company_settings").insert({ ...data, user_id: userId });
      if (error) { toast.error("Failed to save"); return; }
    }
    toast.success("Company profile saved");
  }

  return (
    <Card>
      <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Company Name" {...register("company_name")} />
          <Textarea label="Address" rows={3} {...register("address")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" {...register("phone")} />
            <Input label="Email" type="email" {...register("email")} />
          </div>
          <Input label="Website" placeholder="https://example.com" {...register("website")} />
          <Input label="GSTIN" placeholder="24XXXXX0000A1Z5" {...register("gstin")} />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting}>Save Company Profile</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function QuotationSettingsForm({ docSettings, userId }: { docSettings: DocSettings | null; userId: string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      qtn_prefix: docSettings?.qtn_prefix ?? "QTN",
      qtn_validity_days: docSettings?.qtn_validity_days ?? 10,
      qtn_terms: docSettings?.qtn_terms ?? "1. Quotation is valid until the mentioned validity date.\n2. Taxes are applicable as mentioned.\n3. Payment terms are as agreed with the customer.",
    },
  });

  async function onSubmit(data: any) {
    const supabase = createClient();
    const payload = { qtn_prefix: data.qtn_prefix, qtn_validity_days: parseInt(data.qtn_validity_days), qtn_terms: data.qtn_terms };
    if (docSettings) {
      await supabase.from("doc_settings").update(payload).eq("user_id", userId);
    } else {
      await supabase.from("doc_settings").insert({ ...payload, user_id: userId });
    }
    toast.success("Quotation settings saved");
  }

  return (
    <Card>
      <CardHeader><CardTitle>Quotation Settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quotation Prefix" placeholder="QTN" {...register("qtn_prefix")} hint="e.g. QTN → QTN-2026-001" />
            <Input label="Default Validity (days)" type="number" {...register("qtn_validity_days")} />
          </div>
          <Textarea label="Default Terms & Conditions" rows={5} {...register("qtn_terms")} />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting}>Save Quotation Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function InvoiceSettingsForm({ docSettings, userId }: { docSettings: DocSettings | null; userId: string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      inv_prefix: docSettings?.inv_prefix ?? "INV",
      inv_payment_days: docSettings?.inv_payment_days ?? 30,
      default_gst_percent: docSettings?.default_gst_percent ?? 18,
      inv_terms: docSettings?.inv_terms ?? "1. Payment is due within 30 days of invoice date.\n2. Taxes are applicable as mentioned.\n3. Goods once sold will not be taken back.",
    },
  });

  async function onSubmit(data: any) {
    const supabase = createClient();
    const payload = {
      inv_prefix: data.inv_prefix,
      inv_payment_days: parseInt(data.inv_payment_days),
      default_gst_percent: parseFloat(data.default_gst_percent),
      inv_terms: data.inv_terms,
    };
    if (docSettings) {
      await supabase.from("doc_settings").update(payload).eq("user_id", userId);
    } else {
      await supabase.from("doc_settings").insert({ ...payload, user_id: userId });
    }
    toast.success("Invoice settings saved");
  }

  return (
    <Card>
      <CardHeader><CardTitle>Invoice Settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="Invoice Prefix" placeholder="INV" {...register("inv_prefix")} hint="e.g. INV → INV-2026-001" />
            <Input label="Payment Terms (days)" type="number" {...register("inv_payment_days")} />
            <Input label="Default GST %" type="number" step="0.01" {...register("default_gst_percent")} />
          </div>
          <Textarea label="Default Terms & Conditions" rows={5} {...register("inv_terms")} />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting}>Save Invoice Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function BankDetailsForm({ docSettings, userId }: { docSettings: DocSettings | null; userId: string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      bank_account_name: docSettings?.bank_account_name ?? "",
      bank_name: docSettings?.bank_name ?? "",
      bank_account_number: docSettings?.bank_account_number ?? "",
      bank_ifsc: docSettings?.bank_ifsc ?? "",
      bank_upi: docSettings?.bank_upi ?? "",
    },
  });

  async function onSubmit(data: any) {
    const supabase = createClient();
    if (docSettings) {
      await supabase.from("doc_settings").update(data).eq("user_id", userId);
    } else {
      await supabase.from("doc_settings").insert({ ...data, user_id: userId });
    }
    toast.success("Bank details saved");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
        <p className="text-sm text-brand-muted mt-1">Shown at the bottom of every invoice and quotation PDF.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Account Holder Name" {...register("bank_account_name")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bank Name" {...register("bank_name")} />
            <Input label="IFSC Code" {...register("bank_ifsc")} />
          </div>
          <Input label="Account Number" {...register("bank_account_number")} />
          <Input label="UPI ID" placeholder="name@upi" {...register("bank_upi")} />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting}>Save Bank Details</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
