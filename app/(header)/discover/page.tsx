"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Target, MapPin, Shield, GraduationCap, Send, UserCheck, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { getSportsList, US_STATES, GRADUATION_YEARS, DIVISIONS } from "@/lib/sports-data";
import { useRoleView } from "@/hooks/use-role-view";

import { AuthWrapper } from '../../../components/auth-wrapper';
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// Fallback data in case imports fail
const FALLBACK_SPORTS = ['Basketball', 'Football', 'Baseball', 'Soccer', 'Tennis', 'Golf', 'Swimming', 'Track & Field'];
const FALLBACK_STATES = ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania'];
const FALLBACK_GRADUATION_YEARS = [2024, 2025, 2026, 2027, 2028];
const FALLBACK_DIVISIONS = ['NCAA Division I', 'NCAA Division II', 'NCAA Division III', 'NAIA', 'NJCAA'];

// Safe getters with fallbacks
const getSafeSpotsList = () => {
  try {
    return getSportsList() || FALLBACK_SPORTS;
  } catch {
    return FALLBACK_SPORTS;
  }
};

const getSafeStates = () => {
  try {
    return US_STATES || FALLBACK_STATES;
  } catch {
    return FALLBACK_STATES;
  }
};

const getSafeGraduationYears = () => {
  try {
    return GRADUATION_YEARS || FALLBACK_GRADUATION_YEARS;
  } catch {
    return FALLBACK_GRADUATION_YEARS;
  }
};

const getSafeDivisions = () => {
  try {
    return DIVISIONS || FALLBACK_DIVISIONS;
  } catch {
    return FALLBACK_DIVISIONS;
  }
};

// User types
interface BaseUser {
  id: string;
  name: string;
  sport: string;
  profilePicture: string;
  location: string;
  verified?: boolean;
  bio?: string;
  isConnected?: boolean;
}

interface Athlete extends BaseUser {
  role: 'athlete';
  position: string;
  graduationYear: number;
  gpa: number;
  height: string;
  weight: string;
  stats?: Record<string, string | number>;
}

interface Coach extends BaseUser {
  role: 'coach';
  school: string;
  division: string;
  achievements?: string[];
}

interface Recruiter extends BaseUser {
  role: 'recruiter';
  school: string;
  division: string;
  department: string;
  activelyRecruiting: boolean;
}

type UserProfile = Athlete | Coach | Recruiter;

// Mock data with proper typing
const mockUsers: UserProfile[] = [
  // Athletes
  {
    id: "1",
    name: "Marcus Johnson",
    role: "athlete",
    sport: "Basketball",
    position: "Point Guard",
    graduationYear: 2025,
    location: "Chicago, IL",
    gpa: 3.8,
    height: "6'2\"",
    weight: "185 lbs",
    profilePicture: "https://placehold.co/100x100/E0E0E0/B0B0B0?text=MJ",
    verified: true,
    bio: "Passionate point guard with strong leadership skills",
    stats: { ppg: 18.5, apg: 7.2, rpg: 4.8 },
    isConnected: false
  },
  {
    id: "2",
    name: "Sarah Williams",
    role: "athlete", 
    sport: "Golf",
    position: "Individual",
    graduationYear: 2024,
    location: "Austin, TX",
    gpa: 3.9,
    height: "5'7\"",
    weight: "140 lbs",
    profilePicture: "https://placehold.co/100x100/D1C4E9/7E57C2?text=SW",
    verified: true,
    stats: { "Average Score": 72, "Best Round": 68, "Tournaments": 15 },
    isConnected: true
  },
  {
    id: "3",
    name: "David Chen",
    role: "athlete",
    sport: "Swimming",
    position: "Freestyle",
    graduationYear: 2025,
    location: "San Diego, CA",
    gpa: 4.0,
    height: "6'0\"",
    weight: "170 lbs",
    profilePicture: "https://placehold.co/100x100/C8E6C9/66BB6A?text=DC",
    verified: false,
    stats: { "50m Free": "21.45s", "100m Free": "47.23s", "200m Free": "1:42.15" },
    isConnected: false
  },
  {
    id: "4", 
    name: "Jordan Parker",
    role: "athlete",
    sport: "Golf",
    position: "Individual",
    graduationYear: 2026,
    location: "Seattle, WA",
    gpa: 3.7,
    height: "6'1\"", 
    weight: "175 lbs",
    profilePicture: "https://placehold.co/100x100/81C784/4CAF50?text=JP",
    bio: "Dedicated golfer with state championship experience",
    isConnected: false
  },
  {
    id: "10", 
    name: "Emma Davis",
    role: "athlete",
    sport: "Golf",
    position: "Individual",
    graduationYear: 2025,
    location: "Phoenix, AZ",
    gpa: 3.8,
    height: "5'6\"", 
    weight: "130 lbs",
    profilePicture: "https://placehold.co/100x100/FFAB91/FF5722?text=ED",
    bio: "Rising golf talent with multiple tournament wins",
    isConnected: true
  },
  // Coaches
  {
    id: "5",
    name: "Coach Emily Rodriguez",
    role: "coach",
    sport: "Track & Field",
    school: "Duke University",
    division: "NCAA Division I",
    location: "Durham, NC",
    profilePicture: "https://placehold.co/100x100/FFCDD2/E57373?text=ER",
    verified: true,
    bio: "Head coach with multiple conference championships",
    achievements: ["3x Conference Coach of the Year", "Olympic Team Assistant Coach"],
    isConnected: false
  },
  {
    id: "6",
    name: "Coach Lisa Brown",
    role: "coach",
    sport: "Golf",
    school: "Stanford University", 
    division: "NCAA Division I",
    location: "Stanford, CA",
    profilePicture: "https://placehold.co/100x100/B39DDB/673AB7?text=LB",
    verified: true,
    achievements: ["NCAA Championship 2019", "5x Pac-12 Coach of the Year"],
    isConnected: true
  },
  {
    id: "7",
    name: "Coach Mike Thompson",
    role: "coach",
    sport: "Football",
    school: "University of Alabama",
    division: "NCAA Division I", 
    location: "Tuscaloosa, AL",
    profilePicture: "https://placehold.co/100x100/F8BBD9/E91E63?text=MT",
    verified: true,
    bio: "Defensive coordinator with championship pedigree",
    isConnected: false
  },
  // Recruiters
  {
    id: "8",
    name: "Alex Martinez",
    role: "recruiter",
    sport: "Baseball",
    school: "UCLA",
    division: "NCAA Division I",
    department: "Athletic Recruiting",
    activelyRecruiting: true,
    location: "Los Angeles, CA",
    profilePicture: "https://placehold.co/100x100/FFB74D/FF9800?text=AM",
    verified: true,
    bio: "Lead recruiter specializing in West Coast talent",
    isConnected: false
  },
  {
    id: "9",
    name: "Jamie Wilson",
    role: "recruiter", 
    sport: "Basketball",
    school: "University of North Carolina",
    division: "NCAA Division I",
    department: "Basketball Operations",
    activelyRecruiting: true,
    location: "Chapel Hill, NC",
    profilePicture: "https://placehold.co/100x100/90CAF9/42A5F5?text=JW",
    verified: true,
    isConnected: true
  }
];





// Add new filter interfaces
interface FilterOption extends Option {
  value: string;
  label: string;
}

// Convert arrays to filter options
const sportsOptions = getSafeSpotsList().map(sport => ({ value: sport, label: sport }));
const statesOptions = getSafeStates().map(state => ({ value: state, label: state }));
const divisionsOptions = getSafeDivisions().map(division => ({ value: division, label: division }));
const graduationYearsOptions = getSafeGraduationYears().map(year => ({ value: year.toString(), label: year.toString() }));

// Add type for tab values
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
  const [appliedFilters, setAppliedFilters] = useState({
    tab: 'athletes' as TabValue,
    sports: [] as FilterOption[],
    divisions: [] as FilterOption[],
    states: [] as FilterOption[],
    years: [] as FilterOption[]
  });
  const itemsPerPage = 20;

  const availableTabs = getAvailableTabs(effectiveRole);

  // Reset page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const filteredUsers = useMemo(() => {
    let filtered = mockUsers;

    // Filter by role
    if (appliedFilters.tab !== 'all') {
      const roleMap: Record<TabValue, string> = {
        'athletes': 'athlete',
        'coaches': 'coach',
        'recruiters': 'recruiter',
        'all': 'all'
      };
      filtered = filtered.filter(user => user.role === roleMap[appliedFilters.tab]);
    }

    // Filter by sports
    if (appliedFilters.sports.length > 0) {
      filtered = filtered.filter(user => 
        appliedFilters.sports.some(sport => sport.value === user.sport)
      );
    }

    // Filter by divisions (for coaches and recruiters)
    if (appliedFilters.divisions.length > 0 && (appliedFilters.tab === 'coaches' || appliedFilters.tab === 'recruiters')) {
      filtered = filtered.filter(user => 
        user.role !== 'athlete' && appliedFilters.divisions.some(div => div.value === user.division)
      );
    }

    // Filter by states
    if (appliedFilters.states.length > 0) {
      filtered = filtered.filter(user => {
        const userState = user.location.split(', ')[1];
        return appliedFilters.states.some(state => state.value === userState);
      });
    }

    // Filter by graduation years (for athletes)
    if (appliedFilters.years.length > 0 && appliedFilters.tab === 'athletes') {
      filtered = filtered.filter(user => 
        user.role === 'athlete' && appliedFilters.years.some(year => parseInt(year.value) === user.graduationYear)
      );
    }

    return filtered;
  }, [appliedFilters]);

  const clearFilters = () => {
    setSelectedSports([]);
    setSelectedDivisions([]);
    setSelectedStates([]);
    setSelectedYears([]);
    setCurrentPage(1);
  };

  const handleDiscover = () => {
    setAppliedFilters({
      tab: activeTab,
      sports: selectedSports,
      divisions: selectedDivisions,
      states: selectedStates,
      years: selectedYears
    });
  };

  // Process profile image URL to ensure it works with R2/CloudFlare
  const getProfileImageUrl = (profileImage: string) => {
    if (!profileImage || typeof profileImage !== 'string') {
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
  const getRoleBadge = (user: UserProfile) => {
    let roleText = '';
    let roleColor = '';

    if (user.role === 'athlete') {
      roleText = `${user.sport} Athlete`;
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
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
              <div className="flex flex-col md:flex-row gap-4">
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

                {activeTab !== 'athletes' && (
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
                )}

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

                {activeTab === 'athletes' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">Graduation</label>
                    <MultipleSelector
                      value={selectedYears}
                      onChange={setSelectedYears}
                      defaultOptions={graduationYearsOptions}
                      placeholder="Select years..."
                      className="w-full"
                    />
                  </div>
                )}
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
              {filteredUsers.length === 0 ? (
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
                    {filteredUsers
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((user) => (
                      <Link href={`/profile/${user.id}`} key={user.id}>
                        <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-[#01ae79]/15 border border-border hover:border-[#01ae79]/40 dark:hover:border-[#01ae79]/50 overflow-hidden">
                          <CardContent className="p-3 sm:p-4 md:p-5">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                              <div className="flex items-start gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                  <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-[#01ae79]/20 group-hover:ring-[#01ae79]/50 transition-all duration-200">
                                    <AvatarImage 
                                      src={getProfileImageUrl(user.profilePicture)} 
                                      alt={user.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="text-xs sm:text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.verified && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                      <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                  <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight truncate">
                                    {user.name}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-wrap pt-1.5">
                                    {getRoleBadge(user)}
                                  </div>
                                  <p className="text-xs md:text-sm font-medium text-[#01ae79] truncate">
                                    {user.role === 'athlete' ? user.position : user.school}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Info Section */}
                            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">{user.location}</span>
                              </div>
                              {user.role === 'athlete' ? (
                                <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">
                                  Class of {user.graduationYear}
                                </p>
                              ) : (
                                <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">
                                  {user.division}
                                </p>
                              )}
                            </div>

                            {/* Connect Button */}
                            <div className="pt-3 md:pt-4 border-t border-border/50">
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Handle connect action
                                }}
                                disabled={user.isConnected}
                                className={cn(
                                  "w-full h-8 sm:h-8 md:h-9 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                                  user.isConnected
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : "bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                                )}
                              >
                                {user.isConnected ? (
                                  <>
                                    <UserCheck size={14} className="mr-1.5 sm:mr-2" />
                                    Connected
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
                  {filteredUsers.length > itemsPerPage && (
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
                        <span className="font-medium">{Math.ceil(filteredUsers.length / itemsPerPage)}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
                        disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
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