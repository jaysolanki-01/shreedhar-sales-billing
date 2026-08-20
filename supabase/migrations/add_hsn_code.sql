-- Add HSN Code column to quotation_items and invoice_items
alter table quotation_items add column if not exists hsn_code text default '';
alter table invoice_items   add column if not exists hsn_code text default '';
