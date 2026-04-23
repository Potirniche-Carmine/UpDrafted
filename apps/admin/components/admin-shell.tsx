"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Flag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/reports", label: "Reports", icon: Flag },
];

export function AdminShell({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin: { name: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-[color:var(--border)] bg-[color:var(--card)] md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="grid size-9 place-items-center rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)] font-bold">
              U
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">UpDrafted</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--primary)]">
                Admin
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/" ? pathname === "/" : pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[color:var(--accent)] text-[color:var(--foreground)]"
                          : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]",
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-[color:var(--border)] p-4">
            <p className="truncate text-sm font-medium">{admin.name}</p>
            <p className="mb-3 truncate text-xs text-[color:var(--muted-foreground)]">
              {admin.email}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
