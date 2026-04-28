"use client";

import Link from "next/link";
import { useRoleView } from "@/hooks/use-role-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import type { AthleteProfile, CoachProfile, RecruitingProfile } from "@/database/schema";

interface DemoProfiles {
  athlete: AthleteProfile | null;
  coach: CoachProfile | null;
  recruiter: RecruitingProfile | null;
}

export function AdminRoleSwitcher() {
  const {
    isAdmin,
    viewingAs,
    verificationStatus,
    loading,
    setViewingAs,
    setVerificationStatus
  } = useRoleView();



  const [demoProfiles, setDemoProfiles] = useState<DemoProfiles>({
    athlete: null,
    coach: null,
    recruiter: null
  });
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const hasFetchedProfiles = useRef(false);

  useEffect(() => {
    const fetchDemoProfiles = async () => {
      if (!isAdmin || hasFetchedProfiles.current) return;

      hasFetchedProfiles.current = true;

      try {

        const response = await fetch('/api/admin/demo-profiles', {
          headers: {
            'Accept': 'application/json',
          }
        });
        if (response.ok) {
          const { profiles } = await response.json();
          setDemoProfiles(profiles);
        }
      } catch (error) {
        console.error('Failed to fetch demo profiles:', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    if (isAdmin && !hasFetchedProfiles.current) {
      fetchDemoProfiles();
    } else if (!isAdmin) {
      setLoadingProfiles(false);
      hasFetchedProfiles.current = false; // Reset for when user becomes admin
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  if (loading || loadingProfiles) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Controls</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleRoleSwitch = (role: 'athlete' | 'coach' | 'recruiter' | null) => {
    setViewingAs(role);
  };

  const handleVerificationToggle = (checked: boolean) => {
    setVerificationStatus(checked);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Admin Controls
          <Badge variant="destructive">ADMIN</Badge>
        </CardTitle>
        <CardDescription>
          Switch between role views and manage demo profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Current View:</div>
          <Badge variant={viewingAs ? "default" : "secondary"}>
            {viewingAs ? `Viewing as ${viewingAs}` : "Admin view"}
          </Badge>
        </div>

        {/* Role Switching */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Switch Role View:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={viewingAs === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch(null)}
            >
              Admin
            </Button>
            <Button
              variant={viewingAs === 'athlete' ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch('athlete')}
              disabled={!demoProfiles.athlete}
            >
              Athlete
              {!demoProfiles.athlete && <span className="text-xs ml-1">(No Demo)</span>}
            </Button>
            <Button
              variant={viewingAs === 'coach' ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch('coach')}
              disabled={!demoProfiles.coach}
            >
              Coach
              {!demoProfiles.coach && <span className="text-xs ml-1">(No Demo)</span>}
            </Button>
            <Button
              variant={viewingAs === 'recruiter' ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch('recruiter')}
              disabled={!demoProfiles.recruiter}
            >
              Recruiter
              {!demoProfiles.recruiter && <span className="text-xs ml-1">(No Demo)</span>}
            </Button>
          </div>
        </div>

        {/* Verification Override */}
        <div className="flex items-center space-x-2">
          <Switch
            id="verification-override"
            checked={verificationStatus}
            onCheckedChange={handleVerificationToggle}
          />
          <Label htmlFor="verification-override" className="text-sm">
            Override Verification Status
          </Label>
        </div>

        {/* Demo Profile Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Demo Profiles Status:</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span>Athlete:</span>
              <Badge variant={demoProfiles.athlete ? "default" : "secondary"}>
                {demoProfiles.athlete ? "Created" : "Not Created"}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Coach:</span>
              <Badge variant={demoProfiles.coach ? "default" : "secondary"}>
                {demoProfiles.coach ? "Created" : "Not Created"}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Recruiter:</span>
              <Badge variant={demoProfiles.recruiter ? "default" : "secondary"}>
                {demoProfiles.recruiter ? "Created" : "Not Created"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Create or replace demo profiles through onboarding while signed in as admin.
          </p>
          <Button asChild className="w-full">
            <Link href="/onboarding">Create demo profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
