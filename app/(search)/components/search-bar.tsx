"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge";
import { Search, User, Users, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock user data - replace with real API calls later
interface SearchUser {
  id: string;
  name: string;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  profilePicture: string;
  location: string;
  verified?: boolean;
  graduationYear?: number; // For athletes
  school?: string; // For coaches/recruiters
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
    case 'athlete': return <User className="h-3 w-3" />;
    case 'coach': return <Users className="h-3 w-3" />;
    case 'recruiter': return <Target className="h-3 w-3" />;
  }
};

const getRoleBadgeColor = (role: SearchUser['role']) => {
  switch (role) {
    case 'athlete': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'coach': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'recruiter': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }
};

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter users based on search term (min 4 characters)
  const filteredUsers = useMemo(() => {
    if (searchTerm.length < 4) return [];
    
    const term = searchTerm.toLowerCase();
    return mockUsers
      .filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.sport.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        (user.school && user.school.toLowerCase().includes(term))
      )
      .slice(0, 8); // Limit to 8 results
  }, [searchTerm]);

  // Show/hide dropdown based on search term and results
  useEffect(() => {
    setIsOpen(searchTerm.length >= 4 && filteredUsers.length > 0);
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

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search athletes, coaches, recruiters..."
        className="w-full rounded-lg bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background border-border/50"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground border-b border-border/30 mb-2">
              <span>Search Results</span>
              <span>{filteredUsers.length} found</span>
            </div>
            
            {filteredUsers.map((user) => (
              <Link 
                key={user.id} 
                href={`/profile/${user.id}`}
                onClick={handleUserClick}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors cursor-pointer border border-transparent hover:border-green-200/50 dark:hover:border-green-800/50">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={user.profilePicture}
                      alt={user.name || "Profile picture"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover ring-2 ring-green-100 dark:ring-green-900"
                    />
                    {user.verified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {user.name}
                      </h4>
                      <Badge className={`text-xs px-2 py-0.5 flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-green-600 dark:text-green-400">{user.sport}</span>
                      <span>•</span>
                      <span>{user.location}</span>
                      {user.graduationYear && (
                        <>
                          <span>•</span>
                          <span>Class of {user.graduationYear}</span>
                        </>
                      )}
                      {user.school && (
                        <>
                          <span>•</span>
                          <span className="truncate">{user.school}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* View All Results Link */}
            <div className="pt-2 border-t border-border/30">
              <Link 
                href={`/search?q=${encodeURIComponent(searchTerm)}`}
                onClick={handleUserClick}
                className="block w-full p-3 text-center text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium hover:bg-green-50/50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
              >
                View all results for &ldquo;{searchTerm}&rdquo;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
