"use client";

import { useMemo, useCallback } from 'react';

// Types for the DiscoverUser - matching the main page interface
export interface DiscoverUser {
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

// Profile completeness scoring weights
const COMPLETENESS_WEIGHTS = {
  profileImage: 25,
  verified: 20,
  organization: 15,
  title: 10,           // For coaches/recruiters
  graduationYear: 10,  // For athletes
  heightWeight: 10,    // For athletes
  positions: 10,
};

// Tier thresholds and distribution weights
const TIER_CONFIG = {
  high: { min: 80, max: 100, topHalfChance: 0.6 },
  medium: { min: 50, max: 79, topHalfChance: 0.3 },
  low: { min: 0, max: 49, topHalfChance: 0.1 },
};

/**
 * Calculate completeness score for a user profile (0-100)
 */
function calculateCompletenessScore(user: DiscoverUser): number {
  let score = 0;

  // Profile image
  if (user.profileImage) {
    score += COMPLETENESS_WEIGHTS.profileImage;
  }

  // Verified status
  if (user.isVerified) {
    score += COMPLETENESS_WEIGHTS.verified;
  }

  // Organization name
  if (user.organizationName && user.organizationName.trim() !== '') {
    score += COMPLETENESS_WEIGHTS.organization;
  }

  // Role-specific scoring
  if (user.role === 'coach' || user.role === 'recruiter') {
    // Title/Position for coaches and recruiters
    if (user.title && user.title.trim() !== '') {
      score += COMPLETENESS_WEIGHTS.title;
    }
  } else if (user.role === 'athlete') {
    // Graduation year for athletes
    if (user.graduationYear) {
      score += COMPLETENESS_WEIGHTS.graduationYear;
    }

    // Height and weight for athletes
    if (user.height && user.weight) {
      score += COMPLETENESS_WEIGHTS.heightWeight;
    }
  }

  // Positions (for all roles)
  if (user.positions && user.positions.length > 0) {
    score += COMPLETENESS_WEIGHTS.positions;
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Determine which tier a user belongs to based on their completeness score
 */
function getUserTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= TIER_CONFIG.high.min) return 'high';
  if (score >= TIER_CONFIG.medium.min) return 'medium';
  return 'low';
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sort users by profile completeness with weighted randomization
 * More complete profiles have higher chance of appearing first, but still maintains randomness
 */
export function sortByCompletenessWithRandomization(users: DiscoverUser[]): DiscoverUser[] {
  if (users.length === 0) return users;

  // Calculate scores and assign tiers
  const usersWithScores = users.map(user => ({
    user,
    score: calculateCompletenessScore(user),
    tier: getUserTier(calculateCompletenessScore(user)),
  }));

  // Separate into tiers
  const highTier = usersWithScores.filter(item => item.tier === 'high');
  const mediumTier = usersWithScores.filter(item => item.tier === 'medium');
  const lowTier = usersWithScores.filter(item => item.tier === 'low');

  // Shuffle within each tier to maintain randomness
  const shuffledHigh = shuffleArray(highTier);
  const shuffledMedium = shuffleArray(mediumTier);
  const shuffledLow = shuffleArray(lowTier);

  // Calculate how many from each tier go to top half
  const totalUsers = users.length;
  const topHalfSize = Math.ceil(totalUsers / 2);
  
  const highInTopHalf = Math.floor(shuffledHigh.length * TIER_CONFIG.high.topHalfChance);
  const mediumInTopHalf = Math.min(
    Math.floor(shuffledMedium.length * TIER_CONFIG.medium.topHalfChance),
    topHalfSize - highInTopHalf
  );
  const lowInTopHalf = Math.min(
    topHalfSize - highInTopHalf - mediumInTopHalf,
    shuffledLow.length
  );

  // Split each tier into top half and bottom half portions
  const topHalf = [
    ...shuffledHigh.slice(0, highInTopHalf),
    ...shuffledMedium.slice(0, mediumInTopHalf),
    ...shuffledLow.slice(0, lowInTopHalf),
  ];

  const bottomHalf = [
    ...shuffledHigh.slice(highInTopHalf),
    ...shuffledMedium.slice(mediumInTopHalf),
    ...shuffledLow.slice(lowInTopHalf),
  ];

  // Shuffle the top and bottom halves internally to avoid predictable patterns
  const finalTopHalf = shuffleArray(topHalf);
  const finalBottomHalf = shuffleArray(bottomHalf);

  // Combine and return just the user objects
  return [...finalTopHalf, ...finalBottomHalf].map(item => item.user);
}

/**
 * React hook for sorting users with completeness algorithm
 */
export function useProfileCompletenessSorting(users: DiscoverUser[]) {
  const sortedUsers = useMemo(() => {
    return sortByCompletenessWithRandomization(users);
  }, [users]);

  // Function to re-randomize the sorting (useful for "shuffle" functionality)
  const reshuffleUsers = useCallback(() => {
    return sortByCompletenessWithRandomization(users);
  }, [users]);

  return {
    sortedUsers,
    reshuffleUsers,
  };
}

/**
 * Get completeness percentage for debugging/display purposes
 */
export function getProfileCompletenessPercentage(user: DiscoverUser): number {
  return calculateCompletenessScore(user);
}
