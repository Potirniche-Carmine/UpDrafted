import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "transform-gpu will-change-auto",
        className
      )}
      {...props}
    />
  )
}

// SocialInput: Input with @ prefix, user cannot remove or type @
function SocialInput({ value, onChange, className, ...props }: React.ComponentProps<"input">) {
  // Always strip @ from value for the input, but display @ as prefix
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any @ from the input value
    const newValue = e.target.value.replace(/@/g, "");
    if (onChange) {
      onChange({ ...e, target: { ...e.target, value: newValue } });
    }
  };

  return (
    <div className={cn("relative flex items-center", className)} style={{ background: "none" }}>
      <span className="absolute left-3 text-muted-foreground pointer-events-none select-none">@</span>
      <Input
        {...props}
        value={typeof value === "string" ? value.replace(/@/g, "") : value}
        onChange={handleChange}
        className={cn("pl-7", className)}
        inputMode="text"
        autoComplete="off"
      />
    </div>
  );
}

export { Input, SocialInput };
