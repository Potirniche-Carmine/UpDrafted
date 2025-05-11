"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";
import { Users, MessageSquare, Bell, LogIn, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Header() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const allNavItems = [
    { href: "/connections", label: "My Connections", icon: <Users className="h-5 w-5" />, requiresAuth: true },
    { href: "/messaging", label: "Messaging", icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true },
    { href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, requiresAuth: true },
  ];
  const navItemsToDisplay = allNavItems.filter(item => !item.requiresAuth || isSignedIn);

  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-10 h-10", 
      userButtonPopoverActionButton: "text-primary hover:bg-primary/20 hover:text-green rounded-md",
      userButtonPopoverActionButton__signOut: "text-destructive hover:!bg-destructive/20 hover:!text-destructive-foreground rounded-md",
    },
  };

  const handleViewProfile = () => {
    router.push('/recruit-profile');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="UpDrafted Logo" 
            width={150} 
            height={50} 
            priority
            className="mr-3 w-[110px] md:w-[150px] h-auto" 
          />
        </Link>
        <div className="hidden md:flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3"> 
          {navItemsToDisplay.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-primary flex items-center p-1.5 sm:p-2 group rounded-lg"
              title={item.label}
            >
              {item.icon}
              <span className="ml-2 text-sm font-medium hidden lg:inline group-hover:text-primary">
                {item.label}
              </span>
            </Link>
          ))}

          <div className="md:hidden ml-2"> 
          </div>

          <SignedIn>
            <div className="relative flex items-center ml-1 sm:ml-2"> 
              <UserButton
                appearance={userButtonAppearance}
              >
                <UserButton.MenuItems>
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
      <div className="md:hidden px-4 pb-3 pt-2 border-t border-border/40">
        <SearchBar />
      </div>
    </header>
  );
}