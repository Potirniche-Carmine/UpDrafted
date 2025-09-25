"use client";

import { useCallback } from "react";
import { useRouter } from 'next/navigation';

interface DiscoverUser {
  id: string;
  fullName: string;
  organizationName: string;
  profileImage: string | null;
  city: string;
  state: string;
  country?: string;
  isVerified: boolean;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  title?: string;
  division?: string;
  educationLevel?: string;
  hasPendingRequest: boolean;
  hasIncomingRequest: boolean;
  graduationYear?: number;
  height?: string;
  weight?: string;
  positions?: string[];
  recruitingNeeds?: {
    studentClassifications: string[];
    positions: string[];
    scholarshipsAvailable: number | null;
  } | null;
}

interface UseProfileNavigationProps {
  allUsers: DiscoverUser[];
  saveSearchState: () => void;
}

export const useProfileNavigation = ({ allUsers, saveSearchState }: UseProfileNavigationProps) => {
  const router = useRouter();

  // Generate profile URL with slug
  const generateProfileUrl = useCallback((user: DiscoverUser) => {
    if (user.fullName) {
      const slug = user.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return `/profile/${slug}/${user.id}`;
    }
    // Fallback to old format if no fullName
    return `/profile/${user.id}`;
  }, []);

  // Handle profile view with caching
  const handleViewProfile = useCallback((userId: string) => {
    saveSearchState();
    
    // Find the user in the current results to get their fullName
    const user = allUsers.find(u => u.id === userId);
    if (user && user.fullName) {
      const profileUrl = generateProfileUrl(user);
      router.push(profileUrl);
    } else {
      // Fallback to old format if user not found or no fullName
      router.push(`/profile/${userId}`);
    }
  }, [saveSearchState, router, allUsers, generateProfileUrl]);

  // Upgrade handler
  const handleUpgradeClick = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  return {
    generateProfileUrl,
    handleViewProfile,
    handleUpgradeClick
  };
};