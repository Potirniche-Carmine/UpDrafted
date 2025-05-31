"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, User, Users, Target, MapPin, Calendar, School } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Same interface and mock data as search-bar component
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
    profilePicture: 'https://placehold.co/80x80/E0E0E0/B0B0B0?text=MJ',
    location: 'Chicago, IL',
    verified: true,
    graduationYear: 2025
  },
  {
    id: '2', 
    name: 'Sarah Williams',
    role: 'coach',
    sport: 'Soccer',
    profilePicture: 'https://placehold.co/80x80/D1C4E9/7E57C2?text=SW',
    location: 'Austin, TX',
    verified: true,
    school: 'University of Texas'
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'athlete',
    sport: 'Swimming',
    profilePicture: 'https://placehold.co/80x80/C8E6C9/66BB6A?text=DC',
    location: 'San Diego, CA',
    graduationYear: 2025
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    role: 'recruiter',
    sport: 'Track & Field',
    profilePicture: 'https://placehold.co/80x80/FFCDD2/E57373?text=ER',
    location: 'Durham, NC',
    verified: true,
    school: 'Duke University'
  },
  {
    id: '5',
    name: 'Michael Thompson',
    role: 'athlete',
    sport: 'Football',
    profilePicture: 'https://placehold.co/80x80/F8BBD9/E91E63?text=MT',
    location: 'Miami, FL',
    graduationYear: 2024
  },
  {
    id: '6',
    name: 'Coach Lisa Brown',
    role: 'coach',
    sport: 'Tennis',
    profilePicture: 'https://placehold.co/80x80/B39DDB/673AB7?text=LB',
    location: 'Stanford, CA',
    verified: true,
    school: 'Stanford University'
  },
  {
    id: '7',
    name: 'Jordan Parker',
    role: 'athlete',
    sport: 'Volleyball',
    profilePicture: 'https://placehold.co/80x80/81C784/4CAF50?text=JP',
    location: 'Seattle, WA',
    graduationYear: 2026
  },
  {
    id: '8',
    name: 'Alex Martinez',
    role: 'recruiter',
    sport: 'Baseball',
    profilePicture: 'https://placehold.co/80x80/FFB74D/FF9800?text=AM',
    location: 'Los Angeles, CA',
    school: 'UCLA'
  },
  {
    id: '9',
    name: 'Samantha Davis',
    role: 'athlete',
    sport: 'Basketball',
    profilePicture: 'https://placehold.co/80x80/FFE0B2/FF9800?text=SD',
    location: 'New York, NY',
    graduationYear: 2025
  },
  {
    id: '10',
    name: 'Coach Robert Wilson',
    role: 'coach',
    sport: 'Baseball',
    profilePicture: 'https://placehold.co/80x80/C5E1A5/8BC34A?text=RW',
    location: 'Boston, MA',
    verified: true,
    school: 'Harvard University'
  },
  {
    id: '11',
    name: 'Isabella Garcia',
    role: 'athlete',
    sport: 'Soccer',
    profilePicture: 'https://placehold.co/80x80/F8BBD9/E91E63?text=IG',
    location: 'Phoenix, AZ',
    graduationYear: 2024
  },
  {
    id: '12',
    name: 'James Anderson',
    role: 'recruiter',
    sport: 'Swimming',
    profilePicture: 'https://placehold.co/80x80/DCEDC8/8BC34A?text=JA',
    location: 'Atlanta, GA',
    school: 'Georgia Tech'
  }
];

const getRoleIcon = (role: SearchUser['role']) => {
  switch (role) {
    case 'athlete': return <User className="h-4 w-4" />;
    case 'coach': return <Users className="h-4 w-4" />;
    case 'recruiter': return <Target className="h-4 w-4" />;
  }
};

const getRoleBadgeColor = (role: SearchUser['role']) => {
  switch (role) {
    case 'athlete': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'coach': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'recruiter': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }
};

const ITEMS_PER_PAGE = 12;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Update search term when URL changes
  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    let results = mockUsers;

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.sport.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.location.toLowerCase().includes(term) ||
        (user.school && user.school.toLowerCase().includes(term))
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      results = results.filter(user => user.role === roleFilter);
    }

    // Apply sport filter
    if (sportFilter !== 'all') {
      results = results.filter(user => user.sport === sportFilter);
    }

    return results;
  }, [searchTerm, roleFilter, sportFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get unique sports for filter dropdown
  const uniqueSports = useMemo(() => {
    return Array.from(new Set(mockUsers.map(user => user.sport))).sort();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setSportFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search Results</h1>
        {searchTerm && (
          <p className="text-muted-foreground">
            Showing results for &ldquo;<span className="font-medium text-foreground">{searchTerm}</span>&rdquo;
          </p>
        )}
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search athletes, coaches, recruiters..."
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(roleFilter !== 'all' || sportFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1">
                    {[roleFilter !== 'all' ? 1 : 0, sportFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
              
              {(roleFilter !== 'all' || sportFilter !== 'all') && (
                <Button type="button" variant="ghost" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="athlete">Athletes</SelectItem>
                      <SelectItem value="coach">Coaches</SelectItem>
                      <SelectItem value="recruiter">Recruiters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sport</label>
                  <Select value={sportFilter} onValueChange={setSportFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sports</SelectItem>
                      {uniqueSports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'} found
          {filteredUsers.length > ITEMS_PER_PAGE && (
            <span> • Page {currentPage} of {totalPages}</span>
          )}
        </p>
      </div>

      {/* Results Grid */}
      {paginatedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedUsers.map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`}>
              <Card className="hover:shadow-lg transition-shadow duration-200 hover:border-green-200 dark:hover:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover ring-2 ring-green-100 dark:ring-green-900"
                      />
                      {user.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {user.name}
                        </h3>
                        <Badge className={`text-xs px-2 py-1 flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-600 dark:text-green-400">{user.sport}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{user.location}</span>
                        </div>
                        
                        {user.graduationYear && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Class of {user.graduationYear}</span>
                          </div>
                        )}
                        
                        {user.school && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <School className="h-3 w-3" />
                            <span className="truncate">{user.school}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or clearing filters
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
} 