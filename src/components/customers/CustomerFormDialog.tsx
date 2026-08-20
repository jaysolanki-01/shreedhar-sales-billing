"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Customer } from "@/types";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Customer name is required"),
  company_name: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email").or(z.literal("")),
  address: z.string(),
  ship_to_address: z.string(),
  gstin: z.string(),
  notes: z.string(),
});

type FormData = {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  ship_to_address: string;
  gstin: string;
  notes: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Customer, "id" | "user_id" | "created_at" | "updated_at">) => void;
  customer: Customer | null;
}

export function CustomerFormDialog({ open, onOpenChange, onSave, customer }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", company_name: "", phone: "", email: "", address: "", ship_to_address: "", gstin: "", notes: "" },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        company_name: customer.company_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        ship_to_address: customer.ship_to_address ?? "",
        gstin: customer.gstin,
        notes: customer.notes,
      });
    } else {
      reset({ name: "", company_name: "", phone: "", email: "", address: "", ship_to_address: "", gstin: "", notes: "" });
    }
  }, [customer, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={customer ? "Edit Customer" : "Add Customer"}
        description="Customer details will appear on quotations and invoices."
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Input label="Customer Name *" placeholder="Full name" {...register("name")} error={errors.name?.message} />
          <Input label="Company Name" placeholder="Company or business name" {...register("company_name")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" placeholder="9876543210" type="tel" {...register("phone")} />
            <Input label="Email" placeholder="email@example.com" type="email" {...register("email")} error={errors.email?.message} />
          </div>
          <Textarea label="Bill To Address" placeholder="Full billing address" rows={3} {...register("address")} />
          <Textarea label="Ship To Address" placeholder="Leave blank to use same as billing address" rows={2} {...register("ship_to_address")} />
          <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" {...register("gstin")} />
          <Textarea label="Notes" placeholder="Any internal notes" rows={2} {...register("notes")} />

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="md">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {customer ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
