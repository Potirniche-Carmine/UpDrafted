"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";
import { Home, Users, MessageSquare, Bell, LogIn } from "lucide-react"; 
import Image from "next/image";

export function Header() {
  const { isSignedIn } = useUser(); 
  const allNavItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" />, requiresAuth: false },
    { href: "/connections", label: "My Connections", icon: <Users className="h-5 w-5" />, requiresAuth: true },
    { href: "/messaging", label: "Messaging", icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true },
    { href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, requiresAuth: true },
  ];

  const navItemsToDisplay = allNavItems.filter(item => !item.requiresAuth || isSignedIn);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.png" alt="UpDrafted Logo" width={150}
            height={50}
            priority
            style = {{height: 'auto', width: 'auto'}}
            className="mr-3"/>
        </Link>
        <div className="hidden md:flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          {navItemsToDisplay.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hidden sm:flex items-center space-x-1 group"
              title={item.label}
            >
              {item.icon}
              <span className="hidden lg:inline group-hover:text-primary">{item.label}</span>
            </Link>
          ))}
          
          <div className="md:hidden">
          </div>

          <SignedIn>
            <UserButton/>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
       <div className="md:hidden px-4 pb-3 pt-2 border-t border-border/40">
          <SearchBar />
        </div>
    </header>
  );
}
