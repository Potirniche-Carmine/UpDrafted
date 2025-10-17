"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Bell, LogIn, ChevronDown, Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
        <div className="flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-medium rounded-full px-1 border-2 border-white dark:border-gray-950 shadow-sm">
          {count > 99 ? '99+' : String(count)}
        </div>
        {/* Subtle pulse animation for new notifications */}
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
      </div>
    </div>
  );
}

// Professional navigation item with notification support
function NavItem({
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
      className={`transition-colors flex items-center px-2 md:px-3 py-2 group rounded-lg relative ${
        isActive 
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

export function Header() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navigateToProfile, isNavigating: profileNavigating } = useProfileNavigation();
  const { unreadCount: notificationCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has completed onboarding (has a role)
  const userRole = user?.publicMetadata?.role as string;
  const hasCompletedOnboarding = userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole);
  const isAdmin = userRole === 'admin';

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

  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-9 h-9 ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30",
      userButtonPopoverActionButton: "text-primary hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 hover:text-[#01ae79] rounded-md",
      userButtonPopoverActionButton__signOut: "text-destructive hover:!bg-destructive/20 hover:!text-destructive-foreground rounded-md",
    },
  };

  const handleViewProfile = async () => {
    await navigateToProfile();
  };

  return (
    <header className="sticky top-0 z-[51] w-full border-b border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80">
      <div className="w-full flex h-14 lg:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 overflow-x-auto min-w-0">
        {/* Logo */}
        <a href="#" onClick={handleLogoClick} className="flex items-center space-x-2 flex-shrink-0 logo-no-flash min-w-0">
          <Image
            src="/updrafted-logo.webp"
            alt="UpDrafted Logo"
            width={150}
            height={50}
            priority
            quality={90}
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
        {isSignedIn && hasCompletedOnboarding && (
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
              <NavItem
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
          <SignedIn>
            {['/for-athletes', '/for-coaches', '/for-recruiters'].includes(pathname) && hasCompletedOnboarding && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-[#01ae79] hover:bg-[#01ae79]/5 ml-2">
                  ← Dashboard
                </Button>
              </Link>
            )}
          </SignedIn>

          <SignedIn>
            <div className="relative flex items-center ml-2">
              <UserButton
                appearance={userButtonAppearance}
              >
                <UserButton.MenuItems>
                  {hasCompletedOnboarding && (
                    <UserButton.Action
                      label={profileNavigating ? "Loading..." : "View Profile"}
                      labelIcon={<Users className="mr-2 h-4 w-4" />}
                      onClick={profileNavigating ? () => { } : handleViewProfile}
                    >
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{profileNavigating ? "Loading..." : "View Profile"}</span>
                      </div>
                    </UserButton.Action>
                  )}
                </UserButton.MenuItems>
              </UserButton>
              {hasCompletedOnboarding && (
                <div
                  className="absolute -bottom-[2px] -right-[2px] w-[13px] h-[13px] 
                             bg-[#01ae79]/10 dark:bg-[#01ae79]/20 
                             rounded-full flex items-center justify-center 
                             pointer-events-none 
                             border-2 border-background shadow-sm"
                >
                  <ChevronDown className="h-2.5 w-2.5 text-[#01ae79]" />
                </div>
              )}
            </div>
          </SignedIn>

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

          <SignedOut>
            {/* Mobile: Only show Sign In icon, hide Sign Up */}
            <SignInButton mode="modal">
              <Button variant="default" size="sm" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white md:flex md:items-center">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Sign In</span>
              </Button>
            </SignInButton>
            {/* Only show Sign Up on md+ screens */}
            <div className="hidden md:block">
              <SignUpButton mode="modal">
                <Button variant="outline" size="sm" className="ml-2 border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/30 dark:hover:bg-[#01ae79]/10 text-[#01ae79] hover:text-[#01ae79]">
                  <span>Sign Up</span>
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </nav>

        {/* Mobile Navigation - Show only on small screens */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />

          {/* For authenticated users with completed onboarding - just show user button and admin if applicable */}
          <SignedIn>
            {isSignedIn && hasCompletedOnboarding ? (
              <>
                {/* User button */}
                <UserButton
                  appearance={userButtonAppearance}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label={profileNavigating ? "Loading..." : "View Profile"}
                      labelIcon={<Users className="mr-2 h-4 w-4" />}
                      onClick={profileNavigating ? () => { } : handleViewProfile}
                    >
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{profileNavigating ? "Loading..." : "View Profile"}</span>
                      </div>
                    </UserButton.Action>
                  </UserButton.MenuItems>
                </UserButton>
              </>
            ) : (
              /* For users not completed onboarding, show basic user button */
              <UserButton appearance={userButtonAppearance} />
            )}
          </SignedIn>

          {/* For non-authenticated users - show mobile menu with sign in/up */}
          <SignedOut>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[60]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                  <SheetDescription className="text-left">
                    Sign in to access UpDrafted
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {/* Sign in/Sign up for non-authenticated users */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 px-3">
                    <SignInButton mode="modal">
                      <Button variant="default" className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white mb-3 py-3 text-base font-medium">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="outline" className="w-full border-[#01ae79]/30 hover:bg-[#01ae79]/5 text-[#01ae79] py-3 text-base font-medium">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}