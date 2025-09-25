"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Target, GraduationCap, Shield } from "lucide-react";
import { SearchResults } from './search-results';

// Types
type TabValue = 'all' | 'athletes' | 'coaches' | 'recruiters';

interface Tab {
  value: TabValue;
  label: string;
  icon: React.ReactNode;
}

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

interface SearchTabsProps {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  availableTabs: Tab[];
  getValidTab: (effectiveRole: string, tab: string) => TabValue;
  effectiveRole: string;
  
  // Props for SearchResults
  initialLoading: boolean;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  hasMore: boolean;
  displayedUsers: DiscoverUser[];
  allUsers: DiscoverUser[];
  activeFiltersCount: number;
  clearFilters: () => void;
  loadUsers: (page: number, isNewSearch: boolean) => void;
  handleViewProfile: (userId: string) => void;
  generateProfileUrl: (user: DiscoverUser) => string;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

// Get available tabs based on user role
export const getAvailableTabs = (userRole: string): Tab[] => {
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
export const getTabRole = (tab: TabValue): string | null => {
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

// Set default tab based on user role
export const getDefaultTab = (userRole: string): TabValue => {
  if (userRole === 'coach' || userRole === 'recruiter') {
    return 'athletes'; // Coaches and recruiters can only see athletes
  }
  return 'all'; // Athletes default to 'all'
};

// Helper function to get a valid tab with multiple fallbacks
export const getValidTab = (userRole: string, urlTab?: string | null): TabValue => {
  const availableTabs = getAvailableTabs(userRole);
  const availableTabValues = availableTabs.map(tab => tab.value);
  
  // Validate that we have available tabs
  if (!availableTabValues || availableTabValues.length === 0) {
    console.error(`No available tabs found for role "${userRole}". This should not happen.`);
    return 'all'; // Ultimate fallback
  }
  
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
  const fallbackTab = availableTabValues[0];
  
  // Additional safety check (should never be needed due to validation above)
  if (!fallbackTab) {
    console.error(`Failed to get fallback tab for role "${userRole}". Available tabs:`, availableTabValues);
    return 'all'; // Ultimate fallback
  }
  
  // Log warning if we had to use fallback (for debugging)
  if (urlTab && !availableTabValues.includes(urlTab as TabValue)) {
    console.warn(`Invalid tab "${urlTab}" for role "${userRole}". Using fallback: "${fallbackTab}"`);
  }
  
  return fallbackTab;
};

export const SearchTabs: React.FC<SearchTabsProps> = ({
  activeTab,
  setActiveTab,
  availableTabs,
  getValidTab,
  effectiveRole,
  initialLoading,
  loading,
  error,
  hasSearched,
  hasMore,
  displayedUsers,
  allUsers,
  activeFiltersCount,
  clearFilters,
  loadUsers,
  handleViewProfile,
  generateProfileUrl,
  loadMoreRef
}) => {
  return (
    <>
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
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-[#01ae79] data-[state=active]:text-white text-xs sm:text-sm px-1 sm:px-4 min-w-0"
            >
              {tab.icon}
              <span className="text-xs sm:text-sm truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Badge Disclaimer */}
        <div className="mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground" role="list">
            <div className="flex items-center gap-1.5" role="listitem">
              <div className="w-4 h-4 bg-[#01ae79] rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1.5" role="listitem">
              <div className="w-4 h-4 bg-orange-500 rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white opacity-95" />
              </div>
              <span>Unverified</span>
            </div>
          </div>
        </div>

        {availableTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <SearchResults
              initialLoading={initialLoading}
              loading={loading}
              error={error}
              hasSearched={hasSearched}
              hasMore={hasMore}
              displayedUsers={displayedUsers}
              allUsers={allUsers}
              activeFiltersCount={activeFiltersCount}
              clearFilters={clearFilters}
              loadUsers={loadUsers}
              handleViewProfile={handleViewProfile}
              generateProfileUrl={generateProfileUrl}
              loadMoreRef={loadMoreRef}
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};