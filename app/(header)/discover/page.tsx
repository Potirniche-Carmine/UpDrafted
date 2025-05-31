"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Users, Target, MapPin, MessageCircle, Heart, Award, GraduationCap, Filter } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { getSportsList, US_STATES, GRADUATION_YEARS, DIVISIONS } from "@/lib/sports-data";
import { useRoleView } from "@/hooks/use-role-view";

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

const getRoleIcon = (role: UserProfile['role']) => {
  switch (role) {
    case 'athlete': return <User className="h-4 w-4" />;
    case 'coach': return <Users className="h-4 w-4" />;
    case 'recruiter': return <Target className="h-4 w-4" />;
  }
};

const getRoleBadgeColor = (role: UserProfile['role']) => {
  switch (role) {
    case 'athlete': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'coach': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'recruiter': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }
};

// Capitalize role for display
const formatRole = (role: UserProfile['role']) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Get available tabs based on user role
const getAvailableTabs = (userRole: string) => {
  switch (userRole) {
    case 'athlete':
      return [
        { value: 'all', label: 'All', icon: <Users className="h-4 w-4" /> },
        { value: 'coaches', label: 'Coaches', icon: <Users className="h-4 w-4" /> },
        { value: 'recruiters', label: 'Recruiters', icon: <Target className="h-4 w-4" /> }
      ];
    case 'coach':
    case 'recruiter':
      return [
        { value: 'athletes', label: 'Athletes', icon: <User className="h-4 w-4" /> },
        { value: 'coaches', label: 'Coaches', icon: <Users className="h-4 w-4" /> },
        { value: 'recruiters', label: 'Recruiters', icon: <Target className="h-4 w-4" /> }
      ];
    default:
      return [];
  }
};

// Get description based on user role
const getDescription = (userRole: string) => {
  switch (userRole) {
    case 'athlete':
      return "Connect with coaches and recruiters who can help advance your athletic career";
    case 'coach':
      return "Discover talented athletes and connect with fellow coaches and recruiters in your network";
    case 'recruiter':
      return "Find promising athletes and build relationships with coaches and other recruiters";
    default:
      return "Discover and connect with athletes, coaches, and recruiters in your sports community";
  }
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const { effectiveRole } = useRoleView();
  
  const availableTabs = getAvailableTabs(effectiveRole);
  
  const [activeTab, setActiveTab] = useState<'athletes' | 'coaches' | 'recruiters' | 'all'>(
    availableTabs.length > 0 ? availableTabs[0].value as 'athletes'| 'coaches' | 'recruiters' | 'all' : 'athletes'
  );
  const [nameFilter, setNameFilter] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    sport: "all",
    graduationYear: "all", // For athletes
    division: "all", // For coaches/recruiters
    state: "all"
  });

  useEffect(() => {
    if (initialQuery) {
      setNameFilter(initialQuery);
      setHasSearched(true);
    }
  }, [initialQuery]);

  // Update activeTab when effectiveRole changes
  useEffect(() => {
    const newAvailableTabs = getAvailableTabs(effectiveRole);
    if (newAvailableTabs.length > 0) {
      setActiveTab(newAvailableTabs[0].value as 'athletes' | 'coaches' | 'recruiters' | 'all');
    }
  }, [effectiveRole]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'athletes' | 'coaches' | 'recruiters' | 'all');
  };

  const filteredUsers = useMemo(() => {
    // Don't show any results if haven't searched yet
    if (!hasSearched) {
      return [];
    }

    let filtered = mockUsers;

    // Apply role-based filtering based on current user role and active tab
    if (effectiveRole === 'athlete') {
      if (activeTab === 'coaches') {
        // Athletes searching coaches see only coaches
        filtered = filtered.filter(user => user.role === 'coach');
      } else if (activeTab === 'recruiters') {
        // Athletes searching recruiters see only recruiters
        filtered = filtered.filter(user => user.role === 'recruiter');
      } else if (activeTab === 'all') {
        // Athletes searching all see both coaches and recruiters
        filtered = filtered.filter(user => user.role === 'coach' || user.role === 'recruiter');
      }
    } else {
      // Coaches and recruiters can see all roles based on tab
      if (activeTab === 'athletes') {
        filtered = filtered.filter(user => user.role === 'athlete');
      } else if (activeTab === 'coaches') {
        filtered = filtered.filter(user => user.role === 'coach');
      } else if (activeTab === 'recruiters') {
        filtered = filtered.filter(user => user.role === 'recruiter');
      }
      // No 'all' tab for coaches/recruiters in this implementation
    }

    // Apply sport filter
    if (filters.sport !== "all") {
      filtered = filtered.filter(user => user.sport === filters.sport);
    }

    // Apply graduation year filter (athletes only)
    if (filters.graduationYear !== "all" && activeTab === 'athletes') {
      filtered = filtered.filter(user => 
        user.role === 'athlete' && user.graduationYear.toString() === filters.graduationYear
      );
    }

    // Apply division filter (coaches/recruiters only)
    if (filters.division !== "all" && (activeTab === 'coaches' || activeTab === 'recruiters' || activeTab === 'all')) {
      filtered = filtered.filter(user => 
        (user.role === 'coach' || user.role === 'recruiter') && user.division === filters.division
      );
    }

    // Apply state filter
    if (filters.state !== "all") {
      filtered = filtered.filter(user => user.location.includes(filters.state));
    }

    // Apply name filter if provided
    if (nameFilter.trim()) {
      const term = nameFilter.toLowerCase();
      filtered = filtered.filter(user => {
        const matchesName = user.name.toLowerCase().includes(term);
        const matchesBio = user.bio?.toLowerCase().includes(term);
        const matchesSchool = (user.role === 'coach' || user.role === 'recruiter') && 
                             user.school.toLowerCase().includes(term);
        const matchesPosition = user.role === 'athlete' && 
                               user.position.toLowerCase().includes(term);
        
        return matchesName || matchesBio || matchesSchool || matchesPosition;
      });
    }

    return filtered;
  }, [hasSearched, activeTab, filters, nameFilter, effectiveRole]);

  const clearFilters = () => {
    setFilters({
      sport: "all",
      graduationYear: "all",
      division: "all", 
      state: "all"
    });
    setNameFilter("");
    setHasSearched(false);
  };

  const handleSearch = () => {
    setHasSearched(true);
  };

  const getTabCounts = () => {
    // Don't calculate counts until user has actually searched
    if (!hasSearched) {
      return { athletes: 0, coaches: 0, recruiters: 0, all: 0 };
    }

    // Calculate total counts for each role type regardless of active tab
    // Apply base role filtering first based on current user role
    let baseFiltered = mockUsers;
    
    if (effectiveRole === 'athlete') {
      // Athletes can only see coaches and recruiters
      baseFiltered = baseFiltered.filter(user => user.role === 'coach' || user.role === 'recruiter');
    }
    // For coaches/recruiters, they can see all roles, so no base filtering needed

    // Apply other filters (excluding role-based tab filtering)
    if (filters.sport !== "all") {
      baseFiltered = baseFiltered.filter(user => user.sport === filters.sport);
    }

    if (filters.state !== "all") {
      baseFiltered = baseFiltered.filter(user => user.location.includes(filters.state));
    }

    // Apply graduation year filter for athletes
    if (filters.graduationYear !== "all") {
      baseFiltered = baseFiltered.filter(user => 
        user.role !== 'athlete' || user.graduationYear.toString() === filters.graduationYear
      );
    }

    // Apply division filter for coaches/recruiters
    if (filters.division !== "all") {
      baseFiltered = baseFiltered.filter(user => 
        (user.role !== 'coach' && user.role !== 'recruiter') || user.division === filters.division
      );
    }

    // Apply name filter if provided
    if (nameFilter.trim()) {
      const term = nameFilter.toLowerCase();
      baseFiltered = baseFiltered.filter(user => {
        const matchesName = user.name.toLowerCase().includes(term);
        const matchesBio = user.bio?.toLowerCase().includes(term);
        const matchesSchool = (user.role === 'coach' || user.role === 'recruiter') && 
                             user.school.toLowerCase().includes(term);
        const matchesPosition = user.role === 'athlete' && 
                               user.position.toLowerCase().includes(term);
        
        return matchesName || matchesBio || matchesSchool || matchesPosition;
      });
    }

    // Calculate counts for each tab based on user role
    const athletes = baseFiltered.filter(u => u.role === 'athlete').length;
    const coaches = baseFiltered.filter(u => u.role === 'coach').length;
    const recruiters = baseFiltered.filter(u => u.role === 'recruiter').length;
    
    // For athletes: 'all' means coaches + recruiters
    // For coaches/recruiters: no 'all' tab
    const all = effectiveRole === 'athlete' ? coaches + recruiters : 0;
    
    return { athletes, coaches, recruiters, all };
  };

  const counts = getTabCounts();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#01ae79] via-[#01ae79] to-[#01ae79] bg-clip-text text-transparent mb-2">
            Discovery
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg">
            {getDescription(effectiveRole)}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, school, or position..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-3 text-sm border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] transition-all"
            />
          </div>
        </div>

        {/* Tabs - Restored shadcn implementation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className={`grid w-full max-w-lg bg-[#01ae79]/5 dark:bg-[#01ae79]/10 p-1 rounded-xl`} style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
            {availableTabs.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-[#01ae79] data-[state=active]:text-white cursor-pointer hover:bg-[#01ae79]/10 dark:hover:bg-[#01ae79]/20 transition-colors"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
                ({counts[tab.value as keyof typeof counts]})
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filters */}
          <div className="border border-border/50 rounded-xl shadow-sm bg-card/50 backdrop-blur-sm p-4 md:p-6 mb-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
                Filters
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs md:text-sm text-[#01ae79] border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/40 dark:hover:bg-[#01ae79]/10">
                  Clear
                </Button>
                <Button 
                  onClick={handleSearch} 
                  size="sm"
                  className="text-xs md:text-sm bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                >
                  <Search className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Discover
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {/* Sport Filter */}
              <div>
                <label className="text-xs md:text-sm font-medium mb-2 block text-muted-foreground">Sport</label>
                <Select value={filters.sport} onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}>
                  <SelectTrigger className="bg-background/50 border-border/50 h-9">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {getSafeSpotsList().map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional filters based on active tab */}
              {activeTab === "athletes" && (
                <div>
                  <label className="text-xs md:text-sm font-medium mb-2 block text-muted-foreground">Graduation Year</label>
                  <Select value={filters.graduationYear} onValueChange={(value) => setFilters(prev => ({ ...prev, graduationYear: value }))}>
                    <SelectTrigger className="bg-background/50 border-border/50 h-9">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {getSafeGraduationYears().map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(activeTab === "coaches" || activeTab === "recruiters" || activeTab === "all") && (
                <div>
                  <label className="text-xs md:text-sm font-medium mb-2 block text-muted-foreground">Division</label>
                  <Select value={filters.division} onValueChange={(value) => setFilters(prev => ({ ...prev, division: value }))}>
                    <SelectTrigger className="bg-background/50 border-border/50 h-9">
                      <SelectValue placeholder="All Divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {getSafeDivisions().map(division => (
                        <SelectItem key={division} value={division}>{division}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* State Filter */}
              <div>
                <label className="text-xs md:text-sm font-medium mb-2 block text-muted-foreground">State</label>
                <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
                  <SelectTrigger className="bg-background/50 border-border/50 h-9">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {getSafeStates().map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results - Single TabsContent that shows content based on activeTab */}
          <TabsContent value={activeTab} className="mt-0">
            {!hasSearched ? (
              <div className="text-center py-12 md:py-16">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Search className="h-8 w-8 md:h-12 md:w-12 text-[#01ae79] dark:text-[#01ae79]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                  Ready to discover amazing talent?
                </h3>
                <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                  {effectiveRole === 'athlete' 
                    ? "Click discover to find coaches and recruiters who can help you reach the next level, or use filters to narrow your search."
                    : "Click discover to see all available users, or use filters to find the perfect matches for your program."
                  }
                </p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredUsers.map(user => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="group block"
                  >
                    <div className="flex flex-col p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md hover:border-[#01ae79]/30 dark:hover:border-[#01ae79]/40 transition-all duration-200 hover:bg-card/80 cursor-pointer">
                      {/* User Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={user.profilePicture}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30 group-hover:ring-[#01ae79]/40 dark:group-hover:ring-[#01ae79]/50 transition-colors"
                          />
                          {user.verified && (
                            <div className="absolute -top-1 -right-1 bg-[#01ae79] rounded-full p-0.5">
                              <Award className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground truncate">{user.name}</h3>
                          <Badge className={`text-xs px-1.5 py-0.5 flex items-center gap-1 w-fit ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {formatRole(user.role)}
                          </Badge>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[#01ae79] dark:text-[#01ae79] text-sm">{user.sport}</span>
                          {user.role === 'athlete' && (
                            <>
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-xs text-muted-foreground truncate">{user.position}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </div>

                        {user.role === 'athlete' && (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Class of {user.graduationYear}</span>
                            </div>
                            <div className="font-medium">GPA: {user.gpa}</div>
                          </div>
                        )}

                        {(user.role === 'coach' || user.role === 'recruiter') && (
                          <div className="text-xs space-y-1">
                            <div className="font-medium text-foreground">{user.school}</div>
                            <div className="text-muted-foreground">{user.division}</div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 mt-3 border-t border-border/30">
                        {user.isConnected ? (
                          <Button 
                            size="sm" 
                            className="w-full h-8 text-xs bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle message action
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full h-8 text-xs bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle connect action
                            }}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                  {activeTab === 'athletes' ? <User className="h-8 w-8 md:h-12 md:w-12 text-[#01ae79] dark:text-[#01ae79]" /> :
                   activeTab === 'coaches' ? <Users className="h-8 w-8 md:h-12 md:w-12 text-[#01ae79] dark:text-[#01ae79]" /> :
                   activeTab === 'recruiters' ? <Target className="h-8 w-8 md:h-12 md:w-12 text-[#01ae79] dark:text-[#01ae79]" /> :
                   <Users className="h-8 w-8 md:h-12 md:w-12 text-[#01ae79] dark:text-[#01ae79]" />}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                  No {activeTab === 'all' ? 'results' : activeTab} found
                </h3>
                <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                  Try adjusting your filters or search criteria to find more results.
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4 border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/40 dark:hover:bg-[#01ae79]/10"
                >
                  Clear All Filters & Start Over
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 