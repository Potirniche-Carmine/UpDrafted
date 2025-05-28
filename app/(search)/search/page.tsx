"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MapPin, Users, Target, Award, Eye, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for demonstration
const mockAthletes = [
  {
    id: "1",
    name: "Marcus Johnson",
    sport: "Basketball",
    position: "Point Guard",
    graduationYear: 2025,
    location: "Chicago, IL",
    gpa: 3.8,
    height: "6'2\"",
    weight: "185 lbs",
    profileImage: "/api/placeholder/80/80",
    verified: true,
    stats: { ppg: 18.5, apg: 7.2, rpg: 4.8 }
  },
  {
    id: "2",
    name: "Sarah Williams",
    sport: "Soccer",
    position: "Forward",
    graduationYear: 2024,
    location: "Austin, TX",
    gpa: 3.9,
    height: "5'7\"",
    weight: "140 lbs",
    profileImage: "/api/placeholder/80/80",
    verified: true,
    stats: { goals: 24, assists: 12, shots: 89 }
  },
  {
    id: "3",
    name: "David Chen",
    sport: "Swimming",
    position: "Freestyle",
    graduationYear: 2025,
    location: "San Diego, CA",
    gpa: 4.0,
    height: "6'0\"",
    weight: "170 lbs",
    profileImage: "/api/placeholder/80/80",
    verified: false,
    stats: { "50m Free": "21.45s", "100m Free": "47.23s", "200m Free": "1:42.15" }
  }
];

const mockPrograms = [
  {
    id: "1",
    name: "University of Texas Basketball",
    coach: "Coach Sarah Williams",
    division: "NCAA Division I",
    conference: "Big 12",
    location: "Austin, TX",
    sport: "Basketball",
    logo: "/api/placeholder/60/60",
    verified: true,
    scholarshipsAvailable: 3,
    recruitingYears: [2025, 2026]
  },
  {
    id: "2",
    name: "Duke University Soccer",
    coach: "Coach Mike Rodriguez",
    division: "NCAA Division I",
    conference: "ACC",
    location: "Durham, NC",
    sport: "Soccer",
    logo: "/api/placeholder/60/60",
    verified: true,
    scholarshipsAvailable: 2,
    recruitingYears: [2024, 2025]
  }
];

const sports = ["Basketball", "Soccer", "Football", "Baseball", "Swimming", "Track & Field", "Tennis", "Golf"];
const divisions = ["NCAA Division I", "NCAA Division II", "NCAA Division III", "NJCAA"];
const graduationYears = [2024, 2025, 2026, 2027];
const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<"athletes" | "programs">("athletes");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    sport: "all",
    division: "all",
    graduationYear: "all",
    state: "all",
    position: "",
    minGPA: "",
    verified: "all"
  });

  const filteredAthletes = useMemo(() => {
    return mockAthletes.filter(athlete => {
      const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           athlete.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           athlete.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSport = filters.sport === "all" || athlete.sport === filters.sport;
      const matchesYear = filters.graduationYear === "all" || athlete.graduationYear.toString() === filters.graduationYear;
      const matchesState = filters.state === "all" || athlete.location.includes(filters.state);
      const matchesPosition = !filters.position || athlete.position.toLowerCase().includes(filters.position.toLowerCase());
      const matchesGPA = !filters.minGPA || athlete.gpa >= parseFloat(filters.minGPA);
      const matchesVerified = filters.verified === "all" || (filters.verified === "true" ? athlete.verified : !athlete.verified);

      return matchesSearch && matchesSport && matchesYear && matchesState && matchesPosition && matchesGPA && matchesVerified;
    });
  }, [searchTerm, filters]);

  const filteredPrograms = useMemo(() => {
    return mockPrograms.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.sport.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSport = filters.sport === "all" || program.sport === filters.sport;
      const matchesDivision = filters.division === "all" || program.division === filters.division;
      const matchesState = filters.state === "all" || program.location.includes(filters.state);
      const matchesVerified = filters.verified === "all" || (filters.verified === "true" ? program.verified : !program.verified);

      return matchesSearch && matchesSport && matchesDivision && matchesState && matchesVerified;
    });
  }, [searchTerm, filters]);

  const clearFilters = () => {
    setFilters({
      sport: "all",
      division: "all",
      graduationYear: "all",
      state: "all",
      position: "",
      minGPA: "",
      verified: "all"
    });
    setSearchTerm("");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Athletes & Programs</h1>
        <p className="text-muted-foreground">
          Discover talented student-athletes and college programs across all divisions
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, sport, position, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "athletes" | "programs")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="athletes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Athletes ({filteredAthletes.length})
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Programs ({filteredPrograms.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sport</label>
                <Select value={filters.sport} onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sports.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeTab === "athletes" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Graduation Year</label>
                  <Select value={filters.graduationYear} onValueChange={(value) => setFilters(prev => ({ ...prev, graduationYear: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {graduationYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeTab === "programs" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Division</label>
                  <Select value={filters.division} onValueChange={(value) => setFilters(prev => ({ ...prev, division: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {divisions.map(division => (
                        <SelectItem key={division} value={division}>{division}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Verified Only</label>
                <Select value={filters.verified} onValueChange={(value) => setFilters(prev => ({ ...prev, verified: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Profiles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Profiles</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                    <SelectItem value="false">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeTab === "athletes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Position</label>
                  <Input
                    placeholder="e.g., Point Guard, Forward"
                    value={filters.position}
                    onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum GPA</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4.0"
                    placeholder="e.g., 3.0"
                    value={filters.minGPA}
                    onChange={(e) => setFilters(prev => ({ ...prev, minGPA: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <TabsContent value="athletes">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAthletes.map(athlete => (
              <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Image
                        src={athlete.profileImage}
                        alt={athlete.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                      {athlete.verified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{athlete.name}</h3>
                      <p className="text-muted-foreground">{athlete.position} • Class of {athlete.graduationYear}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {athlete.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{athlete.sport}</Badge>
                      <span className="text-sm font-medium">GPA: {athlete.gpa}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Height:</span>
                        <span className="ml-1 font-medium">{athlete.height}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="ml-1 font-medium">{athlete.weight}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/profile/${athlete.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAthletes.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No athletes found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPrograms.map(program => (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Image
                        src={program.logo}
                        alt={program.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      {program.verified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{program.name}</h3>
                      <p className="text-muted-foreground">{program.coach}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {program.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{program.sport}</Badge>
                      <Badge variant="outline">{program.division}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Conference:</span>
                        <span className="ml-1 font-medium">{program.conference}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Scholarships:</span>
                        <span className="ml-1 font-medium">{program.scholarshipsAvailable}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">Recruiting: </span>
                      {program.recruitingYears.map(year => (
                        <Badge key={year} variant="outline" className="ml-1 text-xs">
                          {year}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/profile/${program.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Program
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No programs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 