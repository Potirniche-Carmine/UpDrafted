"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, School, Shield, Users, Clock, Target, Building2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthWrapper } from '../../../components/auth-wrapper';
import { UnifiedSportSelector } from "@/components/ui/unified-sport-selector";
import { generateProfileUrl } from "@/lib/utils";

interface SearchResult {
  id: string;
  fullName: string;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  profileImage: string | null;
  organizationName: string;
  city: string;
  state: string;
  isVerified: boolean;
  title?: string;
  division?: string;
  graduationYear?: number;
  educationLevel?: string;
  height?: string;
  weight?: string;
  positions?: string[];
}

// Helper function to get role badge with descriptive text and improved styling (same as connections page)
const getRoleBadge = (role: string, division?: string, educationLevel?: string) => {
  let roleText = '';
  let roleColor = '';

  if (role === 'athlete') {
    if (educationLevel === 'high_school') {
      roleText = 'HS Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (educationLevel === 'undergraduate') {
      roleText = 'College Athlete';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else if (educationLevel === 'associate') {
      roleText = 'JC Athlete';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (educationLevel === 'graduate') {
      roleText = 'Grad Athlete';
      roleColor = 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-700';
    } else {
      roleText = 'Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    }
  } else if (role === 'coach') {
    if (division === 'High School') {
      roleText = 'HS Coach';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (division === 'Club Sports') {
      roleText = 'Club Coach';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = 'JC Coach';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Coach';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Coach';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  } else if (role === 'recruiter') {
    if (division === 'High School') {
      roleText = 'HS Recruiter';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (division === 'Club Sports') {
      roleText = 'Club Recruiter';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = 'JC Recruiter';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Recruiter';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Recruiter';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  }

  return <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 border ${roleColor} whitespace-nowrap`}>{roleText}</Badge>;
};

const RESULTS_PER_PAGE = 20;
const PAGES_TO_LOAD = 2;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialRole = searchParams.get('role') || 'all';
  const initialSport = searchParams.get('sport') || 'all';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<string>(initialRole);
  const [sportFilter, setSportFilter] = useState<string>(initialSport);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadedPage, setLastLoadedPage] = useState(0);


  // Add debounce and prevent duplicate calls
  const searchRequestRef = useRef<AbortController | null>(null);
  const lastSearchParamsRef = useRef<string>('');

  // Fetch search results from API
  const searchUsers = useCallback(async (query: string, page: number) => {
    if (!query || query.length < 3) {
      setAllResults([]);
      setFilteredResults([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    // Create unique identifier for the search request
    const searchParams = `${query}-${Math.ceil(page / PAGES_TO_LOAD)}`;

    // Prevent duplicate requests
    if (lastSearchParamsRef.current === searchParams) {
      return;
    }

    // Cancel previous request if still pending
    if (searchRequestRef.current) {
      searchRequestRef.current.abort();
    }

    // Create new abort controller for this request
    searchRequestRef.current = new AbortController();
    lastSearchParamsRef.current = searchParams;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: Math.ceil(page / PAGES_TO_LOAD).toString(),
        pageSize: (RESULTS_PER_PAGE * PAGES_TO_LOAD).toString()
      });

      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: searchRequestRef.current.signal
      });

      if (response.ok) {
        const data = await response.json();
        // Append new results to existing ones
        setAllResults(prev => {
          const newResults = [...prev];
          const startIndex = (Math.ceil(page / PAGES_TO_LOAD) - 1) * RESULTS_PER_PAGE * PAGES_TO_LOAD;
          data.results.forEach((result: SearchResult, index: number) => {
            newResults[startIndex + index] = result;
          });
          return newResults;
        });
        setTotalResults(data.total);
        setTotalPages(Math.ceil(data.total / RESULTS_PER_PAGE));
        setLastLoadedPage(Math.ceil(page / PAGES_TO_LOAD) * PAGES_TO_LOAD);
      } else {
        console.error('Search API error:', response.status, response.statusText);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, which is expected behavior
        return;
      }
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      searchRequestRef.current = null;
    }
  }, []);

  // Track if initial search has been performed
  const hasPerformedInitialSearch = useRef(false);

  // Initial load when coming from header search - only once
  useEffect(() => {
    if (initialQuery && initialQuery.length >= 3 && !hasPerformedInitialSearch.current) {
      hasPerformedInitialSearch.current = true;
      searchUsers(initialQuery, 1);
    }
  }, [initialQuery, searchUsers]); // Empty dependency array - only runs once on mount

  // Load more results if needed when page changes
  useEffect(() => {
    if (currentPage > lastLoadedPage - PAGES_TO_LOAD && searchTerm.length >= 3 && hasPerformedInitialSearch.current) {
      searchUsers(searchTerm, currentPage);
    }
  }, [currentPage, lastLoadedPage, searchTerm, searchUsers]);

  // Apply filters client-side
  useEffect(() => {
    let filtered = [...allResults];

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(result => result.role === roleFilter);
    }

    // Apply sport filter
    if (sportFilter !== 'all') {
      filtered = filtered.filter(result => result.sport.toLowerCase() === sportFilter.toLowerCase());
    }

    // Update filtered results
    setFilteredResults(filtered.filter(Boolean));

    // Update pagination for filtered results
    const totalFilteredResults = filtered.filter(Boolean).length;
    setTotalResults(totalFilteredResults);
    setTotalPages(Math.ceil(totalFilteredResults / RESULTS_PER_PAGE));

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [allResults, roleFilter, sportFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length >= 3) {
      // Update the actual search term
      setSearchTerm(inputValue);

      // Update URL with current search parameters and filters
      const params = new URLSearchParams();
      params.set('q', inputValue);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (sportFilter !== 'all') params.set('sport', sportFilter);

      // Reset page to 1 and perform search
      setCurrentPage(1);
      router.replace(`/search?${params.toString()}`);
      searchUsers(inputValue, 1);
    }
  };

  const handleFilterChange = (type: 'role' | 'sport', value: string) => {
    // Just update the filter state - no URL updates
    if (type === 'role') {
      setRoleFilter(value);
    } else {
      setSportFilter(value);
    }
  };

  const clearFilters = () => {
    // Just reset filters - no URL updates
    setRoleFilter('all');
    setSportFilter('all');
  };

  // Process profile image URL to ensure it works with R2/CloudFlare
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) {
      return null;
    }

    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }

    // Construct the full R2 URL using environment variable or fallback to known R2 domain
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
    return `${baseUrl}/${profileImage}`;
  };

  // Get current page results
  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Search Results</h1>
        <p className="text-sm sm:text-base text-muted-foreground h-6">
          {searchTerm ? (
            <>Showing results for &ldquo;<span className="font-medium text-foreground">{searchTerm}</span>&rdquo;</>
          ) : (
            <>&nbsp;</>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search athletes, coaches, recruiters..."
                  className="pl-11 h-14 sm:h-12 text-base"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="h-14 sm:h-12 w-full sm:w-auto px-8 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white font-medium text-base"
                disabled={inputValue.length < 3}
              >
                Search
              </Button>
            </div>

            {/* Always visible filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select value={roleFilter} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger className="h-12 sm:h-11 w-full">
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

              <div>
                <label className="block text-sm font-medium mb-2">Sport</label>
                <UnifiedSportSelector
                  mode="single"
                  value={sportFilter === 'all' ? '' : sportFilter}
                  onValueChange={(value) => handleFilterChange('sport', value || 'all')}
                  placeholder="All sports"
                  className="w-full h-12 sm:h-11"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          {isLoading ? (
            'Searching...'
          ) : searchTerm.length < 3 ? (
            'Enter at least 3 characters to search'
          ) : (
            <>
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              {totalResults > 0 && (
                <span className="hidden sm:inline"> • Page {currentPage} of {totalPages}</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Results Grid */}
      {searchTerm.length < 3 ? (
        <div className="text-center py-12 sm:py-16">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Start your search</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter at least 3 characters to search for athletes, coaches, and recruiters
          </p>
        </div>
      ) : isLoading && allResults.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : getCurrentPageResults().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">{getCurrentPageResults().map((user) => (
          <Link key={user.id} href={generateProfileUrl(user.fullName, user.id)}>
            <Card className="hover:shadow-lg transition-all duration-200 hover:border-green-200 dark:hover:border-green-800 group h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-[#01ae79]/20 group-hover:ring-[#01ae79]/50 transition-all duration-200">
                      <AvatarImage
                        src={getProfileImageUrl(user.profileImage) || undefined}
                        alt={user.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <Users className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
                        <Shield className="h-3 w-3 text-white stroke-[4]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
                        {user.fullName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getRoleBadge(user.role, user.division, user.educationLevel)}
                    </div>

                    <div className="space-y-1">
                      {/* Sport/Title */}
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Building2 className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-[#01ae79]" />
                        <span className="font-medium">{user.role === 'athlete' ? user.sport : user.title}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-[#01ae79]" />
                        <span className="font-medium">{user.city}, {user.state}</span>
                      </div>

                      {/* Organization */}
                      <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                        {user.organizationName}
                      </p>

                      {/* Athlete-specific: Height & Weight */}
                      {user.role === 'athlete' && (user.height || user.weight) && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-[#01ae79]" />
                          <span className="font-medium">
                            {[
                              user.height,
                              user.weight ? `${user.weight} lbs` : null
                            ].filter(Boolean).join(' / ')}
                          </span>
                        </div>
                      )}

                      {/* Graduation Year */}
                      {user.graduationYear && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-[#01ae79]" />
                          <span className="font-medium">Class of {user.graduationYear}</span>
                        </div>
                      )}

                      {/* Positions for athletes */}
                      {user.role === 'athlete' && user.positions && user.positions.length > 0 && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Target className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-[#01ae79]" />
                          <span className="font-medium">{user.positions.join(', ')}</span>
                        </div>
                      )}

                      {/* Title for coaches/recruiters */}
                      {user.title && user.role !== 'athlete' && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <School className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-[#01ae79]" />
                          <span className="font-medium truncate">{user.title}</span>
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
        <div className="text-center py-12 sm:py-16">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No results found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Try adjusting your search terms or clearing filters
          </p>
          {roleFilter !== 'all' && (
            <Button onClick={clearFilters} variant="outline" className="h-11">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-11 px-4 sm:px-6"
          >
            Previous
          </Button>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show first page, last page, current page, and pages around current
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 sm:w-11 sm:h-11"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-11 px-4 sm:px-6"
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
    <AuthWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent />
      </Suspense>
    </AuthWrapper>
  );
} 