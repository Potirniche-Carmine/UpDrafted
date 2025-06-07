"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Target, MapPin, Shield, GraduationCap, Send, ChevronLeft, ChevronRight, Search, X, Clock, Building2} from "lucide-react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { AuthWrapper } from '@/components/auth-wrapper';
import { useRoleView } from '@/hooks/use-role-view';
import MultipleSelector from '@/components/ui/multi-select';
import type { Option as FilterOption } from '@/components/ui/multi-select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Safe getters with fallbacks
const getSafeSpotsList = () => {
  return [
    'Football', 'Basketball (M)', 'Basketball (W)', 'Baseball', 'Softball',
    'Soccer (M)', 'Soccer (W)', 'Volleyball (M)', 'Volleyball (W)', 'Track & Field',
    'Cross Country', 'Swimming', 'Tennis (M)', 'Tennis (W)', 'Golf (M)', 'Golf (W)',
    'Wrestling', 'Hockey', 'Lacrosse (M)', 'Lacrosse (W)', 'Field Hockey'
  ];
};

const getSafeStates = () => {
  return [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];
};

const getSafeDivisions = () => {
  return [
    'NCAA Division I', 'NCAA Division II', 'NCAA Division III',
    'NAIA', 'NJCAA Division I', 'NJCAA Division II', 'NJCAA Division III',
    'High School', 'Club Sports', 'Community College', 'Junior College'
  ];
};

// API response types
interface DiscoverUser {
  id: string;
  fullName: string;
  organizationName: string;
  profileImage: string | null;
  city: string;
  state: string;
  isVerified: boolean;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  title?: string;
  division?: string;
  educationLevel?: string;
  hasPendingRequest: boolean;
  graduationYear?: number;
}

interface DiscoverResponse {
  results: DiscoverUser[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

type TabValue = 'all' | 'athletes' | 'coaches' | 'recruiters';

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
        { value: 'all' as TabValue, label: 'All', icon: <Users className="h-4 w-4" /> },
        { value: 'athletes' as TabValue, label: 'Athletes', icon: <User className="h-4 w-4" /> },
        { value: 'coaches' as TabValue, label: 'Coaches', icon: <GraduationCap className="h-4 w-4" /> },
        { value: 'recruiters' as TabValue, label: 'Recruiters', icon: <Target className="h-4 w-4" /> }
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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { effectiveRole } = useRoleView();
  const [activeTab, setActiveTab] = useState<TabValue>(searchParams?.get('tab') as TabValue || 'athletes');
  const [selectedSports, setSelectedSports] = useState<FilterOption[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<FilterOption[]>([]);
  const [selectedStates, setSelectedStates] = useState<FilterOption[]>([]);
  const [selectedYears, setSelectedYears] = useState<FilterOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DiscoverResponse | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    tab: 'athletes' as TabValue,
    sports: [] as FilterOption[],
    divisions: [] as FilterOption[],
    states: [] as FilterOption[],
    years: [] as FilterOption[]
  });
  const [hasSearched, setHasSearched] = useState(false);
  const itemsPerPage = 20;
  const resultsPerQuery = 40;

  const availableTabs = useMemo(() => 
    getAvailableTabs(effectiveRole)
  , [effectiveRole]);

  const sportsOptions = useMemo(() => 
    getSafeSpotsList().map(sport => ({
      value: sport,
      label: sport
    }))
  , []);

  const divisionsOptions = useMemo(() => 
    getSafeDivisions().map(division => ({
      value: division,
      label: division
    }))
  , []);

  const statesOptions = useMemo(() => 
    getSafeStates().map(state => ({
      value: state,
      label: state
    }))
  , []);

  // Load discover results
  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      // Calculate the page number for the API call (2 pages at a time)
      const apiPage = Math.ceil(currentPage / 2);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: apiPage.toString(),
        pageSize: resultsPerQuery.toString()
      });

      // Add filters
      if (appliedFilters.tab !== 'all') {
        params.append('role', appliedFilters.tab === 'athletes' ? 'athlete' : 
                            appliedFilters.tab === 'coaches' ? 'coach' : 'recruiter');
      }

      if (appliedFilters.sports.length > 0) {
        appliedFilters.sports.forEach(sport => params.append('sports', sport.value));
      }

      if (appliedFilters.divisions.length > 0) {
        appliedFilters.divisions.forEach(div => params.append('divisions', div.value));
      }

      if (appliedFilters.states.length > 0) {
        appliedFilters.states.forEach(state => params.append('states', state.value));
      }

      if (appliedFilters.years.length > 0) {
        appliedFilters.years.forEach(year => params.append('graduationYears', year.value));
      }

      const response = await fetch(`/api/discover?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load discover results');
      }

      const data = await response.json();
      
      // Calculate the actual results for the current page
      const startIdx = (currentPage % 2 === 0 ? itemsPerPage : 0);
      const pageResults = {
        ...data,
        results: data.results.slice(startIdx, startIdx + itemsPerPage)
      };
      
      setResults(pageResults);
    } catch (error) {
      console.error('Error loading discover results:', error);
      setError(error instanceof Error ? error.message : 'Failed to load discover results');
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedFilters, itemsPerPage]);

  // Load results only when page changes after initial search
  useEffect(() => {
    if (hasSearched) {
      loadResults();
    }
  }, [currentPage, appliedFilters, loadResults, hasSearched]);

  const clearFilters = () => {
    setSelectedSports([]);
    setSelectedDivisions([]);
    setSelectedStates([]);
    setSelectedYears([]);
    setCurrentPage(1);
    setHasSearched(false);
    setResults(null);
  };

  const handleDiscover = () => {
    setCurrentPage(1); // Reset to first page
    setHasSearched(true); // Mark that we've performed a search
    setAppliedFilters({
      tab: activeTab,
      sports: selectedSports,
      divisions: selectedDivisions,
      states: selectedStates,
      years: selectedYears
    });
  };

  // Process profile image URL to ensure it works with R2/CloudFlare
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) {
      return undefined;
    }
    
    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // Construct the full R2 URL using environment variable or fallback to known R2 domain
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
    return `${baseUrl}/${profileImage}`;
  };

  // Get role badge with descriptive text and improved styling
  const getRoleBadge = (user: DiscoverUser) => {
    let roleText = '';
    let roleColor = '';

    if (user.role === 'athlete') {
      if (user.educationLevel === 'high_school') {
        roleText = 'HS Athlete';
        roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
      } else if (user.educationLevel === 'undergraduate') {
        roleText = 'College Athlete';
        roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
      } else if (user.educationLevel === 'associate') {
        roleText = 'JC Athlete';
        roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
      } else if (user.educationLevel === 'graduate') {
        roleText = 'Grad Athlete';
        roleColor = 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-700';
      } else {
        roleText = 'Athlete';
        roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
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

    return <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 border ${roleColor} whitespace-nowrap`}>{roleText}</Badge>;
  };

  // Handle connect button click
  const handleConnect = async (userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request sent successfully!';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);

        // Refresh results to update UI
        loadResults();
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send connection request';
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = errorMessage;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover</h1>
          <p className="text-muted-foreground">Find and connect with athletes, coaches, and recruiters</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as TabValue)} className="space-y-6">
          <div className="relative">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/30 p-1 text-muted-foreground w-full max-w-2xl mx-auto backdrop-blur-sm border border-border/50">
              {availableTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="group relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-[10px] md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/50 data-[state=active]:hover:bg-background min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {tab.icon}
                    </div>
                    <span className="transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold">
                      {tab.label}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[#01ae79] transition-all duration-300 group-data-[state=active]:w-8 group-data-[state=active]:-translate-x-1/2 rounded-full"></div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          <TabsContent value={activeTab} className="mt-6 min-h-[400px]">
            {/* Filters */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Sports</label>
                  <MultipleSelector
                    value={selectedSports}
                    onChange={setSelectedSports}
                    defaultOptions={sportsOptions}
                    placeholder="Select sports..."
                    className="w-full"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Divisions</label>
                  <MultipleSelector
                    value={selectedDivisions}
                    onChange={setSelectedDivisions}
                    defaultOptions={divisionsOptions}
                    placeholder="Select divisions..."
                    className="w-full"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">States</label>
                  <MultipleSelector
                    value={selectedStates}
                    onChange={setSelectedStates}
                    defaultOptions={statesOptions}
                    placeholder="Select states..."
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={handleDiscover}
                  className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white text-sm min-w-[120px]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Discover
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="mt-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01ae79] mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading results...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Results</h3>
                  <p className="text-muted-foreground">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      loadResults();
                    }}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#01ae79] hover:bg-[#01ae79]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01ae79]"
                  >
                    Try Again
                  </button>
                </div>
              ) : !results || results.results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Users className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {appliedFilters.sports.length > 0 || appliedFilters.divisions.length > 0 || appliedFilters.states.length > 0 || appliedFilters.years.length > 0
                      ? 'No results found'
                      : 'No users found'}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {appliedFilters.sports.length > 0 || appliedFilters.divisions.length > 0 || appliedFilters.states.length > 0 || appliedFilters.years.length > 0
                      ? 'Try adjusting your filters'
                      : 'Try changing your search criteria'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.results.map((user) => (
                      <Link href={`/profile/${user.id}`} key={user.id}>
                        <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-[#01ae79]/15 border border-border hover:border-[#01ae79]/40 dark:hover:border-[#01ae79]/50 overflow-hidden">
                          <CardContent className="p-3 sm:p-4 md:p-5">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                              <div className="flex items-start gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                  <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-[#01ae79]/20 group-hover:ring-[#01ae79]/50 transition-all duration-200">
                                    <AvatarImage 
                                      src={getProfileImageUrl(user.profileImage)} 
                                      alt={user.fullName || 'User'}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="text-xs sm:text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                                      {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.isVerified && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                      <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                  <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight truncate">
                                    {user.fullName}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-wrap pt-1.5">
                                    {getRoleBadge(user)}
                                  </div>
                                  <p className="text-xs md:text-sm font-medium text-[#01ae79] truncate">
                                    {user.role === 'athlete' ? user.sport : user.title}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Info Section */}
                            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">{user.city}, {user.state}</span>
                              </div>
                              {user.role === 'athlete' ? (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
                                  <GraduationCap className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  <span className="truncate">Class of {user.graduationYear}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
                                  <Building2 className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  <span className="truncate">{user.division || 'No Division'}</span>
                                </div>
                              )}
                              <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">
                                {user.organizationName}
                              </p>
                            </div>

                            {/* Connect Button */}
                            <div className="pt-3 md:pt-4 border-t border-border/50">
                              <Button
                                onClick={(e) => handleConnect(user.id, e)}
                                disabled={user.hasPendingRequest}
                                className={cn(
                                  "w-full h-8 sm:h-8 md:h-9 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                                  user.hasPendingRequest
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : "bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                                )}
                              >
                                {user.hasPendingRequest ? (
                                  <>
                                    <Clock size={14} className="mr-1.5 sm:mr-2" />
                                    Request Pending
                                  </>
                                ) : (
                                  <>
                                    <Send size={14} className="mr-1.5 sm:mr-2" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {results.totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Page</span>
                        <span className="font-medium">{currentPage}</span>
                        <span className="text-muted-foreground">of</span>
                        <span className="font-medium">{results.totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(results.totalPages, prev + 1))}
                        disabled={currentPage === results.totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
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