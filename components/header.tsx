"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Bell, LogIn, ChevronDown, Shield, BarChart3, UserCheck, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ReactElement;
  requiresAuth: boolean;
  className?: string;
  onClick?: () => void;
}

export function Header() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Determine home URL based on authentication status
  const homeUrl = isSignedIn ? '/dashboard' : '/';

  const regularNavItems: NavItem[] = [
    { key: "connections", href: "/connections", label: "My Connections", icon: <Users className="h-5 w-5" />, requiresAuth: true, className: undefined },
    { key: "messaging", href: "/messaging", label: "Messaging", icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true, className: undefined },
    { key: "notifications", href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, requiresAuth: true, className: undefined }
  ];

  const adminNavItems: NavItem[] = [
    { key: "dashboard", href: "/admin", label: "Dashboard", icon: <Shield className="h-5 w-5" />, requiresAuth: true, className: undefined },
    { key: "reports", href: "/admin", label: "Reports", icon: <BarChart3 className="h-5 w-5" />, requiresAuth: true, className: undefined, onClick: () => window.location.href = '/admin?tab=reports' },
    { key: "verification", href: "/admin", label: "Verification", icon: <UserCheck className="h-5 w-5" />, requiresAuth: true, className: undefined, onClick: () => window.location.href = '/admin?tab=verification' }
  ];

  const navItemsToDisplay = isSignedIn ? 
    (isAdmin ? adminNavItems : regularNavItems) : 
    [];

  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-10 h-10", 
      userButtonPopoverActionButton: "text-primary hover:bg-primary/20 hover:text-green rounded-md",
      userButtonPopoverActionButton__signOut: "text-destructive hover:!bg-destructive/20 hover:!text-destructive-foreground rounded-md",
    },
  };

  const handleViewProfile = () => {
    if (user?.id) {
      router.push(`/profile/${user.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={homeUrl} className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="UpDrafted Logo" 
            width={150} 
            height={50} 
            priority
            className="mr-3 w-[110px] md:w-[150px] h-auto" 
          />
        </Link>
        
        {/* Admin header shows admin title */}
        {isAdmin && isSignedIn && (
          <div className="hidden md:flex items-center space-x-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="font-semibold text-lg">Admin Portal</span>
          </div>
        )}

        {/* Search button for all users */}
        <SignedIn>
          <div className="hidden md:flex flex-1 justify-center px-4">
            <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={() => router.push('/search')}>
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </SignedIn>

        <nav className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3"> 
          {navItemsToDisplay.map((item) => (
            item.onClick ? (
              <button
                key={item.key}
                onClick={item.onClick}
                className={`transition-colors flex items-center p-1.5 sm:p-2 group rounded-lg ${
                  item.className || "text-muted-foreground hover:text-primary"
                }`}
                title={item.label}
              >
                {item.icon}
                <span className={`ml-2 text-sm font-medium hidden lg:inline ${
                  item.className ? "" : "group-hover:text-primary"
                }`}>
                  {item.label}
                </span>
              </button>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className={`transition-colors flex items-center p-1.5 sm:p-2 group rounded-lg ${
                  item.className || "text-muted-foreground hover:text-primary"
                }`}
                title={item.label}
              >
                {item.icon}
                <span className={`ml-2 text-sm font-medium hidden lg:inline ${
                  item.className ? "" : "group-hover:text-primary"
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          ))}

          <div className="md:hidden ml-2"> 
          </div>

          <SignedIn>
            <div className="relative flex items-center ml-1 sm:ml-2"> 
              <UserButton
                appearance={userButtonAppearance}
              >
                <UserButton.MenuItems>
                  {!isAdmin && (
                    <UserButton.Action
                      label="View Profile" 
                      labelIcon={<Users className="mr-2 h-4 w-4" />}
                      onClick={handleViewProfile}
                    >
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" /> 
                        <span>View Profile</span>
                      </div>
                    </UserButton.Action>
                  )}
                  {isAdmin && (
                    <UserButton.Action
                      label="Admin Dashboard" 
                      labelIcon={<Shield className="mr-2 h-4 w-4" />}
                      onClick={() => router.push('/admin')}
                    >
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" /> 
                        <span>Admin Dashboard</span>
                      </div>
                    </UserButton.Action>
                  )}
                </UserButton.MenuItems>
              </UserButton>
              <div
                className="absolute -bottom-[2px] -right-[2px] w-[13px] h-[13px] 
                           bg-gray-200 dark:bg-gray-700 
                           rounded-full flex items-center justify-center 
                           pointer-events-none 
                           border-2 border-background shadow-sm"
              >
                <ChevronDown className="h-2.5 w-2.5 text-gray-700 dark:text-gray-200" />
              </div>
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm" className="flex items-center space-x-2 ml-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button variant="outline" size="sm" className="ml-2">
                    Sign Up
                </Button>
            </SignUpButton>
          </SignedOut>
        </nav>
      </div>
      <SignedIn>
        <div className="md:hidden px-4 pb-3 pt-2 border-t border-border/40">
          <div className="flex justify-center">
            <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={() => router.push('/search')}>
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </div>
      </SignedIn>
    </header>
  );
}