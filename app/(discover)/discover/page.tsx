"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Target, MapPin, Shield, GraduationCap, Send, ChevronDown, X, Clock, Building2, Filter, Search} from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';

import { AuthWrapper } from '@/components/auth-wrapper';
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sanitizeText } from '@/utils/sanitization';
import { getSportsList, DIVISIONS, US_STATES } from '@/lib/sports-data';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

// Filter option interface
interface FilterOption {
  value: string;
  label: string;
}

// API response types
interface DiscoverUser {
  id: string;
  fullName: string;
  organizationName: string;
  profileImage: string | null;
  city: string;
  state: string;
  country?: string;
  isVerified: boolean;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  title?: string;
  division?: string;
  educationLevel?: string;
  hasPendingRequest: boolean;
  graduationYear?: number;
  height?: string;
  weight?: string;
  positions?: string[];
}

interface DiscoverResponse {
  results: DiscoverUser[];
  total: number;
  hasMore: boolean;
}

type TabValue = 'all' | 'athletes' | 'coaches' | 'recruiters';

// Get ordered divisions based on user role
const getOrderedDivisions = (userRole: string) => {
  if (userRole === 'coach' || userRole === 'recruiter') {
    // Put High School first for coaches and recruiters
    const highSchoolFirst = ['High School', ...DIVISIONS.filter(d => d !== 'High School')];
    return highSchoolFirst;
  }
  return DIVISIONS;
};

// Multi-select filter component
interface MultiSelectFilterProps {
  options: FilterOption[];
  selected: FilterOption[];
  onSelectionChange: (selected: FilterOption[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
}

function MultiSelectFilter({ 
  options, 
  selected, 
  onSelectionChange, 
  placeholder, 
  searchPlaceholder = "Search...",
  className 
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options);
    }
  };

  const handleToggleOption = (option: FilterOption) => {
    const isSelected = selected.some(s => s.value === option.value);
    if (isSelected) {
      onSelectionChange(selected.filter(s => s.value !== option.value));
    } else {
      onSelectionChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className={cn("w-full justify-between text-left font-normal", className)}
        >
          <span className="truncate">
            {selected.length === 0 
              ? placeholder 
              : selected.length === 1 
                ? selected[0].label 
                : `${selected.length} selected`
            }
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0" align="center" side="bottom" sideOffset={4}>
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {/* Select All Option */}
              <CommandItem
                onSelect={handleSelectAll}
                className="cursor-pointer"
              >
                <Checkbox
                  checked={selected.length === options.length}
                  className="mr-2"
                />
                <span className="font-medium">
                  {selected.length === options.length ? 'Deselect All' : 'Select All'}
                </span>
              </CommandItem>
              
              {/* Individual Options */}
              {filteredOptions.map((option) => {
                const isSelected = selected.some(s => s.value === option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleToggleOption(option)}
                    className="cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-2"
                    />
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Get available tabs based on user role
const getAvailableTabs = (userRole: string) => {
  switch (userRole) {
    case 'athlete':
      return [
        { value: 'all' as TabValue, label: 'All', icon: <Users className="h-4 w-4" /> },
        { value: 'coaches' as TabValue, label: 'Coaches', icon: <GraduationCap className="h-4 w-4" /> },
        { value: 'recruiters' as TabValue, label: 'Recruiters', icon: <Target className="h-4 w-4" /> }
      ];
    case 'coach':
    case 'recruiter':
      return [
        { value: 'athletes' as TabValue, label: 'Athletes', icon: <User className="h-4 w-4" /> }
      ];
    default:
      return [
        { value: 'all' as TabValue, label: 'All', icon: <Users className="h-4 w-4" /> },
        { value: 'athletes' as TabValue, label: 'Athletes', icon: <User className="h-4 w-4" /> },
        { value: 'coaches' as TabValue, label: 'Coaches', icon: <GraduationCap className="h-4 w-4" /> },
        { value: 'recruiters' as TabValue, label: 'Recruiters', icon: <Target className="h-4 w-4" /> }
      ];
  }
};

// Helper function to convert tab to role
const getTabRole = (tab: TabValue): string | null => {
  switch (tab) {
    case 'athletes':
      return 'athlete';
    case 'coaches':
      return 'coach';
    case 'recruiters':
      return 'recruiter';
    default:
      return null;
  }
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const effectiveRole = user?.publicMetadata?.role as string;
  
  // Set default tab based on user role
  const getDefaultTab = (userRole: string): TabValue => {
    if (userRole === 'coach' || userRole === 'recruiter') {
      return 'athletes'; // Coaches and recruiters can only see athletes
    }
    return 'all'; // Athletes default to 'all'
  };
  
  const [activeTab, setActiveTab] = useState<TabValue>(
    searchParams?.get('tab') as TabValue || getDefaultTab(effectiveRole)
  );
  
  // Filter states
  const [selectedSports, setSelectedSports] = useState<FilterOption[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<FilterOption[]>([]);
  const [selectedStates, setSelectedStates] = useState<FilterOption[]>([]);
  
  // Data and loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  // Filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDiscoverButton, setShowDiscoverButton] = useState(false);
  
  // Refs for infinite scroll and preventing double initial load
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const initialLoadTriggered = useRef(false);

  const availableTabs = useMemo(() => 
    getAvailableTabs(effectiveRole)
  , [effectiveRole]);

  // Filter options
  const sportsOptions = useMemo(() => 
    getSportsList().map(sport => ({
      value: sport,
      label: sport
    }))
  , []);

  const divisionsOptions = useMemo(() => 
    getOrderedDivisions(effectiveRole).map(division => ({
      value: division,
      label: division
    }))
  , [effectiveRole]);

  const statesOptions = useMemo(() => 
    US_STATES.map(state => ({
      value: state,
      label: state
    }))
  , []);

  // Load users function - only called when discover button is clicked
  const loadUsers = useCallback(async (pageNum: number, isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setInitialLoading(true);
        setAllUsers([]); // Clear previous results
        setHasSearched(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: '10' // Show 10 profiles per load
      });

      // Don't filter by role in API call - we'll filter client-side
      // This allows users to switch between tabs without losing results

      // Add filters
      selectedSports.forEach(sport => 
        params.append('sports', sanitizeText(sport.value))
      );
      selectedDivisions.forEach(div => 
        params.append('divisions', sanitizeText(div.value))
      );
      selectedStates.forEach(state => 
        params.append('states', sanitizeText(state.value))
      );

      const response = await fetch(`/api/discover?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data: DiscoverResponse = await response.json();
      
      if (isNewSearch) {
        setAllUsers(data.results);
        setPage(1);
      } else {
        setAllUsers(prev => [...prev, ...data.results]);
      }
      
      setHasMore(data.results.length === 10); // If we got less than 10, no more pages
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedSports, selectedDivisions, selectedStates]);

  // Store all results from the search
  const [allUsers, setAllUsers] = useState<DiscoverUser[]>([]);

  // Cache key for search state
  const CACHE_KEY = 'discover_search_state';

  // Save current search state to cache
  const saveSearchState = useCallback(() => {
    const searchState = {
      selectedSports,
      selectedDivisions, 
      selectedStates,
      allUsers: allUsers.slice(0, 50), // Limit cached users to prevent storage overflow
      activeTab,
      page,
      hasSearched,
      timestamp: Date.now()
    };
    try {
      const stateString = JSON.stringify(searchState);
      // Check if the data is too large for localStorage (typical limit is 5-10MB)
      const sizeMB = new Blob([stateString]).size / (1024 * 1024);
      if (sizeMB > 2) { // Limit to 2MB to be safe
        console.warn('Search state too large for localStorage, skipping cache');
        return;
      }
      localStorage.setItem(CACHE_KEY, stateString);
    } catch (error) {
      console.warn('Failed to save search state to cache:', error);
      // Try to clear old cache and retry with reduced data
      try {
        localStorage.removeItem(CACHE_KEY);
        const reducedState = {
          ...searchState,
          allUsers: allUsers.slice(0, 20) // Further reduce cached users
        };
        const reducedStateString = JSON.stringify(reducedState);
        const reducedSizeMB = new Blob([reducedStateString]).size / (1024 * 1024);
        if (reducedSizeMB <= 1) {
          localStorage.setItem(CACHE_KEY, reducedStateString);
        }
      } catch (retryError) {
        console.warn('Failed to save reduced search state to cache:', retryError);
      }
    }
  }, [selectedSports, selectedDivisions, selectedStates, allUsers, activeTab, page, hasSearched]);

  // Load search state from cache
  const loadSearchState = useCallback(() => {
    try {
      const cachedState = localStorage.getItem(CACHE_KEY);
      if (cachedState) {
        const parsed = JSON.parse(cachedState);
        const isRecent = Date.now() - (parsed.timestamp || 0) < 30 * 60 * 1000; // 30 minutes
        
        if (isRecent && parsed.allUsers && parsed.allUsers.length > 0) {
          setSelectedSports(parsed.selectedSports || []);
          setSelectedDivisions(parsed.selectedDivisions || []);
          setSelectedStates(parsed.selectedStates || []);
          setAllUsers(parsed.allUsers || []);
          setActiveTab(parsed.activeTab || getDefaultTab(effectiveRole));
          setPage(parsed.page || 1);
          setHasSearched(parsed.hasSearched || false);
          return true; // Successfully loaded cache
        }
      }
    } catch (error) {
      console.warn('Failed to load search state from cache:', error);
    }
    return false; // No valid cache found
  }, [effectiveRole]);

  // Handle profile view with caching
  const handleViewProfile = useCallback((userId: string) => {
    saveSearchState();
    router.push(`/profile/${userId}`);
  }, [saveSearchState, router]);

  // Auto-load results when the page first loads
  useEffect(() => {
    if (effectiveRole && !hasSearched && !initialLoading && !loading && !initialLoadTriggered.current) {
      initialLoadTriggered.current = true;
      
      // Try to load from cache first
      const cacheLoaded = loadSearchState();
      
      // Only fetch fresh data if no valid cache found
      if (!cacheLoaded) {
        loadUsers(1, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole]); // Only depend on effectiveRole to prevent multiple triggers

  // Show discover button when filters change (only if filters are applied)
  useEffect(() => {
    const hasFiltersApplied = selectedSports.length > 0 || selectedDivisions.length > 0 || selectedStates.length > 0;
    setShowDiscoverButton(hasFiltersApplied && hasSearched);
  }, [selectedSports, selectedDivisions, selectedStates, hasSearched]);

  // Save search state whenever important data changes
  useEffect(() => {
    if (hasSearched && allUsers.length > 0) {
      saveSearchState();
    }
  }, [selectedSports, selectedDivisions, selectedStates, allUsers, activeTab, page, hasSearched, saveSearchState]);

  // Filter displayed users based on active tab
  const displayedUsers = useMemo(() => {
    if (!hasSearched || allUsers.length === 0) return [];
    
    const tabRole = getTabRole(activeTab);
    if (!tabRole) return allUsers; // 'all' tab shows all users
    
    return allUsers.filter(user => user.role === tabRole);
  }, [allUsers, activeTab, hasSearched]);

  // Discover/Search function
  const handleDiscover = () => {
    setShowMobileFilters(false);
    setShowDiscoverButton(false);
    loadUsers(1, true);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedSports([]);
    setSelectedDivisions([]);
    setSelectedStates([]);
    setShowMobileFilters(false);
    setShowDiscoverButton(false);
    setError(null);
    // Re-load results without filters
    loadUsers(1, true);
  };

  // Infinite scroll setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading && hasSearched) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadUsers(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, initialLoading, page, loadUsers, hasSearched]);

  // Profile image helper
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) return null;
    
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
    return `${baseUrl}/${profileImage}`;
  };

  // Helper to format education level consistently  
  const formatEducationLevel = (educationLevel?: string) => {
    if (educationLevel === 'high_school') return 'High School';
    if (educationLevel === 'associate') return 'Associate';
    if (educationLevel === 'undergraduate') return 'Undergraduate';
    if (educationLevel === 'graduate') return 'Graduate';
    return educationLevel;
  };

  // Helper to format division consistently
  const formatDivision = (division?: string) => {
    if (division === 'high_school') return 'High School';
    return division;
  };

  // Role badge helper with division-based color coding
  const getRoleBadge = (user: DiscoverUser) => {
    let roleText = '';
    let roleColor = '';

    if (user.role === 'athlete') {
      if (user.educationLevel === 'high_school') {
        roleText = 'HS Athlete';
        roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
      } else if (user.educationLevel === 'associate') {
        roleText = 'JC Athlete';
        roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
      } else if (user.educationLevel === 'undergraduate' || user.educationLevel === 'graduate') {
        roleText = 'College Athlete';
        roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
      } else {
        roleText = 'Athlete';
        roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
      }
    } else if (user.role === 'coach') {
      if (user.division === 'High School') {
        roleText = 'HS Coach';
        roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
      } else if (user.division === 'Club Sports') {
        roleText = 'Club Coach';
        roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
      } else if (user.division === 'Community College' || user.division === 'Junior College' || user.division?.includes('NJCAA')) {
        roleText = 'JC Coach';
        roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
      } else if (user.division?.includes('NCAA') || user.division === 'NAIA') {
        roleText = 'College Coach';
        roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
      } else {
        roleText = 'Coach';
        roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
      }
    } else if (user.role === 'recruiter') {
      if (user.division === 'High School') {
        roleText = 'HS Recruiter';
        roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
      } else if (user.division === 'Club Sports') {
        roleText = 'Club Recruiter';
        roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
      } else if (user.division === 'Community College' || user.division === 'Junior College' || user.division?.includes('NJCAA')) {
        roleText = 'JC Recruiter';
        roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
      } else if (user.division?.includes('NCAA') || user.division === 'NAIA') {
        roleText = 'College Recruiter';
        roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
      } else {
        roleText = 'Recruiter';
        roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
      }
    }
    
    return (
      <Badge 
        variant="outline" 
        className={cn("text-xs font-medium px-1.5 py-0.5 border whitespace-nowrap sm:px-2", roleColor)}
      >
        {roleText}
      </Badge>
    );
  };

  // User card component
  const renderUserCard = (user: DiscoverUser) => (
    <Card key={user.id} className="group hover:shadow-2xl transition-all duration-300 border border-border shadow-xl bg-card hover:bg-card/90 hover:scale-[1.01] hover:border-[#01ae79]/50">
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header with Avatar, Name, and Badge */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-3 ring-[#01ae79]/30 border-2 border-border">
                <AvatarImage 
                  src={getProfileImageUrl(user.profileImage) || undefined} 
                  alt={user.fullName || 'User'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#01ae79] to-emerald-600 text-white font-semibold text-lg sm:text-xl">
                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UN'}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-[#01ae79] rounded-full p-1.5 border-2 border-background">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Name, Organization and Badge */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-bold text-base sm:text-lg lg:text-xl text-card-foreground leading-tight break-words line-clamp-2">
                    {user.fullName || 'Unknown User'}
                  </h3>
                  {user.organizationName && (
                    <p className="text-sm sm:text-base text-muted-foreground font-medium leading-tight break-words line-clamp-2">
                      {user.organizationName}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2">
                  {getRoleBadge(user)}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs sm:text-sm">
            {/* Sport */}
            {user.sport && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Building2 className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{user.sport}</span>
              </div>
            )}

            {/* Location with Country */}
            {(user.city || user.state || user.country) && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <MapPin className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">
                  {[user.city, user.state, user.country !== 'United States' ? user.country : null]
                    .filter(Boolean)
                    .join(', ')
                  }
                </span>
              </div>
            )}

            {/* Division/Education Level */}
            {(user.division || user.educationLevel) && (
              <div className="flex items-center text-muted-foreground">
                <GraduationCap className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{formatDivision(user.division) || formatEducationLevel(user.educationLevel)}</span>
              </div>
            )}

            {/* Title/Position for coaches/recruiters */}
            {user.title && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{user.title}</span>
              </div>
            )}

            {/* Athlete-specific: Height & Weight */}
            {user.role === 'athlete' && (user.height || user.weight) && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">
                  {[user.height, user.weight].filter(Boolean).join(' / ')}
                </span>
              </div>
            )}

            {/* Graduation Year */}
            {user.role === 'athlete' && user.graduationYear && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Class of {user.graduationYear}</span>
              </div>
            )}

            {/* Positions for athletes */}
            {user.role === 'athlete' && user.positions && user.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{user.positions.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Action Button - Always at bottom with consistent positioning */}
          <div className="pt-3">
            <Button 
              size="lg" 
              className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold py-3 text-sm sm:text-base"
              disabled={user.hasPendingRequest}
              onClick={() => handleViewProfile(user.id)}
            >
              {user.hasPendingRequest ? (
                <>
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Request Sent
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  View Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Active filters count
  const activeFiltersCount = selectedSports.length + selectedDivisions.length + selectedStates.length;

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden xl:block w-full xl:w-80 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground mb-1">
                    Discover
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Find athletes, coaches & recruiters
                  </p>
                </div>
                
                {/* Mobile Filter Button */}
                <Button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  variant="outline"
                  className="xl:hidden relative"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-[#01ae79] text-white">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4 h-6">
                <h2 className="text-sm font-medium text-foreground">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Button 
                    onClick={clearFilters}
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Sports Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sports
                  </label>
                  <MultiSelectFilter
                    options={sportsOptions}
                    selected={selectedSports}
                    onSelectionChange={setSelectedSports}
                    placeholder="Select sports..."
                    searchPlaceholder="Search sports..."
                  />
                </div>

                {/* Divisions Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Division/Level
                  </label>
                  <MultiSelectFilter
                    options={divisionsOptions}
                    selected={selectedDivisions}
                    onSelectionChange={setSelectedDivisions}
                    placeholder="Select divisions..."
                    searchPlaceholder="Search divisions..."
                  />
                </div>

                {/* States Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <MultiSelectFilter
                    options={statesOptions}
                    selected={selectedStates}
                    onSelectionChange={setSelectedStates}
                    placeholder="Select states..."
                    searchPlaceholder="Search states..."
                  />
                </div>

                {showDiscoverButton && (
                  <Button 
                    onClick={handleDiscover}
                    className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Header - Only visible when sidebar is hidden */}
          <div className="xl:hidden mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  Discover
                </h1>
                <p className="text-sm text-muted-foreground">
                  Find athletes, coaches & recruiters
                </p>
              </div>
              
              {/* Mobile Filter Button */}
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                variant="outline"
                className="relative flex-shrink-0 w-[120px] justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="truncate">
                  {activeFiltersCount > 0 ? `${activeFiltersCount} Filter${activeFiltersCount !== 1 ? 's' : ''}` : 'Filters'}
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile/Tablet Filters Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 xl:hidden flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                  <Button 
                    onClick={() => setShowMobileFilters(false)}
                    variant="ghost" 
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Sports Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sports
                    </label>
                    <MultiSelectFilter
                      options={sportsOptions}
                      selected={selectedSports}
                      onSelectionChange={setSelectedSports}
                      placeholder="Select sports..."
                      searchPlaceholder="Search sports..."
                    />
                  </div>

                  {/* Divisions Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Division/Level
                    </label>
                    <MultiSelectFilter
                      options={divisionsOptions}
                      selected={selectedDivisions}
                      onSelectionChange={setSelectedDivisions}
                      placeholder="Select divisions..."
                      searchPlaceholder="Search divisions..."
                    />
                  </div>

                  {/* States Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location
                    </label>
                    <MultiSelectFilter
                      options={statesOptions}
                      selected={selectedStates}
                      onSelectionChange={setSelectedStates}
                      placeholder="Select states..."
                      searchPlaceholder="Search states..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                    {showDiscoverButton && (
                      <Button 
                        onClick={handleDiscover}
                        className="flex-1 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Apply Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
              <TabsList className="grid w-full mb-6 bg-card border border-border" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
                {availableTabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-[#01ae79] data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
                  >
                    {tab.icon}
                    <span className="text-xs sm:text-sm">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {/* Results */}
                  {initialLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79]"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">{error}</p>
                      <Button onClick={() => loadUsers(1, true)} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  ) : !hasSearched ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79] mx-auto"></div>
                    </div>
                  ) : displayedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeFiltersCount > 0 
                          ? "Try adjusting your filters to see more results."
                          : "No users are available to discover at the moment."
                        }
                      </p>
                      {activeFiltersCount > 0 && (
                        <Button onClick={clearFilters} variant="outline">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Results Count */}
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          Showing {displayedUsers.length}
                          {activeFiltersCount > 0 && (
                            <span className="ml-2">
                              • <span className="font-medium">{activeFiltersCount}</span> filter{activeFiltersCount !== 1 ? 's' : ''} applied
                            </span>
                          )}
                        </p>
                      </div>

                      {/* User Grid - responsive columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
                        {displayedUsers.map(renderUserCard)}
                      </div>

                      {/* Infinite Scroll Trigger */}
                      {hasMore && (
                        <div 
                          ref={loadMoreRef}
                          className="text-center py-4"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#01ae79] mr-2"></div>
                              <span className="text-muted-foreground">Loading more...</span>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">Scroll down to load more</p>
                          )}
                        </div>
                      )}

                      {!hasMore && allUsers.length > 10 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">You&apos;ve reached the end!</p>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AuthWrapper requireRole={['athlete', 'coach', 'recruiter', 'admin']}>
      <Suspense fallback={
        <div className="bg-background flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79]"></div>
        </div>
      }>
        <SearchPageContent />
      </Suspense>
    </AuthWrapper>
  );
} 