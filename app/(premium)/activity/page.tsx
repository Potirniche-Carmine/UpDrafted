"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Users, Calendar, ArrowRight, TrendingUp, Lock, Star } from "lucide-react";
import Link from "next/link";
import { AuthWrapper } from "../../../components/auth-wrapper";
import { generateProfileUrl } from "@/lib/utils";

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
  isPremium: boolean;
  activities?: ActivityItem[];
  insights?: {
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    message: string;
  };
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

// Activity Content Component
function ActivityLogContent() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [insights, setInsights] = useState<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    message: string;
  } | null>(null);
  const [isPremium, setIsPremium] = useState(false);
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

      setIsPremium(data.isPremium);
      
      if (data.isPremium && data.activities) {
        setActivities(data.activities);
        setInsights(null);
      } else if (!data.isPremium && data.insights) {
        setInsights(data.insights);
        setActivities([]);
      }
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
                  <p className="text-2xl font-bold text-foreground">
                    {isPremium ? activities.length : insights?.totalViews || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-[#01ae79]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isPremium ? 'Unique Viewers' : 'This Week'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {isPremium 
                      ? new Set(activities.map(a => a.viewer.id)).size
                      : insights?.viewsThisWeek || 0
                    }
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#01ae79]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isPremium ? 'This Week' : 'Today'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {isPremium 
                      ? activities.filter(a => {
                          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          return new Date(a.createdAt) > weekAgo;
                        }).length
                      : insights?.viewsToday || 0
                    }
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[#01ae79]" />
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
          ) : !isPremium ? (
            /* Free user view - show upgrade prompt */
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {insights?.message || 'Upgrade to see who viewed your profile'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get detailed insights about who&apos;s viewing your profile, when they visited, and more with premium access.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Who Viewed</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">See names and profiles</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">When</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">View timestamps</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  <Star className="mr-2 h-5 w-5" />
                  Upgrade to Premium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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
                      href={generateProfileUrl(activity.viewer.name, activity.viewer.id)}
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

export default function ActivityLogPage() {
  return (
    <AuthWrapper>
      <ActivityLogContent />
    </AuthWrapper>
  );
} 