import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { 
  Calendar, 
  Mail, 
  MapPin, 
  Phone, 
  Award, 
  User, 
  School, 
  Ruler, 
  Weight, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Star, 
  FileText,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import React from "react";

// Mock data for demonstration
const playerData = {
  name: "Marcus Johnson",
  position: "Point Guard",
  sport: "Basketball",
  profileImage: "/college_player.jpg",
  bannerImage: "/api/placeholder/1200/300",
  location: "Chicago, IL",
  school: "Westfield High School",
  graduationYear: 2025,
  height: "6'2\"",
  weight: "185 lbs",
  email: "marcus.johnson@example.com",
  phone: "(555) 123-4567",
  gpa: 3.8,
  sat: 1320,
  act: 28,
  highlights: [
    {
      title: "Season Highlights 2024",
      thumbnail: "/api/placeholder/300/200",
      url: "#"
    },
    {
      title: "Championship Game MVP",
      thumbnail: "/api/placeholder/300/200",
      url: "#"
    }
  ],
  stats: {
    pointsPerGame: 18.5,
    assistsPerGame: 7.2,
    reboundsPerGame: 4.3,
    stealsPerGame: 2.1,
    fieldGoalPercentage: 48.2,
    threePointPercentage: 38.5,
    freeThrowPercentage: 82.7
  },
  awards: [
    "All-State First Team (2024)",
    "Conference MVP (2024)",
    "3-Point Contest Winner (2023)",
    "Team Captain (2023-2024)"
  ],
  about: "Dedicated student-athlete with 4 years of varsity basketball experience. Known for court vision, leadership, and three-point shooting ability. Looking to contribute to a competitive college program while pursuing a degree in Sports Management or Business Administration.",
  socialMedia: {
    instagram: "marcus_johnson21",
    twitter: "MJ_Hoops21",
    facebook: "marcusjohnsonbasketball",
    youtube: "MarcusJohnsonHighlights"
  },
  academicInterests: ["Sports Management", "Business Administration", "Marketing"],
  references: [
    {
      name: "Coach Robert Williams",
      position: "Head Basketball Coach",
      organization: "Westfield High School",
      phone: "(555) 987-6543",
      email: "rwilliams@westfield.edu"
    },
    {
      name: "Coach Sarah Thompson",
      position: "AAU Coach",
      organization: "Chicago Elite Basketball",
      phone: "(555) 456-7890",
      email: "sthompson@chicagoelite.org"
    }
  ]
};

export default function PlayerProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="container pt-4">
        <Link href="/athletes">
          <Button variant="ghost" className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Athletes
          </Button>
        </Link>
      </div>
      
      {/* Centered Profile Picture */}
      <div className="container flex justify-center -mb-8 relative z-10">
        <div className="rounded-full overflow-hidden border-4 border-background w-32 h-32 shadow-md">
          <Image src={playerData.profileImage} alt="UpDrafted Logo" width={150}
                      height={50}
                      priority
                      style = {{height: 'auto', width: 'auto'}}
                      className="mr-3"/>
        </div>
      </div>
      
      {/* Player Info Tags */}
      <div className="container flex justify-center mb-6 mt-12">
        <div className="bg-background rounded-lg p-2 shadow-sm">
          <Badge className="bg-primary text-primary-foreground">{playerData.sport}</Badge>
          <Badge className="ml-2 bg-secondary text-secondary-foreground">{playerData.position}</Badge>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column - Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-center md:text-left">{playerData.name}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1 justify-center md:justify-start">
                  <MapPin className="w-4 h-4" /> {playerData.location}
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <p className="flex items-center gap-2 text-sm">
                  <School className="w-4 h-4 text-primary" /> 
                  <span className="font-medium">School:</span> {playerData.school}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" /> 
                  <span className="font-medium">Class of:</span> {playerData.graduationYear}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Ruler className="w-4 h-4 text-primary" /> 
                  <span className="font-medium">Height:</span> {playerData.height}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Weight className="w-4 h-4 text-primary" /> 
                  <span className="font-medium">Weight:</span> {playerData.weight}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" /> 
                  <span className="font-medium">Email:</span> {playerData.email}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" /> 
                  <span className="font-medium">Phone:</span> {playerData.phone}
                </p>
              </div>
              
              <div className="pt-2">
                <h2 className="text-sm font-semibold mb-2">Social Media</h2>
                <div className="flex gap-2">
                  <Link href={`https://instagram.com/${playerData.socialMedia.instagram}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                      <Instagram className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`https://twitter.com/${playerData.socialMedia.twitter}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`https://facebook.com/${playerData.socialMedia.facebook}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                      <Facebook className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`https://youtube.com/${playerData.socialMedia.youtube}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                      <Youtube className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> 
                Awards & Achievements
              </h2>
              <ul className="space-y-2">
                {playerData.awards.map((award, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-sm">{award}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> 
                References
              </h2>
              <div className="space-y-4">
                {playerData.references.map((ref, index) => (
                  <div key={index} className="text-sm space-y-1 border-l-2 border-primary pl-3">
                    <p className="font-medium">{ref.name}</p>
                    <p className="text-muted-foreground">{ref.position}</p>
                    <p className="text-muted-foreground">{ref.organization}</p>
                    <p className="text-xs">{ref.email}</p>
                    <p className="text-xs">{ref.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> 
                About
              </h2>
              <p className="text-muted-foreground">{playerData.about}</p>
              
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Academic Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {playerData.academicInterests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">GPA</p>
                  <p className="text-2xl font-bold text-primary">{playerData.gpa}</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">SAT</p>
                  <p className="text-2xl font-bold text-primary">{playerData.sat}</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">ACT</p>
                  <p className="text-2xl font-bold text-primary">{playerData.act}</p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
              </TabsList>
              <TabsContent value="stats" className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">2023-2024 Season Stats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">PPG</p>
                    <p className="text-2xl font-bold">{playerData.stats.pointsPerGame}</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">APG</p>
                    <p className="text-2xl font-bold">{playerData.stats.assistsPerGame}</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">RPG</p>
                    <p className="text-2xl font-bold">{playerData.stats.reboundsPerGame}</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">SPG</p>
                    <p className="text-2xl font-bold">{playerData.stats.stealsPerGame}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">FG%</p>
                    <p className="text-xl font-bold">{playerData.stats.fieldGoalPercentage}%</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">3PT%</p>
                    <p className="text-xl font-bold">{playerData.stats.threePointPercentage}%</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">FT%</p>
                    <p className="text-xl font-bold">{playerData.stats.freeThrowPercentage}%</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/marcus-johnson/full-stats">
                    <Button variant="outline">View Complete Stats</Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="highlights" className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Video Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {playerData.highlights.map((highlight, index) => (
                    <Link href={highlight.url} key={index}>
                      <div className="border rounded-lg overflow-hidden group cursor-pointer">
                        <div className="relative">
                          <img 
                            src={highlight.thumbnail} 
                            alt={highlight.title} 
                            className="w-full aspect-video object-cover group-hover:opacity-90 transition-opacity" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium">{highlight.title}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/marcus-johnson/all-videos">
                    <Button variant="outline">View All Videos</Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="bg-muted rounded-lg p-6 text-center space-y-4">
              <h2 className="text-xl font-semibold">Interested in recruiting Marcus?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Connect with Marcus to discuss recruitment opportunities and learn more about his athletic and academic goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Connect with Marcus
                </Button>
                <Button variant="outline" size="lg">
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}