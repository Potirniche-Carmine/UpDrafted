"use client";

import { CoachProfile } from './coach-profile';
import type { CoachProfileData } from './coach-profile';

interface CoachProfileWrapperProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
}

export function CoachProfileWrapper({ data, isOwnProfile = false }: CoachProfileWrapperProps) {
  const handleShowInterest = () => {
    console.log('Show interest in coach clicked');
    // TODO: Implement show interest logic
    // This could make an API call to express interest in the coaching program
  };

  return (
    <CoachProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onShowInterest={handleShowInterest}
    />
  );
} 