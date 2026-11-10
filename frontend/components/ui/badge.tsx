import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-neutral-900 text-white shadow hover:bg-neutral-800",
    secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    destructive: "border-transparent bg-rose-500 text-white shadow hover:bg-rose-600",
    outline: "border-neutral-200 text-neutral-900",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
