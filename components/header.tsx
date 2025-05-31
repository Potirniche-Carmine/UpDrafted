"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Bell, LogIn, ChevronDown, Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
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

// Mock user data for search - same as in search-bar.tsx
interface SearchUser {
  id: string;
  name: string;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  profilePicture: string;
  location: string;
  verified?: boolean;
  graduationYear?: number;
  school?: string;
}

const mockUsers: SearchUser[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    role: 'athlete',
    sport: 'Basketball',
    profilePicture: 'https://placehold.co/40x40/E0E0E0/B0B0B0?text=MJ',
    location: 'Chicago, IL',
    verified: true,
    graduationYear: 2025
  },
  {
    id: '2', 
    name: 'Sarah Williams',
    role: 'coach',
    sport: 'Soccer',
    profilePicture: 'https://placehold.co/40x40/D1C4E9/7E57C2?text=SW',
    location: 'Austin, TX',
    verified: true,
    school: 'University of Texas'
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'athlete',
    sport: 'Swimming',
    profilePicture: 'https://placehold.co/40x40/C8E6C9/66BB6A?text=DC',
    location: 'San Diego, CA',
    graduationYear: 2025
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    role: 'recruiter',
    sport: 'Track & Field',
    profilePicture: 'https://placehold.co/40x40/FFCDD2/E57373?text=ER',
    location: 'Durham, NC',
    verified: true,
    school: 'Duke University'
  },
  {
    id: '5',
    name: 'Michael Thompson',
    role: 'athlete',
    sport: 'Football',
    profilePicture: 'https://placehold.co/40x40/F8BBD9/E91E63?text=MT',
    location: 'Miami, FL',
    graduationYear: 2024
  },
  {
    id: '6',
    name: 'Coach Lisa Brown',
    role: 'coach',
    sport: 'Tennis',
    profilePicture: 'https://placehold.co/40x40/B39DDB/673AB7?text=LB',
    location: 'Stanford, CA',
    verified: true,
    school: 'Stanford University'
  },
  {
    id: '7',
    name: 'Jordan Parker',
    role: 'athlete',
    sport: 'Volleyball',
    profilePicture: 'https://placehold.co/40x40/81C784/4CAF50?text=JP',
    location: 'Seattle, WA',
    graduationYear: 2026
  },
  {
    id: '8',
    name: 'Alex Martinez',
    role: 'recruiter',
    sport: 'Baseball',
    profilePicture: 'https://placehold.co/40x40/FFB74D/FF9800?text=AM',
    location: 'Los Angeles, CA',
    school: 'UCLA'
  }
];

const getRoleIcon = (role: SearchUser['role']) => {
  switch (role) {
    case 'athlete': return <Users className="h-3 w-3" />;
    case 'coach': return <Users className="h-3 w-3" />;
    case 'recruiter': return <Users className="h-3 w-3" />;
  }
};

const getRoleBadgeColor = (role: SearchUser['role']) => {
  switch (role) {
    case 'athlete': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'coach': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'recruiter': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }
};

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ReactElement;
  requiresAuth: boolean;
  className?: string;
  onClick?: () => void;
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

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter users based on search term (min 2 characters for header)
  const filteredUsers = useMemo(() => {
    if (searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    return mockUsers
      .filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.sport.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        (user.school && user.school.toLowerCase().includes(term))
      )
      .slice(0, 5); // Limit to 5 results for header
  }, [searchTerm]);

  // Show/hide dropdown based on search term and results
  useEffect(() => {
    setIsOpen(searchTerm.length >= 2 && filteredUsers.length > 0);
  }, [searchTerm.length, filteredUsers.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search athletes, coaches..."
        className="w-full rounded-lg bg-background/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01ae79]/50 focus:border-[#01ae79]/50 border-[#01ae79]/20 dark:border-[#01ae79]/30"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-[#01ae79]/20 dark:border-[#01ae79]/30 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {filteredUsers.map((user) => (
              <Link 
                key={user.id} 
                href={`/profile/${user.id}`}
                onClick={handleUserClick}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 transition-colors cursor-pointer border border-transparent hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30"
                    />
                    {user.verified && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#01ae79] rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {user.name}
                      </h4>
                      <Badge className={`text-xs px-1.5 py-0.5 flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-[#01ae79]">{user.sport}</span>
                      <span>•</span>
                      <span className="truncate">{user.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* View All Results Link */}
            <div className="pt-2 border-t border-border/30">
              <button 
                onClick={handleViewAll}
                className="block w-full p-3 text-center text-sm text-[#01ae79] hover:text-[#01ae79]/80 font-medium hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 rounded-lg transition-colors"
              >
                View all results for &ldquo;{searchTerm}&rdquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const {isSignedIn, user } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine home URL based on authentication status
  const homeUrl = isSignedIn ? '/dashboard' : '/';

  const navItems: NavItem[] = [
    { key: "discover", href: "/discover", label: "Discover", icon: <Search className="h-5 w-5" />, requiresAuth: true },
    { key: "connections", href: "/connections", label: "Connections", icon: <Users className="h-5 w-5" />, requiresAuth: true },
    { key: "messaging", href: "/messaging", label: "Messages", icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true },
    { key: "notifications", href: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, requiresAuth: true }
  ];

  const navItemsToDisplay = isSignedIn ? navItems : [];

  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-9 h-9 ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30", 
      userButtonPopoverActionButton: "text-primary hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 hover:text-[#01ae79] rounded-md",
      userButtonPopoverActionButton__signOut: "text-destructive hover:!bg-destructive/20 hover:!text-destructive-foreground rounded-md",
    },
  };

  const handleViewProfile = () => {
    if (user?.id) {
      router.push(`/profile/${user.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={homeUrl} className="flex items-center space-x-2 flex-shrink-0">
          <Image 
            src="/logo.png" 
            alt="UpDrafted Logo" 
            width={150} 
            height={50} 
            priority
            className="mr-3 w-[110px] md:w-[150px] h-auto" 
          />
        </Link>
        
        {/* Desktop Search Bar - Only show when signed in */}
        <SignedIn>
          <div className="hidden md:flex flex-1 justify-center px-6 max-w-md">
            <SearchBar />
          </div>
        </SignedIn>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2"> 
          {navItemsToDisplay.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="transition-colors flex items-center px-3 py-2 group rounded-lg text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10"
              title={item.label}
            >
              {item.icon}
              <span className="ml-2 text-sm font-medium">
                {item.label}
              </span>
            </Link>
          ))}

          {/* Theme Toggle */}
          <ThemeToggle />

          <SignedIn>
            <div className="relative flex items-center ml-2"> 
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
                           bg-[#01ae79]/10 dark:bg-[#01ae79]/20 
                           rounded-full flex items-center justify-center 
                           pointer-events-none 
                           border-2 border-background shadow-sm"
              >
                <ChevronDown className="h-2.5 w-2.5 text-[#01ae79]" />
              </div>
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
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
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
                        className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 hover:text-[#01ae79]"
                      >
                        {item.icon}
                        <span>{item.label}</span>
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
                      className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 hover:text-[#01ae79] w-full text-left"
                    >
                      <Users className="h-5 w-5" />
                      <span>View Profile</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
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