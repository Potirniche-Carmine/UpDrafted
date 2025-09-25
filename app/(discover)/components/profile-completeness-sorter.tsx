"use client";

import { useMemo, useCallback } from 'react';

/**
 * Profile Completeness Sorting for Discover Page
 * 
 * This component provides client-side sorting based on profile completeness to prioritize
 * more complete profiles while maintaining randomness and discovery opportunities.
 * Premium subscription users receive highest priority placement.
 * 
 * Key Design Principles:
 * - Premium subscription users get top priority (30 point bonus)
 * - Profile images are highly valued (40 points) - should appear at top
 * - Verified status is most valuable for trust (45 points)
 * - Positions and scholarships give coaches/recruiters bonus points
 * - Maintains fair discovery through weighted randomization
 * - Uses score-based buckets instead of complex tier system
 * 
 * Scoring System (0-100+ points, capped at 100):
 * - Premium Subscription: 30 points (highest priority - paying users)
 * - Profile Image: 40 points (major factor for visibility)
 * - Verified Status: 45 points (trust and authenticity)  
 * - Positions (coaches/recruiters only): 15 points (optional recruiting info)
 * - Scholarships Available (coaches/recruiters only): 15 points (>0 scholarships)
 * 
 * Score Buckets & Distribution:
 * - High (80-100): 85% chance top half - Premium + verified + image users
 * - Medium-High (60-79): 70% chance top half - Verified + image OR premium users
 * - Medium (40-59): 40% chance top half - Image OR verified users
 * - Low (0-39): 15% chance top half - Basic profiles
 * 
 * This ensures profiles WITH pictures and verification appear at the top,
 * while still giving some discovery opportunities to incomplete profiles.
 */

// Types for subscription status
export type SubscriptionTier = 'free' | 'pro_athlete_monthly' | 'pro_athlete_yearly' | 'pro_coach_monthly' | 'pro_coach_yearly' | 'pro_recruiter_monthly' | 'pro_recruiter_yearly';

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
  // Subscription information for premium prioritization
  subscriptionTier?: SubscriptionTier;
  isPremium?: boolean;
}

// Profile completeness scoring weights - using only truly optional fields
const COMPLETENESS_WEIGHTS = {
  premium: 30,               // Premium subscription bonus (top priority)
  profileImage: 40,          // Has profile image (optional)
  verified: 45,              // Verified status (optional but most valuable)
  positions: 15,             // Has positions (optional for coaches/recruiters, required for athletes)
  scholarshipsAvailable: 15, // Has scholarship info (optional for recruiters/coaches)
};

/**
 * Check if a user has a premium subscription
 */
function isPremiumUser(user: DiscoverUser): boolean {
  // Check explicit isPremium flag first
  if (user.isPremium !== undefined) {
    return user.isPremium;
  }
  
  // Fallback to checking subscription tier
  if (user.subscriptionTier) {
    return user.subscriptionTier !== 'free';
  }
  
  // Default to false if no subscription info
  return false;
}

/**
 * Calculate completeness score for a user profile (0-130, capped at 100)
 */
function calculateCompletenessScore(user: DiscoverUser): number {
  let score = 0;

  // Premium subscription - highest priority bonus (30 points)
  if (isPremiumUser(user)) {
    score += COMPLETENESS_WEIGHTS.premium;
  }

  // Profile image - major optional factor (40 points)
  if (user.profileImage) {
    score += COMPLETENESS_WEIGHTS.profileImage;
  }

  // Verified status - most important optional factor (45 points)
  if (user.isVerified) {
    score += COMPLETENESS_WEIGHTS.verified;
  }

  // Positions - optional for coaches/recruiters, required for athletes (15 points)
  // Only give points to coaches/recruiters who have positions (since it's optional for them)
  if ((user.role === 'coach' || user.role === 'recruiter') && user.positions && user.positions.length > 0) {
    score += COMPLETENESS_WEIGHTS.positions;
  }

  // Scholarships available - optional for coaches/recruiters (15 points)
  if ((user.role === 'coach' || user.role === 'recruiter') && 
      user.recruitingNeeds && 
      user.recruitingNeeds.scholarshipsAvailable !== null && 
      user.recruitingNeeds.scholarshipsAvailable > 0) {
    score += COMPLETENESS_WEIGHTS.scholarshipsAvailable;
  }

  return Math.min(score, 100); // Cap at 100
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

  // Calculate scores for all users
  const usersWithScores = users.map(user => {
    const score = calculateCompletenessScore(user);
    return { user, score };
  });

  // Sort by score (highest first) with some randomization within score ranges
  const sortedUsers = usersWithScores.sort((a, b) => {
    // If scores are very close (within 10 points), add some randomness
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) <= 10) {
      return Math.random() - 0.5;
    }
    return scoreDiff;
  });

  // Apply weighted randomization based on score buckets
  const totalUsers = sortedUsers.length;
  
  // Group users into score buckets for better distribution
  const highScoreBucket: typeof sortedUsers = []; // 80-100
  const mediumHighBucket: typeof sortedUsers = []; // 60-79
  const mediumBucket: typeof sortedUsers = []; // 40-59
  const lowBucket: typeof sortedUsers = []; // 0-39
  
  sortedUsers.forEach(item => {
    if (item.score >= 80) highScoreBucket.push(item);
    else if (item.score >= 60) mediumHighBucket.push(item);
    else if (item.score >= 40) mediumBucket.push(item);
    else lowBucket.push(item);
  });

  // Shuffle within each bucket to maintain randomness
  const shuffleHighScore = shuffleArray(highScoreBucket);
  const shuffleMediumHigh = shuffleArray(mediumHighBucket);
  const shuffleMedium = shuffleArray(mediumBucket);
  const shuffleLow = shuffleArray(lowBucket);

  // Weighted distribution: higher scores get priority but not complete dominance
  const topHalfSize = Math.ceil(totalUsers / 2);
  
  // Calculate how many from each bucket go to top half
  let highScoreInTop = Math.min(Math.ceil(shuffleHighScore.length * 0.85), shuffleHighScore.length);
  let mediumHighInTop = Math.min(Math.ceil(shuffleMediumHigh.length * 0.70), shuffleMediumHigh.length);
  let mediumInTop = Math.min(Math.ceil(shuffleMedium.length * 0.40), shuffleMedium.length);
  let lowInTop = Math.min(Math.ceil(shuffleLow.length * 0.15), shuffleLow.length);
  
  // Adjust if we exceed top half size
  const totalInTop = highScoreInTop + mediumHighInTop + mediumInTop + lowInTop;
  if (totalInTop > topHalfSize) {
    const excess = totalInTop - topHalfSize;
    // Remove excess from lower priority buckets first
    const reductionFromLow = Math.min(excess, lowInTop);
    lowInTop -= reductionFromLow;
    let remaining = excess - reductionFromLow;
    
    if (remaining > 0) {
      const reductionFromMedium = Math.min(remaining, mediumInTop);
      mediumInTop -= reductionFromMedium;
      remaining -= reductionFromMedium;
    }
    
    if (remaining > 0) {
      const reductionFromMediumHigh = Math.min(remaining, mediumHighInTop);
      mediumHighInTop -= reductionFromMediumHigh;
      remaining -= reductionFromMediumHigh;
    }
    
    if (remaining > 0) {
      highScoreInTop -= remaining;
    }
  }
  
  // If we have room, add more from higher buckets
  const actualTotalInTop = highScoreInTop + mediumHighInTop + mediumInTop + lowInTop;
  if (actualTotalInTop < topHalfSize) {
    const available = topHalfSize - actualTotalInTop;
    // Add more from high score bucket first
    const canAddFromHigh = Math.min(available, shuffleHighScore.length - highScoreInTop);
    highScoreInTop += canAddFromHigh;
    let remainingSlots = available - canAddFromHigh;
    
    if (remainingSlots > 0) {
      const canAddFromMediumHigh = Math.min(remainingSlots, shuffleMediumHigh.length - mediumHighInTop);
      mediumHighInTop += canAddFromMediumHigh;
      remainingSlots -= canAddFromMediumHigh;
    }
    
    if (remainingSlots > 0) {
      const canAddFromMedium = Math.min(remainingSlots, shuffleMedium.length - mediumInTop);
      mediumInTop += canAddFromMedium;
      remainingSlots -= canAddFromMedium;
    }
    
    if (remainingSlots > 0) {
      lowInTop += Math.min(remainingSlots, shuffleLow.length - lowInTop);
    }
  }

  // Build the final sorted list
  const topHalf = [
    ...shuffleHighScore.slice(0, highScoreInTop),
    ...shuffleMediumHigh.slice(0, mediumHighInTop),
    ...shuffleMedium.slice(0, mediumInTop),
    ...shuffleLow.slice(0, lowInTop),
  ];

  const bottomHalf = [
    ...shuffleHighScore.slice(highScoreInTop),
    ...shuffleMediumHigh.slice(mediumHighInTop),
    ...shuffleMedium.slice(mediumInTop),
    ...shuffleLow.slice(lowInTop),
  ];

  // Shuffle the top and bottom halves to avoid predictable patterns
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
