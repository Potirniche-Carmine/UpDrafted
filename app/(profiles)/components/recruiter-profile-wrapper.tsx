"use client";

import React from 'react';
import { RecruiterProfile } from './recruiter/recruiter-profile-main';
import type { RecruiterProfileData } from './recruiter/recruiter-profile-types';

interface RecruiterProfileWrapperProps {
  data: RecruiterProfileData;
  isOwnProfile?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  connectionDirection?: "incoming" | "outgoing" | null;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
}

export function RecruiterProfileWrapper({ 
  data, 
  isOwnProfile = false,
  connectionStatus,
  connectionDirection,
  hasPendingVerification,
  pendingSubmittedAt,
  hasRejectedVerification,
  rejectionReason,
  rejectedAt
}: RecruiterProfileWrapperProps) {
  // Placeholder handlers – integrate real logic when available
  const handleConnect = () => {};

  const handleShare = () => {};

  return (
    <RecruiterProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleConnect}
      onShare={handleShare}
      hasPendingVerification={hasPendingVerification}
      pendingSubmittedAt={pendingSubmittedAt}
      hasRejectedVerification={hasRejectedVerification}
      rejectionReason={rejectionReason}
      rejectedAt={rejectedAt}
      connectionStatus={connectionStatus}
      connectionDirection={connectionDirection}
    />
  );
} 