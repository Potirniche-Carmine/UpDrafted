"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeOption = "system" | "light" | "dark";

const OPTIONS: Array<{
  value: ThemeOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-10 items-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/80 p-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <span
            key={value}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--muted-foreground)]"
            aria-hidden="true"
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/80 p-1 shadow-sm"
      role="group"
      aria-label="Color theme"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
              active
                ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]",
            )}
            aria-pressed={active}
            aria-label={`Use ${label.toLowerCase()} theme`}
            title={label}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
