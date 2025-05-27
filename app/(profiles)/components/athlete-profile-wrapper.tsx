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
  };

  return (
    <AthleteProfile
      data={data}
      isOwnProfile={isOwnProfile}
      onConnect={handleConnect}
    />
  );
} 