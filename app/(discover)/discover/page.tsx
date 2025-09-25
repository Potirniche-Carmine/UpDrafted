"use client";

import React, { useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import { AuthWrapper } from '@/components/auth-wrapper';
import { useUser } from "@clerk/nextjs";
import { useProfileCompletenessSorting } from '../components/profile-completeness-sorter';
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

// API response types (now also defined in our hooks, but kept here for component use)


function SearchPageContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const effectiveRole = user?.publicMetadata?.role as string;
  
  // Get subscription features
  const features = useFeatureAccess();
  const hasAdvancedSearch = features.advancedSearch;

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

  // Initialize hooks
  const searchState = useSearchState({
    effectiveRole,
    initialTab: getValidTab(effectiveRole, searchParams?.get('tab'))
  });

  const filterOptions = useFilterOptions({
    selectedSports: searchState.selectedSports,
    selectedDivisions: searchState.selectedDivisions,
    selectedCountries: searchState.selectedCountries
  });

  const searchAPI = useSearchAPI({
    effectiveRole,
    selectedSports: searchState.selectedSports,
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

  // Get available tabs based on user role
  const availableTabs = useMemo(() =>
    getAvailableTabs(effectiveRole)
  , [effectiveRole]);

  // Auto-load results when the page first loads
  useEffect(() => {
    if (effectiveRole && !searchState.hasSearched && !searchState.initialLoading && !searchState.loading && !searchState.initialLoadTriggered.current) {
      searchState.initialLoadTriggered.current = true;

      // Try to load filters from cache first
      searchState.loadSearchState();

      // Always fetch fresh data (even if cache loaded, we only cached filters)
      searchAPI.loadUsers(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole]); // Only depend on effectiveRole to prevent multiple triggers

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

  // Filter displayed users based on active tab
  const filteredUsers = useMemo(() => {
    if (!searchState.hasSearched || searchState.allUsers.length === 0) return [];

    const tabRole = getTabRole(searchState.activeTab);
    if (!tabRole) {
      // 'all' tab logic depends on user role
      if (effectiveRole === 'athlete') {
        // Athletes see only coaches and recruiters in 'all' tab
        return searchState.allUsers.filter(user => user.role === 'coach' || user.role === 'recruiter');
      }
      // For other roles, show all users
      return searchState.allUsers;
    }

    return searchState.allUsers.filter(user => user.role === tabRole);
  }, [searchState.allUsers, searchState.activeTab, searchState.hasSearched, effectiveRole]);

  // Apply profile completeness sorting to filtered users
  const { sortedUsers: displayedUsers } = useProfileCompletenessSorting(filteredUsers);

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
    <div className="bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Search Filters Component */}
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
            sportsOptions={filterOptions.sportsOptions}
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
            clearFilters={searchState.clearFilters}
            handleUpgradeClick={profileNavigation.handleUpgradeClick}
            title={title}
            subtitle={subtitle}
          />

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