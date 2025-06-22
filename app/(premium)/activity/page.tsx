"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Users, Calendar, Crown, ArrowRight, TrendingUp, Lock, Star } from "lucide-react";
import Link from "next/link";
import { AuthWrapper } from "../../../components/auth-wrapper";
import { Protect } from "@clerk/nextjs";

interface ActivityItem {
  id: number;
  action: string;
  createdAt: string;
  metadata?: {
    viewerRole?: string;
    timestamp?: string;
  };
  viewer: {
    id: string;
    name: string;
    profileImage: string | null;
    role: string;
  };
}

interface ActivityResponse {
  success: boolean;
  activities: ActivityItem[];
  requiresUpgrade?: boolean;
  error?: string;
}

// Helper function to get profile image URL
const getProfileImageUrl = (profileImage: string | null): string | null => {
  if (!profileImage || typeof profileImage !== 'string') {
    return null;
  }
  
  const cleanedProfileImage = profileImage.replace('undefined/', '');

  if (cleanedProfileImage.startsWith('http')) {
    return cleanedProfileImage;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
  return `${baseUrl}/${cleanedProfileImage}`;
};

// Helper function to get role badge
const getRoleBadge = (role: string) => {
  const colors = {
    athlete: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700',
    coach: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700',
    recruiter: 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700',
  };

  return (
    <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 border ${colors[role as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-200'} whitespace-nowrap`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

// Helper function to format time ago
const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Placeholder data for demo purposes
const placeholderActivities: ActivityItem[] = [
  {
    id: 1,
    action: 'profile_view',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    viewer: {
      id: 'demo1',
      name: 'Coach Sarah Johnson',
      profileImage: null,
      role: 'coach'
    }
  },
  {
    id: 2,
    action: 'profile_view',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    viewer: {
      id: 'demo2',
      name: 'Recruiter Mike Davis',
      profileImage: null,
      role: 'recruiter'
    }
  },
  {
    id: 3,
    action: 'profile_view',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    viewer: {
      id: 'demo3',
      name: 'Alex Thompson',
      profileImage: null,
      role: 'athlete'
    }
  }
];

// Premium Banner Component
function PremiumBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="max-w-2xl mx-4 border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/90 dark:via-gray-900 dark:to-orange-950/90 shadow-2xl relative">
        {/* X Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Unlock Activity Insights
          </h2>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            See who&apos;s viewing your profile, track engagement metrics, and gain valuable insights into your visibility on the platform.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-amber-200 dark:border-amber-700">
              <Eye className="h-6 w-6 text-amber-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Profile Views</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">See who visited</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-amber-200 dark:border-amber-700">
              <Users className="h-6 w-6 text-amber-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Engagement</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track interactions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-amber-200 dark:border-amber-700">
              <TrendingUp className="h-6 w-6 text-amber-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Analytics</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth insights</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Star className="mr-2 h-5 w-5" />
                Upgrade Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              onClick={onDismiss}
              variant="outline" 
              className="px-8 py-3 text-lg border-2 border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Protected Activity Content
function ActivityLogContent() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data: ActivityResponse = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch activity data');
        return;
      }

      setActivities(data.activities);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    fetchActivityData();
  }, [isLoaded, isSignedIn, fetchActivityData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#01ae79] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center">
            <Eye className="h-6 w-6 text-[#01ae79]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
            <p className="text-muted-foreground">See who&apos;s been viewing your profile</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold text-foreground">{activities.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Viewers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(activities.map(a => a.viewer.id)).size}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground">
                    {activities.filter(a => {
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return new Date(a.createdAt) > weekAgo;
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchActivityData} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No profile views yet</p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Share your profile to start getting views!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={getProfileImageUrl(activity.viewer.profileImage) || undefined} 
                        alt={activity.viewer.name} 
                        className="object-cover" 
                      />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                        {activity.viewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{activity.viewer.name}</p>
                        {getRoleBadge(activity.viewer.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Viewed your profile
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {getTimeAgo(activity.createdAt)}
                    </p>
                    <Link 
                      href={`/profile/${activity.viewer.id}`}
                      className="text-xs text-[#01ae79] hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Demo Content with placeholder data
function DemoActivityContent() {
  const router = useRouter();

  const handleDismissBanner = () => {
    // Navigate back to dashboard instead of just hiding the banner
    router.push('/dashboard');
  };

  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-8 max-w-4xl opacity-30 pointer-events-none">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-[#01ae79]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
              <p className="text-muted-foreground">Premium feature - upgrade to unlock</p>
            </div>
          </div>

          {/* Demo Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">•••</p>
                      <p className="text-2xl font-bold text-foreground">••</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-500/10 dark:bg-gray-500/20 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Activity List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Recent Activity (Preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {placeholderActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                        {activity.viewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{activity.viewer.name}</p>
                        {getRoleBadge(activity.viewer.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Viewed your profile
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {getTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Premium Banner Overlay */}
      <PremiumBanner onDismiss={handleDismissBanner} />
    </div>
  );
}

export default function ActivityLogPage() {
  return (
    <AuthWrapper>
      <Protect
        feature="activity"
        fallback={<DemoActivityContent />}
      >
        <ActivityLogContent />
      </Protect>
    </AuthWrapper>
  );
} 