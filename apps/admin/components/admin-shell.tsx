"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { UpdraftedLogo } from "@/components/updrafted-logo";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/reports", label: "Reports", icon: Flag },
];

function isActive(pathname: string | null, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname?.startsWith(href) ?? false;
}

function Brand() {
  return (
    <Link href="/" className="flex items-center outline-none" aria-label="UpDrafted Admin">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]/80 px-3 py-2 shadow-lg shadow-black/10">
        <UpdraftedLogo className="w-[84px] sm:w-[92px]" priority />
      </div>
    </Link>
  );
}

export function AdminShell({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin: { name: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!accountOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const initials = React.useMemo(() => {
    const parts = admin.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return admin.email[0]?.toUpperCase() ?? "?";
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }, [admin.name, admin.email]);

  return (
    <div className="min-h-[100dvh]">
      {/* Top bar (all breakpoints) */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--background)]/85 backdrop-blur-md safe-area-top">
        <div className="flex h-14 items-center gap-3 pr-4 sm:h-16 sm:pr-6">
          {/* Brand block: matches sidebar width on md+ so it looks attached */}
          <div className="flex h-full shrink-0 items-center gap-3 px-4 sm:px-6 md:w-64 md:border-r md:border-[color:var(--border)]">
            <Brand />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/70 py-1 pl-1 pr-3 text-sm transition-colors hover:bg-[color:var(--accent)]"
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="grid size-7 place-items-center rounded-full bg-[color:var(--primary)] text-[11px] font-semibold text-[color:var(--primary-foreground)]">
                  {initials}
                </span>
                <span className="hidden max-w-[140px] truncate sm:inline">
                  {admin.name}
                </span>
                <ChevronDown className="size-4 text-[color:var(--muted-foreground)]" />
              </button>
              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-2 shadow-2xl anim-fade-in"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">{admin.name}</p>
                    <p className="truncate text-xs text-[color:var(--muted-foreground)]">
                      {admin.email}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-[color:var(--border)]" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--accent)]"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop sidebar (fixed, below header) */}
      <aside
        className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-[color:var(--border)] bg-[color:var(--card)]/70 backdrop-blur-md md:flex"
        aria-label="Primary navigation"
      >
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)]"
                        : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        active
                          ? "text-[color:var(--primary)]"
                          : "text-[color:var(--muted-foreground)] group-hover:text-[color:var(--foreground)]",
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 md:pb-10 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--card)]/90 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active
                      ? "text-[color:var(--primary)]"
                      : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition-colors",
                      active ? "bg-[color:var(--primary)]/15" : "bg-transparent",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
