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
 * - Focus on truly OPTIONAL fields that users can choose to fill out
 * - Profile Image & Verified Status are the main completeness indicators
 * - Positions and Height/Weight for athletes are optional enhancements
 * - Maintains fair discovery - even incomplete profiles still appear
 * - Uses weighted randomization instead of strict sorting
 * 
 * Scoring System (0-130 points, capped at 100):
 * - Premium Subscription: 30 points (highest priority - paying users)
 * - Profile Image: 40 points (optional, shows professionalism)
 * - Verified Status: 45 points (optional but most valuable for trust)  
 * - Positions (coaches/recruiters only): 15 points (optional for them, required for athletes)
 * - Scholarships Available (coaches/recruiters only): 15 points (optional recruiting info)
 * 
 * 5-Tier System:
 * - Elite (90% top half): Premium users with ALL: subscription + positions + scholarships + verified + image
 * - Premium (80% top half): Premium users with subscription + (verified OR image)
 * - High (65% top half): Non-premium but verified + image (high completeness)
 * - Medium (35% top half): Non-premium with verified OR image (medium completeness)
 * - Low (15% top half): Basic profiles (0-29 points)
 * 
 * Note: Athletes don't get position points since positions are required for them,
 * but coaches/recruiters get points since positions are optional for their profiles.
 * 
 * Maximum possible scores:
 * - Premium Athletes: 115 points (capped at 100) → Premium/Elite tier
 * - Premium Coaches/Recruiters: 130 points (capped at 100) → Elite tier if actively recruiting
 * - Free Athletes: 85 points → High tier
 * - Free Coaches/Recruiters: 115 points (capped at 100) → High tier if complete
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

// Tier thresholds and distribution weights - 5-tier system with premium at top
const TIER_CONFIG = {
  elite: { min: 95, max: 130, topHalfChance: 0.90 },    // Premium + verified + image + positions/scholarships
  premium: { min: 75, max: 94, topHalfChance: 0.80 },   // Premium + verified OR image
  high: { min: 55, max: 74, topHalfChance: 0.65 },      // Verified + image (non-premium)
  medium: { min: 30, max: 54, topHalfChance: 0.35 },    // Verified OR image (non-premium)  
  low: { min: 0, max: 29, topHalfChance: 0.15 },        // Basic profiles
};

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
 * Check if a coach/recruiter qualifies for elite tier (premium + actively recruiting)
 */
function isEliteRecruiter(user: DiscoverUser): boolean {
  if (user.role !== 'coach' && user.role !== 'recruiter') return false;
  
  const isPremium = isPremiumUser(user);
  const hasPositions = !!(user.positions && user.positions.length > 0);
  const hasScholarships = !!(user.recruitingNeeds && 
                            user.recruitingNeeds.scholarshipsAvailable !== null && 
                            user.recruitingNeeds.scholarshipsAvailable > 0);
  const isVerified = !!user.isVerified;
  const hasProfileImage = !!user.profileImage;
  
  // Elite tier: Must be premium AND have ALL four elements (positions, scholarships, verified, profile image)
  return isPremium && hasPositions && hasScholarships && isVerified && hasProfileImage;
}

/**
 * Determine which tier a user belongs to based on their completeness score and special criteria
 */
function getUserTier(user: DiscoverUser, score: number): 'elite' | 'premium' | 'high' | 'medium' | 'low' {
  // Check for elite tier first (special case for premium actively recruiting coaches/recruiters)
  if (isEliteRecruiter(user)) {
    return 'elite';
  }
  
  // Standard tier logic based on score
  if (score >= TIER_CONFIG.premium.min) return 'premium';
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
  const eliteTier = usersWithScores.filter(item => item.tier === 'elite');
  const premiumTier = usersWithScores.filter(item => item.tier === 'premium');
  const highTier = usersWithScores.filter(item => item.tier === 'high');
  const mediumTier = usersWithScores.filter(item => item.tier === 'medium');
  const lowTier = usersWithScores.filter(item => item.tier === 'low');

  // Shuffle within each tier to maintain randomness
  const shuffledElite = shuffleArray(eliteTier);
  const shuffledPremium = shuffleArray(premiumTier);
  const shuffledHigh = shuffleArray(highTier);
  const shuffledMedium = shuffleArray(mediumTier);
  const shuffledLow = shuffleArray(lowTier);

  // Calculate how many from each tier go to top half with better edge case handling
  // This improved algorithm ensures fair representation from all tiers while maintaining weighted preferences
  const totalUsers = users.length;
  const topHalfSize = Math.ceil(totalUsers / 2);
  
  // Step 1: Calculate ideal distribution based on tier percentages
  const idealEliteInTopHalf = Math.floor(shuffledElite.length * TIER_CONFIG.elite.topHalfChance);
  const idealPremiumInTopHalf = Math.floor(shuffledPremium.length * TIER_CONFIG.premium.topHalfChance);
  const idealHighInTopHalf = Math.floor(shuffledHigh.length * TIER_CONFIG.high.topHalfChance);
  const idealMediumInTopHalf = Math.floor(shuffledMedium.length * TIER_CONFIG.medium.topHalfChance);
  const idealLowInTopHalf = Math.floor(shuffledLow.length * TIER_CONFIG.low.topHalfChance);
  
  const totalIdeal = idealEliteInTopHalf + idealPremiumInTopHalf + idealHighInTopHalf + idealMediumInTopHalf + idealLowInTopHalf;
  
  let eliteInTopHalf, premiumInTopHalf, highInTopHalf, mediumInTopHalf, lowInTopHalf;
  
  if (totalIdeal <= topHalfSize) {
    // We have room for all ideal distributions, fill remaining slots proportionally
    const remainingSlots = topHalfSize - totalIdeal;
    const totalTierUsers = shuffledElite.length + shuffledPremium.length + shuffledHigh.length + shuffledMedium.length + shuffledLow.length;
    
    // Distribute remaining slots proportionally by tier size, with elite bias
    const extraForElite = Math.min(remainingSlots, Math.floor((shuffledElite.length / totalTierUsers) * remainingSlots * 2.0));
    const extraForPremium = Math.min(remainingSlots - extraForElite, Math.floor((shuffledPremium.length / totalTierUsers) * remainingSlots * 1.5));
    const extraForHigh = Math.min(remainingSlots - extraForElite - extraForPremium, Math.floor((shuffledHigh.length / totalTierUsers) * remainingSlots));
    const extraForMedium = Math.min(remainingSlots - extraForElite - extraForPremium - extraForHigh, Math.floor((shuffledMedium.length / totalTierUsers) * remainingSlots));
    const extraForLow = remainingSlots - extraForElite - extraForPremium - extraForHigh - extraForMedium;
    
    eliteInTopHalf = Math.min(idealEliteInTopHalf + extraForElite, shuffledElite.length);
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
    eliteInTopHalf = shuffledElite.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealEliteInTopHalf * scaleFactor)), shuffledElite.length) : 0;
    premiumInTopHalf = shuffledPremium.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealPremiumInTopHalf * scaleFactor)), shuffledPremium.length) : 0;
    highInTopHalf = shuffledHigh.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealHighInTopHalf * scaleFactor)), shuffledHigh.length) : 0;
    mediumInTopHalf = shuffledMedium.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealMediumInTopHalf * scaleFactor)), shuffledMedium.length) : 0;
    lowInTopHalf = shuffledLow.length > 0 ? 
      Math.min(Math.max(minRepresentation, Math.floor(idealLowInTopHalf * scaleFactor)), shuffledLow.length) : 0;
    
    // Adjust if we've exceeded topHalfSize
    const currentTotal = eliteInTopHalf + premiumInTopHalf + highInTopHalf + mediumInTopHalf + lowInTopHalf;
    if (currentTotal > topHalfSize) {
      // Reduce from largest tiers first while maintaining minimum representation
      const excess = currentTotal - topHalfSize;
      let remaining = excess;
      
      // Reduce low tier first (preserve elite tiers)
      if (remaining > 0 && lowInTopHalf > minRepresentation && shuffledLow.length > 0) {
        const reduction = Math.min(remaining, lowInTopHalf - minRepresentation);
        lowInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Then medium tier
      if (remaining > 0 && mediumInTopHalf > minRepresentation && shuffledMedium.length > 0) {
        const reduction = Math.min(remaining, mediumInTopHalf - minRepresentation);
        mediumInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Then high tier
      if (remaining > 0 && highInTopHalf > minRepresentation && shuffledHigh.length > 0) {
        const reduction = Math.min(remaining, highInTopHalf - minRepresentation);
        highInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Then premium tier (preserve elite as much as possible)
      if (remaining > 0 && premiumInTopHalf > minRepresentation && shuffledPremium.length > 0) {
        const reduction = Math.min(remaining, premiumInTopHalf - minRepresentation);
        premiumInTopHalf -= reduction;
        remaining -= reduction;
      }
      
      // Finally elite tier if absolutely necessary
      if (remaining > 0 && eliteInTopHalf > minRepresentation && shuffledElite.length > 0) {
        const reduction = Math.min(remaining, eliteInTopHalf - minRepresentation);
        eliteInTopHalf -= reduction;
        remaining -= reduction;
      }
    }
  }

  // Split each tier into top half and bottom half portions
  const topHalf = [
    ...shuffledElite.slice(0, eliteInTopHalf),
    ...shuffledPremium.slice(0, premiumInTopHalf),
    ...shuffledHigh.slice(0, highInTopHalf),
    ...shuffledMedium.slice(0, mediumInTopHalf),
    ...shuffledLow.slice(0, lowInTopHalf),
  ];

  const bottomHalf = [
    ...shuffledElite.slice(eliteInTopHalf),
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
