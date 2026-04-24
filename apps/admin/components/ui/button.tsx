import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm shadow-[color:var(--primary)]/20 hover:brightness-110",
        success:
          "bg-[color:var(--success)] text-[color:var(--success-foreground)] shadow-sm hover:brightness-110",
        warning:
          "bg-[color:var(--warning)] text-[color:var(--warning-foreground)] shadow-sm hover:brightness-110",
        destructive:
          "bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] shadow-sm hover:brightness-110",
        outline:
          "border border-[color:var(--border)] bg-transparent hover:bg-[color:var(--accent)] hover:border-[color:var(--primary)]/40 text-[color:var(--foreground)]",
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--accent)]",
        ghost:
          "bg-transparent hover:bg-[color:var(--accent)] text-[color:var(--foreground)]",
        link: "bg-transparent underline-offset-4 hover:underline text-[color:var(--primary)] h-auto px-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        xl: "h-12 rounded-lg px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
