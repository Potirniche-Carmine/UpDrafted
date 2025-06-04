"use client";

import { CoachProfile } from './coach/coach-profile-main';
import type { CoachProfileData } from './coach/coach-profile-types';

interface CoachProfileWrapperProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function CoachProfileWrapper({ 
  data, 
  isOwnProfile = false,
  connectionStatus,
  hasPendingVerification,
  pendingSubmittedAt 
}: CoachProfileWrapperProps) {
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
      onConnect={handleConnect}
      onShare={handleShare}
      hasPendingVerification={hasPendingVerification}
      pendingSubmittedAt={pendingSubmittedAt}
      connectionStatus={connectionStatus}
    />
  );
} 