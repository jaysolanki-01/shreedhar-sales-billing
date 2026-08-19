"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-brand-dark/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
          "w-full max-w-lg bg-surface rounded-xl border border-brand-border shadow-modal",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-brand-border">
            <div>
              {title && <DialogPrimitive.Title className="text-lg font-semibold text-brand-dark">{title}</DialogPrimitive.Title>}
              {description && <DialogPrimitive.Description className="mt-1 text-sm text-brand-muted">{description}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close className="rounded p-1 text-brand-muted hover:text-brand-dark hover:bg-brand-beige transition-colors">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
        )}
        <div className="p-6">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
