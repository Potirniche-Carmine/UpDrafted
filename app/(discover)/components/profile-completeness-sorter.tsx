"use client";

import { useMemo, useCallback } from 'react';

/**
 * Profile Completeness Sorting for Discover Page
 * 
 * This component provides client-side sorting based on profile completeness to prioritize
 * more complete profiles while maintaining randomness and discovery opportunities.
 * 
 * Key Design Principles:
 * - Focus on truly OPTIONAL fields that users can choose to fill out
 * - Profile Image & Verified Status are the main completeness indicators
 * - Positions and Height/Weight for athletes are optional enhancements
 * - Maintains fair discovery - even incomplete profiles still appear
 * - Uses weighted randomization instead of strict sorting
 * 
 * Scoring System (0-100 points):
 * - Profile Image: 40 points (optional, shows professionalism)
 * - Verified Status: 45 points (optional but most valuable for trust)  
 * - Positions (coaches/recruiters only): 15 points (optional for them, required for athletes)
 * - Scholarships Available (coaches/recruiters only): 15 points (optional recruiting info)
 * 
 * 4-Tier System:
 * - Premium (85% top half): Coaches/Recruiters with ALL: positions + scholarships + verified + image
 * - High (65% top half): High scoring profiles (70-89 points) - typically verified + image
 * - Medium (35% top half): Medium scoring profiles (40-69 points) - verified OR image
 * - Low (10% top half): Basic profiles (0-39 points)
 * 
 * Note: Athletes don't get position points since positions are required for them,
 * but coaches/recruiters get points since positions are optional for their profiles.
 * 
 * Maximum possible scores:
 * - Athletes: 85 points (image + verified) → High tier
 * - Coaches/Recruiters: 115 points (capped at 100) → Premium tier if actively recruiting
 */

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

// Profile completeness scoring weights - using only truly optional fields
const COMPLETENESS_WEIGHTS = {
  profileImage: 40,      // Has profile image (optional)
  verified: 45,          // Verified status (optional but most valuable)
  positions: 15,         // Has positions (optional for coaches/recruiters, required for athletes)
  scholarshipsAvailable: 15, // Has scholarship info (optional for recruiters/coaches)
};

// Tier thresholds and distribution weights - 4-tier system
const TIER_CONFIG = {
  premium: { min: 90, max: 100, topHalfChance: 0.85 }, // Coaches/Recruiters with scholarships + positions + verified + image
  high: { min: 70, max: 89, topHalfChance: 0.65 },    // Verified + image users
  medium: { min: 40, max: 69, topHalfChance: 0.35 },  // Verified OR image users
  low: { min: 0, max: 39, topHalfChance: 0.1 },       // Basic profiles
};

/**
 * Calculate completeness score for a user profile (0-100)
 */
function calculateCompletenessScore(user: DiscoverUser): number {
  let score = 0;

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
 * Check if a coach/recruiter qualifies for premium tier (actively recruiting)
 */
function isPremiumRecruiter(user: DiscoverUser): boolean {
  if (user.role !== 'coach' && user.role !== 'recruiter') return false;
  
  const hasPositions = !!(user.positions && user.positions.length > 0);
  const hasScholarships = !!(user.recruitingNeeds && 
                            user.recruitingNeeds.scholarshipsAvailable !== null && 
                            user.recruitingNeeds.scholarshipsAvailable > 0);
  const isVerified = !!user.isVerified;
  const hasProfileImage = !!user.profileImage;
  
  // Premium tier: Must have ALL four elements (positions, scholarships, verified, profile image)
  return hasPositions && hasScholarships && isVerified && hasProfileImage;
}

/**
 * Determine which tier a user belongs to based on their completeness score and special criteria
 */
function getUserTier(user: DiscoverUser, score: number): 'premium' | 'high' | 'medium' | 'low' {
  // Check for premium tier first (special case for actively recruiting coaches/recruiters)
  if (isPremiumRecruiter(user)) {
    return 'premium';
  }
  
  // Standard tier logic based on score
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
  const usersWithScores = users.map(user => {
    const score = calculateCompletenessScore(user);
    return {
      user,
      score,
      tier: getUserTier(user, score),
    };
  });

  // Separate into tiers
  const premiumTier = usersWithScores.filter(item => item.tier === 'premium');
  const highTier = usersWithScores.filter(item => item.tier === 'high');
  const mediumTier = usersWithScores.filter(item => item.tier === 'medium');
  const lowTier = usersWithScores.filter(item => item.tier === 'low');

  // Shuffle within each tier to maintain randomness
  const shuffledPremium = shuffleArray(premiumTier);
  const shuffledHigh = shuffleArray(highTier);
  const shuffledMedium = shuffleArray(mediumTier);
  const shuffledLow = shuffleArray(lowTier);

  // Calculate how many from each tier go to top half with better edge case handling
  // This improved algorithm ensures fair representation from all tiers while maintaining weighted preferences
  const totalUsers = users.length;
  const topHalfSize = Math.ceil(totalUsers / 2);
  
  // Step 1: Calculate ideal distribution based on tier percentages
  const idealPremiumInTopHalf = Math.floor(shuffledPremium.length * TIER_CONFIG.premium.topHalfChance);
  const idealHighInTopHalf = Math.floor(shuffledHigh.length * TIER_CONFIG.high.topHalfChance);
  const idealMediumInTopHalf = Math.floor(shuffledMedium.length * TIER_CONFIG.medium.topHalfChance);
  const idealLowInTopHalf = Math.floor(shuffledLow.length * TIER_CONFIG.low.topHalfChance);
  
  const totalIdeal = idealPremiumInTopHalf + idealHighInTopHalf + idealMediumInTopHalf + idealLowInTopHalf;
  
  let premiumInTopHalf, highInTopHalf, mediumInTopHalf, lowInTopHalf;
  
  if (totalIdeal <= topHalfSize) {
    // We have room for all ideal distributions, fill remaining slots proportionally
    const remainingSlots = topHalfSize - totalIdeal;
    const totalTierUsers = shuffledPremium.length + shuffledHigh.length + shuffledMedium.length + shuffledLow.length;
    
    // Distribute remaining slots proportionally by tier size, with premium bias
    const extraForPremium = Math.min(remainingSlots, Math.floor((shuffledPremium.length / totalTierUsers) * remainingSlots * 1.5));
    const extraForHigh = Math.min(remainingSlots - extraForPremium, Math.floor((shuffledHigh.length / totalTierUsers) * remainingSlots));
    const extraForMedium = Math.min(remainingSlots - extraForPremium - extraForHigh, Math.floor((shuffledMedium.length / totalTierUsers) * remainingSlots));
    const extraForLow = remainingSlots - extraForPremium - extraForHigh - extraForMedium;
    
    premiumInTopHalf = Math.min(idealPremiumInTopHalf + extraForPremium, shuffledPremium.length);
    highInTopHalf = Math.min(idealHighInTopHalf + extraForHigh, shuffledHigh.length);
    mediumInTopHalf = Math.min(idealMediumInTopHalf + extraForMedium, shuffledMedium.length);
    lowInTopHalf = Math.min(idealLowInTopHalf + extraForLow, shuffledLow.length);
  } else {
    // We need to scale down proportionally while maintaining minimum representation
    const scaleFactor = topHalfSize / totalIdeal;
    
    // Ensure each non-empty tier gets at least 1 representative if possible
    const minRepresentation = 1;
    
    // Scale down the ideal numbers and add back minimum representation
    premiumInTopHalf = shuffledPremium.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealPremiumInTopHalf * scaleFactor)), shuffledPremium.length) : 0;
    highInTopHalf = shuffledHigh.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealHighInTopHalf * scaleFactor)), shuffledHigh.length) : 0;
    mediumInTopHalf = shuffledMedium.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealMediumInTopHalf * scaleFactor)), shuffledMedium.length) : 0;
    lowInTopHalf = shuffledLow.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealLowInTopHalf * scaleFactor)), shuffledLow.length) : 0;
    
    // Adjust if we've exceeded topHalfSize
    const currentTotal = premiumInTopHalf + highInTopHalf + mediumInTopHalf + lowInTopHalf;
    if (currentTotal > topHalfSize) {
      // Reduce from largest tiers first while maintaining minimum representation
      const excess = currentTotal - topHalfSize;
      let remaining = excess;
      
      // Reduce premium first (but keep at least 1 if they exist)
      if (remaining > 0 && premiumInTopHalf > minRepresentation && shuffledPremium.length > 0) {
        const reduction = Math.min(remaining, premiumInTopHalf - minRepresentation);
        premiumInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Then high tier
      if (remaining > 0 && highInTopHalf > minRepresentation && shuffledHigh.length > 0) {
        const reduction = Math.min(remaining, highInTopHalf - minRepresentation);
        highInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Then medium tier
      if (remaining > 0 && mediumInTopHalf > minRepresentation && shuffledMedium.length > 0) {
        const reduction = Math.min(remaining, mediumInTopHalf - minRepresentation);
        mediumInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Finally low tier if absolutely necessary
      if (remaining > 0 && lowInTopHalf > minRepresentation && shuffledLow.length > 0) {
        const reduction = Math.min(remaining, lowInTopHalf - minRepresentation);
        lowInTopHalf -= reduction;
        remaining -= reduction;
      }
    }
  }

  // Split each tier into top half and bottom half portions
  const topHalf = [
    ...shuffledPremium.slice(0, premiumInTopHalf),
    ...shuffledHigh.slice(0, highInTopHalf),
    ...shuffledMedium.slice(0, mediumInTopHalf),
    ...shuffledLow.slice(0, lowInTopHalf),
  ];

  const bottomHalf = [
    ...shuffledPremium.slice(premiumInTopHalf),
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
