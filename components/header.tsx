"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Bell, LogIn, ChevronDown, Search, Menu, Sun, Moon, LogOut, User as UserIcon, Settings } from "lucide-react";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import { useNotifications } from '@/hooks/use-notifications';
import { SearchBar } from '@/app/(search)/components/search-bar';
import { useUser, signOut } from "@/hooks/use-auth";

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ReactElement;
  requiresAuth: boolean;
  className?: string;
  onClick?: () => void;
}

// Professional notification badge component
function NotificationBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count === 0) return null;

  return (
    <div className={`absolute -top-2 -right-2 z-10 ${className}`}>
      <div className="relative">
        <div className="flex items-center justify-center min-w-4.5 h-4.5 bg-red-500 text-white text-xs font-medium rounded-full px-1 border-2 border-white dark:border-gray-950 shadow-sm">
          {count > 99 ? '99+' : String(count)}
        </div>
        {/* Subtle pulse animation for new notifications */}
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
      </div>
    </div>
  );
}

// Professional navigation item with notification support
function NavItemComponent({
  item,
  notificationCount = 0,
  className = "",
  onClick,
  isActive = false
}: {
  item: NavItem;
  notificationCount?: number;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`transition-colors flex items-center px-2 md:px-3 py-2 group rounded-lg relative ${isActive
        ? 'text-[#01ae79] bg-[#01ae79]/10 dark:bg-[#01ae79]/20'
        : 'text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10'
        } ${className}`}
      title={item.label}
    >
      <div className="relative">
        {item.icon}
        {item.key === 'notifications' && notificationCount > 0 && (
          <NotificationBadge count={notificationCount} />
        )}
      </div>
      <span className="ml-2 text-sm font-medium hidden xl:inline">
        {item.label}
      </span>
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#01ae79] rounded-full"></div>
      )}
    </Link>
  );
}

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User button dropdown with profile and sign out
function UserButtonDropdown({
  user,
  hasCompletedOnboarding,
  profileNavigating,
  handleViewProfile
}: {
  user: { name?: string | null; email: string; image?: string | null };
  hasCompletedOnboarding: boolean;
  profileNavigating: boolean;
  handleViewProfile: () => void;
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
            <div className="w-9 h-9 rounded-full bg-[#01ae79]/10 flex items-center justify-center text-[#01ae79] font-medium ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
          )}
          {hasCompletedOnboarding && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.25 h-3.25 
                         bg-[#01ae79]/10 dark:bg-[#01ae79]/20 
                         rounded-full flex items-center justify-center 
                         pointer-events-none 
                         border-2 border-background shadow-sm"
            >
              <ChevronDown className="h-2.5 w-2.5 text-[#01ae79]" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewProfile} disabled={profileNavigating}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{profileNavigating ? "Loading..." : "View Profile"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/account')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Manage Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { navigateToProfile, isNavigating: profileNavigating } = useProfileNavigation();
  const { unreadCount: notificationCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has completed onboarding (has a role)
  const userRole = user?.role as string | undefined;
  const hasCompletedOnboarding = userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole);
  const isAdmin = userRole === 'admin';

  // Prevent hydration mismatch by ensuring component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blur any focused inputs when mobile sheet opens to prevent auto-focus
  useEffect(() => {
    if (mobileMenuOpen) {
      // Small delay to ensure the sheet is rendered before blurring
      const timeout = setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [mobileMenuOpen]);

  // Determine home URL based on authentication status and onboarding completion
  // Use Next.js router for proper client-side navigation
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn && hasCompletedOnboarding) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const navItems: NavItem[] = [
    { key: "discover", href: "/discover", label: "Discover", icon: <Search className="h-5 w-5" />, requiresAuth: true },
    { key: "connections", href: "/connections", label: "Connections", icon: <Users className="h-5 w-5" />, requiresAuth: true },
    { key: "messages", href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true },
    { key: "notifications", href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, requiresAuth: true }
  ];

  // Determine which navigation items to show
  let navItemsToDisplay: NavItem[] = [];
  if (isSignedIn && hasCompletedOnboarding) {
    // Show app navigation for authenticated users
    navItemsToDisplay = navItems;
  } else {
    // Hide navigation for non-authenticated users or those without completed onboarding
    navItemsToDisplay = [];
  }

  const handleViewProfile = async () => {
    await navigateToProfile();
  };

  // Don't render anything until loaded to prevent flash
  if (!isLoaded || !mounted) {
    return (
      <header className="sticky top-0 z-51 w-full border-b border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-gray-950/80">
        <div className="w-full flex h-14 lg:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8">
          <a href="#" onClick={handleLogoClick} className="flex items-center space-x-2 shrink-0 logo-no-flash min-w-0">
            <Image
              src="/updrafted-logo.webp"
              alt="UpDrafted Logo"
              width={150}
              height={50}
              priority
              placeholder="empty"
              sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 140px, 150px"
              className="mr-2 lg:mr-3"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "clamp(100px, 15vw, 150px)",
                maxHeight: "40px"
              }}
            />
          </a>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-51 w-full border-b border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-gray-950/80">
      <div className="w-full flex h-14 lg:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 overflow-x-auto min-w-0">
        {/* Logo */}
        <a href="#" onClick={handleLogoClick} className="flex items-center space-x-2 shrink-0 logo-no-flash min-w-0">
          <Image
            src="/updrafted-logo.webp"
            alt="UpDrafted Logo"
            width={150}
            height={50}
            priority
            placeholder="empty"
            sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 140px, 150px"
            className="mr-2 lg:mr-3"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "clamp(100px, 15vw, 150px)",
              maxHeight: "40px"
            }}
          />
        </a>

        {/* Desktop & Tablet Search Bar - Show on medium screens and up (includes iPads) */}
        {isSignedIn && hasCompletedOnboarding && userRole && (
          <div className="hidden md:flex flex-1 justify-center px-4 xl:px-6 max-w-lg min-w-0">
            <div className="w-full max-w-md min-w-0">
              <SearchBar userRole={userRole} />
            </div>
          </div>
        )}

        {/* Desktop/Tablet Navigation - Show on medium screens and up, with labels only on xl+ */}
        <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 xl:space-x-2">
          {navItemsToDisplay.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <NavItemComponent
                key={item.key}
                item={item}
                notificationCount={item.key === 'notifications' ? notificationCount : 0}
                isActive={isActive}
              />
            );
          })}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Back button for logged-in users on company pages */}
          {isSignedIn && ['/for-athletes', '/for-coaches', '/for-recruiters'].includes(pathname) && hasCompletedOnboarding && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-[#01ae79] hover:bg-[#01ae79]/5 ml-2">
                ← Dashboard
              </Button>
            </Link>
          )}

          {isSignedIn && user && (
            <div className="relative flex items-center ml-2">
              <UserButtonDropdown
                user={user}
                hasCompletedOnboarding={!!hasCompletedOnboarding}
                profileNavigating={profileNavigating}
                handleViewProfile={handleViewProfile}
              />
            </div>
          )}

          {/* Admin Button (Desktop) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
              className="hidden xl:flex h-8 px-3 text-sm font-medium border-[#01ae79]/20 text-[#01ae79] hover:bg-[#01ae79]/5"
            >
              Admin
            </Button>
          )}

          {!isSignedIn && (
            <>
              {/* Mobile: Only show Sign In icon, hide Sign Up */}
              <Link href="/sign-in">
                <Button variant="default" size="sm" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white md:flex md:items-center">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Sign In</span>
                </Button>
              </Link>
              {/* Only show Sign Up on md+ screens */}
              <div className="hidden md:block">
                <Link href="/sign-up">
                  <Button variant="outline" size="sm" className="ml-2 border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/30 dark:hover:bg-[#01ae79]/10 text-[#01ae79] hover:text-[#01ae79]">
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Mobile Navigation - Show only on small screens */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />

          {/* For authenticated users with completed onboarding - just show user button and admin if applicable */}
          {isSignedIn && user && (
            <>
              {hasCompletedOnboarding ? (
                <>
                  {/* User button */}
                  <UserButtonDropdown
                    user={user}
                    hasCompletedOnboarding={true}
                    profileNavigating={profileNavigating}
                    handleViewProfile={handleViewProfile}
                  />
                </>
              ) : (
                /* For users not completed onboarding, show basic user button */
                <UserButtonDropdown
                  user={user}
                  hasCompletedOnboarding={false}
                  profileNavigating={profileNavigating}
                  handleViewProfile={handleViewProfile}
                />
              )}
            </>
          )}

          {/* For non-authenticated users - show mobile menu with sign in/up */}
          {!isSignedIn && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-75 sm:w-100 z-60">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                  <SheetDescription className="text-left">
                    Sign in to access UpDrafted
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {/* Sign in/Sign up for non-authenticated users */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 px-3">
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white mb-3 py-3 text-base font-medium">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-[#01ae79]/30 hover:bg-[#01ae79]/5 text-[#01ae79] py-3 text-base font-medium">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}