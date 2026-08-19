import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-brand-dark uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">{leftIcon}</div>
          )}
          <input
            id={inputId}
            className={cn(
              "w-full h-9 rounded-md border border-brand-border bg-surface px-3 py-2 text-sm text-brand-dark placeholder:text-brand-placeholder",
              "transition-colors focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown",
              error && "border-red-400 focus:border-red-400 focus:ring-red-400",
              leftIcon && "pl-9",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-brand-muted">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
