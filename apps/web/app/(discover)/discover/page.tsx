"use client";

import { useEffect, useMemo, Suspense, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthWrapper } from '@/components/auth-wrapper';
import { useUser } from "@/hooks/use-auth";
import { sortByCompletenessWithRandomization } from '../components/profile-completeness-sorter';
import { useFeatureAccess } from '@/components/providers/subscription-provider';

// Import our new components
import { SearchFilters } from '../components/search-filters';
import { SearchHeader } from '../components/search-header';
import { SearchTabs, getAvailableTabs, getTabRole, getValidTab } from '../components/search-tabs';

// Import our custom hooks
import { useFilterOptions } from '../hooks/use-filter-options';
import { useSearchState } from '../hooks/use-search-state';
import { useSearchAPI } from '../hooks/use-search-api';
import { useProfileNavigation } from '../hooks/use-profile-navigation';
import { useUserPrimarySport } from '@/hooks/use-user-primary-sport';


// API response types (now also defined in our hooks, but kept here for component use)


function SearchPageContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const effectiveRole = user?.role as string;
  
  // Get subscription features
  const features = useFeatureAccess();
  const hasAdvancedSearch = features.advancedSearch;

  // Get user's primary sport to use as default filter
  const { userSport, loading: userSportLoading } = useUserPrimarySport();

  // Track if filters are ready to be shown (to prevent flash)
  const [filtersReady, setFiltersReady] = useState(false);

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

  // Get user's default sports
  const getUserDefaultSports = useCallback(() => {
    // Use URL param as override
    const urlSport = searchParams?.get('defaultSport');
    if (urlSport) {
      return [{ value: urlSport, label: urlSport }];
    }

    if (!userSport?.primarySport) return [];

    const sportsToSet: { value: string; label: string }[] = [];
    
    // Add primary sport
    sportsToSet.push({ value: userSport.primarySport, label: userSport.primarySport });
    
    // For recruiters and athletes, add secondary sports too
    if ((userSport.role === 'recruiter' || userSport.role === 'athlete') && userSport.secondarySports?.length) {
      userSport.secondarySports.forEach(sport => {
        if (!sportsToSet.some(s => s.value === sport)) {
          sportsToSet.push({ value: sport, label: sport });
        }
      });
    }
    
    return sportsToSet;
  }, [userSport, searchParams]);

  // Initialize hooks without default sports (will be set via useEffect when user data loads)
  const searchState = useSearchState({
    effectiveRole,
    initialTab: getValidTab(effectiveRole, searchParams?.get('tab'))
  });

  // Destructure search state
  const { selectedSports } = searchState;

  const filterOptions = useFilterOptions({
    selectedSports: selectedSports,
    selectedDivisions: searchState.selectedDivisions,
    selectedCountries: searchState.selectedCountries
  });

  const searchAPI = useSearchAPI({
    effectiveRole,
    selectedSports: selectedSports,
    selectedDivisions: searchState.selectedDivisions,
    selectedCountries: searchState.selectedCountries,
    selectedStates: searchState.selectedStates,
    selectedPositions: searchState.selectedPositions,
    selectedGraduatingClasses: searchState.selectedGraduatingClasses,
    selectedConferences: searchState.selectedConferences,
    minHeight: searchState.minHeight,
    minWeight: searchState.minWeight,
    verifiedFilter: searchState.verifiedFilter,
    showStatesFilter: filterOptions.showStatesFilter,
    setAllUsers: searchState.setAllUsers,
    setHasSearched: searchState.setHasSearched,
    setPage: searchState.setPage,
    setHasMore: searchState.setHasMore,
    setLoading: searchState.setLoading,
    setInitialLoading: searchState.setInitialLoading,
    setError: searchState.setError
  });

  const profileNavigation = useProfileNavigation({
    allUsers: searchState.allUsers,
    saveSearchState: searchState.saveSearchState
  });

  // Custom clear filters that preserves user's default sports
  const clearFiltersWithDefaults = useCallback(() => {
    // Call the original clear filters first
    searchState.clearFilters();
    
    // Then set the user's default sports
    const defaultSports = getUserDefaultSports();
    if (defaultSports.length > 0) {
      searchState.setSelectedSports(defaultSports);
    }
  }, [searchState, getUserDefaultSports]);

  // Initialize filters and mark ready when user sport data is loaded
  useEffect(() => {
    if (!userSportLoading && userSport !== null && !searchState.initialLoadTriggered.current) {
      // Try to load filters from cache first
      const hasCache = searchState.loadSearchState();

      // If no cache, set default sports
      if (!hasCache) {
        const userDefaultSports = getUserDefaultSports();
        if (userDefaultSports.length > 0) {
          searchState.setSelectedSports(userDefaultSports);
        }
      }

      // Mark filters as ready
      setFiltersReady(true);
    }
  }, [userSportLoading, userSport, getUserDefaultSports, searchState]);

  // Get available tabs based on user role
  const availableTabs = useMemo(() =>
    getAvailableTabs(effectiveRole)
  , [effectiveRole]);

  // Auto-load results when filters are ready and page first loads
  useEffect(() => {
    if (effectiveRole && filtersReady && !searchState.hasSearched && !searchState.initialLoading && !searchState.loading && !searchState.initialLoadTriggered.current) {
      searchState.initialLoadTriggered.current = true;

      // Trigger search with cached or default filters
      searchAPI.loadUsers(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole, filtersReady]); // Trigger when filters are ready

  // Show discover button when filters change (only if filters are applied)
  useEffect(() => {
    if (effectiveRole) {
      const validTab = getValidTab(effectiveRole, searchState.activeTab);
      if (validTab !== searchState.activeTab) {
        searchState.setActiveTab(validTab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole]); // Only depend on effectiveRole and activeTab

  // Show discover button when filters change (always show after first search)
  useEffect(() => {
    // Always show the button if user has searched at least once, regardless of filters
    // This allows users to go back to default filters or reapply changes
    searchState.setShowDiscoverButton(searchState.hasSearched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchState.selectedSports, 
    searchState.selectedDivisions, 
    searchState.selectedCountries, 
    searchState.selectedStates, 
    searchState.selectedPositions, 
    searchState.selectedGraduatingClasses, 
    searchState.selectedConferences, 
    searchState.minHeight, 
    searchState.minWeight, 
    searchState.hasSearched, 
    searchState.verifiedFilter
  ]);

  // Save search state whenever important data changes
  useEffect(() => {
    if (searchState.hasSearched && searchState.allUsers.length > 0) {
      searchState.saveSearchState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchState.selectedSports, 
    searchState.selectedDivisions, 
    searchState.selectedStates, 
    searchState.selectedPositions, 
    searchState.selectedGraduatingClasses, 
    searchState.selectedConferences, 
    searchState.minHeight, 
    searchState.minWeight, 
    searchState.allUsers, 
    searchState.activeTab, 
    searchState.page, 
    searchState.hasSearched
  ]);

  // Handle clearing filters - reload when filters are cleared
  useEffect(() => {
    if (searchState.clearingFilters) {
      searchState.setClearingFilters(false);
      searchAPI.loadUsers(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchState.clearingFilters]);

  // Store the sorted users separately to prevent re-sorting on pagination
  const [sortedUsers, setSortedUsers] = useState<typeof searchState.allUsers>([]);
  const previousUserCountRef = useRef(0);

  // Filter and sort users - only sort new users when they're added
  useEffect(() => {
    if (!searchState.hasSearched || searchState.allUsers.length === 0) {
      setSortedUsers([]);
      previousUserCountRef.current = 0;
      return;
    }

    // When a new search starts (indicated by initialLoading), sort the new set of users.
    // Otherwise, for pagination, sort only the newly added users and append them.
    if (searchState.initialLoading) {
      // New search: sort all users
      const sorted = sortByCompletenessWithRandomization(searchState.allUsers);
      setSortedUsers(sorted);
    } else {
      // Pagination: only sort the NEW users and append them
      const newUsersCount = searchState.allUsers.length - previousUserCountRef.current;
      if (newUsersCount > 0) {
        const newUsers = searchState.allUsers.slice(-newUsersCount);
        const sortedNewUsers = sortByCompletenessWithRandomization(newUsers);
        setSortedUsers(prev => [...prev, ...sortedNewUsers]);
      }
    }

    previousUserCountRef.current = searchState.allUsers.length;
  }, [searchState.allUsers, searchState.hasSearched, searchState.initialLoading]);

  // Filter displayed users based on active tab from the sorted list
  const displayedUsers = useMemo(() => {
    if (!searchState.hasSearched || sortedUsers.length === 0) return [];

    const tabRole = getTabRole(searchState.activeTab);
    if (!tabRole) {
      // 'all' tab logic depends on user role
      if (effectiveRole === 'athlete') {
        // Athletes see only coaches and recruiters in 'all' tab
        return sortedUsers.filter(user => user.role === 'coach' || user.role === 'recruiter');
      }
      // For other roles, show all users
      return sortedUsers;
    }

    return sortedUsers.filter(user => user.role === tabRole);
  }, [sortedUsers, searchState.activeTab, searchState.hasSearched, effectiveRole]);

  // Discover/Search function
  const handleDiscover = () => {
    searchState.setShowMobileFilters(false);
    // Keep showDiscoverButton as true to always show the button
    searchAPI.loadUsers(1, true);
  };

  // Infinite scroll setup
  useEffect(() => {
    if (searchState.observerRef.current) {
      searchState.observerRef.current.disconnect();
    }

    searchState.observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && searchState.hasMore && !searchState.loading && !searchState.initialLoading && searchState.hasSearched) {
          // Use current page state for loading next page
          searchAPI.loadUsers(searchState.page, false);
        }
      },
      { threshold: 0.1 }
    );

    if (searchState.loadMoreRef.current) {
      searchState.observerRef.current.observe(searchState.loadMoreRef.current);
    }

    return () => {
      if (searchState.observerRef.current) {
        searchState.observerRef.current.disconnect();
      }
    };
  }, [searchState.hasMore, searchState.loading, searchState.initialLoading, searchState.page, searchAPI, searchState.hasSearched, searchState.observerRef, searchState.loadMoreRef]);

  const title = getTitle();
  const subtitle = getSubtitle();

  return (
    <div className="container mx-auto max-w-7xl px-0 md:px-2 space-y-6 md:space-y-8">
      <div className="flex flex-col xl:flex-row gap-6">
          {/* Search Filters Component - Only show when filters are ready to prevent flash */}
          {filtersReady ? (
            <SearchFilters
              effectiveRole={effectiveRole}
              showMobileFilters={searchState.showMobileFilters}
              setShowMobileFilters={searchState.setShowMobileFilters}
              activeFiltersCount={searchState.activeFiltersCount}
              showDiscoverButton={searchState.showDiscoverButton}
              selectedSports={searchState.selectedSports}
              selectedDivisions={searchState.selectedDivisions}
              selectedCountries={searchState.selectedCountries}
              selectedStates={searchState.selectedStates}
              selectedPositions={searchState.selectedPositions}
              selectedGraduatingClasses={searchState.selectedGraduatingClasses}
              selectedConferences={searchState.selectedConferences}
              minHeight={searchState.minHeight}
              minWeight={searchState.minWeight}
              verifiedFilter={searchState.verifiedFilter}
              showStatesFilter={filterOptions.showStatesFilter}
              divisionsOptions={filterOptions.divisionsOptions}
              countryOptions={filterOptions.countryOptions}
              statesOptions={filterOptions.statesOptions}
              graduatingClassOptions={filterOptions.graduatingClassOptions}
              positionsOptions={filterOptions.positionsOptions}
              conferencesOptions={filterOptions.conferencesOptions}
              setSelectedSports={searchState.setSelectedSports}
              setSelectedDivisions={searchState.setSelectedDivisions}
              setSelectedCountries={searchState.setSelectedCountries}
              setSelectedStates={searchState.setSelectedStates}
              setSelectedPositions={searchState.setSelectedPositions}
              setSelectedGraduatingClasses={searchState.setSelectedGraduatingClasses}
              setSelectedConferences={searchState.setSelectedConferences}
              setMinHeight={searchState.setMinHeight}
              setMinWeight={searchState.setMinWeight}
              setVerifiedFilter={searchState.setVerifiedFilter}
              hasAdvancedSearch={hasAdvancedSearch}
              handleDiscover={handleDiscover}
              clearFilters={clearFiltersWithDefaults}
              handleUpgradeClick={profileNavigation.handleUpgradeClick}
              title={title}
              subtitle={subtitle}
              // Default sport logic now handled internally in SearchFilters
            />
          ) : (
            <div className="w-full xl:w-96 shrink-0">
              {/* Loading placeholder for filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile/Tablet Header - Only visible when sidebar is hidden */}
          <SearchHeader
            title={title}
            subtitle={subtitle}
            showMobileFilters={searchState.showMobileFilters}
            setShowMobileFilters={searchState.setShowMobileFilters}
            activeFiltersCount={searchState.activeFiltersCount}
          />

          {/* Main Content */}
          <div className="flex-1">
            <SearchTabs
              activeTab={searchState.activeTab}
              setActiveTab={searchState.setActiveTab}
              availableTabs={availableTabs}
              getValidTab={getValidTab}
              effectiveRole={effectiveRole}
              initialLoading={searchState.initialLoading}
              loading={searchState.loading}
              error={searchState.error}
              hasSearched={searchState.hasSearched}
              hasMore={searchState.hasMore}
              displayedUsers={displayedUsers}
              allUsers={searchState.allUsers}
              activeFiltersCount={searchState.activeFiltersCount}
              clearFilters={searchState.clearFilters}
              loadUsers={searchAPI.loadUsers}
              handleViewProfile={profileNavigation.handleViewProfile}
              generateProfileUrl={profileNavigation.generateProfileUrl}
              loadMoreRef={searchState.loadMoreRef}
            />
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