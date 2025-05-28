"use client";

import React from 'react';
import { RecruiterProfile } from './recruiter-profile';
import type { RecruitingProfileData } from '../lib/base-profile-types';

interface RecruiterProfileWrapperProps {
  data: RecruitingProfileData;
  isOwnProfile?: boolean;
  currentUserRole?: string | null;
}

export function RecruiterProfileWrapper({ data, isOwnProfile = false, currentUserRole }: RecruiterProfileWrapperProps) {
  const handleShowInterest = () => {
    console.log('Show interest in recruiter clicked');
    // TODO: Implement show interest logic
    // This could make an API call to express interest in getting recruited
  };

  const handleConnect = () => {
    console.log('Connect clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <RecruiterProfile
      data={data}
      isOwnProfile={isOwnProfile}
      currentUserRole={currentUserRole}
      onShowInterest={handleShowInterest}
      onConnect={handleConnect}
      onShare={handleShare}
    />
  );
} 