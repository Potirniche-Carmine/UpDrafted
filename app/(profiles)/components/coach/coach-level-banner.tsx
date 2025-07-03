"use client";

import React from "react";
import { LevelBanner } from "../shared/level-banner";

interface CoachLevelBannerProps {
  division: string;
  conference?: string;
  organizationName: string;
  sportCoaching: string;
}

export function CoachLevelBanner({ 
  division, 
  conference,
  organizationName, 
  sportCoaching 
}: CoachLevelBannerProps) {
  return (
    <LevelBanner
      division={division}
      conference={conference}
      organizationName={organizationName}
      sportActivity={sportCoaching}
      role="Coach"
    />
  );
} 