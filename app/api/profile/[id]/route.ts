import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { userOperations, athleteOperations, coachOperations, recruitingOperations } from '@/lib/db-utils';
import { R2_PUBLIC_URL } from '@/lib/r2';

interface ProfilePageParams {
  params: Promise<{
    id: string;
  }>;
}

// Cache configuration - different cache times based on data sensitivity
const CACHE_CONFIG = {
  // Public profile data can be cached longer
  PUBLIC_PROFILE_CACHE_SECONDS: 300, // 5 minutes
  // Own profile data cached shorter for freshness
  OWN_PROFILE_CACHE_SECONDS: 60, // 1 minute
  // Admin views get fresh data
  ADMIN_CACHE_SECONDS: 30, // 30 seconds
};

// Helper function to set cache headers
function setCacheHeaders(response: NextResponse, cacheSeconds: number) {
  // Set Cache-Control header for both browser and CDN caching
  response.headers.set('Cache-Control', `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`);
  // Add ETag for better cache validation
  response.headers.set('Vary', 'Authorization');
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

    // Set maxPrepsVerified based on verification status
    transformed.maxPrepsVerified = transformed.isVerified || false;

    // Ensure achievements is an array
    if (!Array.isArray(transformed.achievements)) {
      transformed.achievements = [];
    }

    // Ensure measurables is an array
    if (!Array.isArray(transformed.measurables)) {
      transformed.measurables = [];
    }

    // Ensure URLs are properly handled - set to undefined if null or empty
    if (!transformed.maxPrepsUrl || transformed.maxPrepsUrl.trim() === '') {
      transformed.maxPrepsUrl = undefined;
    }
    if (!transformed.hudlUrl || transformed.hudlUrl.trim() === '') {
      transformed.hudlUrl = undefined;
    }
    if (!transformed.hudlEmbedUrl || transformed.hudlEmbedUrl.trim() === '') {
      transformed.hudlEmbedUrl = undefined;
    }
  } else if (profileType === 'coach' || profileType === 'recruiter') {
    // Transform organization logo from R3 key to URL using proper R2 configuration
    if (profileData.organizationLogo) {
      transformed.profileImage = `${R2_PUBLIC_URL}/${profileData.organizationLogo}`;
    }
  }

  return transformed;
}

export async function GET(
  request: NextRequest,
  { params }: ProfilePageParams
) {
  try {
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

    try {
      if (userWithProfile.role === 'athlete' && userWithProfile.athleteProfile) {
        profileType = 'athlete';
        // Get full athlete profile with related data
        const athleteProfile = await athleteOperations.getAthleteProfile(profileUserId);
        profileData = athleteProfile;
      } else if (userWithProfile.role === 'coach' && userWithProfile.coachProfile) {
        profileType = 'coach';
        // Get full coach profile with related data
        const coachProfile = await coachOperations.getCoachProfile(profileUserId);
        profileData = coachProfile;
      } else if (userWithProfile.role === 'recruiter' && userWithProfile.recruitingProfile) {
        profileType = 'recruiter';
        // Get full recruiting profile with related data
        const recruitingProfile = await recruitingOperations.getRecruitingProfile(profileUserId);
        profileData = recruitingProfile;
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

    // Return profile data with ownership information
    const response = NextResponse.json({
      success: true,
      profile: transformedProfile,
      profileType,
      isOwnProfile,
      isAdmin,
      canEdit: isOwnProfile || isAdmin,
      currentUserRole,
    });

    // Set cache headers based on user role
    if (isOwnProfile || isAdmin) {
      setCacheHeaders(response, CACHE_CONFIG.OWN_PROFILE_CACHE_SECONDS);
    } else {
      setCacheHeaders(response, CACHE_CONFIG.PUBLIC_PROFILE_CACHE_SECONDS);
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