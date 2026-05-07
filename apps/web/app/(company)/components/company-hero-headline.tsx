import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompanyHeroHeadlineProps {
  lead: ReactNode;
  emphasis: ReactNode;
  className?: string;
}

interface CompanyHeroTriggerProps {
  children: ReactNode;
}

export function CompanyHeroTrigger({ children }: CompanyHeroTriggerProps) {
  return (
    <span className="relative inline-block pb-3">
      {children}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-3 w-full text-[#01ae79]"
        viewBox="0 0 300 12"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M2 9C70 3 150 3 298 9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </span>
  );
}

export function CompanyHeroHeadline({
  lead,
  emphasis,
  className,
}: CompanyHeroHeadlineProps) {
  return (
    <h1 className={cn("leading-none", className)}>
      <span className="block text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
        {lead}
      </span>
      <span className="mt-3 block text-5xl font-black leading-[1.08] text-[#01ae79] sm:text-6xl md:mt-4 md:text-7xl">
        {emphasis}
      </span>
    </h1>
  );
}
