"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  Target
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

const getUserTypeContent = (role: string, userId: string) => {
  switch (role) {
    case 'athlete':
      return {
        welcomeText: "Continue your recruiting journey",
        searchText: "Find Coaches & Recruiters",
        searchHref: "/search?type=coaches",
        primaryActions: [
          { label: "Find Coaches", href: "/search?type=coaches", icon: Search, description: "Discover college programs" },
          { label: "Update Profile", href: `/profile/${userId}`, icon: Edit3, description: "Keep profile current" },
          { label: "My Connections", href: "/connections", icon: Users, description: "Manage your network" },
          { label: "Check Messages", href: "/messaging", icon: MessageSquare, description: "Connect with coaches" },
        ],
        secondaryActions: []
      }
    case 'coach':
      return {
        welcomeText: "Discover and recruit talented athletes",
        searchText: "Find Athletes",
        searchHref: "/search?type=athletes",
        primaryActions: [
          { label: "Scout Athletes", href: "/search?type=athletes", icon: Search, description: "Find top prospects" },
          { label: "Update Profile", href: `/profile/${userId}`, icon: Edit3, description: "Keep profile current" },
          { label: "View Notifications", href: "/notifications", icon: Bell, description: "Stay updated" },
          { label: "Send Messages", href: "/messaging", icon: MessageSquare, description: "Connect with prospects" },
        ],
        secondaryActions: []
      }
    case 'recruiter':
      return {
        welcomeText: "Connect athletes with the right opportunities",
        searchText: "Find Athletes & Coaches",
        searchHref: "/search?type=athletes",
        primaryActions: [
          { label: "Search Database", href: "/search?type=athletes", icon: Search, description: "Find athletes & coaches" },
          { label: "Update Profile", href: `/profile/${userId}`, icon: Edit3, description: "Keep profile current" },
          { label: "Manage Matches", href: "/recruiting/matches", icon: Target, description: "Track connections" },
          { label: "Send Messages", href: "/messaging", icon: MessageSquare, description: "Facilitate connections" },
        ],
        secondaryActions: []
      }
    default:
      return {
        welcomeText: "Welcome to your dashboard",
        searchText: "Search",
        searchHref: "/search",
        primaryActions: [
          { label: "Search", href: "/search", icon: Search, description: "Find what you need" },
          { label: "View Profile", href: `/profile/${userId}`, icon: Eye, description: "Check your profile" },
          { label: "Messages", href: "/messaging", icon: MessageSquare, description: "Check messages" },
          { label: "Notifications", href: "/notifications", icon: Bell, description: "Stay updated" },
        ],
        secondaryActions: []
      }
  }
}

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { effectiveRole, isAdmin, isViewingAsOtherRole, isVerified } = useRoleView();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    console.log('Dialog state changed:', { showVerificationDialog, effectiveRole, isVerified });
  }, [showVerificationDialog, effectiveRole, isVerified]);

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

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}!</h1>
            <p className="text-muted-foreground">{userContent.welcomeText}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href={`/profile/${user.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View My Profile
              </Button>
            </Link>
            <Link href={userContent.searchHref} className="flex-1">
              <Button size="sm" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                <span className="truncate">{userContent.searchText}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification Status */}
        {!isVerified && (
          <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <ShieldX className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Your account is not verified. Get verified to unlock all features and build trust with {getVerificationMessage(effectiveRole || 'athlete')}.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950 self-start sm:self-auto"
                  onClick={handleGetVerified}
                >
                  Get Verified
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/connections?tab=requests">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border hover:border-green-200 dark:hover:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Connections</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockDashboardData.connectionRequests}</div>
                <p className="text-xs text-muted-foreground">Awaiting your response</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/messaging">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border hover:border-green-200 dark:hover:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockDashboardData.unreadMessages}</div>
                <p className="text-xs text-muted-foreground">
                  {mockDashboardData.unreadMessages > 0 ? 'New messages waiting' : 'All caught up!'}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notifications">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border hover:border-green-200 dark:hover:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockDashboardData.notifications}</div>
                <p className="text-xs text-muted-foreground">Updates and alerts</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="flex flex-col lg:grid lg:gap-6 lg:grid-cols-3 space-y-6 lg:space-y-0">
          {/* Pending Connections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Connection Requests
                    {mockDashboardData.connectionRequests > 0 && (
                      <Badge variant="secondary">
                        {mockDashboardData.connectionRequests}
                      </Badge>
                    )}
                  </div>
                  <Link href="/connections?tab=requests">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDashboardData.pendingConnections.length > 0 ? (
                  mockDashboardData.pendingConnections.slice(0, 4).map((connection, index) => (
                    <div key={connection.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={connection.avatar} alt={connection.name} />
                          <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium truncate">{connection.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {connection.title} • {connection.organization}
                          </p>
                          <p className="text-xs text-muted-foreground">{connection.requestedAt}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" className="h-8 text-xs">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                      {index < mockDashboardData.pendingConnections.slice(0, 4).length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No pending connection requests</p>
                    <p className="text-xs">New requests will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Actions - Bigger with descriptions */}
                <div className="space-y-3">
                  {userContent.primaryActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button 
                        className={`w-full h-auto p-5 justify-start transition-all duration-200 hover:scale-[1.02] ${
                          index % 2 === 0 
                            ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400 dark:bg-green-900/60 dark:border-green-700 dark:text-green-100 dark:hover:bg-green-800/70 dark:hover:border-green-600'
                            : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 dark:bg-green-950/20 dark:border-green-800/40 dark:text-green-300 dark:hover:bg-green-900/30 dark:hover:border-green-700/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs opacity-75 mt-0.5 leading-relaxed">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        role={(effectiveRole === 'coach' || effectiveRole === 'recruiter') ? effectiveRole : 'coach'}
      />
    </div>
  )
} 