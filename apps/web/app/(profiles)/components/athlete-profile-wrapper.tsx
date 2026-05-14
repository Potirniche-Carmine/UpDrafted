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
  transferPortalStatus?: {
    isD1D2Athlete: boolean;
    hasApprovedTransferPortalVerification: boolean;
    isCommunicationLocked: boolean;
    currentRequestStatus: 'pending' | 'approved' | 'rejected' | null;
  };
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
  rejectedAt,
  transferPortalStatus
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
      transferPortalStatus={transferPortalStatus}
      connectionStatus={connectionStatus}
      connectionDirection={connectionDirection}
      connectionId={connectionId}
    />
  );
} 
