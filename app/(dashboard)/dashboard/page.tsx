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

// Mock data for profile completion - in real app, fetch from API
const mockAthleteProfileCompletion = {
  overall: 65,
  categories: {
    basic: 85,
    academic: 60,
    athletic: 45,
    media: 30,
    social: 80
  },
  nextSteps: [
    { field: 'measurables', label: 'Athletic Measurables', weight: 8 },
    { field: 'personalStatement', label: 'Personal Statement', weight: 10 },
    { field: 'hudlUrl', label: 'Hudl Highlights', weight: 5 }
  ]
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
  
  useEffect(() => {
    console.log('Dialog state changed:', { showVerificationDialog, effectiveRole, isVerified });
  }, [showVerificationDialog, effectiveRole, isVerified]);

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
      <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
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

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
            <p className="text-muted-foreground mt-1">{userContent.welcomeText}</p>
          </div>
          
          <div className="flex gap-3">
            <Link href={userContent.searchHref}>
              <Button size="lg" className="gap-2">
                <Search className="w-4 h-4" />
                {userContent.searchText}
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Widget - Only for athletes */}
        {effectiveRole === 'athlete' && (
          <Card className="border-[#01ae79]/20 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:border-[#01ae79]/30 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full">
                    <TrendingUp className="w-5 h-5 text-[#01ae79]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profile Strength</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={mockAthleteProfileCompletion.overall} className="w-32 h-2" />
                      <span className="text-2xl font-bold text-[#01ae79]">{mockAthleteProfileCompletion.overall}%</span>
                      <Badge variant={mockAthleteProfileCompletion.overall >= 70 ? "default" : "secondary"} className={mockAthleteProfileCompletion.overall >= 70 ? 'bg-[#01ae79] hover:bg-[#01ae79]/90 text-white' : ''}>
                        {mockAthleteProfileCompletion.overall >= 85 ? 'Excellent' : 
                         mockAthleteProfileCompletion.overall >= 70 ? 'Good' : 
                         mockAthleteProfileCompletion.overall >= 50 ? 'Getting Started' : 'Needs Work'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-[#01ae79] text-[#01ae79] hover:bg-[#01ae79] hover:text-white"
                  onClick={() => {
                    if (user?.id) {
                      window.location.href = `/profile/${user.id}`;
                    }
                  }}
                >
                  View Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAthleteProfileCompletion.overall < 85 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {mockAthleteProfileCompletion.overall >= 70 
                        ? "Great profile! Add a few more details to maximize your opportunities."
                        : mockAthleteProfileCompletion.overall >= 50
                        ? "You're on the right track! Complete more sections to stand out."
                        : "Your profile needs more information to attract coaches."
                      }
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#01ae79]" />
                        Quick wins to boost your profile:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {mockAthleteProfileCompletion.nextSteps.map((step) => (
                          <div key={step.field} className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 border border-[#01ae79]/20">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{step.label}</span>
                              <Badge variant="outline" className="text-xs border-[#01ae79]/30 text-[#01ae79]">+{step.weight}pts</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Alert */}
        {!isVerified && (
          <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <ShieldX className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700 dark:text-orange-200">
              <div className="flex items-center justify-between">
                <span>Get verified to build trust with {getVerificationMessage(effectiveRole || 'athlete')} and unlock premium features.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900"
                  onClick={handleGetVerified}
                >
                  Get Verified
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="flex items-center p-4 md:p-6">
              <UserPlus className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{mockDashboardData.connectionRequests}</p>
                <p className="text-xs text-muted-foreground">Connection Requests</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4 md:p-6">
              <MessageSquare className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{mockDashboardData.unreadMessages}</p>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4 md:p-6">
              <Bell className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{mockDashboardData.notifications}</p>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4 md:p-6">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">42</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveRole === 'athlete' ? 'Profile Views' : 'Connections'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userContent.primaryActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <Link key={action.label} href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/20">
                          <CardContent className="flex items-center p-4">
                            <IconComponent className="h-8 w-8 text-primary mr-4" />
                            <div>
                              <h3 className="font-semibold">{action.label}</h3>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Connection Requests
                  <Badge variant="secondary">{mockDashboardData.pendingConnections.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDashboardData.pendingConnections.slice(0, 3).map((connection) => (
                  <div key={connection.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={connection.avatar} />
                      <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">{connection.title}</p>
                      <p className="text-xs text-muted-foreground">{connection.organization}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" className="h-7 w-7 p-0">
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {mockDashboardData.pendingConnections.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/connections">
                      <Button variant="outline" size="sm">
                        View All Requests
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
                
                <Separator />
                
                <div className="text-center">
                  <Link href="/connections">
                    <Button variant="outline" className="w-full">
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