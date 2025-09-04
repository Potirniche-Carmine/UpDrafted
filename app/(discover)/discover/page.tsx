"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Target, MapPin, Shield, GraduationCap, Send, ChevronDown, X, Clock, Building2, Filter, Search } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';

import { AuthWrapper } from '@/components/auth-wrapper';
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sanitizeText } from '@/utils/sanitization';
import { createSecureHeaders } from '@/utils/clerk-security';
import { getSportsList, DIVISIONS, US_STATES, COUNTRIES, getPositionsForSport } from '@/lib/sports-data';
import { CONFERENCES_BY_DIVISION } from '@/lib/conference-data';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  hasIncomingRequest: boolean;
  graduationYear?: number;
  height?: string;
  weight?: string;
  positions?: string[];
  recruitingNeeds?: {
    studentClassifications: string[];
    positions: string[];
    scholarshipsAvailable: number | null;
  } | null;
}

interface DiscoverResponse {
  results: DiscoverUser[];
  total: number;
  hasMore: boolean;
}

type TabValue = 'all' | 'athletes' | 'coaches' | 'recruiters';

// Helper functions for height/weight conversion
const inchesToFeetString = (totalInches: number): string => {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches > 0 ? `${feet}'${inches}"` : `${feet}'`;
};

// Generate graduation year options
const getGraduationYearOptions = (): FilterOption[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 6; i++) {
    years.push({
      value: (currentYear + i).toString(),
      label: `Class of ${currentYear + i}`
    });
  }
  return years;
};

// Get conferences for selected divisions
const getConferencesForDivisions = (selectedDivisions: FilterOption[]): FilterOption[] => {
  // Don't show conferences for High School division
  const eligibleDivisions = selectedDivisions.filter(div => div.value !== 'High School');
  
  // If no eligible divisions are selected, return empty array (don't show all conferences)
  if (eligibleDivisions.length === 0) {
    return [];
  }
  
  const conferences = new Set<string>();
  eligibleDivisions.forEach(division => {
    const divisionConfs = CONFERENCES_BY_DIVISION[division.value] || [];
    divisionConfs.forEach(conf => conferences.add(conf));
  });
  
  return Array.from(conferences)
    .map(conf => ({ value: conf, label: conf }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

// Get positions for selected sports
const getPositionsForSports = (selectedSports: FilterOption[]): FilterOption[] => {
  if (selectedSports.length === 0) return [];
  
  const positions = new Set<string>();
  selectedSports.forEach(sport => {
    const sportPositions = getPositionsForSport(sport.value);
    sportPositions.forEach(pos => positions.add(pos));
  });
  
  return Array.from(positions)
    .map(pos => ({ value: pos, label: pos }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

// Ordered divisions with High School first (most common)
const ORDERED_DIVISIONS = ['High School', ...DIVISIONS.filter(d => d !== 'High School')];

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

// Height/Weight Range Filter Component
interface HeightWeightFilterProps {
  minHeight: number;
  minWeight: number;
  onHeightChange: (height: number) => void;
  onWeightChange: (weight: number) => void;
  className?: string;
}

function HeightWeightFilter({
  minHeight,
  minWeight,
  onHeightChange,
  onWeightChange,
  className
}: HeightWeightFilterProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Minimum Height: {inchesToFeetString(minHeight)}
        </Label>
        <Slider
          value={[minHeight]}
          onValueChange={(value: number[]) => onHeightChange(value[0])}
          min={60} // 5'0"
          max={96} // 8'0"
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5&apos;0&quot;</span>
          <span>8&apos;0&quot;</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Minimum Weight: {minWeight} lbs
        </Label>
        <Slider
          value={[minWeight]}
          onValueChange={(value: number[]) => onWeightChange(value[0])}
          min={100}
          max={500}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>100 lbs</span>
          <span>500 lbs</span>
        </div>
      </div>
    </div>
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
  
  // Dynamic title and subtitle based on user role
  const getTitle = () => {
    switch (effectiveRole) {
      case 'athlete':
        return 'Discover';
      case 'coach':
        return 'Discover';
      case 'recruiter':
        return 'Discover';
      case 'admin':
        return 'Discover';
      default:
        return 'Discover';
    }
  };

  const getSubtitle = () => {
    switch (effectiveRole) {
      case 'athlete':
        return 'Find your next coach or opportunity';
      case 'coach':
        return 'Find your next talent';
      case 'recruiter':
        return 'Find your next talent';
      case 'admin':
        return 'Find athletes, coaches & recruiters';
      default:
        return 'Find athletes, coaches & recruiters';
    }
  };

  // Set default tab based on user role
  const getDefaultTab = (userRole: string): TabValue => {
    if (userRole === 'coach' || userRole === 'recruiter') {
      return 'athletes'; // Coaches and recruiters can only see athletes
    }
    return 'all'; // Athletes default to 'all'
  };

  // Helper function to get a valid tab with multiple fallbacks
  const getValidTab = useCallback((userRole: string, urlTab?: string | null): TabValue => {
    const availableTabs = getAvailableTabs(userRole);
    const availableTabValues = availableTabs.map(tab => tab.value);
    
    // First, try the URL tab if it's valid
    if (urlTab && availableTabValues.includes(urlTab as TabValue)) {
      return urlTab as TabValue;
    }
    
    // Then try the default tab for the role
    const defaultTab = getDefaultTab(userRole);
    if (availableTabValues.includes(defaultTab)) {
      return defaultTab;
    }
    
    // Finally, fallback to the first available tab
    const fallbackTab = availableTabValues[0] || 'all';
    
    // Log warning if we had to use fallback (for debugging)
    if (urlTab && !availableTabValues.includes(urlTab as TabValue)) {
      console.warn(`Invalid tab "${urlTab}" for role "${userRole}". Using fallback: "${fallbackTab}"`);
    }
    
    return fallbackTab;
  }, []); // No dependencies since getAvailableTabs and getDefaultTab are pure functions

  const [activeTab, setActiveTab] = useState<TabValue>(
    getValidTab(effectiveRole, searchParams?.get('tab'))
  );

  // Filter states
  const [selectedSports, setSelectedSports] = useState<FilterOption[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<FilterOption[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<FilterOption[]>([
    { value: 'United States', label: 'United States' } // Default to United States
  ]);
  const [selectedStates, setSelectedStates] = useState<FilterOption[]>([]);
  
  // Advanced filter states
  const [selectedPositions, setSelectedPositions] = useState<FilterOption[]>([]);
  const [selectedGraduatingClasses, setSelectedGraduatingClasses] = useState<FilterOption[]>([]);
  const [selectedConferences, setSelectedConferences] = useState<FilterOption[]>([]);
  const [minHeight, setMinHeight] = useState<number>(60); // 5'0" in inches
  const [minWeight, setMinWeight] = useState<number>(100); // 100 lbs

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
    ORDERED_DIVISIONS.map((division: string) => ({
      value: division,
      label: division
    }))
    , []);

  const statesOptions = useMemo(() =>
    US_STATES.map(state => ({
      value: state,
      label: state
    }))
    , []);

  // Country options
  const countryOptions = useMemo(() =>
    COUNTRIES.map(country => ({
      value: country,
      label: country
    }))
    , []);

  // Check if United States is selected to show states
  const showStatesFilter = useMemo(() =>
    selectedCountries.some(country => country.value === 'United States')
    , [selectedCountries]);

  // Advanced filter options
  const positionsOptions = useMemo(() =>
    getPositionsForSports(selectedSports)
    , [selectedSports]);

  const graduatingClassOptions = useMemo(() =>
    getGraduationYearOptions()
    , []);

  const conferencesOptions = useMemo(() =>
    getConferencesForDivisions(selectedDivisions)
    , [selectedDivisions]);

  // Load users function - only called when discover button is clicked
  const loadUsers = useCallback(async (pageNum: number, isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setInitialLoading(true);
        setAllUsers([]); // Clear previous results
        setHasSearched(true);
        setPage(1); // Reset page state immediately for new searches
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

      // Prepare the search parameters
      const searchParams = {
        page: pageNum.toString(),
        pageSize: '10', // Show 10 profiles per load
        sports: selectedSports.map(sport => sanitizeText(sport.value)),
        divisions: selectedDivisions.map(div => sanitizeText(div.value)),
        countries: selectedCountries.map(country => sanitizeText(country.value)),
        states: showStatesFilter ? selectedStates.map(state => sanitizeText(state.value)) : [],
        positions: selectedPositions.map(pos => sanitizeText(pos.value)),
        graduatingClasses: selectedGraduatingClasses.map(gc => sanitizeText(gc.value)),
        conferences: selectedConferences.map(conf => sanitizeText(conf.value)),
        minHeight: minHeight.toString(),
        minWeight: minWeight.toString()
      };

      // Calculate approximate URL length if we were to use GET
      const params = new URLSearchParams({
        page: searchParams.page,
        pageSize: searchParams.pageSize
      });

      searchParams.sports.forEach(sport => params.append('sports', sport));
      searchParams.divisions.forEach(div => params.append('divisions', div));
      searchParams.countries.forEach(country => params.append('countries', country));
      if (showStatesFilter) {
        searchParams.states.forEach(state => params.append('states', state));
      }
      searchParams.positions.forEach(pos => params.append('positions', pos));
      searchParams.graduatingClasses.forEach(gc => params.append('graduatingClasses', gc));
      searchParams.conferences.forEach(conf => params.append('conferences', conf));
      if (minHeight > 60) params.append('minHeight', searchParams.minHeight);
      if (minWeight > 100) params.append('minWeight', searchParams.minWeight);

      const baseUrl = '/api/discover';
      const estimatedUrlLength = baseUrl.length + params.toString().length + 1; // +1 for '?'

      // Use POST if URL would be too long (> 3000 chars to be safe)
      const usePost = estimatedUrlLength > 3000;

      let response: Response;

      // Helper to send POST request (avoids duplication)
      const requestWithPost = async () =>
        fetch('/api/discover', {
          method: 'POST',
          headers: createSecureHeaders(token || ''),
          body: JSON.stringify({
            page: pageNum,
            pageSize: 10,
            sports: selectedSports.map(sport => sanitizeText(sport.value)),
            divisions: selectedDivisions.map(div => sanitizeText(div.value)),
            countries: selectedCountries.map(country => sanitizeText(country.value)),
            states: showStatesFilter ? selectedStates.map(state => sanitizeText(state.value)) : [],
            positions: selectedPositions.map(pos => sanitizeText(pos.value)),
            graduatingClasses: selectedGraduatingClasses.map(gc => sanitizeText(gc.value)),
            conferences: selectedConferences.map(conf => sanitizeText(conf.value)),
            minHeight: minHeight > 60 ? minHeight : undefined,
            minWeight: minWeight > 100 ? minWeight : undefined
          })
        });

      // Helper to produce better error messages
      const ensureOk = async (res: Response) => {
        if (res.ok) return;
        const data = await res.json().catch(() => ({}));
        const message = data?.error || data?.message || 'Failed to load users';
        throw new Error(message);
      };

      if (usePost) {
        // Use POST request for large filter sets
        response = await requestWithPost();
      } else {
        // Use GET request for smaller filter sets
        response = await fetch(`${baseUrl}?${params.toString()}`, {
          headers: createSecureHeaders(token || ''),
        });
      }

      if (!response.ok) {
        // Check if it's a URL too long error and retry with POST
        if (response.status === 414 && !usePost) {
          response = await requestWithPost();
          if (!response.ok) {
            await ensureOk(response);
          }
        } else {
          await ensureOk(response);
        }
      }

      const data: DiscoverResponse = await response.json();

      if (isNewSearch) {
        setAllUsers(data.results);
        // Page is already set to 1 at the beginning of the function
      } else {
        setAllUsers(prev => [...prev, ...data.results]);
        setPage(pageNum + 1); // Update page for next load
      }

      setHasMore(data.results.length === 10); // If we got less than 10, no more pages

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedSports, selectedDivisions, selectedCountries, selectedStates, selectedPositions, selectedGraduatingClasses, selectedConferences, minHeight, minWeight, showStatesFilter]);

  // Store all results from the search
  const [allUsers, setAllUsers] = useState<DiscoverUser[]>([]);

  // Cache key for search state
  const CACHE_KEY = 'discover_search_state';

  // Save current search state to cache (filters only, not user data)
  const saveSearchState = useCallback(() => {
    const searchState = {
      selectedSports,
      selectedDivisions,
      selectedCountries,
      selectedStates,
      selectedPositions,
      selectedGraduatingClasses,
      selectedConferences,
      minHeight,
      minWeight,
      activeTab,
      hasSearched,
      timestamp: Date.now()
    };
    try {
      const stateString = JSON.stringify(searchState);
      localStorage.setItem(CACHE_KEY, stateString);
    } catch (error) {
      console.warn('Failed to save search state to cache:', error);
    }
  }, [selectedSports, selectedDivisions, selectedCountries, selectedStates, selectedPositions, selectedGraduatingClasses, selectedConferences, minHeight, minWeight, activeTab, hasSearched]);

  // Load search state from cache (filters only)
  const loadSearchState = useCallback(() => {
    try {
      const cachedState = localStorage.getItem(CACHE_KEY);
      if (cachedState) {
        const parsed = JSON.parse(cachedState);
        const isRecent = Date.now() - (parsed.timestamp || 0) < 60 * 60 * 1000; // 1 hour for filters

        if (isRecent) {
          setSelectedSports(parsed.selectedSports || []);
          setSelectedDivisions(parsed.selectedDivisions || []);
          setSelectedCountries(parsed.selectedCountries || [{ value: 'United States', label: 'United States' }]);
          setSelectedStates(parsed.selectedStates || []);
          setSelectedPositions(parsed.selectedPositions || []);
          setSelectedGraduatingClasses(parsed.selectedGraduatingClasses || []);
          setSelectedConferences(parsed.selectedConferences || []);
          setMinHeight(parsed.minHeight || 60);
          setMinWeight(parsed.minWeight || 100);
          setActiveTab(getValidTab(effectiveRole, parsed.activeTab));
          setHasSearched(parsed.hasSearched || false);
          return true; // Successfully loaded cache, but need to search fresh
        }
      }
    } catch (error) {
      console.warn('Failed to load search state from cache:', error);
    }
    return false; // No valid cache found
  }, [effectiveRole, getValidTab]);

  // Generate profile URL with slug
  const generateProfileUrl = useCallback((user: DiscoverUser) => {
    if (user.fullName) {
      const slug = user.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return `/profile/${slug}/${user.id}`;
    }
    // Fallback to old format if no fullName
    return `/profile/${user.id}`;
  }, []);

  // Handle profile view with caching
  const handleViewProfile = useCallback((userId: string) => {
    saveSearchState();
    
    // Find the user in the current results to get their fullName
    const user = allUsers.find(u => u.id === userId);
    if (user && user.fullName) {
      const profileUrl = generateProfileUrl(user);
      router.push(profileUrl);
    } else {
      // Fallback to old format if user not found or no fullName
      router.push(`/profile/${userId}`);
    }
  }, [saveSearchState, router, allUsers, generateProfileUrl]);

  // Auto-load results when the page first loads
  useEffect(() => {
    if (effectiveRole && !hasSearched && !initialLoading && !loading && !initialLoadTriggered.current) {
      initialLoadTriggered.current = true;

      // Try to load filters from cache first
      loadSearchState();

      // Always fetch fresh data (even if cache loaded, we only cached filters)
      loadUsers(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole]); // Only depend on effectiveRole to prevent multiple triggers

  // Ensure activeTab is always valid when role changes
  useEffect(() => {
    if (effectiveRole) {
      const validTab = getValidTab(effectiveRole, activeTab);
      if (validTab !== activeTab) {
        setActiveTab(validTab);
      }
    }
  }, [effectiveRole, activeTab, getValidTab]);

  // Show discover button when filters change (only if filters are applied)
  useEffect(() => {
    const hasFiltersApplied = selectedSports.length > 0 || 
                             selectedDivisions.length > 0 || 
                             selectedCountries.length > 1 || // More than just United States
                             selectedStates.length > 0 ||
                             selectedPositions.length > 0 ||
                             selectedGraduatingClasses.length > 0 ||
                             selectedConferences.length > 0 ||
                             minHeight > 60 ||
                             minWeight > 100;
    setShowDiscoverButton(hasFiltersApplied && hasSearched);
  }, [selectedSports, selectedDivisions, selectedCountries, selectedStates, selectedPositions, selectedGraduatingClasses, selectedConferences, minHeight, minWeight, hasSearched]);

  // Save search state whenever important data changes
  useEffect(() => {
    if (hasSearched && allUsers.length > 0) {
      saveSearchState();
    }
  }, [selectedSports, selectedDivisions, selectedStates, selectedPositions, selectedGraduatingClasses, selectedConferences, minHeight, minWeight, allUsers, activeTab, page, hasSearched, saveSearchState]);

  // Filter displayed users based on active tab
  const displayedUsers = useMemo(() => {
    if (!hasSearched || allUsers.length === 0) return [];

    const tabRole = getTabRole(activeTab);
    if (!tabRole) {
      // 'all' tab logic depends on user role
      if (effectiveRole === 'athlete') {
        // Athletes see only coaches and recruiters in 'all' tab
        return allUsers.filter(user => user.role === 'coach' || user.role === 'recruiter');
      }
      // For other roles, show all users
      return allUsers;
    }

    return allUsers.filter(user => user.role === tabRole);
  }, [allUsers, activeTab, hasSearched, effectiveRole]);

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
    setSelectedCountries([{ value: 'United States', label: 'United States' }]); // Reset to default
    setSelectedStates([]);
    setSelectedPositions([]);
    setSelectedGraduatingClasses([]);
    setSelectedConferences([]);
    setMinHeight(60);
    setMinWeight(100);
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
          // Use current page state for loading next page
          loadUsers(page, false);
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
    <Card key={user.id} className="group hover:shadow-xl transition-all duration-300 border border-border shadow-md bg-card hover:bg-card/90 hover:border-[#01ae79]/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with Avatar, Name, and Badge */}
          <div className="flex items-start gap-3">
            {/* Avatar - Clickable */}
            <a
              href={generateProfileUrl(user)}
              className="relative flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity block"
              onClick={(e) => {
                e.preventDefault();
                handleViewProfile(user.id);
              }}
            >
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-[#01ae79]/30 border-2 border-border">
                <AvatarImage
                  src={getProfileImageUrl(user.profileImage) || undefined}
                  alt={user.fullName || 'User'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#01ae79] to-emerald-600 text-white font-semibold text-sm sm:text-base">
                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UN'}
                </AvatarFallback>
              </Avatar>
                {user.isVerified && (
                 <div className="absolute -bottom-1 -right-1 bg-[#01ae79] rounded-full p-1 border-2 border-background">
                   <Shield className="h-3 w-3 text-white" />
                 </div>
               )}
              {!user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-[#f59e0b] rounded-full p-1 border-2 border-background">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </a>

            {/* Name, Organization and Badge */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <a
                    href={generateProfileUrl(user)}
                    className="font-semibold text-base text-card-foreground leading-tight break-words line-clamp-2 cursor-pointer hover:text-[#01ae79] transition-colors block"
                    onClick={(e) => {
                      e.preventDefault();
                      handleViewProfile(user.id);
                    }}
                  >
                    {user.fullName || 'Unknown User'}
                  </a>
                  {user.organizationName && (
                    <p className="text-sm text-muted-foreground font-medium leading-tight break-words line-clamp-2">
                      {user.organizationName}
                    </p>
                  )}
                  {/* Title/Position for coaches/recruiters */}
                  {user.title && (user.role === 'coach' || user.role === 'recruiter') && (
                    <div className="flex items-center text-muted-foreground">
                      <span className="font-medium text-sm">{user.title}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2">
                  {getRoleBadge(user)}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm">
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

            {/* Scholarships Available for Coaches and Recruiters */}
            {(user.role === 'coach' || user.role === 'recruiter') && user.recruitingNeeds?.scholarshipsAvailable !== null && user.recruitingNeeds?.scholarshipsAvailable !== undefined && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Scholarships: {user.recruitingNeeds.scholarshipsAvailable}</span>
              </div>
            )}

            {/* Athlete-specific: Height & Weight */}
            {user.role === 'athlete' && (user.height || user.weight) && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">
                  {[
                    user.height,
                    user.weight ? `${user.weight} lbs` : null
                  ].filter(Boolean).join(' / ')}
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

            {/* Student Classifications for Coaches and Recruiters */}
            {(user.role === 'coach' || user.role === 'recruiter') && user.recruitingNeeds && user.recruitingNeeds.studentClassifications && user.recruitingNeeds.studentClassifications.length > 0 && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Users className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Looking for: {user.recruitingNeeds.studentClassifications.map(classification => {
                  switch (classification) {
                    case 'high_school': return 'High School';
                    case 'university_transfers': return 'University Transfers';
                    case 'juco_students': return 'JUCO Students';
                    case 'graduate_transfers': return 'Graduate Transfers';
                    case 'international_students': return 'International Students';
                    default: return classification;
                  }
                }).join(', ')}</span>
              </div>
            )}

            {/* Positions Needed for Coaches and Recruiters */}
            {(user.role === 'coach' || user.role === 'recruiter') && user.recruitingNeeds && user.recruitingNeeds.positions && user.recruitingNeeds.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Positions in need: {user.recruitingNeeds.positions.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Action Button - Always at bottom with consistent positioning */}
          <div className="pt-2">
            {user.hasPendingRequest ? (
              <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-0 shadow-sm transition-all duration-200 font-medium py-2 text-sm rounded-md flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Request Sent
              </div>
            ) : user.hasIncomingRequest ? (
              <a
                href={generateProfileUrl(user)}
                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium py-2 text-sm rounded-md flex items-center justify-center no-underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewProfile(user.id);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Connection Request Received - View Profile
              </a>
            ) : (
              <a
                href={generateProfileUrl(user)}
                className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 font-medium py-2 text-sm rounded-md flex items-center justify-center no-underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewProfile(user.id);
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                View Profile
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Active filters count
  const activeFiltersCount = selectedSports.length + 
                           selectedDivisions.length + 
                           (selectedCountries.length > 1 ? selectedCountries.length : 0) + // Only count if more than United States
                           selectedStates.length +
                           selectedPositions.length +
                           selectedGraduatingClasses.length +
                           selectedConferences.length +
                           (minHeight > 60 ? 1 : 0) +
                           (minWeight > 100 ? 1 : 0);

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden xl:block w-full xl:w-80 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {getTitle()}
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground">
                    {getSubtitle()}
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

              <div className="space-y-4 min-h-[300px]">
                {/* Sports Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sports
                    {(effectiveRole === 'coach' || effectiveRole === 'recruiter') && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        💡 Select one sport to filter by positions
                      </span>
                    )}
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

                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country
                  </label>
                  <MultiSelectFilter
                    options={countryOptions}
                    selected={selectedCountries}
                    onSelectionChange={setSelectedCountries}
                    placeholder="Select countries..."
                    searchPlaceholder="Search countries..."
                  />
                </div>

                {/* States Filter - Only show if United States is selected */}
                {showStatesFilter && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      US States
                    </label>
                    <MultiSelectFilter
                      options={statesOptions}
                      selected={selectedStates}
                      onSelectionChange={setSelectedStates}
                      placeholder="Select states..."
                      searchPlaceholder="Search states..."
                    />
                  </div>
                )}

                {/* Advanced Filters for Coaches/Recruiters/Admins viewing Athletes */}
                {(effectiveRole === 'coach' || effectiveRole === 'recruiter' || effectiveRole === 'admin') && (
                  <>
                    {/* Height/Weight Filters */}
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-foreground mb-3">Physical Requirements</h3>
                      <HeightWeightFilter
                        minHeight={minHeight}
                        minWeight={minWeight}
                        onHeightChange={setMinHeight}
                        onWeightChange={setMinWeight}
                      />
                    </div>

                    {/* Graduating Class Filter */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Graduating Class
                      </label>
                      <MultiSelectFilter
                        options={graduatingClassOptions}
                        selected={selectedGraduatingClasses}
                        onSelectionChange={setSelectedGraduatingClasses}
                        placeholder="Select graduation years..."
                        searchPlaceholder="Search years..."
                      />
                    </div>

                    {/* Positions Filter - Only show if sports are selected */}
                    {selectedSports.length > 0 && positionsOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Positions
                        </label>
                        <MultiSelectFilter
                          options={positionsOptions}
                          selected={selectedPositions}
                          onSelectionChange={setSelectedPositions}
                          placeholder="Select positions..."
                          searchPlaceholder="Search positions..."
                        />
                      </div>
                    )}

                    {/* Conferences Filter - Only show if divisions are selected */}
                    {selectedDivisions.length > 0 && conferencesOptions.length > 0 && (
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Conferences
                        </label>
                        <MultiSelectFilter
                          options={conferencesOptions}
                          selected={selectedConferences}
                          onSelectionChange={setSelectedConferences}
                          placeholder="Select conferences..."
                          searchPlaceholder="Search conferences..."
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Advanced Filters for Athletes viewing Coaches/Recruiters */}
                {effectiveRole === 'athlete' && (
                  <>
                    {/* Conferences Filter - Only show if divisions are selected */}
                    {selectedDivisions.length > 0 && conferencesOptions.length > 0 && (
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Conferences
                        </label>
                        <MultiSelectFilter
                          options={conferencesOptions}
                          selected={selectedConferences}
                          onSelectionChange={setSelectedConferences}
                          placeholder="Select conferences..."
                          searchPlaceholder="Search conferences..."
                        />
                      </div>
                    )}
                  </>
                )}

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
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {getTitle()}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  {getSubtitle()}
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

                <div className="space-y-4 min-h-[400px]">
                  {/* Sports Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sports
                      {(effectiveRole === 'coach' || effectiveRole === 'recruiter') && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          💡 Select one sport to filter by positions
                        </span>
                      )}
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

                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Country
                    </label>
                    <MultiSelectFilter
                      options={countryOptions}
                      selected={selectedCountries}
                      onSelectionChange={setSelectedCountries}
                      placeholder="Select countries..."
                      searchPlaceholder="Search countries..."
                    />
                  </div>

                  {/* States Filter - Only show if United States is selected */}
                  {showStatesFilter && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        US States
                      </label>
                      <MultiSelectFilter
                        options={statesOptions}
                        selected={selectedStates}
                        onSelectionChange={setSelectedStates}
                        placeholder="Select states..."
                        searchPlaceholder="Search states..."
                      />
                    </div>
                  )}

                  {/* Advanced Filters for Coaches/Recruiters/Admins viewing Athletes */}
                  {(effectiveRole === 'coach' || effectiveRole === 'recruiter' || effectiveRole === 'admin') && (
                    <>
                      {/* Height/Weight Filters */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-foreground mb-3">Physical Requirements</h3>
                        <HeightWeightFilter
                          minHeight={minHeight}
                          minWeight={minWeight}
                          onHeightChange={setMinHeight}
                          onWeightChange={setMinWeight}
                        />
                      </div>

                      {/* Graduating Class Filter */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Graduating Class
                        </label>
                        <MultiSelectFilter
                          options={graduatingClassOptions}
                          selected={selectedGraduatingClasses}
                          onSelectionChange={setSelectedGraduatingClasses}
                          placeholder="Select graduation years..."
                          searchPlaceholder="Search years..."
                        />
                      </div>

                      {/* Positions Filter - Only show if sports are selected */}
                      {selectedSports.length > 0 && positionsOptions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Positions
                          </label>
                          <MultiSelectFilter
                            options={positionsOptions}
                            selected={selectedPositions}
                            onSelectionChange={setSelectedPositions}
                            placeholder="Select positions..."
                            searchPlaceholder="Search positions..."
                          />
                        </div>
                      )}

                      {/* Conferences Filter - Only show if divisions are selected */}
                      {selectedDivisions.length > 0 && conferencesOptions.length > 0 && (
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Conferences
                          </label>
                          <MultiSelectFilter
                            options={conferencesOptions}
                            selected={selectedConferences}
                            onSelectionChange={setSelectedConferences}
                            placeholder="Select conferences..."
                            searchPlaceholder="Search conferences..."
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Advanced Filters for Athletes viewing Coaches/Recruiters */}
                  {effectiveRole === 'athlete' && (
                    <>
                      {/* Conferences Filter - Only show if divisions are selected */}
                      {selectedDivisions.length > 0 && conferencesOptions.length > 0 && (
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Conferences
                          </label>
                          <MultiSelectFilter
                            options={conferencesOptions}
                            selected={selectedConferences}
                            onSelectionChange={setSelectedConferences}
                            placeholder="Select conferences..."
                            searchPlaceholder="Search conferences..."
                          />
                        </div>
                      )}
                    </>
                  )}

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
            <Tabs value={activeTab} onValueChange={(value) => {
              const validTab = getValidTab(effectiveRole, value);
              setActiveTab(validTab);
            }}>
              <TabsList className="grid w-full mb-6 bg-card border border-border" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
                {availableTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-[#01ae79] data-[state=active]:text-white text-sm px-2 sm:px-4"
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.label}</span>
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