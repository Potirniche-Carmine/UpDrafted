import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole, requireOwnershipOrAdmin } from '@/utils/roles';
import { userOperations, athleteOperations, coachOperations, recruitingOperations, recruitingNeedsOperations } from '@/database/db-utils';
import { R2_PUBLIC_URL } from '@/database/r2';
import { NewAthleteProfile, NewAthleteMeasurable, NewAthleteVideo, NewCoachProfile, NewRecruitingProfile, verificationRequests } from '@/database/schema';
import { db } from '@/database/db';
import { eq } from 'drizzle-orm';

// Force Node.js runtime to avoid expensive edge function costs
export const runtime = 'nodejs';

interface ProfilePageParams {
  params: Promise<{
    id: string;
  }>;
}

// Cache configuration - balanced caching to reduce edge requests while maintaining freshness
const CACHE_CONFIG = {
  // Public profile data can be cached longer to reduce costs - increased from 10 minutes
  PUBLIC_PROFILE_CACHE_SECONDS: 1800, // 30 minutes (increased from 10 minutes)
  // Own profile data cached for reasonable freshness
  OWN_PROFILE_CACHE_SECONDS: 300, // 5 minutes (increased from 3 minutes)
  // Admin views get fresh data but slightly longer cache
  ADMIN_CACHE_SECONDS: 120, // 2 minutes (increased from 1 minute)
};

// Helper function to set cache headers
function setCacheHeaders(response: NextResponse, cacheSeconds: number, isPublicProfile = false) {
  try {
    // More aggressive caching for public profiles to reduce costs
    if (isPublicProfile) {
      // Public profiles can be cached more aggressively
      response.headers.set('Cache-Control', `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds * 2}, stale-while-revalidate=300`);
      // CDN can cache even longer for public profiles
      response.headers.set('CDN-Cache-Control', `public, max-age=${cacheSeconds * 3}`); // 90 minutes for CDN
    } else {
      // More conservative caching for own profiles
      response.headers.set('Cache-Control', `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`);
      response.headers.set('CDN-Cache-Control', `public, max-age=${Math.min(cacheSeconds * 1.5, 900)}`); // Cap at 15 minutes
    }
    
    // Add ETag for better cache validation
    response.headers.set('Vary', 'Authorization');
    
    // Add cache tags for better invalidation (if using a CDN that supports it)
    response.headers.set('Cache-Tag', 'profile');
  } catch (error) {
    // If header setting fails, log but don't fail the request
    console.warn('Failed to set cache headers:', error);
  }
  return response;
}

// Helper function to sanitize profile data based on viewing permissions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeProfileData(profileData: Record<string, any>, profileType: string | null, isOwnProfile: boolean, isAdmin: boolean): Record<string, any> | null {
  if (!profileData || !profileType) return null;

  // If it's the user's own profile or admin, return full data
  if (isOwnProfile || isAdmin) {
    return profileData;
  }

  // For other users viewing the profile, remove sensitive information
  const sanitized = { ...profileData };
  
  // Remove sensitive user data that should only be visible to the profile owner
  if (sanitized.user) {
    delete sanitized.user.email;
    delete sanitized.user.createdAt;
    delete sanitized.user.updatedAt;
  }

  // Remove sensitive profile data based on type
  if (profileType === 'athlete') {
    // Keep public athlete information but remove private details
    delete sanitized.personalStatement; // Keep this for now, but could be made private
    // Remove any private measurables or stats if needed
  } else if (profileType === 'coach' || profileType === 'recruiter') {
    // Remove any sensitive coaching/recruiting information
    delete sanitized.recruitingNeeds?.recruitingPhilosophy; // Keep this public for now
  }

  // Remove connection data for privacy
  delete sanitized.connections;

  return sanitized;
}

// Helper function to transform database profile data to match component interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProfileData(profileData: Record<string, any>, profileType: string): Record<string, any> {
  const transformed = { ...profileData };

  if (profileType === 'athlete') {
    // Preserve userId for client-side API calls
    if (profileData.userId) {
      transformed.userId = profileData.userId;
    }
    
    // Transform profile image from R3 key to URL using proper R2 configuration
    if (profileData.profileImageR3Key) {
      transformed.profileImage = `${R2_PUBLIC_URL}/${profileData.profileImageR3Key}`;
    }

    // Map database videos to youtubeVideos for component compatibility
    if (profileData.videos) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformed.youtubeVideos = profileData.videos.map((video: any) => ({
        id: video.id,
        title: video.title,
        url: video.youtubeUrl,
        embedUrl: video.embedUrl,
        sortOrder: video.sortOrder
      }));
      delete transformed.videos;
    } else {
      transformed.youtubeVideos = [];
    }

    // Ensure positions is an array (it might be stored as string array in DB)
    if (typeof transformed.positions === 'string') {
      transformed.positions = JSON.parse(transformed.positions);
    }
    if (!Array.isArray(transformed.positions)) {
      transformed.positions = [];
    }

    // Ensure secondarySports is an array
    if (transformed.secondarySports && typeof transformed.secondarySports === 'string') {
      transformed.secondarySports = JSON.parse(transformed.secondarySports);
    }
    if (!Array.isArray(transformed.secondarySports)) {
      transformed.secondarySports = [];
    }

    // Transform social media data if needed
    if (transformed.instagramHandle || transformed.twitterHandle) {
      transformed.socialMedia = {
        instagram: transformed.instagramHandle,
        twitter: transformed.twitterHandle
      };
    }

    // Set verification status from database
    transformed.isVerified = transformed.isVerified || false;

    // Ensure achievements is an array
    if (!Array.isArray(transformed.achievements)) {
      transformed.achievements = [];
    }

    // Ensure measurables is an array
    if (!Array.isArray(transformed.measurables)) {
      transformed.measurables = [];
    }

    // Ensure URLs are properly handled - set to undefined if null or empty
    // Map database field names to frontend field names
    if (transformed.maxprepsUrl) {
      transformed.maxPrepsUrl = transformed.maxprepsUrl;
      delete transformed.maxprepsUrl; // Remove the database field name
    } else {
      transformed.maxPrepsUrl = undefined;
    }
    
    if (!transformed.hudlUrl || transformed.hudlUrl.trim() === '') {
      transformed.hudlUrl = undefined;
    }
    if (!transformed.hudlEmbedUrl || transformed.hudlEmbedUrl.trim() === '') {
      transformed.hudlEmbedUrl = undefined;
    }
  } else if (profileType === 'coach' || profileType === 'recruiter') {
    // Preserve userId for client-side API calls
    if (profileData.userId) {
      transformed.userId = profileData.userId;
    }
    
    // Transform profile image from R3 key to URL using proper R2 configuration
    if (profileData.profileImageR3Key) {
      transformed.profileImage = `${R2_PUBLIC_URL}/${profileData.profileImageR3Key}`;
    }
    
    // Transform organization logo from R3 key to URL using proper R2 configuration
    if (profileData.organizationLogoR3Key) {
      transformed.organizationLogo = `${R2_PUBLIC_URL}/${profileData.organizationLogoR3Key}`;
    }
  }

  return transformed;
}

export async function GET(
  request: NextRequest,
  { params }: ProfilePageParams
) {
  try {
    // SECURITY: Validate request size and URL length to prevent DoS attacks
    const url = new URL(request.url);
    
    // Limit total URL length (including query params)
    const MAX_URL_LENGTH = 2048; // Standard browser limit
    if (request.url.length > MAX_URL_LENGTH) {
      return NextResponse.json(
        { error: 'URL too long' },
        { status: 414 } // 414 URI Too Long
      );
    }

    // Limit query string size
    const MAX_QUERY_LENGTH = 1024;
    if (url.search.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: 'Query parameters too long' },
        { status: 400 }
      );
    }

    // Limit number of query parameters to prevent parameter pollution
    const MAX_QUERY_PARAMS = 10;
    if (url.searchParams.size > MAX_QUERY_PARAMS) {
      return NextResponse.json(
        { error: 'Too many query parameters' },
        { status: 400 }
      );
    }

    // SECURITY NOTE: This is where REAL auth happens
    // Client-side AuthWrapper is just for UX - this is the actual security layer
    
    // Validate required Clerk headers for client-side requests
    const authHeader = request.headers.get('authorization');
    
    // For client-side requests, we only strictly require authorization
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Missing authorization header',
          details: 'Authorization header is required'
        },
        { status: 401 }
      );
    }

    // Check Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Invalid authorization format',
          details: 'Authorization header must use Bearer token format'
        },
        { status: 401 }
      );
    }

    // Require any authenticated role
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId: currentUserId, role: currentUserRole } = auth;
    const { id: profileUserId } = await params;

    // Validate the profile user ID format
    if (!profileUserId || typeof profileUserId !== 'string' || profileUserId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent potential injection attacks by validating the ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(profileUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if the current user is viewing their own profile
    const isOwnProfile = currentUserId === profileUserId;
    const isAdmin = currentUserRole === 'admin';

    // Get the user with their profile data
    const userWithProfile = await userOperations.getUserWithProfile(profileUserId);

    if (!userWithProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine the user's role and get appropriate profile data
    let profileData = null;
    let profileType = null;
    let verificationStatus = null;

    try {
      if (userWithProfile.role === 'athlete' && userWithProfile.athleteProfile) {
        profileType = 'athlete';
        // Get full athlete profile with related data
        const athleteProfile = await athleteOperations.getAthleteProfile(profileUserId);
        profileData = athleteProfile;

        // Check for pending verification request if it's the user's own profile
        if (isOwnProfile) {
          const pendingVerification = await db
            .select({
              status: verificationRequests.status,
              submittedAt: verificationRequests.submittedAt
            })
            .from(verificationRequests)
            .where(eq(verificationRequests.userId, profileUserId))
            .limit(1);

          if (pendingVerification.length > 0 && (pendingVerification[0].status === 'pending' || pendingVerification[0].status === 'under_review')) {
            verificationStatus = {
              hasPendingVerification: true,
              pendingSubmittedAt: pendingVerification[0].submittedAt.toISOString()
            };
          }
        }
      } else if (userWithProfile.role === 'coach' && userWithProfile.coachProfile) {
        profileType = 'coach';
        // Get full coach profile with related data
        const coachProfile = await coachOperations.getCoachProfile(profileUserId);
        profileData = coachProfile;

        // Check for pending verification request if it's the user's own profile
        if (isOwnProfile) {
          const pendingVerification = await db
            .select({
              status: verificationRequests.status,
              submittedAt: verificationRequests.submittedAt
            })
            .from(verificationRequests)
            .where(eq(verificationRequests.userId, profileUserId))
            .limit(1);

          if (pendingVerification.length > 0 && (pendingVerification[0].status === 'pending' || pendingVerification[0].status === 'under_review')) {
            verificationStatus = {
              hasPendingVerification: true,
              pendingSubmittedAt: pendingVerification[0].submittedAt.toISOString()
            };
          }
        }
      } else if (userWithProfile.role === 'recruiter' && userWithProfile.recruitingProfile) {
        profileType = 'recruiter';
        // Get full recruiting profile with related data
        const recruitingProfile = await recruitingOperations.getRecruitingProfile(profileUserId);
        profileData = recruitingProfile;

        // Check for pending verification request if it's the user's own profile
        if (isOwnProfile) {
          const pendingVerification = await db
            .select({
              status: verificationRequests.status,
              submittedAt: verificationRequests.submittedAt
            })
            .from(verificationRequests)
            .where(eq(verificationRequests.userId, profileUserId))
            .limit(1);

          if (pendingVerification.length > 0 && (pendingVerification[0].status === 'pending' || pendingVerification[0].status === 'under_review')) {
            verificationStatus = {
              hasPendingVerification: true,
              pendingSubmittedAt: pendingVerification[0].submittedAt.toISOString()
            };
          }
        }
      }
    } catch (dbError) {
      console.error('Database error fetching profile:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Sanitize the profile data based on viewing permissions
    const sanitizedProfile = sanitizeProfileData(profileData, profileType, isOwnProfile, isAdmin);

    if (!sanitizedProfile || !profileType) {
      return NextResponse.json(
        { error: 'Profile data could not be processed' },
        { status: 500 }
      );
    }

    // Transform the profile data to match the component interface
    const transformedProfile = transformProfileData(sanitizedProfile, profileType);

    // Add verification status to the response if applicable
    const responseData = {
      success: true,
      profile: transformedProfile,
      profileType,
      isOwnProfile,
      isAdmin,
      canEdit: isOwnProfile || isAdmin,
      currentUserRole,
      ...(verificationStatus && verificationStatus)
    };

    // Return profile data with ownership information
    const response = NextResponse.json(responseData);

    // Set cache headers based on user role
    if (isOwnProfile || isAdmin) {
      setCacheHeaders(response, CACHE_CONFIG.OWN_PROFILE_CACHE_SECONDS, false);
    } else {
      setCacheHeaders(response, CACHE_CONFIG.PUBLIC_PROFILE_CACHE_SECONDS, true);
    }

    return response;

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: ProfilePageParams
) {
  try {
    // SECURITY: Validate request size and URL length to prevent DoS attacks
    const url = new URL(request.url);
    
    // Limit total URL length (including query params)
    const MAX_URL_LENGTH = 2048;
    if (request.url.length > MAX_URL_LENGTH) {
      return NextResponse.json(
        { error: 'URL too long' },
        { status: 414 }
      );
    }

    // Limit query string size
    const MAX_QUERY_LENGTH = 512; // Smaller for PUT requests
    if (url.search.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: 'Query parameters too long' },
        { status: 400 }
      );
    }

    const { id: profileUserId } = await params;

    // Use the secure ownership validation utility
    const auth = await requireOwnershipOrAdmin(profileUserId);
    if (auth instanceof NextResponse) return auth;

    const { userId: currentUserId } = auth;

    // Parse the request body
    const updateData = await request.json();

    // SECURITY: Prevent privilege escalation attacks
    // Never allow these critical security fields to be updated via profile API
    delete updateData.isVerified; // Only admins should set verification via separate process
    delete updateData.role; // Roles should never be changeable via profile API
    delete updateData.userId; // User ID should never be changeable
    delete updateData.createdAt; // Creation date should never be changeable
    delete updateData.updatedAt; // Update date is managed by database

    // Get the current user to determine their role
    const userWithProfile = await userOperations.getUserWithProfile(currentUserId);
    if (!userWithProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let updatedProfile: any = null;

    if (userWithProfile.role === 'athlete') {
      // Update athlete profile
      try {
        // Transform the update data to match database schema
        const profileUpdateData: Partial<NewAthleteProfile> = {};
        
        // Map common fields
        if (updateData.fullName !== undefined) profileUpdateData.fullName = updateData.fullName;
        if (updateData.sport !== undefined) profileUpdateData.sport = updateData.sport;
        if (updateData.secondarySports !== undefined) profileUpdateData.secondarySports = updateData.secondarySports;
        if (updateData.graduationYear !== undefined) profileUpdateData.graduationYear = updateData.graduationYear;
        if (updateData.educationLevel !== undefined) profileUpdateData.educationLevel = updateData.educationLevel;
        if (updateData.organizationName !== undefined) profileUpdateData.organizationName = updateData.organizationName;
        if (updateData.city !== undefined) profileUpdateData.city = updateData.city;
        if (updateData.state !== undefined) profileUpdateData.state = updateData.state;
        if (updateData.height !== undefined) profileUpdateData.height = updateData.height;
        if (updateData.weight !== undefined) profileUpdateData.weight = updateData.weight;
        if (updateData.positions !== undefined) profileUpdateData.positions = updateData.positions;
        if (updateData.gpa !== undefined) profileUpdateData.gpa = updateData.gpa;
        if (updateData.satScore !== undefined) profileUpdateData.satScore = updateData.satScore;
        if (updateData.actScore !== undefined) profileUpdateData.actScore = updateData.actScore;
        if (updateData.intendedMajor !== undefined) profileUpdateData.intendedMajor = updateData.intendedMajor;
        if (updateData.gender !== undefined) profileUpdateData.gender = updateData.gender;
        if (updateData.personalStatement !== undefined) profileUpdateData.personalStatement = updateData.personalStatement;
        
        // Handle URL fields with correct field names
        if (updateData.maxPrepsUrl !== undefined) profileUpdateData.maxprepsUrl = updateData.maxPrepsUrl; // Note: client sends maxPrepsUrl, DB expects maxprepsUrl
        if (updateData.hudlUrl !== undefined) profileUpdateData.hudlUrl = updateData.hudlUrl;
        if (updateData.hudlEmbedUrl !== undefined) profileUpdateData.hudlEmbedUrl = updateData.hudlEmbedUrl;
        
        // Handle social media - extract from socialMedia object
        if (updateData.socialMedia !== undefined) {
          profileUpdateData.instagramHandle = updateData.socialMedia?.instagram || null;
          profileUpdateData.twitterHandle = updateData.socialMedia?.twitter || null;
        }

        // Update the athlete profile in the database
        updatedProfile = await athleteOperations.updateAthleteProfile(profileUserId, profileUpdateData);
        
        // Handle measurables updates if provided
        if (updateData.measurables !== undefined && Array.isArray(updateData.measurables)) {
          // Transform client measurables data to database format
          const measurablesData: NewAthleteMeasurable[] = updateData.measurables.map((measurable: {
            sport: string;
            label: string;
            value: string;
            measurementDate: string;
          }) => ({
            athleteId: updatedProfile?.id || 0, // Use the database profile ID
            sport: measurable.sport,
            label: measurable.label,
            value: measurable.value,
            measurementDate: measurable.measurementDate
          }));
          
          // Replace all existing measurables with new ones
          if (updatedProfile?.id) {
            await athleteOperations.replaceAthleteMeasurables(updatedProfile.id, measurablesData);
          }
        }

        // Handle video updates if provided
        if (updateData.youtubeVideos !== undefined && Array.isArray(updateData.youtubeVideos)) {
          // Transform client videos data to database format
          const videosData: NewAthleteVideo[] = updateData.youtubeVideos.map((video: {
            title: string;
            url: string;
            embedUrl: string;
            sortOrder?: number;
          }) => ({
            athleteId: updatedProfile?.id || 0, // Use the database profile ID
            title: video.title,
            youtubeUrl: video.url,
            embedUrl: video.embedUrl,
            sortOrder: video.sortOrder || 0
          }));
          
          // Replace all existing videos with new ones
          if (updatedProfile?.id) {
            await athleteOperations.replaceAthleteVideos(updatedProfile.id, videosData);
          }
        }
        
        // Re-fetch the complete profile with all related data to ensure consistency
        updatedProfile = await athleteOperations.getAthleteProfile(profileUserId);
        
      } catch (dbError) {
        console.error('Database error updating athlete profile:', dbError);
        return NextResponse.json(
          { error: 'Failed to update athlete profile' },
          { status: 500 }
        );
      }
    } else if (userWithProfile.role === 'coach') {
      // Update coach profile
      try {
        // Transform the update data to match database schema
        const profileUpdateData: Partial<NewCoachProfile> = {};
        
        // Map common fields
        if (updateData.fullName !== undefined) profileUpdateData.fullName = updateData.fullName;
        if (updateData.title !== undefined) profileUpdateData.title = updateData.title;
        if (updateData.sportCoaching !== undefined) profileUpdateData.sportCoaching = updateData.sportCoaching;
        if (updateData.organizationName !== undefined) profileUpdateData.organizationName = updateData.organizationName;
        if (updateData.city !== undefined) profileUpdateData.city = updateData.city;
        if (updateData.state !== undefined) profileUpdateData.state = updateData.state;
        if (updateData.division !== undefined) profileUpdateData.division = updateData.division;
        if (updateData.conference !== undefined) profileUpdateData.conference = updateData.conference;
        if (updateData.personalStatement !== undefined) profileUpdateData.personalStatement = updateData.personalStatement;
        if (updateData.programWebsite !== undefined) profileUpdateData.programWebsite = updateData.programWebsite;
        if (updateData.schoolWebsite !== undefined) profileUpdateData.schoolWebsite = updateData.schoolWebsite;
        if (updateData.instagramHandle !== undefined) profileUpdateData.instagramHandle = updateData.instagramHandle;
        if (updateData.twitterHandle !== undefined) profileUpdateData.twitterHandle = updateData.twitterHandle;
        if (updateData.showcaseVideoTitle !== undefined) profileUpdateData.showcaseVideoTitle = updateData.showcaseVideoTitle;
        if (updateData.showcaseVideoUrl !== undefined) profileUpdateData.showcaseVideoUrl = updateData.showcaseVideoUrl;
        if (updateData.showcaseVideoEmbedUrl !== undefined) profileUpdateData.showcaseVideoEmbedUrl = updateData.showcaseVideoEmbedUrl;

        // Update the coach profile in the database
        updatedProfile = await coachOperations.updateCoachProfile(profileUserId, profileUpdateData);
        
        // Handle recruiting needs updates if provided
        if (updateData.recruitingNeeds !== undefined && updatedProfile?.id) {
          const recruitingNeedsData = {
            graduationYears: updateData.recruitingNeeds.graduationYears || [],
            positions: updateData.recruitingNeeds.positions || [],
            scholarshipsAvailable: updateData.recruitingNeeds.scholarshipsAvailable || null,
            recruitingPhilosophy: updateData.recruitingNeeds.recruitingPhilosophy || null
          };
          
          await recruitingNeedsOperations.updateRecruitingNeeds(updatedProfile.id, recruitingNeedsData);
        }
        
        // Re-fetch the complete profile with all related data to ensure consistency
        updatedProfile = await coachOperations.getCoachProfile(profileUserId);
        
      } catch (dbError) {
        console.error('Database error updating coach profile:', dbError);
        return NextResponse.json(
          { error: 'Failed to update coach profile' },
          { status: 500 }
        );
      }
    } else if (userWithProfile.role === 'recruiter') {
      // Update recruiting profile
      try {
        // Transform the update data to match database schema
        const profileUpdateData: Partial<NewRecruitingProfile> = {};
        
        // Map common fields
        if (updateData.fullName !== undefined) profileUpdateData.fullName = updateData.fullName;
        if (updateData.title !== undefined) profileUpdateData.title = updateData.title;
        if (updateData.sportRecruiting !== undefined) profileUpdateData.sportRecruiting = updateData.sportRecruiting;
        if (updateData.organizationName !== undefined) profileUpdateData.organizationName = updateData.organizationName;
        if (updateData.city !== undefined) profileUpdateData.city = updateData.city;
        if (updateData.state !== undefined) profileUpdateData.state = updateData.state;
        if (updateData.division !== undefined) profileUpdateData.division = updateData.division;
        if (updateData.conference !== undefined) profileUpdateData.conference = updateData.conference;
        if (updateData.personalStatement !== undefined) profileUpdateData.personalStatement = updateData.personalStatement;
        if (updateData.programWebsite !== undefined) profileUpdateData.programWebsite = updateData.programWebsite;
        if (updateData.schoolWebsite !== undefined) profileUpdateData.schoolWebsite = updateData.schoolWebsite;
        if (updateData.instagramHandle !== undefined) profileUpdateData.instagramHandle = updateData.instagramHandle;
        if (updateData.twitterHandle !== undefined) profileUpdateData.twitterHandle = updateData.twitterHandle;
        if (updateData.showcaseVideoTitle !== undefined) profileUpdateData.showcaseVideoTitle = updateData.showcaseVideoTitle;
        if (updateData.showcaseVideoUrl !== undefined) profileUpdateData.showcaseVideoUrl = updateData.showcaseVideoUrl;
        if (updateData.showcaseVideoEmbedUrl !== undefined) profileUpdateData.showcaseVideoEmbedUrl = updateData.showcaseVideoEmbedUrl;

        // Update the recruiting profile in the database
        updatedProfile = await recruitingOperations.updateRecruitingProfile(profileUserId, profileUpdateData);
        
        // Handle recruiting needs updates if provided
        if (updateData.recruitingNeeds !== undefined && updatedProfile?.id) {
          const recruitingNeedsData = {
            graduationYears: updateData.recruitingNeeds.graduationYears || [],
            positions: updateData.recruitingNeeds.positions || [],
            scholarshipsAvailable: updateData.recruitingNeeds.scholarshipsAvailable || null,
            recruitingPhilosophy: updateData.recruitingNeeds.recruitingPhilosophy || null
          };
          
          // Use recruitingProfileNeeds instead of recruitingNeeds for recruiting profiles
          if (recruitingNeedsOperations.updateRecruitingProfileNeeds) {
            await recruitingNeedsOperations.updateRecruitingProfileNeeds(updatedProfile.id, recruitingNeedsData);
          }
        }
        
        // Re-fetch the complete profile with all related data to ensure consistency
        updatedProfile = await recruitingOperations.getRecruitingProfile(profileUserId);
        
      } catch (dbError) {
        console.error('Database error updating recruiting profile:', dbError);
        return NextResponse.json(
          { error: 'Failed to update recruiting profile' },
          { status: 500 }
        );
      }
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Transform the updated profile data to match the component interface
    const transformedProfile = transformProfileData(updatedProfile, userWithProfile.role);

    return NextResponse.json({
      success: true,
      profile: transformedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 