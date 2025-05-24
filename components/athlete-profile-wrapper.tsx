"use client";

import { AthleteProfile } from './athlete-profile';
import type { AthleteProfileData } from './athlete-profile';

interface AthleteProfileWrapperProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
}

export function AthleteProfileWrapper({ data, isOwnProfile = false }: AthleteProfileWrapperProps) {
  const handleConnect = () => {
    console.log('Connect clicked');
    // TODO: Implement connection logic
    // This could make an API call to your backend to create a connection
  };

  return (
    <AthleteProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleConnect}
    />
  );
} 