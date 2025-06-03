"use client";

import React from 'react';
import { RecruiterProfile } from './recruiter/recruiter-profile-main';
import type { RecruiterProfileData } from './recruiter/recruiter-profile-types';

interface RecruiterProfileWrapperProps {
  data: RecruiterProfileData;
  isOwnProfile?: boolean;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function RecruiterProfileWrapper({ 
  data, 
  isOwnProfile = false, 
  hasPendingVerification,
  pendingSubmittedAt 
}: RecruiterProfileWrapperProps) {
  const handleShowInterest = () => {
    console.log('Show interest in recruiter clicked');
    // TODO: Implement show interest logic
    // This could make an API call to express interest in getting recruited
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <RecruiterProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleShowInterest}
      onShare={handleShare}
      hasPendingVerification={hasPendingVerification}
      pendingSubmittedAt={pendingSubmittedAt}
    />
  );
} 