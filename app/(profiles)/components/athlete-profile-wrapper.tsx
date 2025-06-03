"use client";

import { AthleteProfile } from './athlete-profile';
import type { AthleteProfileData } from './athlete-profile';

interface AthleteProfileWrapperProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function AthleteProfileWrapper({ 
  data, 
  isOwnProfile = false, 
  hasPendingVerification,
  pendingSubmittedAt 
}: AthleteProfileWrapperProps) {
  const handleConnect = () => {
  };

  const handleShare = () => {
  };

  return (
    <AthleteProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleConnect}
      onShare={handleShare}
      hasPendingVerification={hasPendingVerification}
      pendingSubmittedAt={pendingSubmittedAt}
    />
  );
} 