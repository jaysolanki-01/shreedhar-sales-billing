import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-brand-dark uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "w-full rounded-md border border-brand-border bg-surface px-3 py-2 text-sm text-brand-dark placeholder:text-brand-placeholder resize-none",
            "transition-colors focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown",
            error && "border-red-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
