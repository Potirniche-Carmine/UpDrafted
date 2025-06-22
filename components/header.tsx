"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Bell, LogIn, ChevronDown, Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
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
  onClick 
}: { 
  item: NavItem; 
  notificationCount?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`transition-colors flex items-center px-3 py-2 group rounded-lg text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 relative ${className}`}
      title={item.label}
    >
      <div className="relative">
        {item.icon}
        <NotificationBadge count={notificationCount} />
      </div>
      <span className="ml-2 text-sm font-medium hidden lg:inline">
        {item.label}
      </span>
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

  // Check if user has completed onboarding (has a role)
  const userRole = user?.publicMetadata?.role as string;
  const hasCompletedOnboarding = userRole && ['athlete', 'coach', 'recruiter', 'admin'].includes(userRole);

  // Determine home URL based on authentication status and onboarding completion
  // Use Next.js router for proper navigation
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add a small delay to prevent rapid clicking causing issues
    setTimeout(() => {
      if (isSignedIn && hasCompletedOnboarding) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    }, 100);
  };

  const navItems: NavItem[] = [
    { key: "discover", href: "/discover", label: "Discover", icon: <Search className="h-5 w-5" />, requiresAuth: true },
    { key: "connections", href: "/connections", label: "Connections", icon: <Users className="h-5 w-5" />, requiresAuth: true },
    { key: "messages", href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true },
    { key: "notifications", href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, requiresAuth: true }
  ];

  // Only show navigation if user is signed in AND has completed onboarding
  const navItemsToDisplay = isSignedIn && hasCompletedOnboarding ? navItems : [];

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
    <header className="sticky top-0 z-50 w-full border-b border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" onClick={handleLogoClick} className="flex items-center space-x-2 flex-shrink-0 logo-no-flash">
          <Image
            src="/logo.png"
            alt="UpDrafted Logo"
            width={150}
            height={50}
            priority
            quality={90}
            placeholder="empty"
            sizes="(max-width: 768px) 110px, 150px"
            className="mr-3"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "clamp(110px, 12vw, 150px)",
              maxHeight: "50px"
            }}
          />
        </a>

        {/* Desktop Search Bar - Only show when signed in and onboarded */}
        {isSignedIn && hasCompletedOnboarding && (
          <div className="hidden md:flex flex-1 justify-center px-6 max-w-md">
            <SearchBar />
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItemsToDisplay.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              notificationCount={item.key === 'notifications' ? notificationCount : 0}
            />
          ))}

          {/* Theme Toggle */}
          <ThemeToggle />

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

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm" className="flex items-center space-x-2 ml-2 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="sm" className="ml-2 border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/30 dark:hover:bg-[#01ae79]/10 text-[#01ae79] hover:text-[#01ae79]">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />

          <SignedIn>
            {hasCompletedOnboarding && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                    <SheetDescription className="text-left">
                      Navigate to different sections of UpDrafted
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-4">
                    {/* Mobile Search */}
                    <div className="pb-4 border-b border-border">
                      <div className="px-1">
                        <SearchBar />
                      </div>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="space-y-2">
                      {navItemsToDisplay.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 hover:text-[#01ae79]"
                        >
                          <div className="flex items-center space-x-3 relative">
                            <div className="relative">
                              {item.icon}
                              {item.key === 'notifications' && notificationCount > 0 && (
                                <NotificationBadge count={notificationCount} />
                              )}
                            </div>
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* User Profile Link */}
                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => {
                          handleViewProfile();
                          setMobileMenuOpen(false);
                        }}
                        disabled={profileNavigating}
                        className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 hover:text-[#01ae79] w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Users className="h-5 w-5" />
                        <span>{profileNavigating ? "Loading..." : "View Profile"}</span>
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <UserButton
              appearance={userButtonAppearance}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                <LogIn className="h-4 w-4" />
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}