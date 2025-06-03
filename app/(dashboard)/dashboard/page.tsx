"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowRight,
  Bell,
  CheckCircle,
  Eye,
  MessageSquare,
  Search,
  UserPlus,
  Users,
  X,
  Target
} from "lucide-react"
import Link from "next/link"
import { useRoleView } from '@/hooks/use-role-view'
import { useProfileNavigation } from '@/hooks/use-profile-navigation'
import { DashboardHeader } from '../components/dashboard-header'
import { AuthWrapper } from '../../../components/auth-wrapper'

// TypeScript interfaces for actions
interface ActionWithHref {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  onClick?: never;
}

interface ActionWithOnClick {
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href?: never;
}

type DashboardAction = ActionWithHref | ActionWithOnClick;

// Mock data - replace with real data from your database
const mockDashboardData = {
  user: {
    name: "Alex Johnson",
    role: "athlete", // This will be overridden by useRoleView
    verified: true,
    email: "alex@example.com",
    id: "user_123"
  },
  connectionRequests: 4,
  unreadMessages: 7,
  notifications: 12,
  pendingConnections: [
    { 
      id: 1,
      name: 'Coach Martinez', 
      title: 'Head Basketball Coach',
      organization: 'UCLA', 
      avatar: '/api/placeholder/40/40',
      requestedAt: '2 hours ago'
    },
    { 
      id: 2,
      name: 'Sarah Johnson', 
      title: 'Sports Recruiter',
      organization: 'Elite Sports Agency', 
      avatar: '/api/placeholder/40/40',
      requestedAt: '5 hours ago'
    },
    { 
      id: 3,
      name: 'Coach Thompson', 
      title: 'Assistant Coach',
      organization: 'Stanford Football', 
      avatar: '/api/placeholder/40/40',
      requestedAt: '1 day ago'
    },
    { 
      id: 4,
      name: 'Mike Rodriguez', 
      title: 'College Athlete',
      organization: 'USC Basketball', 
      avatar: '/api/placeholder/40/40',
      requestedAt: '2 days ago'
    },
  ]
}

const getUserTypeContent = (role: string, userId: string, handleViewProfile: () => void, profileNavigating: boolean = false): {
  welcomeText: string;
  searchText: string;
  searchHref: string;
  primaryActions: DashboardAction[];
  secondaryActions: DashboardAction[];
} => {
  switch (role) {
    case 'athlete':
      return {
        welcomeText: "Continue your recruiting journey",
        searchText: "Discover Schools & Coaches",
        searchHref: "/discover",
        primaryActions: [
          { label: "Discover Schools", href: "/discover", icon: Search, description: "Find your perfect college match" },
          { label: profileNavigating ? "Loading..." : "View Profile", onClick: handleViewProfile, icon: Eye, description: "Check your current profile" },
          { label: "My Connections", href: "/connections", icon: Users, description: "Manage your network" },
          { label: "Check Messages", href: "/messages", icon: MessageSquare, description: "Connect with coaches" }
        ],
        secondaryActions: []
      }
    case 'coach':
      return {
        welcomeText: "Discover and recruit talented athletes",
        searchText: "Discover Athletes",
        searchHref: "/discover",
        primaryActions: [
          { label: "Discover Athletes", href: "/discover", icon: Search, description: "Find top prospects" },
          { label: profileNavigating ? "Loading..." : "View Profile", onClick: handleViewProfile, icon: Eye, description: "Check your current profile" },
          { label: "View Notifications", href: "/notifications", icon: Bell, description: "Stay updated" },
          { label: "Send Messages", href: "/messages", icon: MessageSquare, description: "Connect with prospects" }
        ],
        secondaryActions: []
      }
    case 'recruiter':
      return {
        welcomeText: "Connect athletes with the right opportunities",
        searchText: "Discover Athletes",
        searchHref: "/discover",
        primaryActions: [
          { label: "Discover Athletes", href: "/discover", icon: Search, description: "Find athletes & coaches" },
          { label: profileNavigating ? "Loading..." : "View Profile", onClick: handleViewProfile, icon: Eye, description: "Check your current profile" },
          { label: "Manage Matches", href: "/recruiting/matches", icon: Target, description: "Track connections" },
          { label: "Send Messages", href: "/messages", icon: MessageSquare, description: "Facilitate connections" }
        ],
        secondaryActions: []
      }
    default:
      return {
        welcomeText: "Welcome to your dashboard",
        searchText: "Discover",
        searchHref: "/discover",
        primaryActions: [
          { label: "Discover", href: "/discover", icon: Search, description: "Find what you need" },
          { label: profileNavigating ? "Loading..." : "View Profile", onClick: handleViewProfile, icon: Eye, description: "Check your profile" },
          { label: "Messages", href: "/messages", icon: MessageSquare, description: "Check messages" },
          { label: "Notifications", href: "/notifications", icon: Bell, description: "Stay updated" }
        ],
        secondaryActions: []
      }
  }
}

export default function DashboardPage() {
  const { navigateToProfile, isNavigating: profileNavigating } = useProfileNavigation();
  
  // Scroll to top when dashboard loads (after onboarding)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle profile navigation with proper prefetching
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

// Separate component for dashboard content that runs inside AuthWrapper
function DashboardContent({ 
  handleViewProfile, 
  profileNavigating 
}: { 
  handleViewProfile: () => Promise<void>; 
  profileNavigating: boolean; 
}) {
  const { user } = useUser();
  const { effectiveRole, isAdmin, isViewingAsOtherRole } = useRoleView();

  // Let AuthWrapper handle authentication - only check if we have the user data we need
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

  // Use effectiveRole instead of the hardcoded role
  const userContent = getUserTypeContent(effectiveRole || 'athlete', user.id, handleViewProfile, profileNavigating);

  // Get user display name
  const displayName = user.fullName || user.firstName || user.username || 'User';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30">
            <CardContent className="flex items-center p-4 md:p-6">
              <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-[#01ae79] mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold text-foreground">{mockDashboardData.connectionRequests}</p>
                <p className="text-xs text-muted-foreground">Connection Requests</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30">
            <CardContent className="flex items-center p-4 md:p-6">
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-[#01ae79] mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold text-foreground">{mockDashboardData.unreadMessages}</p>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30">
            <CardContent className="flex items-center p-4 md:p-6">
              <Bell className="h-6 w-6 md:h-8 md:w-8 text-[#01ae79] mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold text-foreground">{mockDashboardData.notifications}</p>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30">
            <CardContent className="flex items-center p-4 md:p-6">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-[#01ae79] mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold text-foreground">42</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveRole === 'athlete' ? 'Profile Views' : 'Connections'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userContent.primaryActions.map((action) => {
                    const IconComponent = action.icon;
                    
                    // Handle both href and onClick actions
                    if (action.onClick) {
                      const isViewProfileAction = action.label.includes("View Profile") || action.label.includes("Loading");
                      const shouldDisable = isViewProfileAction && profileNavigating;
                      
                      return (
                        <Card 
                          key={action.label} 
                          className={`group transition-all duration-300 border-border/50 ${
                            shouldDisable 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:shadow-lg hover:shadow-[#01ae79]/5 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 cursor-pointer'
                          }`} 
                          onClick={shouldDisable ? undefined : action.onClick}
                        >
                          <CardContent className="flex items-center p-4 md:p-6">
                            <IconComponent className={`h-6 w-6 md:h-8 md:w-8 text-[#01ae79] mr-4 flex-shrink-0 transition-colors ${
                              shouldDisable ? '' : 'group-hover:text-[#01ae79]/80'
                            } ${profileNavigating && isViewProfileAction ? 'animate-pulse' : ''}`} />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    
                    return (
                      <Link key={action.label} href={action.href || '#'}>
                        <Card className="group transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 cursor-pointer">
                          <CardContent className="flex items-center p-4 md:p-6">
                            <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-[#01ae79] mr-4 flex-shrink-0 transition-colors group-hover:text-[#01ae79]/80" />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity / Connection Requests */}
          <div>
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-base md:text-lg">Recent Connection Requests</CardTitle>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/20 px-2 py-1 text-sm font-medium">
                      {mockDashboardData.pendingConnections.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDashboardData.pendingConnections.slice(0, 3).map((connection) => (
                  <div key={connection.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10 ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30">
                      <AvatarImage src={connection.avatar} />
                      <AvatarFallback className="text-sm">{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none text-foreground truncate">{connection.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{connection.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{connection.organization}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" className="h-8 w-8 p-0 bg-[#01ae79] hover:bg-[#01ae79]/90">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-border hover:bg-muted">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {mockDashboardData.pendingConnections.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/connections">
                      <Button variant="outline" size="sm" className="border-[#01ae79] text-[#01ae79] hover:bg-[#01ae79] hover:text-white">
                        View All Requests
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
                
                <Separator />
                
                <div className="text-center">
                  <Link href="/connections">
                    <Button variant="outline" className="w-full border-[#01ae79] text-[#01ae79] hover:bg-[#01ae79] hover:text-white">
                      Manage All Connections
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 