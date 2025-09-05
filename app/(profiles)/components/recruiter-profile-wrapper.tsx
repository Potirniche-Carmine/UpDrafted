"use client";

import React from 'react';
import { RecruiterProfile } from './recruiter/recruiter-profile-main';
import type { RecruiterProfileData } from './recruiter/recruiter-profile-types';

interface RecruiterProfileWrapperProps {
  data: RecruiterProfileData;
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

export function RecruiterProfileWrapper({ 
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
}: RecruiterProfileWrapperProps) {
  // Placeholder handlers – integrate real logic when available
  const handleConnect = () => {};

  return (
    <RecruiterProfile
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