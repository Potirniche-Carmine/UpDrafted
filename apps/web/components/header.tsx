"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Bell, LogIn, Search, Menu, Sun, Moon, LogOut, User as UserIcon, Settings, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import { useNotifications } from '@/hooks/use-notifications';
import { SearchBar } from '@/app/(search)/components/search-bar';
import { useUser, signOut } from "@/hooks/use-auth";
import { getAccessPathForUser, hasAppRole } from "@/lib/auth-routing";

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ReactElement;
}

function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-semibold rounded-full px-1 border-2 border-background shadow-sm">
      {count > 99 ? '99+' : String(count)}
    </span>
  );
}

function NavItemComponent({
  item,
  notificationCount = 0,
  isActive = false,
}: {
  item: NavItem;
  notificationCount?: number;
  isActive?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'text-[#01ae79] bg-[#01ae79]/10'
          : 'text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/5'
      }`}
      title={item.label}
    >
      <span className="relative flex items-center justify-center">
        {item.icon}
        {item.key === 'notifications' && notificationCount > 0 && (
          <NotificationBadge count={notificationCount} />
        )}
      </span>
      <span className="hidden xl:inline">{item.label}</span>
    </Link>
  );
}

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserButtonDropdown({
  user,
  hasCompletedOnboarding,
  profileNavigating,
  handleViewProfile,
  isAdmin,
}: {
  user: { name?: string | null; email: string; image?: string | null };
  hasCompletedOnboarding: boolean;
  profileNavigating: boolean;
  handleViewProfile: () => void;
  isAdmin: boolean;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={36}
              height={36}
              className="rounded-full ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#01ae79]/10 flex items-center justify-center text-[#01ae79] font-semibold text-sm ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex flex-col space-y-0.5 p-2">
          {user.name && <p className="text-sm font-semibold truncate">{user.name}</p>}
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {hasCompletedOnboarding && (
          <DropdownMenuItem onClick={handleViewProfile} disabled={profileNavigating}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{profileNavigating ? "Loading..." : "View profile"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push('/account')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Manage account</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin controls</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignedInUserMenu({
  user,
  hasCompletedOnboarding,
  isAdmin,
}: {
  user: { name?: string | null; email: string; image?: string | null };
  hasCompletedOnboarding: boolean;
  isAdmin: boolean;
}) {
  const { navigateToProfile, isNavigating: profileNavigating } = useProfileNavigation();

  const handleViewProfile = async () => {
    await navigateToProfile();
  };

  return (
    <UserButtonDropdown
      user={user}
      hasCompletedOnboarding={hasCompletedOnboarding}
      profileNavigating={profileNavigating}
      handleViewProfile={handleViewProfile}
      isAdmin={isAdmin}
    />
  );
}

function OnboardedHeaderContent({
  user,
  userRole,
  pathname,
  navItems,
  isAdmin,
}: {
  user: { name?: string | null; email: string; image?: string | null };
  userRole: string;
  pathname: string;
  navItems: NavItem[];
  isAdmin: boolean;
}) {
  const { unreadCount: notificationCount } = useNotifications();

  return (
    <>
      <div className="hidden md:flex flex-1 justify-center max-w-lg min-w-0 mx-4">
        <div className="w-full max-w-md min-w-0">
          <SearchBar userRole={userRole} />
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <NavItemComponent
              key={item.key}
              item={item}
              notificationCount={item.key === 'notifications' ? notificationCount : 0}
              isActive={isActive}
            />
          );
        })}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
        <ThemeToggle />
        <SignedInUserMenu
          user={user}
          hasCompletedOnboarding
          isAdmin={isAdmin}
        />
      </nav>

      <div className="md:hidden flex items-center">
        <SignedInUserMenu
          user={user}
          hasCompletedOnboarding
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
}

export function Header() {
  const pathname = usePathname();

  return <AuthenticatedHeader pathname={pathname} />;
}

function AuthenticatedHeader({ pathname }: { pathname: string }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userRole = user?.role as string | undefined;
  const hasCompletedOnboarding = hasAppRole(userRole);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      const timeout = setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [mobileMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const destination = isSignedIn ? getAccessPathForUser(user) : '/';
    window.location.assign(destination);
  };

  const navItems: NavItem[] = [
    { key: "discover", href: "/discover", label: "Discover", icon: <Search className="h-5 w-5" /> },
    { key: "connections", href: "/connections", label: "Connections", icon: <Users className="h-5 w-5" /> },
    { key: "messages", href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { key: "notifications", href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
  ];

  const renderLogo = () => (
    <a
      href="#"
      onClick={handleLogoClick}
      className="flex items-center shrink-0 logo-no-flash"
      aria-label="UpDrafted home"
    >
      <Image
        src="/updrafted-logo.webp"
        alt="UpDrafted"
        width={140}
        height={40}
        priority
        placeholder="empty"
        sizes="(max-width: 640px) 110px, 140px"
        style={{
          width: "auto",
          height: "auto",
          maxHeight: "36px",
        }}
      />
    </a>
  );

  if (!isLoaded || !mounted) {
    return (
      <header className="sticky top-0 z-51 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-950/70">
        <div className="mx-auto max-w-screen-2xl flex h-14 lg:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {renderLogo()}
        </div>
      </header>
    );
  }

  // Authenticated + onboarded users: minimal header on mobile (just logo + profile)
  if (isSignedIn && hasCompletedOnboarding) {
    return (
      <header className="sticky top-0 z-51 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-950/70">
        <div className="mx-auto max-w-screen-2xl flex h-14 lg:h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {renderLogo()}
          {userRole && user && (
            <OnboardedHeaderContent
              user={user}
              userRole={userRole}
              pathname={pathname}
              navItems={navItems}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </header>
    );
  }

  // Signed in but not onboarded, or a stale route before proxy redirects.
  const marketingLinks = [
    { href: "/for-athletes", label: "For Athletes" },
    { href: "/for-coaches", label: "For Coaches" },
    { href: "/for-recruiters", label: "For Recruiters" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-51 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-950/70">
      <div className="mx-auto max-w-screen-2xl flex h-14 lg:h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {renderLogo()}

        {!isSignedIn && (
          <nav className="hidden md:flex flex-1 justify-center items-center gap-1">
            {marketingLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#01ae79] bg-[#01ae79]/10'
                      : 'text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {!isSignedIn && (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-sm font-semibold">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-[#01ae79] hover:bg-[#018a60] text-white font-semibold">
                  Create profile
                </Button>
              </Link>
            </>
          )}
          {isSignedIn && user && !hasCompletedOnboarding && (
            <SignedInUserMenu
              user={user}
              hasCompletedOnboarding={false}
              isAdmin={isAdmin}
            />
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn && user && !hasCompletedOnboarding && (
            <SignedInUserMenu
              user={user}
              hasCompletedOnboarding={false}
              isAdmin={isAdmin}
            />
          )}
          {!isSignedIn && (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Sign in">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-sm p-0 flex flex-col">
                  <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                    <SheetTitle className="text-left text-lg">UpDrafted</SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {[
                      ...marketingLinks,
                      { href: "/contact", label: "Contact" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-3 rounded-lg text-base font-medium text-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/60 p-4 space-y-2.5 bg-background">
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <Button className="w-full h-11 bg-[#01ae79] hover:bg-[#018a60] text-white text-base font-semibold rounded-lg shadow-sm">
                        Create profile
                      </Button>
                    </Link>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="w-full h-11 border-[#01ae79]/40 hover:bg-[#01ae79]/5 text-[#01ae79] hover:text-[#01ae79] text-base font-semibold rounded-lg"
                      >
                        Sign in
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
