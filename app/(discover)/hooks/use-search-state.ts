"use client";

import { useState, useCallback, useRef } from "react";
import type { FilterOption } from './use-filter-options';

type TabValue = 'all' | 'athletes' | 'coaches' | 'recruiters';

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

interface UseSearchStateProps {
  effectiveRole: string;
  initialTab: TabValue;
  defaultSport?: string; // Optional default sport to preserve during clear operations
}

interface UseSearchStateReturn {
  // Tab state
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  
  // Filter states
  selectedSports: FilterOption[];
  setSelectedSports: (sports: FilterOption[]) => void;
  selectedDivisions: FilterOption[];
  setSelectedDivisions: (divisions: FilterOption[]) => void;
  selectedCountries: FilterOption[];
  setSelectedCountries: (countries: FilterOption[]) => void;
  selectedStates: FilterOption[];
  setSelectedStates: (states: FilterOption[]) => void;
  selectedPositions: FilterOption[];
  setSelectedPositions: (positions: FilterOption[]) => void;
  selectedGraduatingClasses: FilterOption[];
  setSelectedGraduatingClasses: (classes: FilterOption[]) => void;
  selectedConferences: FilterOption[];
  setSelectedConferences: (conferences: FilterOption[]) => void;
  minHeight: number;
  setMinHeight: (height: number) => void;
  minWeight: number;
  setMinWeight: (weight: number) => void;
  verifiedFilter: boolean | null;
  setVerifiedFilter: (verified: boolean | null) => void;
  
  // Loading states
  initialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  page: number;
  setPage: (page: number) => void;
  allUsers: DiscoverUser[];
  setAllUsers: (users: DiscoverUser[] | ((prev: DiscoverUser[]) => DiscoverUser[])) => void;
  
  // UI states
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
  showDiscoverButton: boolean;
  setShowDiscoverButton: (show: boolean) => void;
  clearingFilters: boolean;
  setClearingFilters: (clearing: boolean) => void;
  
  // Refs
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  initialLoadTriggered: React.MutableRefObject<boolean>;
  
  // Actions
  saveSearchState: () => void;
  loadSearchState: () => void;
  clearFilters: () => void;
  
  // Computed values
  activeFiltersCount: number;
}

export const useSearchState = ({ effectiveRole, initialTab, defaultSport }: UseSearchStateProps): UseSearchStateReturn => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

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
  const [minHeight, setMinHeight] = useState<number>(48); // 4'0" in inches
  const [minWeight, setMinWeight] = useState<number>(50); // 50 lbs
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null); // null = all, true = verified only

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
  const [clearingFilters, setClearingFilters] = useState(false);

  // Store all results from the search
  const [allUsers, setAllUsers] = useState<DiscoverUser[]>([]);

  // Refs for infinite scroll and preventing double initial load
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const initialLoadTriggered = useRef(false);

  // Cache key for search state
  const CACHE_KEY = 'discover_search_state_v3';

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
          setMinHeight(parsed.minHeight || 48);
          setMinWeight(parsed.minWeight || 50);
          setHasSearched(parsed.hasSearched || false);
          return true; // Successfully loaded cache, but need to search fresh
        }
      }
    } catch (error) {
      console.warn('Failed to load search state from cache:', error);
    }
    return false; // No valid cache found
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setClearingFilters(true);
    // Preserve default sport if one is set, otherwise clear all sports
    const sportsToSet = defaultSport ? [{ value: defaultSport, label: defaultSport }] : [];
    setSelectedSports(sportsToSet);
    setSelectedDivisions([]);
    setSelectedCountries([{ value: 'United States', label: 'United States' }]); // Reset to default
    setSelectedStates([]);
    setSelectedPositions([]);
    setSelectedGraduatingClasses([]);
    setSelectedConferences([]);
    setMinHeight(48);
    setMinWeight(50);
    setVerifiedFilter(null); // Reset verification filter
    setShowMobileFilters(false);
    setError(null);
  }, [defaultSport]);

  // Active filters count (don't count default sport as an active filter)
  const nonDefaultSportsCount = defaultSport 
    ? selectedSports.filter(sport => sport.value !== defaultSport).length
    : selectedSports.length;
  
  const activeFiltersCount = nonDefaultSportsCount + 
                           selectedDivisions.length + 
                           (selectedCountries.length > 1 ? selectedCountries.length : 0) + // Only count if more than United States
                           selectedStates.length +
                           (effectiveRole !== 'athlete' ? selectedPositions.length : 0) +
                           (effectiveRole !== 'athlete' ? selectedGraduatingClasses.length : 0) +
                           selectedConferences.length +
                           (effectiveRole !== 'athlete' && minHeight > 48 ? 1 : 0) +
                           (effectiveRole !== 'athlete' && minWeight > 50 ? 1 : 0) +
                           (verifiedFilter !== null ? 1 : 0);

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Filter values
    selectedSports,
    selectedDivisions,
    selectedCountries,
    selectedStates,
    selectedPositions,
    selectedGraduatingClasses,
    selectedConferences,
    minHeight,
    minWeight,
    verifiedFilter,

    // Filter setters
    setSelectedSports,
    setSelectedDivisions,
    setSelectedCountries,
    setSelectedStates,
    setSelectedPositions,
    setSelectedGraduatingClasses,
    setSelectedConferences,
    setMinHeight,
    setMinWeight,
    setVerifiedFilter,

    // Loading and data states
    loading,
    setLoading,
    initialLoading,
    setInitialLoading,
    hasMore,
    setHasMore,
    error,
    setError,
    page,
    setPage,
    allUsers,
    setAllUsers,

    // UI states
    showMobileFilters,
    setShowMobileFilters,
    hasSearched,
    setHasSearched,
    showDiscoverButton,
    setShowDiscoverButton,
    clearingFilters,
    setClearingFilters,

    // Refs
    observerRef,
    loadMoreRef,
    initialLoadTriggered,

    // Actions
    saveSearchState,
    loadSearchState,
    clearFilters,
    
    // Computed values
    activeFiltersCount
  };
};