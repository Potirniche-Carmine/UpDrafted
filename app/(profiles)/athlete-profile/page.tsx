import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { 
  MessageCircle,
  Heart,
  Play,
  MapPin,
  GraduationCap,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  ChevronLeft,
  ExternalLink,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import React from "react";

// MVP Data - Keep it simple
const athleteData = {
  name: "Marcus Johnson",
  position: "Point Guard",
  sport: "Basketball",
  profileImage: "/college_player.jpg",
  location: "Chicago, IL",
  school: "Westfield High School",
  graduationYear: 2025,
  height: "6'2\"",
  weight: "185 lbs",
  
  // MaxPreps for official stats and verification
  maxPrepsUrl: "https://www.maxpreps.com/il/chicago/westfield-high-school/basketball/winter-22-23/roster/marcus-johnson",
  maxPrepsVerified: true,
  
  // Draft/Connection status
  draftStatus: "Available for Draft",
  connectionsCount: 12, // Programs that have drafted them
  mutualConnections: 3, // Programs they've drafted back
  
  // Main highlight video
  featuredVideo: {
    title: "Junior Season Highlights",
    platform: "hudl",
    embedUrl: "https://www.hudl.com/embed/video/123456",
    description: "Best plays from junior year including state tournament run"
  },
  
  // Additional videos
  videos: [
    {
      title: "State Championship Game",
      platform: "youtube",
      embedUrl: "https://youtube.com/embed/abc123"
    },
    {
      title: "Summer League Highlights", 
      platform: "hudl",
      embedUrl: "https://www.hudl.com/embed/video/789012"
    }
  ],
  
  // Simple contact
  contact: {
    email: "marcus.johnson@example.com",
    phone: "(555) 123-4567",
    instagram: "@marcus_hoops",
    twitter: "@MJ_Hoops21"
  },
  
  // Key achievements
  achievements: [
    "All-State First Team (2024)",
    "Conference MVP (2024)",
    "Team Captain (2023-24)",
    "Honor Roll Student"
  ],
  
  // Recent draft activity
  recentActivity: [
    { program: "Duke Basketball", action: "drafted", timeAgo: "2 hours ago" },
    { program: "North Carolina Basketball", action: "drafted", timeAgo: "1 day ago" },
    { program: "Texas Basketball", action: "drafted", timeAgo: "3 days ago" }
  ]
};

export default function AthleteProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Simple Header */}
      <div className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/athletes">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-1" />
              Save to Scouts
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Star className="w-4 h-4 mr-1" />
              Draft Player
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Featured Video */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={athleteData.featuredVideo.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">{athleteData.featuredVideo.title}</h2>
                <p className="text-muted-foreground text-sm">{athleteData.featuredVideo.description}</p>
              </div>
            </div>

            {/* Additional Videos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">More Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {athleteData.videos.map((video, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="bg-white/90 text-black w-12 h-12 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 ml-1" />
                        </div>
                      </div>
                    </div>
                    <p className="font-medium text-sm mt-2">{video.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{video.platform}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats via MaxPreps */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Official Stats & Verification</h3>
                {athleteData.maxPrepsVerified && (
                  <Badge className="bg-green-500 text-white">
                    Verified Athlete
                  </Badge>
                )}
              </div>
              
              <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">MaxPreps Profile</p>
                  <p className="text-sm text-muted-foreground">Official stats, game logs, and team roster verification</p>
                </div>
                <Link href={athleteData.maxPrepsUrl} target="_blank">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Stats
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                Stats are pulled from official MaxPreps profile and verified against team rosters
              </p>
            </div>

            {/* Achievements */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Key Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {athleteData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Draft Activity */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Draft Activity</h3>
              <div className="space-y-3">
                {athleteData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.program} {activity.action} you</p>
                        <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Program
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Player Info */}
            <div className="bg-card rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                  <Image 
                    src={athleteData.profileImage} 
                    alt={athleteData.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-2xl font-bold mb-1">{athleteData.name}</h1>
                <p className="text-muted-foreground">{athleteData.position}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <span className="font-medium">{athleteData.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{athleteData.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium">{athleteData.graduationYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium">{athleteData.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">School:</span>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span className="font-medium">{athleteData.school}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Badge className="w-full justify-center bg-green-500 text-white">
                  {athleteData.draftStatus}
                </Badge>
              </div>
            </div>

            {/* Draft Board Status */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Draft Board Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Programs Interested:</span>
                  <span className="font-medium text-lg">{athleteData.connectionsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mutual Connections:</span>
                  <span className="font-medium text-lg text-green-600">{athleteData.mutualConnections}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Message programs only after mutual draft connections
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <a href={`mailto:${athleteData.contact.email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Mail className="w-4 h-4" />
                  {athleteData.contact.email}
                </a>
                <a href={`tel:${athleteData.contact.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Phone className="w-4 h-4" />
                  {athleteData.contact.phone}
                </a>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Social Media</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="p-2">
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                <Star className="w-4 h-4 mr-2" />
                Draft Player
              </Button>
              <Button variant="outline" className="w-full" size="lg" disabled>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message (Draft First)
              </Button>
              <div className="text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  View {athleteData.connectionsCount} Programs Interested
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}