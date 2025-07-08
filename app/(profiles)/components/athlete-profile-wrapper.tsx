"use client";

import { AthleteProfile } from './athlete-profile';
import type { AthleteProfileData } from './athlete-profile';

interface AthleteProfileWrapperProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  connectionDirection?: "incoming" | "outgoing" | null;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
  // Transfer Portal Verification Status
  hasPendingTransferPortalVerification?: boolean;
  transferPortalPendingSubmittedAt?: string;
  hasRejectedTransferPortalVerification?: boolean;
  transferPortalRejectionReason?: string;
  transferPortalRejectedAt?: string;
}

export function AthleteProfileWrapper({ 
  data, 
  isOwnProfile = false, 
  connectionStatus,
  connectionDirection,
  hasPendingVerification,
  pendingSubmittedAt,
  hasRejectedVerification,
  rejectionReason,
  rejectedAt,
  hasPendingTransferPortalVerification,
  transferPortalPendingSubmittedAt,
  hasRejectedTransferPortalVerification,
  transferPortalRejectionReason,
  transferPortalRejectedAt
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
      hasRejectedVerification={hasRejectedVerification}
      rejectionReason={rejectionReason}
      rejectedAt={rejectedAt}
      hasPendingTransferPortalVerification={hasPendingTransferPortalVerification}
      transferPortalPendingSubmittedAt={transferPortalPendingSubmittedAt}
      hasRejectedTransferPortalVerification={hasRejectedTransferPortalVerification}
      transferPortalRejectionReason={transferPortalRejectionReason}
      transferPortalRejectedAt={transferPortalRejectedAt}
      connectionStatus={connectionStatus}
      connectionDirection={connectionDirection}
    />
  );
} 