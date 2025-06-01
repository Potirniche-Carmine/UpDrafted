"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Search, 
  UserPlus, 
  CheckCircle,
  X,
  ShieldX,
  Edit3,
  Eye,
  ArrowRight,
  Target,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { useRoleView } from '@/hooks/use-role-view'
import { VerificationDialog } from '@/app/(profiles)/components/shared/verification-dialog'
import { useProfileCompletion } from '@/app/(profiles)/lib/use-profile-completion'
import { type ProfileCompletion } from '@/app/(profiles)/lib/profile-completion'

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

// Mobile-friendly ProfileCompletionBanner component
const MobileProfileCompletionBanner = ({ completion }: { completion: ProfileCompletion }) => {
  const getProfileStrengthLabel = (percentage: number) => {
    if (percentage >= 85) {
      return { description: 'Your profile is comprehensive and attractive to coaches!' };
    } else if (percentage >= 70) {
      return { description: 'Good profile! Add a few more details to maximize your opportunities.' };
    } else if (percentage >= 50) {
      return { description: 'You\'re on the right track! Complete more sections to stand out.' };
    } else {
      return { description: 'Your profile needs more information to attract coaches.' };
    }
  };

  const strengthInfo = getProfileStrengthLabel(completion.overall);

  if (completion.overall >= 90) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Profile Complete!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your profile is comprehensive and ready to attract coaches.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold text-green-600">{completion.overall}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#01ae79]/20 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:border-[#01ae79]/30 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#01ae79]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">Profile Strength</h3>
              <p className="text-sm text-muted-foreground hidden sm:block">{strengthInfo.description}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold text-[#01ae79]">{completion.overall}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={completion.overall} className="w-full h-2" />
            <p className="text-sm text-muted-foreground block sm:hidden">{strengthInfo.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getUserTypeContent = (role: string, userId: string) => {
  switch (role) {
    case 'athlete':
      return {
        welcomeText: "Continue your recruiting journey",
        searchText: "Discover Schools & Coaches",
        searchHref: "/discover",
        primaryActions: [
          { label: "Discover Schools", href: "/discover", icon: Search, description: "Find your perfect college match" },
          { label: "Update Profile", href: `/profile/${userId}`, icon: Edit3, description: "Keep profile current" },
          { label: "My Connections", href: "/connections", icon: Users, description: "Manage your network" },
          { label: "Check Messages", href: "/messaging", icon: MessageSquare, description: "Connect with coaches" },
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
          { label: "Update Profile", href: `/profile/${userId}`, icon: Edit3, description: "Keep profile current" },
          { label: "View Notifications", href: "/notifications", icon: Bell, description: "Stay updated" },
          { label: "Send Messages", href: "/messaging", icon: MessageSquare, description: "Connect with prospects" },
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
          { label: "Update Profile", href: `/profile/${userId}`, icon: Edit3, description: "Keep profile current" },
          { label: "Manage Matches", href: "/recruiting/matches", icon: Target, description: "Track connections" },
          { label: "Send Messages", href: "/messaging", icon: MessageSquare, description: "Facilitate connections" },
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
          { label: "View Profile", href: `/profile/${userId}`, icon: Eye, description: "Check your profile" },
          { label: "Messages", href: "/messaging", icon: MessageSquare, description: "Check messages" },
          { label: "Notifications", href: "/notifications", icon: Bell, description: "Stay updated" },
        ],
        secondaryActions: []
      }
  }
}

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { effectiveRole, isAdmin, isViewingAsOtherRole, isVerified } = useRoleView();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  // Scroll to top when dashboard loads (after onboarding)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Fetch profile completion data using the reusable hook
  const { completion, loading: completionLoading, invalidateCache, refresh } = useProfileCompletion(
    user?.id, 
    effectiveRole as 'athlete' | 'coach' | 'recruiter' | null
  );
  
  useEffect(() => {
    console.log('Dialog state changed:', { showVerificationDialog, effectiveRole, isVerified });
  }, [showVerificationDialog, effectiveRole, isVerified]);

  // Test function to simulate profile update (for testing cache invalidation)
  const handleTestCacheInvalidation = () => {
    console.log('Invalidating profile completion cache...');
    invalidateCache();
    refresh(); // Force a refresh to see the updated data
  };

  // Show loading while auth state is being determined
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn || !user) {
    return <div>Loading...</div>;
  }

  // Use effectiveRole instead of the hardcoded role
  const userContent = getUserTypeContent(effectiveRole || 'athlete', user.id);

  // Get user display name
  const displayName = user.fullName || user.firstName || user.username || 'User';

  // Only use real completion data, don't fall back to fake data
  const profileCompletion = completion;

  // Update verification message based on effective role
  const getVerificationMessage = (role: string) => {
    switch (role) {
      case 'athlete':
        return 'coaches and recruiters';
      case 'coach':
        return 'athletes and recruiters';
      case 'recruiter':
        return 'coaches and athletes';
      default:
        return 'other users';
    }
  };

  // Handle verification button click
  const handleGetVerified = () => {
    console.log('Get Verified clicked', { effectiveRole, showVerificationDialog });
    if (effectiveRole === 'coach' || effectiveRole === 'recruiter') {
      console.log('Opening verification dialog for', effectiveRole);
      setShowVerificationDialog(true);
    } else {
      // For athletes, you might want to navigate to a different verification flow
      console.log('Athlete verification flow not implemented yet - current role:', effectiveRole);
      // For now, let's allow athletes to see the dialog too for testing
      setShowVerificationDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
        {/* Admin View Indicator */}
        {isAdmin && isViewingAsOtherRole && (
          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <Eye className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-200">
              <div className="flex items-center justify-between">
                <span>Admin Mode: You are viewing the dashboard as a <strong>{effectiveRole}</strong>. Use the role switcher to change perspectives.</span>
                <Badge variant="outline" className="ml-2">
                  {isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {displayName}!</h1>
              <p className="text-muted-foreground text-sm md:text-base">{userContent.welcomeText}</p>
            </div>
            
            <div className="flex gap-3">
              <Link href={userContent.searchHref}>
                <Button className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white gap-2">
                  <Search className="w-4 h-4" />
                  {userContent.searchText}
                </Button>
              </Link>
              
              {/* Debug button for testing cache invalidation - only in development */}
              {process.env.NODE_ENV === 'development' && effectiveRole === 'athlete' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTestCacheInvalidation}
                  className="text-xs"
                >
                  🔄 Test Cache
                </Button>
              )}
            </div>
          </div>

          {/* Profile Completion Widget - Only for athletes and only when we have real data */}
          {effectiveRole === 'athlete' && !completionLoading && profileCompletion && (
            <MobileProfileCompletionBanner completion={profileCompletion} />
          )}

          {/* Loading state for profile completion - Only show for athletes */}
          {effectiveRole === 'athlete' && completionLoading && (
            <Card className="border-[#01ae79]/20 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:border-[#01ae79]/30 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#01ae79] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Profile Strength</h3>
                    <p className="text-sm text-muted-foreground">Calculating your profile completion...</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-6 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Alert */}
          {!isVerified && (
            <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
              <ShieldX className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 dark:text-orange-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>Get verified to build trust with {getVerificationMessage(effectiveRole || 'athlete')} and unlock premium features.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900 self-start sm:self-auto"
                    onClick={handleGetVerified}
                  >
                    Get Verified
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

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
                    return (
                      <Link key={action.label} href={action.href}>
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

        {/* Verification Dialog */}
        <VerificationDialog 
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          role={(effectiveRole === 'coach' || effectiveRole === 'recruiter') ? effectiveRole : 'coach'}
        />
      </div>
    </div>
  );
} 