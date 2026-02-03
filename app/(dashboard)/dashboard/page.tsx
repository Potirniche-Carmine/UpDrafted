"use client";

import { useUser } from '@/hooks/use-auth';
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
  Users,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useProfileNavigation } from '@/hooks/use-profile-navigation'
import { AuthWrapper } from '../../../components/auth-wrapper'
import { PWAInstallPrompt } from '../../../components/pwa-install-prompt'
import { PremiumLimitsCard } from '@/components/premium-limits-card'

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
  primaryNav: NavItem[];
} => {
  // Base navigation items that exist in the app
  switch (role) {
    case 'athlete':
      return {
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
            icon: Users,
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
            label: "Activity",
            href: "/activity",
            icon: BarChart3,
            description: "Track profile views and insights",
            color: "#8b5cf6"
          }
        ]
      };
    case 'coach':
      return {
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
            icon: Users,
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
            label: "Activity",
            href: "/activity",
            icon: BarChart3,
            description: "Track profile views and insights",
            color: "#8b5cf6"
          }
        ]
      };
    case 'recruiter':
      return {
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
            icon: Users,
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
            label: "Activity",
            href: "/activity",
            icon: BarChart3,
            description: "Track profile views and insights",
            color: "#8b5cf6"
          }
        ]
      };
    case 'admin':
      return {
        primaryNav: [
          {
            label: "Admin Controls",
            href: "/admin",
            icon: Eye,
            description: "Access admin management tools",
            color: "#dc2626"
          },
          {
            label: "Discover",
            href: "/discover",
            icon: Users,
            description: "View all platform users",
            color: "#4f46e5"
          },
          {
            label: "Connections",
            href: "/connections",
            icon: Users,
            description: "Monitor connections",
            color: "#0ea5e9"
          },
          {
            label: "Messages",
            href: "/messages",
            icon: MessageSquare,
            description: "Monitor conversations",
            color: "#f59e0b"
          },
          {
            label: "Notifications",
            href: "/notifications",
            icon: Bell,
            description: "View system notifications",
            color: "#ef4444"
          },
          {
            label: "Activity",
            href: "/activity",
            icon: BarChart3,
            description: "Monitor platform activity",
            color: "#8b5cf6"
          }
        ]
      };
    default:
      // Fallback for unknown roles
      return {
        primaryNav: [
          {
            label: "Discover",
            href: "/discover",
            icon: Users,
            description: "Explore the platform",
            color: "#4f46e5"
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
      <PWAInstallPrompt />
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

  // Get user role directly from user metadata instead of useRoleView
  const userRole = user?.role as string || 'athlete';

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
  const userContent = getUserContent(userRole, handleViewProfile, profileNavigating);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6 space-y-8">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Calendar Date - First on mobile, right side on desktop */}
          <div className="lg:col-start-3 lg:row-start-1 order-1">
            <Card className="border shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center text-lg">
                  <Calendar className="mr-2 h-6 w-6 text-[#01ae79]" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-br from-[#01ae79]/5 to-[#01ae79]/10 border border-[#01ae79]/10 rounded-md">
                  <p className="text-xl font-semibold text-foreground">{formattedDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Cards - Second on mobile, spans 2 cols on desktop */}
          <div className="lg:col-span-2 lg:row-start-1 order-2">
            <Card className="border shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {userContent.primaryNav.map((item, index) => (
                    <NavCard key={index} item={item} profileNavigating={profileNavigating} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Limits Card - Third on mobile, below Quick Navigation on desktop */}
          <div className="lg:col-span-2 lg:row-start-2 order-3">
            <PremiumLimitsCard />
          </div>

          {/* NCAA Rules - Fourth on mobile, right side on desktop */}
          <div className="lg:col-start-3 lg:row-start-2 order-4">
            <Card className="border shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center text-lg">
                  <FileText className="mr-2 h-6 w-6 text-[#01ae79]" />
                  NCAA Recruiting Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ncaaRules.map((rule, index) => (
                    <div key={index} className="space-y-2 p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/30 border border-border/30">
                      <h3 className="text-base font-semibold text-foreground flex items-center">
                        <Info className="h-4 w-4 text-[#01ae79] mr-2 flex-shrink-0" />
                        {rule.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{rule.description}</p>
                    </div>
                  ))}
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#01ae79] text-[#01ae79] hover:bg-[#01ae79] hover:text-white text-sm py-2.5 shadow-sm"
                      onClick={() => window.open('https://www.ncsasports.org/ncaa-eligibility-center/recruiting-rules', '_blank')}
                    >
                      <span className="truncate">NCAA Rules & Periods</span>
                      <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
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
        className={`group transition-all duration-300 border shadow-sm bg-gradient-to-br from-card to-card/60 ${shouldDisable
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-lg hover:shadow-[#01ae79]/10 hover:border-[#01ae79]/30 hover:from-card hover:to-[#01ae79]/5 cursor-pointer'
          }`}
        onClick={shouldDisable ? undefined : item.onClick}
      >
        <CardContent className="flex flex-col items-center text-center p-4 min-h-[120px] justify-center">
          <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-[${item.color}]/10 to-[${item.color}]/20 border border-[${item.color}]/20 flex items-center justify-center mb-3 shadow-sm ${profileNavigating && isViewProfileAction ? 'animate-pulse' : ''
            }`}>
            <IconComponent
              className={`h-6 w-6 text-[${item.color}]`}
            />
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-base">{item.label}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={item.href}>
      <Card className="group transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/10 border shadow-sm bg-gradient-to-br from-card to-card/60 hover:border-[#01ae79]/30 hover:from-card hover:to-[#01ae79]/5 cursor-pointer h-full">
        <CardContent className="flex flex-col items-center text-center p-4 min-h-[120px] justify-center">
          <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-[${item.color}]/10 to-[${item.color}]/20 border border-[${item.color}]/20 flex items-center justify-center mb-3 shadow-sm`}>
            <IconComponent
              className={`h-6 w-6 text-[${item.color}]`}
            />
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-base">{item.label}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
} 