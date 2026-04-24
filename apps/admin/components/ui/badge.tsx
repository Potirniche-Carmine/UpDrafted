import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--primary)]/15 text-[color:var(--primary)] ring-[color:var(--primary)]/30",
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] ring-[color:var(--border)]",
        success:
          "bg-[color:var(--success)]/15 text-[color:var(--success)] ring-[color:var(--success)]/30",
        warning:
          "bg-[color:var(--warning)]/15 text-[color:var(--warning)] ring-[color:var(--warning)]/30",
        destructive:
          "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)] ring-[color:var(--destructive)]/30",
        outline:
          "bg-transparent text-[color:var(--foreground)] ring-[color:var(--border)]",
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
