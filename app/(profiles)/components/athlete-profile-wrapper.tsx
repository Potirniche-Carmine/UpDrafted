"use client";

import { AthleteProfile } from './athlete-profile';
import type { AthleteProfileData } from './athlete-profile';

interface AthleteProfileWrapperProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  connectionDirection?: "incoming" | "outgoing" | null;
  connectionId?: number | null;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
}

export function AthleteProfileWrapper({ 
  data, 
  isOwnProfile = false, 
  connectionStatus,
  connectionDirection,
  connectionId,
  hasPendingVerification,
  pendingSubmittedAt,
  hasRejectedVerification,
  rejectionReason,
  rejectedAt
}: AthleteProfileWrapperProps) {
  const handleConnect = () => {
  };

  return (
    <AthleteProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleConnect}
      hasPendingVerification={hasPendingVerification}
      pendingSubmittedAt={pendingSubmittedAt}
      hasRejectedVerification={hasRejectedVerification}
      rejectionReason={rejectionReason}
      rejectedAt={rejectedAt}
      connectionStatus={connectionStatus}
      connectionDirection={connectionDirection}
      connectionId={connectionId}
    />
  );
} 