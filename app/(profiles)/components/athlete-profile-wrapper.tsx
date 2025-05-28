"use client";

import { AthleteProfile } from './athlete-profile';
import type { AthleteProfileData } from './athlete-profile';

interface AthleteProfileWrapperProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  currentUserRole?: string | null;
}

export function AthleteProfileWrapper({ data, isOwnProfile = false, currentUserRole }: AthleteProfileWrapperProps) {
  const handleConnect = () => {
    console.log('Connect clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <AthleteProfile
      data={data}
      isOwnProfile={isOwnProfile}
      currentUserRole={currentUserRole}
      onConnect={handleConnect}
      onShare={handleShare}
    />
  );
} 