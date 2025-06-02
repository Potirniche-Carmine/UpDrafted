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
    console.log('Connect clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
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