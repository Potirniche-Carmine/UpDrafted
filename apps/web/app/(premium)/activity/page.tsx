"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Users, ArrowRight, TrendingUp, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { AuthWrapper } from "../../../components/auth-wrapper";
import { generateProfileUrl } from "@/lib/utils";
import { getProfileImageUrl } from "@/lib/profile-images";
import type { TransferPortalCommunicationStatus } from "@/hooks/use-transfer-portal-status";

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
  transferPortalStatus?: TransferPortalCommunicationStatus;
  error?: string;
}

const getRoleLabel = (role: string) => {
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium px-2 py-0 bg-[#01ae79]/5 text-[#01ae79] border-[#01ae79]/30 whitespace-nowrap"
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

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

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {loading ? '—' : value}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityLogContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const [transferPortalStatus, setTransferPortalStatus] = useState<TransferPortalCommunicationStatus | null>(null);
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

  const isFetching = useRef(false);
  const hasInitialized = useRef(false);

  const fetchActivityData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const response = await fetch('/api/activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data: ActivityResponse = await response.json();
      setTransferPortalStatus(data.transferPortalStatus ?? null);

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
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasInitialized.current) return;
    hasInitialized.current = true;
    fetchActivityData();
  }, [isLoaded, isSignedIn, fetchActivityData]);

  if (transferPortalStatus?.isCommunicationLocked) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/20">
          <Lock className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-4 text-xl font-semibold text-amber-950 dark:text-amber-100">Activity unavailable</h1>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            Communication is disabled for NCAA Division I and II athletes until transfer portal verification is approved.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex">
            <Button className="bg-amber-600 text-white hover:bg-amber-700">Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#01ae79] border-r-transparent" />
      </div>
    );
  }

  const totalViewsValue = isPremium ? activities.length : (insights?.totalViews ?? 0);
  const secondaryLabel = isPremium ? 'Unique viewers' : 'This week';
  const secondaryValue = isPremium
    ? new Set(activities.map((a) => a.viewer.id)).size
    : insights?.viewsThisWeek ?? 0;
  const tertiaryLabel = isPremium ? 'This week' : 'Today';
  const tertiaryValue = isPremium
    ? activities.filter((a) => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(a.createdAt) > weekAgo;
      }).length
    : insights?.viewsToday ?? 0;

  return (
    <div className="container mx-auto max-w-5xl px-0 md:px-2 space-y-8">
      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Profile views"
          value={totalViewsValue}
          icon={<Eye className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          label={secondaryLabel}
          value={secondaryValue}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          label={tertiaryLabel}
          value={tertiaryValue}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={loading}
        />
      </section>

      {/* Activity list / upgrade prompt */}
      <section className="bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25">
        <div className="px-6 py-5 border-b border-[#01ae79]/20 dark:border-[#01ae79]/25">
          <h2 className="text-xl font-semibold tracking-tight">Recent activity</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isPremium ? 'Full history of profile visits' : 'Aggregate view counts'}
          </p>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchActivityData} variant="outline">
                Try again
              </Button>
            </div>
          ) : !isPremium ? (
            <div className="text-center py-10 md:py-12">
              <div className="w-14 h-14 rounded-2xl bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center mx-auto mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
                {insights?.message || 'Unlock who viewed your profile'}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Upgrade to Premium to see names, roles, and timestamps — and follow up with the coaches actually watching you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6 text-left">
                <div className="rounded-xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    See who viewed
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Names and profile links
                  </p>
                </div>
                <div className="rounded-xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    See when
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Precise view timestamps
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-[#01ae79] hover:bg-[#018a60] text-white font-semibold h-11 px-6">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground">No profile views yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share your profile to start getting views.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <Link
                    href={generateProfileUrl(activity.viewer.name, activity.viewer.id)}
                    className="flex items-center gap-4 rounded-xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 px-4 py-3 hover:border-[#01ae79]/40 hover:bg-[#01ae79]/[0.02] transition-colors group"
                  >
                    <Avatar className="w-11 h-11 shrink-0">
                      <AvatarImage
                        src={getProfileImageUrl(activity.viewer.profileImage) || undefined}
                        alt={activity.viewer.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs font-semibold bg-[#01ae79]/10 text-[#01ae79]">
                        {activity.viewer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground group-hover:text-[#01ae79] transition-colors truncate">
                          {activity.viewer.name}
                        </p>
                        {getRoleLabel(activity.viewer.role)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Viewed your profile
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.createdAt)}
                      </p>
                      <ArrowRight className="h-4 w-4 ml-auto mt-1 text-muted-foreground/50 group-hover:text-[#01ae79] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
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
