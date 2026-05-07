"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Shield, Users, Clock, Target, Building2, School } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthWrapper } from '../../../components/auth-wrapper';
import { UnifiedSportSelector } from "@/components/ui/unified-sport-selector";
import { generateProfileUrl } from "@/lib/utils";
import { getProfileImageUrl } from "@/lib/profile-images";
import { formatSportName } from "@/lib/sports-data";

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

const getRoleLabel = (role: string, division?: string, educationLevel?: string) => {
  let roleText = '';

  if (role === 'athlete') {
    if (educationLevel === 'high_school') roleText = 'HS Athlete';
    else if (educationLevel === 'undergraduate') roleText = 'College Athlete';
    else if (educationLevel === 'associate') roleText = 'JC Athlete';
    else if (educationLevel === 'graduate') roleText = 'Grad Athlete';
    else roleText = 'Athlete';
  } else if (role === 'coach') {
    if (division === 'High School') roleText = 'HS Coach';
    else if (division === 'Club Sports') roleText = 'Club Coach';
    else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) roleText = 'JC Coach';
    else if (division?.includes('NCAA') || division === 'NAIA') roleText = 'College Coach';
    else roleText = 'Coach';
  } else if (role === 'recruiter') {
    if (division === 'High School') roleText = 'HS Recruiter';
    else if (division === 'Club Sports') roleText = 'Club Recruiter';
    else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) roleText = 'JC Recruiter';
    else if (division?.includes('NCAA') || division === 'NAIA') roleText = 'College Recruiter';
    else roleText = 'Recruiter';
  }

  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium px-2 py-0 bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30 whitespace-nowrap"
    >
      {roleText}
    </Badge>
  );
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

  const searchRequestRef = useRef<AbortController | null>(null);
  const lastSearchParamsRef = useRef<string>('');

  const searchUsers = useCallback(async (query: string, page: number) => {
    if (!query || query.length < 3) {
      setAllResults([]);
      setFilteredResults([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    const searchParams = `${query}-${Math.ceil(page / PAGES_TO_LOAD)}`;
    if (lastSearchParamsRef.current === searchParams) return;

    if (searchRequestRef.current) searchRequestRef.current.abort();

    searchRequestRef.current = new AbortController();
    lastSearchParamsRef.current = searchParams;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: Math.ceil(page / PAGES_TO_LOAD).toString(),
        pageSize: (RESULTS_PER_PAGE * PAGES_TO_LOAD).toString(),
      });

      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: searchRequestRef.current.signal,
      });

      if (response.ok) {
        const data = await response.json();
        setAllResults((prev) => {
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
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      searchRequestRef.current = null;
    }
  }, []);

  const hasPerformedInitialSearch = useRef(false);

  useEffect(() => {
    if (initialQuery && initialQuery.length >= 3 && !hasPerformedInitialSearch.current) {
      hasPerformedInitialSearch.current = true;
      searchUsers(initialQuery, 1);
    }
  }, [initialQuery, searchUsers]);

  useEffect(() => {
    if (currentPage > lastLoadedPage - PAGES_TO_LOAD && searchTerm.length >= 3 && hasPerformedInitialSearch.current) {
      searchUsers(searchTerm, currentPage);
    }
  }, [currentPage, lastLoadedPage, searchTerm, searchUsers]);

  useEffect(() => {
    let filtered = [...allResults];

    if (roleFilter !== 'all') {
      filtered = filtered.filter((result) => result.role === roleFilter);
    }

    if (sportFilter !== 'all') {
      filtered = filtered.filter((result) => result.sport.toLowerCase() === sportFilter.toLowerCase());
    }

    setFilteredResults(filtered.filter(Boolean));

    const totalFilteredResults = filtered.filter(Boolean).length;
    setTotalResults(totalFilteredResults);
    setTotalPages(Math.ceil(totalFilteredResults / RESULTS_PER_PAGE));

    setCurrentPage(1);
  }, [allResults, roleFilter, sportFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length >= 3) {
      setSearchTerm(inputValue);

      const params = new URLSearchParams();
      params.set('q', inputValue);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (sportFilter !== 'all') params.set('sport', sportFilter);

      setCurrentPage(1);
      router.replace(`/search?${params.toString()}`);
      searchUsers(inputValue, 1);
    }
  };

  const handleFilterChange = (type: 'role' | 'sport', value: string) => {
    if (type === 'role') setRoleFilter(value);
    else setSportFilter(value);
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setSportFilter('all');
  };

  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto max-w-6xl px-0 md:px-2 space-y-8">
      {/* Search Bar */}
      <section className="bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-5 md:p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search athletes, coaches, recruiters..."
                className="pl-11 h-12 text-base"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full sm:w-auto px-8 bg-[#01ae79] hover:bg-[#018a60] text-white font-semibold text-base"
              disabled={inputValue.length < 3}
            >
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Role
              </label>
              <Select value={roleFilter} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger className="h-11 w-full">
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
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Sport
              </label>
              <UnifiedSportSelector
                mode="single"
                value={sportFilter === 'all' ? '' : sportFilter}
                onValueChange={(value) => handleFilterChange('sport', value || 'all')}
                placeholder="All sports"
                className="w-full h-11"
              />
            </div>
          </div>
        </form>
      </section>

      {/* Results Count */}
      <div className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          {isLoading ? (
            'Searching...'
          ) : searchTerm.length < 3 ? (
            'Enter at least 3 characters to search'
          ) : (
            <>
              <span className="font-semibold text-foreground">{totalResults}</span>{' '}
              {totalResults === 1 ? 'result' : 'results'}
              {totalResults > 0 && (
                <span className="hidden sm:inline"> · Page {currentPage} of {totalPages}</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Results */}
      {searchTerm.length < 3 ? (
        <div className="text-center py-16 bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25">
          <div className="w-14 h-14 rounded-2xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center mx-auto mb-5">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Start searching</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter at least 3 characters to find athletes, coaches, and recruiters.
          </p>
        </div>
      ) : isLoading && allResults.length === 0 ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-[#01ae79] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : getCurrentPageResults().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentPageResults().map((user) => (
            <Link key={user.id} href={generateProfileUrl(user.fullName, user.id)} className="block h-full">
              <div className="h-full bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-5 hover:border-[#01ae79]/50 hover:shadow-md hover:shadow-[#01ae79]/10 hover:bg-[#01ae79]/[0.02] transition-all group">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-14 h-14 ring-2 ring-[#01ae79]/15 group-hover:ring-[#01ae79]/40 transition">
                      <AvatarImage
                        src={getProfileImageUrl(user.profileImage) || undefined}
                        alt={user.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#01ae79]/10 text-[#01ae79]">
                        <Users className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#01ae79] rounded-full flex items-center justify-center ring-2 ring-background">
                        <Shield className="h-3 w-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate text-base group-hover:text-[#01ae79] transition-colors">
                      {user.fullName}
                    </h3>
                    <div className="mt-1 mb-2">
                      {getRoleLabel(user.role, user.division, user.educationLevel)}
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#01ae79] shrink-0" />
                        <span className="truncate">{user.role === 'athlete' ? formatSportName(user.sport) : user.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#01ae79] shrink-0" />
                        <span className="truncate">{user.city}, {user.state}</span>
                      </div>

                      {user.organizationName && (
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-[#01ae79] shrink-0" />
                          <span className="truncate">{user.organizationName}</span>
                        </div>
                      )}

                      {user.role === 'athlete' && (user.height || user.weight) && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#01ae79] shrink-0" />
                          <span>
                            {[user.height, user.weight ? `${user.weight} lbs` : null].filter(Boolean).join(' / ')}
                          </span>
                        </div>
                      )}

                      {user.graduationYear && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#01ae79] shrink-0" />
                          <span>Class of {user.graduationYear}</span>
                        </div>
                      )}

                      {user.role === 'athlete' && user.positions && user.positions.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-[#01ae79] shrink-0" />
                          <span className="truncate">{user.positions.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25">
          <div className="w-14 h-14 rounded-2xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center mx-auto mb-5">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">No results found</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Try adjusting your search terms or clearing your filters.
          </p>
          {(roleFilter !== 'all' || sportFilter !== 'all') && (
            <Button onClick={clearFilters} variant="outline">
              Clear filters
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
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 ${currentPage === page ? 'bg-[#01ae79] hover:bg-[#018a60] text-white' : ''}`}
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
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-[#01ae79] border-t-transparent rounded-full" />
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </AuthWrapper>
  );
}
