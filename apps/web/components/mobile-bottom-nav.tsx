"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MessageSquare, LayoutDashboard, Compass, UserPlus } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useNotifications } from '@/hooks/use-notifications';
import { hasAppRole, isUnauthenticatedPagePath } from "@/lib/auth-routing";

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Professional notification badge component
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 z-10">
      <div className="relative">
        <div className="flex items-center justify-center min-w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full px-0.5 border-2 border-white dark:border-gray-950 shadow-sm">
          {count > 99 ? '99+' : String(count)}
        </div>
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  if (isUnauthenticatedPagePath(pathname)) {
    return null;
  }

  return <AuthenticatedMobileBottomGate pathname={pathname} />;
}

function AuthenticatedMobileBottomGate({ pathname }: { pathname: string }) {
  const { isSignedIn, user } = useUser();

  // Check if user has completed onboarding
  const userRole = user?.role;
  const hasCompletedOnboarding = hasAppRole(userRole);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't show the nav if user is not signed in or hasn't completed onboarding or not mounted
  if (!isMounted || !isSignedIn || !hasCompletedOnboarding) {
    return null;
  }

  return <AuthenticatedMobileBottomNav pathname={pathname} />;
}

function AuthenticatedMobileBottomNav({ pathname }: { pathname: string }) {
  const { unreadCount: messageCount } = useNotifications();

  const navItems: NavItem[] = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "search", href: "/search", label: "Search", icon: Search },
    { key: "discover", href: "/discover", label: "Discover", icon: Compass },
    { key: "connections", href: "/connections", label: "Connections", icon: UserPlus },
    { key: "messages", href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-[#01ae79]/20 dark:border-[#01ae79]/30 shadow-lg backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 py-1 transition-colors relative ${isActive
                ? 'text-[#01ae79]'
                : 'text-gray-500 dark:text-gray-400 active:text-[#01ae79] active:bg-[#01ae79]/5'
                }`}
            >
              <div className="relative mb-1">
                <Icon className={`h-6 w-6 ${isActive ? 'text-[#01ae79]' : ''}`} />
                {item.key === 'messages' && messageCount > 0 && (
                  <NotificationBadge count={messageCount} />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#01ae79]' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#01ae79] rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
