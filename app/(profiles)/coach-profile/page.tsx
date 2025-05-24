import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { 
  MessageCircle,
  Heart,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Twitter,
  ChevronLeft,
  ExternalLink,
  Star,
  Users,
  Trophy
} from "lucide-react";
import Link from "next/link";
import React from "react";

// Program Profile Data - Not individual coach
const programData = {
  name: "University of Texas Basketball",
  university: "University of Texas at Austin",
  sport: "Basketball",
  division: "Division I",
  conference: "Big 12",
  logoImage: "/college_player.jpg", // Would be program logo
  location: "Austin, TX",
  founded: 1906,
  
  // Staff can include multiple people
  staffRoles: [
    { name: "Head Coach", current: "Chris Beard" },
    { name: "Assistant Coach", current: "Ulric Maligi" },
    { name: "Assistant Coach", current: "Justin Gainey" },
    { name: "Director of Recruiting", current: "Staff" }
  ],
  
  // Program Success - What attracts athletes
  currentSeason: {
    record: "24-8",
    ranking: "#12 AP Poll",
    achievement: "Big 12 Champions",
    nextGame: "vs Kansas - March 15th"
  },
  
  // Player Development - Key for recruiting
  development: {
    nbaPlayers: 15, // All time or recent
    currentNBAPlayers: ["Kevin Durant", "LaMarcus Aldridge", "Myles Turner"],
    graduationRate: 89,
    academicSupport: true
  },
  
  // Draft/Connection status  
  draftStatus: "Actively Scouting",
  scoutedAthletes: 89, // Athletes they've drafted
  mutualConnections: 23, // Athletes who drafted back
  
  // Current Needs - What's available
  scholarshipsAvailable: 3,
  recruitingNeeds: [
    {
      position: "Point Guard",
      priority: "High", 
      class: "2025",
      scholarships: 2,
      description: "Looking for a floor general who can run our fast-break system"
    },
    {
      position: "Center",
      priority: "Medium",
      class: "2025", 
      scholarships: 1,
      description: "Need size and rim protection for Big 12 play"
    }
  ],
  
  // Program Highlights - Why choose this program
  programHighlights: [
    "15 NBA Draft picks in program history",
    "89% graduation rate for student-athletes", 
    "State-of-the-art $165M practice facility",
    "Academic Learning Center with tutoring",
    "Annual Big 12 championship contenders",
    "Austin - Top college town in America"
  ],
  
  // Contact - Multiple ways to reach program
  contact: {
    recruitingEmail: "recruiting@texassports.com",
    phone: "(512) 471-7437", // Main athletic department
    website: "texassports.com/basketball",
    twitter: "@TexasMBB",
    instagram: "@texasmbb"
  },
  
  // Program facilities and academics
  facilities: {
    arena: "Frank Erwin Center (16,734 capacity)",
    practiceXfacility: "Cooley Pavilion Practice Facility", 
    strengthCenter: "Moncrief-Neuhaus Athletic Complex"
  },
  
  academics: {
    acceptanceRate: "31%",
    avgSAT: "1240-1470",
    topMajors: ["Business", "Engineering", "Communications"],
    academicRanking: "#38 National University"
  },
  
  // Recent draft activity
  recentActivity: [
    { athlete: "James Wilson (PG)", action: "drafted", timeAgo: "1 hour ago", location: "Dallas, TX" },
    { athlete: "Mike Rodriguez (SF)", action: "drafted", timeAgo: "3 hours ago", location: "Houston, TX" },
    { athlete: "Tyler Johnson (C)", action: "drafted", timeAgo: "1 day ago", location: "San Antonio, TX" }
  ]
};

export default function ProgramProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Simple Header */}
      <div className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/programs">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-1" />
              Follow Program
            </Button>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Star className="w-4 h-4 mr-1" />
              Show Interest
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Program Success */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Program Success</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{programData.development.nbaPlayers}</p>
                  <p className="text-sm text-muted-foreground">NBA Draft Picks</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{programData.development.graduationRate}%</p>
                  <p className="text-sm text-muted-foreground">Graduation Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">#{programData.academics.academicRanking.replace('#', '').replace(' National University', '')}</p>
                  <p className="text-sm text-muted-foreground">National Ranking</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{programData.scholarshipsAvailable}</p>
                  <p className="text-sm text-muted-foreground">Scholarships Open</p>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Current Season (2023-24)</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{programData.currentSeason.record}</p>
                    <p className="text-sm text-muted-foreground">{programData.currentSeason.ranking}</p>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    {programData.currentSeason.achievement}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Current NBA Players */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Current NBA Alumni</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {programData.development.currentNBAPlayers.map((player, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{player}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Recruiting Needs */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Recruiting Needs</h3>
                <Badge variant="outline">Class of 2025 Focus</Badge>
              </div>
              <div className="space-y-4">
                {programData.recruitingNeeds.map((need, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{need.position}</h4>
                        <Badge variant="outline" className="text-xs">Class of {need.class}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={need.priority === 'High' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}>
                          {need.priority} Priority
                        </Badge>
                        <Badge variant="outline">{need.scholarships} available</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{need.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Our Program */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Why Choose Texas Basketball</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {programData.programHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Scouting Activity */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Scouting Activity</h3>
              <div className="space-y-3">
                {programData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Scouted {activity.athlete}</p>
                        <p className="text-xs text-muted-foreground">{activity.location} • {activity.timeAgo}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Player
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Program Info */}
            <div className="bg-card rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                  <Image 
                    src={programData.logoImage} 
                    alt={programData.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-xl font-bold mb-1">{programData.name}</h1>
                <p className="text-muted-foreground text-sm">{programData.university}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Division:</span>
                  <span className="font-medium">{programData.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conference:</span>
                  <span className="font-medium">{programData.conference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="font-medium">{programData.founded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium">{programData.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Badge className="w-full justify-center bg-orange-500 text-white">
                  {programData.draftStatus}
                </Badge>
              </div>
            </div>

            {/* Draft Board Status */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Scouting Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Athletes Scouted:</span>
                  <span className="font-medium text-lg">{programData.scoutedAthletes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mutual Interest:</span>
                  <span className="font-medium text-lg text-green-600">{programData.mutualConnections}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Message athletes only after mutual draft connections
                </p>
              </div>
            </div>

            {/* Coaching Staff */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Coaching Staff</h3>
              <div className="space-y-2">
                {programData.staffRoles.map((staff, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{staff.name}:</span>
                    <span className="font-medium">{staff.current}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Academics */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Academics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">National Ranking:</span>
                  <span className="font-medium">{programData.academics.academicRanking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acceptance Rate:</span>
                  <span className="font-medium">{programData.academics.acceptanceRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average SAT:</span>
                  <span className="font-medium">{programData.academics.avgSAT}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Popular Majors</p>
                <div className="flex flex-wrap gap-1">
                  {programData.academics.topMajors.map((major, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {major}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Contact Program</h3>
              <div className="space-y-3">
                <a href={`mailto:${programData.contact.recruitingEmail}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Mail className="w-4 h-4" />
                  {programData.contact.recruitingEmail}
                </a>
                <a href={`tel:${programData.contact.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Phone className="w-4 h-4" />
                  {programData.contact.phone}
                </a>
                <Link href={`https://${programData.contact.website}`} target="_blank" className="flex items-center gap-2 text-sm hover:text-primary">
                  <ExternalLink className="w-4 h-4" />
                  {programData.contact.website}
                </Link>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Follow Program</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="p-2">
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
                <Star className="w-4 h-4 mr-2" />
                Show Interest
              </Button>
              <Button variant="outline" className="w-full" size="lg" disabled>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message (Show Interest First)
              </Button>
              <div className="text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  View {programData.scoutedAthletes} Athletes Scouted
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}