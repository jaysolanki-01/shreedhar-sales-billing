"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        primary:
          "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm focus-visible:ring-[#4F46E5]",
        secondary:
          "bg-white border border-[#E0E7FF] text-[#3730A3] hover:bg-[#EEF2FF] shadow-sm focus-visible:ring-[#4F46E5]",
        outline:
          "border border-[#E0E7FF] bg-white text-[#4F46E5] hover:bg-[#EEF2FF] focus-visible:ring-[#4F46E5]",
        ghost:
          "text-[#6B7280] hover:text-[#4F46E5] hover:bg-[#EEF2FF] focus-visible:ring-[#4F46E5]",
        danger:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500",
        "danger-outline":
          "border border-red-200 text-red-600 hover:bg-red-50 focus-visible:ring-red-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
