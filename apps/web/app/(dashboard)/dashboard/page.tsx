"use client";

import { useUser } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bell,
  Compass,
  Eye,
  Info,
  MessageSquare,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import { AuthWrapper } from '../../../components/auth-wrapper';
import { PWAInstallPrompt } from '../../../components/pwa-install-prompt';
import { PremiumLimitsCard } from '@/components/premium-limits-card';
import { useTransferPortalStatus } from '@/hooks/use-transfer-portal-status';
import { VerificationDialog } from '@/app/(profiles)/components/shared/verification-dialog';

interface NavItemWithHref {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: never;
}

interface NavItemWithOnClick {
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  href?: never;
}

type NavItem = NavItemWithHref | NavItemWithOnClick;

const ncaaRules = [
  {
    title: "Contact Periods",
    description: "A college coach may have face-to-face contact with athletes or their parents, watch them compete, visit their high schools, and call or write them."
  },
  {
    title: "Dead Periods",
    description: "No face-to-face contact is allowed. Coaches may not watch athletes compete or visit their high schools during this window."
  },
  {
    title: "Evaluation Periods",
    description: "A coach may watch athletes compete and visit their high schools. Calls and written contact with athletes or parents are allowed."
  },
  {
    title: "Quiet Periods",
    description: "A coach may only have face-to-face contact with athletes or parents on the college's own campus."
  }
];

const getUserContent = (role: string, handleViewProfile: () => void, profileNavigating: boolean = false, communicationLocked = false): {
  primaryNav: NavItem[];
} => {
  const communicationNav: NavItem[] = communicationLocked ? [] : [
    { label: "Connections", href: "/connections", icon: Users },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Activity", href: "/activity", icon: BarChart3 },
  ];

  const baseAthleteNav: NavItem[] = [
    {
      label: profileNavigating ? "Loading..." : "View Profile",
      onClick: handleViewProfile,
      icon: Eye,
    },
    { label: "Discover", href: "/discover", icon: Compass },
    ...communicationNav,
  ];

  const baseCoachNav: NavItem[] = [
    {
      label: profileNavigating ? "Loading..." : "View Profile",
      onClick: handleViewProfile,
      icon: Eye,
    },
    { label: "Discover", href: "/discover", icon: Compass },
    ...communicationNav,
  ];

  switch (role) {
    case 'athlete':
      return { primaryNav: baseAthleteNav };
    case 'coach':
    case 'recruiter':
      return { primaryNav: baseCoachNav };
    case 'admin':
      return {
        primaryNav: [
          { label: "Admin Controls", href: "/admin", icon: Shield },
          { label: "Discover", href: "/discover", icon: Compass },
          { label: "Connections", href: "/connections", icon: Users },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          { label: "Notifications", href: "/notifications", icon: Bell },
          { label: "Activity", href: "/activity", icon: BarChart3 },
        ],
      };
    default:
      return {
        primaryNav: [
          { label: "Discover", href: "/discover", icon: Compass },
        ],
      };
  }
};

export default function DashboardPage() {
  const { navigateToProfile, isNavigating: profileNavigating } = useProfileNavigation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

function DashboardContent({
  handleViewProfile,
  profileNavigating,
}: {
  handleViewProfile: () => Promise<void>;
  profileNavigating: boolean;
}) {
  const { user } = useUser();
  const userRole = (user?.role as string) || 'athlete';
  const { status: transferPortalStatus } = useTransferPortalStatus();
  const [transferPortalDialogOpen, setTransferPortalDialogOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
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

  const userContent = getUserContent(userRole, handleViewProfile, profileNavigating, transferPortalStatus.isCommunicationLocked);

  return (
    <div className="container mx-auto max-w-7xl px-0 md:px-2 space-y-10">
      {/* ============== QUICK NAV ============== */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {userContent.primaryNav.map((item, index) => (
            <NavCard key={index} item={item} profileNavigating={profileNavigating} />
          ))}
        </div>
      </section>

      {/* ============== GRID: LIMITS + NCAA ============== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {transferPortalStatus.isCommunicationLocked && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
              <h3 className="text-lg font-semibold text-amber-950 dark:text-amber-100">
                Transfer portal verification required
              </h3>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                Communication is disabled for NCAA Division I and II athletes until transfer portal verification is approved.
              </p>
              {transferPortalStatus.currentRequestStatus === 'pending' ? (
                <p className="mt-3 text-sm font-medium text-amber-900 dark:text-amber-100">
                  Your request is pending review.
                </p>
              ) : (
                <Button
                  className="mt-4 bg-amber-600 text-white hover:bg-amber-700"
                  onClick={() => setTransferPortalDialogOpen(true)}
                >
                  Submit Transfer Portal Verification
                </Button>
              )}
            </div>
          )}
          <PremiumLimitsCard />
        </div>

        <div className="bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-6 md:p-7 space-y-5">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              NCAA recruiting periods
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Know the rules. Keep eligibility clean.
            </p>
          </div>

          <ul className="space-y-3">
            {ncaaRules.map((rule) => (
              <li
                key={rule.title}
                className="rounded-xl border border-[#01ae79]/15 dark:border-[#01ae79]/20 bg-[#01ae79]/[0.03] dark:bg-[#01ae79]/[0.06] p-4"
              >
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-[#01ae79] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className="w-full border-[#01ae79]/30 text-[#01ae79] hover:bg-[#01ae79]/5 hover:text-[#01ae79] hover:border-[#01ae79]/40"
            onClick={() =>
              window.open(
                'https://www.ncaa.org/sports/2018/5/8/division-i-and-ii-recruiting-calendars.aspx',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Full NCAA rules
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>
      <VerificationDialog
        open={transferPortalDialogOpen}
        onOpenChange={setTransferPortalDialogOpen}
        role="athlete"
        verificationType="transfer_portal"
        onVerificationSubmitted={() => window.location.reload()}
      />
    </div>
  );
}

function NavCard({
  item,
  profileNavigating,
}: {
  item: NavItem;
  profileNavigating: boolean;
}) {
  const IconComponent = item.icon;
  const isViewProfileAction = 'onClick' in item && (item.label.includes("Profile") || item.label.includes("Loading"));
  const shouldDisable = isViewProfileAction && profileNavigating;

  const classes = `group h-full bg-white dark:bg-black rounded-xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 p-4 transition-all ${
    shouldDisable
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:border-[#01ae79]/50 hover:shadow-md hover:shadow-[#01ae79]/10 hover:bg-[#01ae79]/[0.02] cursor-pointer'
  }`;

  const inner = (
    <div className="flex flex-col items-center justify-center text-center h-full gap-3">
      <div
        className={`w-10 h-10 rounded-lg bg-[#01ae79]/10 text-[#01ae79] flex items-center justify-center ${
          profileNavigating && isViewProfileAction ? 'animate-pulse' : ''
        }`}
      >
        <IconComponent className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-[#01ae79] transition-colors">
        {item.label}
      </h3>
    </div>
  );

  if ('onClick' in item) {
    return (
      <button
        type="button"
        className={`${classes} text-left`}
        onClick={shouldDisable ? undefined : item.onClick}
        disabled={shouldDisable}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={item.href} className={classes}>
      {inner}
    </Link>
  );
}
