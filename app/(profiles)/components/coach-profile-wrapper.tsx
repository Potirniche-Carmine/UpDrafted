"use client";

import { CoachProfile } from './coach-profile';
import type { CoachProfileData } from '../lib/base-profile-types';

interface CoachProfileWrapperProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
  currentUserRole?: string | null;
}

export function CoachProfileWrapper({ data, isOwnProfile = false, currentUserRole }: CoachProfileWrapperProps) {
  const handleConnect = () => {
    console.log('Connect clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <CoachProfile
      data={data}
      isOwnProfile={isOwnProfile}
      currentUserRole={currentUserRole}
      onConnect={handleConnect}
      onShare={handleShare}
    />
  );
} 