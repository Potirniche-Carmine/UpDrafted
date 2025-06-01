import { db } from '@/database/db';
import { profileCompletion, athleteProfiles, coachProfiles, recruitingProfiles } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { AthleteProfileData } from '@/app/(profiles)/components/athlete-profile';
import { 
  ProfileCompletion, 
  ProfileCompletionItem,
  calculateAthleteProfileCompletion 
} from './profile-completion';

// Types for profile data
interface BaseProfileData {
  id: number;
  userId: string;
  updatedAt: Date;
  title?: string;
  organizationName?: string;
  division?: string;
  city?: string;
  state?: string;
  organizationLogo?: string;
  programWebsite?: string;
  showcaseVideoUrl?: string;
  instagramHandle?: string;
  twitterHandle?: string;
}

// Database schema types - align with actual database structure
interface DatabaseAthleteProfile {
  id: number;
  userId: string;
  fullName: string;
  profileImageR3Key: string | null;
  sport: string;
  secondarySports: string[] | null;
  graduationYear: number;
  highSchool: string;
  city: string;
  state: string;
  height: string;
  weight: string;
  positions: string[];
  gpa: string | null; // Database stores as decimal string
  satScore: number | null;
  actScore: number | null;
  intendedMajor: string | null;
  gender: string | null;
  maxprepsUrl: string | null; // Database field name
  isVerified: boolean;
  hudlUrl: string | null;
  hudlEmbedUrl: string | null;
  instagramHandle: string | null;
  twitterHandle: string | null;
  personalStatement: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to transform database athlete profile to AthleteProfileData
function transformDatabaseToAthleteProfile(dbProfile: DatabaseAthleteProfile): AthleteProfileData {
  return {
    id: dbProfile.id.toString(),
    fullName: dbProfile.fullName,
    profileImage: dbProfile.profileImageR3Key || undefined,
    sport: dbProfile.sport,
    secondarySports: dbProfile.secondarySports || undefined,
    graduationYear: dbProfile.graduationYear,
    highSchool: dbProfile.highSchool,
    city: dbProfile.city,
    state: dbProfile.state,
    height: dbProfile.height,
    weight: dbProfile.weight,
    positions: dbProfile.positions,
    gpa: dbProfile.gpa || undefined,
    satScore: dbProfile.satScore || undefined,
    actScore: dbProfile.actScore || undefined,
    intendedMajor: dbProfile.intendedMajor || undefined,
    maxPrepsUrl: dbProfile.maxprepsUrl || undefined,
    maxPrepsVerified: dbProfile.isVerified,
    hudlUrl: dbProfile.hudlUrl || undefined,
    hudlEmbedUrl: dbProfile.hudlEmbedUrl || undefined,
    socialMedia: {
      instagram: dbProfile.instagramHandle || undefined,
      twitter: dbProfile.twitterHandle || undefined,
    },
    personalStatement: dbProfile.personalStatement || undefined,
    measurables: [], // Will be populated separately if needed
    youtubeVideos: [], // Will be populated separately if needed
  };
}

// Server-side cache for profile completion data
const profileCompletionCache = new Map<string, {
  data: ProfileCompletion;
  timestamp: number;
  profileUpdatedAt: number;
}>();

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache duration

// Database operations for profile completion
export async function getProfileCompletion(userId: string, userType: 'athlete' | 'coach' | 'recruiter'): Promise<ProfileCompletion | null> {
  try {
    // Check server-side cache first
    const cacheKey = `${userId}-${userType}`;
    const cached = profileCompletionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Get from database
    const [completionData] = await db
      .select()
      .from(profileCompletion)
      .where(
        and(
          eq(profileCompletion.userId, userId),
          eq(profileCompletion.userType, userType)
        )
      )
      .limit(1);

    if (!completionData) {
      return null;
    }

    const data: ProfileCompletion = {
      overall: completionData.overall,
      categories: {
        basic: completionData.basicCategory,
        academic: completionData.academicCategory,
        athletic: completionData.athleticCategory,
        media: completionData.mediaCategory,
        social: completionData.socialCategory,
      },
      missingFields: completionData.missingFields as ProfileCompletionItem[],
      nextSteps: completionData.nextSteps as ProfileCompletionItem[],
      lastCalculated: completionData.lastCalculated,
      profileLastUpdated: completionData.profileLastUpdated,
    };

    // Update server-side cache
    profileCompletionCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      profileUpdatedAt: completionData.profileLastUpdated.getTime(),
    });

    return data;
  } catch (error) {
    console.error('Error fetching profile completion:', error);
    return null;
  }
}

export async function calculateAndSaveProfileCompletion(
  userId: string, 
  userType: 'athlete' | 'coach' | 'recruiter',
  forceRecalculate = false
): Promise<ProfileCompletion | null> {
  try {
    // Get profile data based on user type
    let profileData: AthleteProfileData | BaseProfileData | null = null;
    let profileUpdatedAt: Date = new Date();

    if (userType === 'athlete') {
      const [athlete] = await db
        .select()
        .from(athleteProfiles)
        .where(eq(athleteProfiles.userId, userId))
        .limit(1);
      
      if (!athlete) return null;
      profileData = transformDatabaseToAthleteProfile(athlete as DatabaseAthleteProfile);
      profileUpdatedAt = athlete.updatedAt;
    } else if (userType === 'coach') {
      const [coach] = await db
        .select()
        .from(coachProfiles)
        .where(eq(coachProfiles.userId, userId))
        .limit(1);
      
      if (!coach) return null;
      profileData = coach as unknown as BaseProfileData;
      profileUpdatedAt = coach.updatedAt;
    } else if (userType === 'recruiter') {
      const [recruiter] = await db
        .select()
        .from(recruitingProfiles)
        .where(eq(recruitingProfiles.userId, userId))
        .limit(1);
      
      if (!recruiter) return null;
      profileData = recruiter as unknown as BaseProfileData;
      profileUpdatedAt = recruiter.updatedAt;
    }

    if (!profileData) return null;

    // Check if we need to recalculate
    if (!forceRecalculate) {
      const existing = await getProfileCompletion(userId, userType);
      if (existing && existing.profileLastUpdated && existing.profileLastUpdated >= profileUpdatedAt) {
        return existing;
      }
    }

    // Calculate completion based on user type
    let completion: ProfileCompletion;
    
    if (userType === 'athlete') {
      completion = calculateAthleteProfileCompletion(profileData as AthleteProfileData);
    } else {
      // For coaches and recruiters, we'll implement simpler completion logic
      completion = calculateBasicProfileCompletion(profileData as BaseProfileData);
    }

    // Save to database
    const now = new Date();
    await db
      .insert(profileCompletion)
      .values({
        userId,
        userType,
        overall: completion.overall,
        basicCategory: completion.categories.basic,
        academicCategory: completion.categories.academic,
        athleticCategory: completion.categories.athletic,
        mediaCategory: completion.categories.media,
        socialCategory: completion.categories.social,
        missingFields: completion.missingFields,
        nextSteps: completion.nextSteps,
        lastCalculated: now,
        profileLastUpdated: profileUpdatedAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [profileCompletion.userId, profileCompletion.userType],
        set: {
          overall: completion.overall,
          basicCategory: completion.categories.basic,
          academicCategory: completion.categories.academic,
          athleticCategory: completion.categories.athletic,
          mediaCategory: completion.categories.media,
          socialCategory: completion.categories.social,
          missingFields: completion.missingFields,
          nextSteps: completion.nextSteps,
          lastCalculated: now,
          profileLastUpdated: profileUpdatedAt,
          updatedAt: now,
        },
      });

    // Update server-side cache
    const cacheKey = `${userId}-${userType}`;
    profileCompletionCache.set(cacheKey, {
      data: completion,
      timestamp: Date.now(),
      profileUpdatedAt: profileUpdatedAt.getTime(),
    });

    return completion;
  } catch (error) {
    console.error('Error calculating and saving profile completion:', error);
    return null;
  }
}

// Simplified completion calculation for coaches and recruiters
function calculateBasicProfileCompletion(profile: BaseProfileData): ProfileCompletion {
  const basicFields = [
    'title', 'organizationName', 'division', 'city', 'state'
  ];
  
  const mediaFields = [
    'organizationLogo', 'programWebsite', 'showcaseVideoUrl'
  ];
  
  const socialFields = [
    'instagramHandle', 'twitterHandle'
  ];

  let basicScore = 0;
  let mediaScore = 0;
  let socialScore = 0;
  const missingFields: ProfileCompletionItem[] = [];

  // Check basic fields (60% weight)
  basicFields.forEach(field => {
    const fieldValue = profile[field as keyof BaseProfileData];
    if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
      basicScore += 20;
    } else {
      missingFields.push({
        field,
        label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        weight: 20,
        category: 'basic'
      });
    }
  });

  // Check media fields (30% weight)
  mediaFields.forEach(field => {
    const fieldValue = profile[field as keyof BaseProfileData];
    if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
      mediaScore += 10;
    } else {
      missingFields.push({
        field,
        label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        weight: 10,
        category: 'media'
      });
    }
  });

  // Check social fields (10% weight)
  socialFields.forEach(field => {
    const fieldValue = profile[field as keyof BaseProfileData];
    if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
      socialScore += 5;
    } else {
      missingFields.push({
        field,
        label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        weight: 5,
        category: 'social'
      });
    }
  });

  const overall = Math.min(100, basicScore + mediaScore + socialScore);

  // Sort and get top 3 next steps
  missingFields.sort((a, b) => b.weight - a.weight);
  const nextSteps = missingFields.slice(0, 3);

  return {
    overall,
    categories: {
      basic: Math.min(100, (basicScore / 100) * 100),
      academic: 100, // Not applicable for coaches/recruiters
      athletic: 100, // Not applicable for coaches/recruiters
      media: Math.min(100, (mediaScore / 30) * 100),
      social: Math.min(100, (socialScore / 10) * 100),
    },
    missingFields,
    nextSteps,
  };
}

// Invalidate cache when profile is updated
export function invalidateProfileCompletionCache(userId: string, userType: 'athlete' | 'coach' | 'recruiter') {
  const cacheKey = `${userId}-${userType}`;
  profileCompletionCache.delete(cacheKey);
} 