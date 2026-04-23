import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
        secondary: "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]",
        success: "bg-[color:var(--success)] text-[color:var(--success-foreground)]",
        warning: "bg-[color:var(--warning)] text-[color:var(--warning-foreground)]",
        destructive: "bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)]",
        outline:
          "border border-[color:var(--border)] text-[color:var(--foreground)] bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
