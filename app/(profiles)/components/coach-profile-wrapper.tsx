"use client";

import { CoachProfile } from './coach/coach-profile-main';
import type { CoachProfileData } from './coach/coach-profile-types';

interface CoachProfileWrapperProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  connectionDirection?: "incoming" | "outgoing" | null;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function CoachProfileWrapper({ 
  data, 
  isOwnProfile = false,
  connectionStatus,
  connectionDirection,
  hasPendingVerification,
  pendingSubmittedAt 
}: CoachProfileWrapperProps) {
  // Placeholder handlers – integrate real logic when available
  const handleConnect = () => {};

  const handleShare = () => {};

  return (
    <CoachProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleConnect}
      onShare={handleShare}
      hasPendingVerification={hasPendingVerification}
      pendingSubmittedAt={pendingSubmittedAt}
      connectionStatus={connectionStatus}
      connectionDirection={connectionDirection}
    />
  );
} 