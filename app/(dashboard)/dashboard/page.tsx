"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight,
  Bell,
  Calendar,
  Eye,
  FileText,
  Info,
  MessageSquare,
  Search,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRoleView } from '@/hooks/use-role-view'
import { useProfileNavigation } from '@/hooks/use-profile-navigation'
import { DashboardHeader } from '../components/dashboard-header'
import { AuthWrapper } from '../../../components/auth-wrapper'

// TypeScript interfaces for navigation items
interface NavItemWithHref {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  onClick?: never;
}

interface NavItemWithOnClick {
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  href?: never;
}

type NavItem = NavItemWithHref | NavItemWithOnClick;

// NCAA Rules information - static content
const ncaaRules = [
  {
    title: "Contact Periods",
    description: "During a contact period, a college coach may have face-to-face contact with college-bound student-athletes or their parents, watch student-athletes compete and visit their high schools, and write or telephone student-athletes or their parents."
  },
  {
    title: "Dead Periods",
    description: "During a dead period, a college coach may not have face-to-face contact with college-bound student-athletes or their parents, and may not watch student-athletes compete or visit their high schools."
  },
  {
    title: "Evaluation Periods",
    description: "During an evaluation period, a college coach may watch college-bound student-athletes compete, visit their high schools, and write or telephone student-athletes or their parents."
  },
  {
    title: "Quiet Periods",
    description: "During a quiet period, a college coach may only have face-to-face contact with college-bound student-athletes or their parents on the college's campus. A coach may not watch student-athletes compete or visit their high schools during this time."
  }
];

const getUserContent = (role: string, handleViewProfile: () => void, profileNavigating: boolean = false): {
  welcomeText: string;
  searchText: string;
  searchHref: string;
  primaryNav: NavItem[];
} => {
  // Base navigation items that exist in the app
  switch (role) {
    case 'athlete':
      return {
        welcomeText: "Continue your recruiting journey",
        searchText: "Discover Schools & Coaches",
        searchHref: "/discover",
        primaryNav: [
          { 
            label: profileNavigating ? "Loading..." : "View Profile", 
            onClick: handleViewProfile, 
            icon: Eye, 
            description: "Check and update your profile", 
            color: "#01ae79" 
          },
          { 
            label: "Discover", 
            href: "/discover", 
            icon: Search, 
            description: "Find schools and coaches", 
            color: "#4f46e5" 
          },
          { 
            label: "Connections", 
            href: "/connections", 
            icon: Users, 
            description: "Manage your network", 
            color: "#0ea5e9" 
          },
          { 
            label: "Messages", 
            href: "/messages", 
            icon: MessageSquare, 
            description: "Check your conversations", 
            color: "#f59e0b" 
          },
          { 
            label: "Notifications", 
            href: "/notifications", 
            icon: Bell, 
            description: "View your notifications", 
            color: "#ef4444" 
          },
          { 
            label: "Search", 
            href: "/search", 
            icon: Search, 
            description: "Search for athletes, coaches, and schools", 
            color: "#8b5cf6" 
          }
        ]
      };
    case 'coach':
      return {
        welcomeText: "Discover and recruit talented athletes",
        searchText: "Discover Athletes",
        searchHref: "/discover",
        primaryNav: [
          { 
            label: profileNavigating ? "Loading..." : "View Profile", 
            onClick: handleViewProfile, 
            icon: Eye, 
            description: "Check and update your profile", 
            color: "#01ae79" 
          },
          { 
            label: "Discover", 
            href: "/discover", 
            icon: Search, 
            description: "Find talented athletes", 
            color: "#4f46e5" 
          },
          { 
            label: "Connections", 
            href: "/connections", 
            icon: Users, 
            description: "Manage your network", 
            color: "#0ea5e9" 
          },
          { 
            label: "Messages", 
            href: "/messages", 
            icon: MessageSquare, 
            description: "Check your conversations", 
            color: "#f59e0b" 
          },
          { 
            label: "Notifications", 
            href: "/notifications", 
            icon: Bell, 
            description: "View your notifications", 
            color: "#ef4444" 
          },
          { 
            label: "Search", 
            href: "/search", 
            icon: Search, 
            description: "Search for athletes and coaches", 
            color: "#8b5cf6" 
          }
        ]
      };
    case 'recruiter':
      return {
        welcomeText: "Connect athletes with the right opportunities",
        searchText: "Discover Athletes",
        searchHref: "/discover",
        primaryNav: [
          { 
            label: profileNavigating ? "Loading..." : "View Profile", 
            onClick: handleViewProfile, 
            icon: Eye, 
            description: "Check and update your profile", 
            color: "#01ae79" 
          },
          { 
            label: "Discover", 
            href: "/discover", 
            icon: Search, 
            description: "Find talented athletes", 
            color: "#4f46e5" 
          },
          { 
            label: "Connections", 
            href: "/connections", 
            icon: Users, 
            description: "Manage your network", 
            color: "#0ea5e9" 
          },
          { 
            label: "Messages", 
            href: "/messages", 
            icon: MessageSquare, 
            description: "Check your conversations", 
            color: "#f59e0b" 
          },
          { 
            label: "Notifications", 
            href: "/notifications", 
            icon: Bell, 
            description: "View your notifications", 
            color: "#ef4444" 
          },
          { 
            label: "Search", 
            href: "/search", 
            icon: Search, 
            description: "Search for athletes and coaches", 
            color: "#8b5cf6" 
          }
        ]
      };
    default:
      return {
        welcomeText: "Welcome to your dashboard",
        searchText: "Discover",
        searchHref: "/discover",
        primaryNav: [
          { 
            label: profileNavigating ? "Loading..." : "View Profile", 
            onClick: handleViewProfile, 
            icon: Eye, 
            description: "Check and update your profile", 
            color: "#01ae79" 
          },
          { 
            label: "Discover", 
            href: "/discover", 
            icon: Search, 
            description: "Explore UpDrafted", 
            color: "#4f46e5" 
          },
          { 
            label: "Connections", 
            href: "/connections", 
            icon: Users, 
            description: "Manage your network", 
            color: "#0ea5e9" 
          },
          { 
            label: "Messages", 
            href: "/messages", 
            icon: MessageSquare, 
            description: "Check your conversations", 
            color: "#f59e0b" 
          },
          { 
            label: "Notifications", 
            href: "/notifications", 
            icon: Bell, 
            description: "View your notifications", 
            color: "#ef4444" 
          },
          { 
            label: "Search", 
            href: "/search", 
            icon: Search, 
            description: "Search UpDrafted", 
            color: "#8b5cf6" 
          }
        ]
      };
  }
};

export default function DashboardPage() {
  const { navigateToProfile, isNavigating: profileNavigating } = useProfileNavigation();
  
  // Scroll to top when dashboard loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle profile navigation
  const handleViewProfile = async () => {
    await navigateToProfile();
  };

  return (
    <AuthWrapper>
      <DashboardContent 
        handleViewProfile={handleViewProfile} 
        profileNavigating={profileNavigating} 
      />
    </AuthWrapper>
  );
}

// Dashboard content component
function DashboardContent({ 
  handleViewProfile, 
  profileNavigating 
}: { 
  handleViewProfile: () => Promise<void>; 
  profileNavigating: boolean; 
}) {
  const { user } = useUser();
  const { effectiveRole, isAdmin, isViewingAsOtherRole } = useRoleView();

  // Get current date for calendar display
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#01ae79] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get content based on user role
  const userContent = getUserContent(effectiveRole || 'athlete', handleViewProfile, profileNavigating);
  
  // Get user display name
  const displayName = user.fullName || user.firstName || user.username || 'User';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6 space-y-8">
        {/* Header Section */}
        <DashboardHeader
          displayName={displayName}
          welcomeText={userContent.welcomeText}
          searchText={userContent.searchText}
          searchHref={userContent.searchHref}
          isAdmin={isAdmin}
          isViewingAsOtherRole={isViewingAsOtherRole}
          effectiveRole={effectiveRole || 'athlete'}
        />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation Cards */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userContent.primaryNav.map((item, index) => (
                    <NavCard key={index} item={item} profileNavigating={profileNavigating} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Content - Calendar and NCAA Rules */}
          <div className="space-y-6">
            {/* Calendar Date */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-[#01ae79]" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-muted/30 rounded-md">
                  <p className="text-lg font-medium text-foreground">{formattedDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* NCAA Rules */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-[#01ae79]" />
                  NCAA Recruiting Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ncaaRules.map((rule, index) => (
                    <div key={index} className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground flex items-center">
                        <Info className="h-4 w-4 text-[#01ae79] mr-2" />
                        {rule.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                      {index < ncaaRules.length - 1 && (
                        <div className="pt-2 border-b border-border/50"></div>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full border-[#01ae79] text-[#01ae79] hover:bg-[#01ae79] hover:text-white" onClick={() => window.open('https://www.ncsasports.org/ncaa-eligibility-center/recruiting-rules', '_blank')}>
                      More On NCAA Recruiting Periods
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation card component
function NavCard({ 
  item, 
  profileNavigating
}: { 
  item: NavItem, 
  profileNavigating: boolean
}) {
  const IconComponent = item.icon;
  const isViewProfileAction = 'onClick' in item && (item.label.includes("Profile") || item.label.includes("Loading"));
  const shouldDisable = isViewProfileAction && profileNavigating;
  
  if ('onClick' in item) {
    return (
      <Card 
        className={`group transition-all duration-300 border-border/50 ${
          shouldDisable 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-lg hover:shadow-[#01ae79]/5 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 cursor-pointer'
        }`} 
        onClick={shouldDisable ? undefined : item.onClick}
      >
        <CardContent className="flex flex-col items-center text-center p-4">
          <div className={`h-10 w-10 rounded-full bg-[${item.color}]/10 flex items-center justify-center mb-3 ${
            profileNavigating && isViewProfileAction ? 'animate-pulse' : ''
          }`}>
            <IconComponent 
              className={`h-5 w-5 text-[${item.color}]`} 
            />
          </div>
          <h3 className="font-medium text-foreground mb-1">{item.label}</h3>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Link href={item.href}>
      <Card className="group transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 cursor-pointer">
        <CardContent className="flex flex-col items-center text-center p-4">
          <div className={`h-10 w-10 rounded-full bg-[${item.color}]/10 flex items-center justify-center mb-3`}>
            <IconComponent 
              className={`h-5 w-5 text-[${item.color}]`} 
            />
          </div>
          <h3 className="font-medium text-foreground mb-1">{item.label}</h3>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
} 