"use client";

import React from "react";
import { LevelBanner } from "../shared/level-banner";

interface RecruiterLevelBannerProps {
  division: string;
  conference?: string;
  organizationName: string;
  sportRecruiting: string;
}

export function RecruiterLevelBanner({ 
  division, 
  conference,
  organizationName, 
  sportRecruiting 
}: RecruiterLevelBannerProps) {
  return (
    <LevelBanner
      division={division}
      conference={conference}
      organizationName={organizationName}
      sportActivity={sportRecruiting}
      role="Recruiter"
    />
  );
} 