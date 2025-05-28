"use client";

import React from 'react';
import { RecruiterProfile } from './recruiter-profile';
import { RecruitingProfileData } from '../lib/base-profile-types';

interface RecruiterProfileWrapperProps {
  data: RecruitingProfileData;
  isOwnProfile?: boolean;
}

export function RecruiterProfileWrapper({ data, isOwnProfile = false }: RecruiterProfileWrapperProps) {
  const handleShowInterest = () => {
    console.log('Show interest in recruiter clicked');
    // TODO: Implement show interest logic
    // This could make an API call to express interest in getting recruited
  };

  return (
    <RecruiterProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onShowInterest={handleShowInterest}
    />
  );
} 