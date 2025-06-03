import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole, requireOwnershipOrAdmin } from '@/utils/roles';
import { userOperations, athleteOperations, coachOperations, recruitingOperations, recruitingNeedsOperations } from '@/database/db-utils';
import { R2_PUBLIC_URL } from '@/database/r2';
import { NewAthleteProfile, NewAthleteMeasurable, NewAthleteVideo, NewCoachProfile, NewRecruitingProfile, verificationRequests, AthleteProfile, CoachProfile, RecruitingProfile } from '@/database/schema';
import { db } from '@/database/db';
import { eq } from 'drizzle-orm';
import { sanitizeProfileData } from '@/utils/sanitization';
import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';

// Force Node.js runtime to avoid expensive edge function costs
export const runtime = 'nodejs';

interface ProfilePageParams {
  params: Promise<{
    id: string;
  }>;
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

// Basic input validation schemas
const validateBasicFields = (data: Record<string, unknown>) => {
  const errors: string[] = [];
  
  // String length validation
  if (data.fullName && (typeof data.fullName !== 'string' || data.fullName.length > 100)) {
    errors.push('Full name must be a string under 100 characters');
  }
  
  if (data.city && (typeof data.city !== 'string' || data.city.length > 50)) {
    errors.push('City must be a string under 50 characters');
  }
  
  if (data.personalStatement && (typeof data.personalStatement !== 'string' || data.personalStatement.length > 1000)) {
    errors.push('Personal statement must be under 1000 characters');
  }
  
  // Numeric validation
  if (data.gpa !== undefined && (typeof data.gpa !== 'number' || data.gpa < 0 || data.gpa > 5)) {
    errors.push('GPA must be a number between 0 and 5');
  }
  
  if (data.graduationYear && (typeof data.graduationYear !== 'number' || data.graduationYear < 2020 || data.graduationYear > 2040)) {
    errors.push('Graduation year must be between 2020 and 2035');
  }
  
  // URL validation
  if (data.maxPrepsUrl && typeof data.maxPrepsUrl === 'string' && data.maxPrepsUrl.length > 0) {
    try {
      new URL(data.maxPrepsUrl);
      if (!data.maxPrepsUrl.includes('maxpreps.com')) {
        errors.push('MaxPreps URL must be from maxpreps.com');
      }
    } catch {
      errors.push('MaxPreps URL must be a valid URL');
    }
  }
  
  return errors;
};

// Sanitize error messages
const sanitizeError = (error: Error | unknown): string => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  
  // Don't expose internal details
  if (message.includes('database') || message.includes('SQL') || message.includes('connection')) {
    return 'A database error occurred. Please try again.';
  }
  
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }
  
  return 'An error occurred while updating your profile.';
};

// Helper function to sanitize profile data based on viewing permissions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeForViewing(profileData: Record<string, any>, profileType: string | null, isOwnProfile: boolean, isAdmin: boolean): Record<string, any> | null {
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

        // Check for verification request status if it's the user's own profile
        if (isOwnProfile) {
          const verificationRequest = await db
            .select({
              status: verificationRequests.status,
              submittedAt: verificationRequests.submittedAt,
              reviewedAt: verificationRequests.reviewedAt,
              rejectionReason: verificationRequests.rejectionReason
            })
            .from(verificationRequests)
            .where(eq(verificationRequests.userId, profileUserId))
            .limit(1);

          if (verificationRequest.length > 0) {
            const verification = verificationRequest[0];
            
            if (verification.status === 'pending' || verification.status === 'under_review') {
              verificationStatus = {
                hasPendingVerification: true,
                pendingSubmittedAt: verification.submittedAt.toISOString()
              };
            } else if (verification.status === 'rejected') {
              verificationStatus = {
                hasRejectedVerification: true,
                rejectionReason: verification.rejectionReason,
                rejectedAt: verification.reviewedAt?.toISOString(),
                submittedAt: verification.submittedAt.toISOString()
              };
            } else if (verification.status === 'approved') {
              // This should already be reflected in the isVerified field on the profile
            }
          }
        }
      } else if (userWithProfile.role === 'coach' && userWithProfile.coachProfile) {
        profileType = 'coach';
        // Get full coach profile with related data
        const coachProfile = await coachOperations.getCoachProfile(profileUserId);
        profileData = coachProfile;

        // Check for verification request status if it's the user's own profile
        if (isOwnProfile) {
          const verificationRequest = await db
            .select({
              status: verificationRequests.status,
              submittedAt: verificationRequests.submittedAt,
              reviewedAt: verificationRequests.reviewedAt,
              rejectionReason: verificationRequests.rejectionReason
            })
            .from(verificationRequests)
            .where(eq(verificationRequests.userId, profileUserId))
            .limit(1);

          if (verificationRequest.length > 0) {
            const verification = verificationRequest[0];
            
            if (verification.status === 'pending' || verification.status === 'under_review') {
              verificationStatus = {
                hasPendingVerification: true,
                pendingSubmittedAt: verification.submittedAt.toISOString()
              };
            } else if (verification.status === 'rejected') {
              verificationStatus = {
                hasRejectedVerification: true,
                rejectionReason: verification.rejectionReason,
                rejectedAt: verification.reviewedAt?.toISOString(),
                submittedAt: verification.submittedAt.toISOString()
              };
            } else if (verification.status === 'approved') {
              // This should already be reflected in the isVerified field on the profile
            }
          }
        }
      } else if (userWithProfile.role === 'recruiter' && userWithProfile.recruitingProfile) {
        profileType = 'recruiter';
        // Get full recruiting profile with related data
        const recruitingProfile = await recruitingOperations.getRecruitingProfile(profileUserId);
        profileData = recruitingProfile;

        // Check for verification request status if it's the user's own profile
        if (isOwnProfile) {
          const verificationRequest = await db
            .select({
              status: verificationRequests.status,
              submittedAt: verificationRequests.submittedAt,
              reviewedAt: verificationRequests.reviewedAt,
              rejectionReason: verificationRequests.rejectionReason
            })
            .from(verificationRequests)
            .where(eq(verificationRequests.userId, profileUserId))
            .limit(1);

          if (verificationRequest.length > 0) {
            const verification = verificationRequest[0];
            
            if (verification.status === 'pending' || verification.status === 'under_review') {
              verificationStatus = {
                hasPendingVerification: true,
                pendingSubmittedAt: verification.submittedAt.toISOString()
              };
            } else if (verification.status === 'rejected') {
              verificationStatus = {
                hasRejectedVerification: true,
                rejectionReason: verification.rejectionReason,
                rejectedAt: verification.reviewedAt?.toISOString(),
                submittedAt: verification.submittedAt.toISOString()
              };
            } else if (verification.status === 'approved') {
              // This should already be reflected in the isVerified field on the profile
            }
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
    const sanitizedProfile = sanitizeForViewing(profileData, profileType, isOwnProfile, isAdmin);

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

    // Handle CORS properly
    if (isOwnProfile) {
      // Return full profile data for the user - verification status at top level
      return NextResponse.json(responseData);
    } else {
      // Return public profile data for other users
      const publicProfileData = sanitizeForViewing(responseData, profileType, isOwnProfile, isAdmin);
      return NextResponse.json(publicProfileData || responseData);
    }

  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve profile',
      details: 'An unexpected error occurred'
    }, { status: 500 });
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

    // CRITICAL: XSS Protection - Sanitize all user input
    const sanitizedData = sanitizeProfileData(updateData);

    // CRITICAL: Input validation
    const validationErrors = validateBasicFields(sanitizedData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    // SECURITY: Prevent privilege escalation attacks
    // Never allow these critical security fields to be updated via profile API
    delete sanitizedData.isVerified; // Only admins should set verification via separate process
    delete sanitizedData.role; // Roles should never be changeable via profile API
    delete sanitizedData.userId; // User ID should never be changeable
    delete sanitizedData.createdAt; // Creation date should never be changeable
    delete sanitizedData.updatedAt; // Update date is managed by database

    // Get the current user to determine their role
    const userWithProfile = await userOperations.getUserWithProfile(currentUserId);

    if (!userWithProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileType = userWithProfile.role;
    let updatedProfile: AthleteProfile | CoachProfile | RecruitingProfile | null = null;

    // Update profile based on type
    if (profileType === 'athlete') {
      // First, update the athlete profile data
      const profileUpdateData: Partial<NewAthleteProfile> = {};
      
      // Map common fields with proper type casting
      if (sanitizedData.fullName !== undefined) profileUpdateData.fullName = sanitizedData.fullName as string;
      if (sanitizedData.sport !== undefined) profileUpdateData.sport = sanitizedData.sport as string;
      if (sanitizedData.secondarySports !== undefined) profileUpdateData.secondarySports = sanitizedData.secondarySports as string[];
      if (sanitizedData.graduationYear !== undefined) profileUpdateData.graduationYear = sanitizedData.graduationYear as number;
      if (sanitizedData.educationLevel !== undefined) profileUpdateData.educationLevel = sanitizedData.educationLevel as EducationLevel;
      if (sanitizedData.organizationName !== undefined) profileUpdateData.organizationName = sanitizedData.organizationName as string;
      if (sanitizedData.city !== undefined) profileUpdateData.city = sanitizedData.city as string;
      if (sanitizedData.state !== undefined) profileUpdateData.state = sanitizedData.state as string;
      if (sanitizedData.height !== undefined) profileUpdateData.height = sanitizedData.height as string;
      if (sanitizedData.weight !== undefined) profileUpdateData.weight = sanitizedData.weight as string;
      if (sanitizedData.positions !== undefined) profileUpdateData.positions = sanitizedData.positions as string[];
      if (sanitizedData.gpa !== undefined) profileUpdateData.gpa = String(sanitizedData.gpa as number);
      if (sanitizedData.satScore !== undefined) profileUpdateData.satScore = sanitizedData.satScore as number;
      if (sanitizedData.actScore !== undefined) profileUpdateData.actScore = sanitizedData.actScore as number;
      if (sanitizedData.intendedMajor !== undefined) profileUpdateData.intendedMajor = sanitizedData.intendedMajor as string;
      if (sanitizedData.personalStatement !== undefined) profileUpdateData.personalStatement = sanitizedData.personalStatement as string;
      
      // Handle URL fields with correct field names
      if (sanitizedData.maxPrepsUrl !== undefined) profileUpdateData.maxprepsUrl = sanitizedData.maxPrepsUrl as string;
      if (sanitizedData.hudlUrl !== undefined) profileUpdateData.hudlUrl = sanitizedData.hudlUrl as string;
      if (sanitizedData.hudlEmbedUrl !== undefined) profileUpdateData.hudlEmbedUrl = sanitizedData.hudlEmbedUrl as string;
      
      // Handle social media - extract from socialMedia object
      if (sanitizedData.socialMedia !== undefined) {
        const socialMedia = sanitizedData.socialMedia as { instagram?: string; twitter?: string };
        profileUpdateData.instagramHandle = socialMedia?.instagram || null;
        profileUpdateData.twitterHandle = socialMedia?.twitter || null;
      }

      // Update the athlete profile in the database
      updatedProfile = await athleteOperations.updateAthleteProfile(profileUserId, profileUpdateData);
      
      // Handle measurables updates if provided
      if (sanitizedData.measurables !== undefined && Array.isArray(sanitizedData.measurables)) {
        // Transform client measurables data to database format
        const measurablesData: NewAthleteMeasurable[] = sanitizedData.measurables.map((measurable: {
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
      if (sanitizedData.youtubeVideos !== undefined && Array.isArray(sanitizedData.youtubeVideos)) {
        // Transform client videos data to database format
        const videosData: NewAthleteVideo[] = sanitizedData.youtubeVideos.map((video: {
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
      const refetchedProfile = await athleteOperations.getAthleteProfile(profileUserId);
      if (refetchedProfile) {
        updatedProfile = refetchedProfile;
      }
      
    } else if (profileType === 'coach') {
      // Update coach profile
      const profileUpdateData: Partial<NewCoachProfile> = {};
      
      // Map common fields with proper type casting
      if (sanitizedData.fullName !== undefined) profileUpdateData.fullName = sanitizedData.fullName as string;
      if (sanitizedData.title !== undefined) profileUpdateData.title = sanitizedData.title as string;
      if (sanitizedData.sportCoaching !== undefined) profileUpdateData.sportCoaching = sanitizedData.sportCoaching as string;
      if (sanitizedData.organizationName !== undefined) profileUpdateData.organizationName = sanitizedData.organizationName as string;
      if (sanitizedData.city !== undefined) profileUpdateData.city = sanitizedData.city as string;
      if (sanitizedData.state !== undefined) profileUpdateData.state = sanitizedData.state as string;
      if (sanitizedData.division !== undefined) profileUpdateData.division = sanitizedData.division as string;
      if (sanitizedData.conference !== undefined) profileUpdateData.conference = sanitizedData.conference as string;
      if (sanitizedData.personalStatement !== undefined) profileUpdateData.personalStatement = sanitizedData.personalStatement as string;
      if (sanitizedData.programWebsite !== undefined) profileUpdateData.programWebsite = sanitizedData.programWebsite as string;
      if (sanitizedData.schoolWebsite !== undefined) profileUpdateData.schoolWebsite = sanitizedData.schoolWebsite as string;
      if (sanitizedData.instagramHandle !== undefined) profileUpdateData.instagramHandle = sanitizedData.instagramHandle as string;
      if (sanitizedData.twitterHandle !== undefined) profileUpdateData.twitterHandle = sanitizedData.twitterHandle as string;
      if (sanitizedData.showcaseVideoTitle !== undefined) profileUpdateData.showcaseVideoTitle = sanitizedData.showcaseVideoTitle as string;
      if (sanitizedData.showcaseVideoUrl !== undefined) profileUpdateData.showcaseVideoUrl = sanitizedData.showcaseVideoUrl as string;
      if (sanitizedData.showcaseVideoEmbedUrl !== undefined) profileUpdateData.showcaseVideoEmbedUrl = sanitizedData.showcaseVideoEmbedUrl as string;

      // Update the coach profile in the database
      updatedProfile = await coachOperations.updateCoachProfile(profileUserId, profileUpdateData);
      
      // Handle recruiting needs updates if provided
      if (sanitizedData.recruitingNeeds !== undefined && updatedProfile?.id) {
        const recruitingNeeds = sanitizedData.recruitingNeeds as {
          graduationYears?: number[];
          positions?: string[];
          scholarshipsAvailable?: number;
          recruitingPhilosophy?: string;
        };
        
        const recruitingNeedsData = {
          graduationYears: recruitingNeeds.graduationYears || [],
          positions: recruitingNeeds.positions || [],
          scholarshipsAvailable: recruitingNeeds.scholarshipsAvailable || null,
          recruitingPhilosophy: recruitingNeeds.recruitingPhilosophy || null
        };
        
        await recruitingNeedsOperations.updateRecruitingNeeds(updatedProfile.id, recruitingNeedsData);
      }
      
      // Re-fetch the complete profile with all related data to ensure consistency
      const refetchedProfile = await coachOperations.getCoachProfile(profileUserId);
      if (refetchedProfile) {
        updatedProfile = refetchedProfile;
      }
      
    } else if (profileType === 'recruiter') {
      // Update recruiting profile
      const profileUpdateData: Partial<NewRecruitingProfile> = {};
      
      // Map common fields with proper type casting
      if (sanitizedData.fullName !== undefined) profileUpdateData.fullName = sanitizedData.fullName as string;
      if (sanitizedData.title !== undefined) profileUpdateData.title = sanitizedData.title as string;
      if (sanitizedData.sportRecruiting !== undefined) profileUpdateData.sportRecruiting = sanitizedData.sportRecruiting as string;
      if (sanitizedData.organizationName !== undefined) profileUpdateData.organizationName = sanitizedData.organizationName as string;
      if (sanitizedData.city !== undefined) profileUpdateData.city = sanitizedData.city as string;
      if (sanitizedData.state !== undefined) profileUpdateData.state = sanitizedData.state as string;
      if (sanitizedData.division !== undefined) profileUpdateData.division = sanitizedData.division as string;
      if (sanitizedData.conference !== undefined) profileUpdateData.conference = sanitizedData.conference as string;
      if (sanitizedData.personalStatement !== undefined) profileUpdateData.personalStatement = sanitizedData.personalStatement as string;
      if (sanitizedData.programWebsite !== undefined) profileUpdateData.programWebsite = sanitizedData.programWebsite as string;
      if (sanitizedData.schoolWebsite !== undefined) profileUpdateData.schoolWebsite = sanitizedData.schoolWebsite as string;
      if (sanitizedData.instagramHandle !== undefined) profileUpdateData.instagramHandle = sanitizedData.instagramHandle as string;
      if (sanitizedData.twitterHandle !== undefined) profileUpdateData.twitterHandle = sanitizedData.twitterHandle as string;
      if (sanitizedData.showcaseVideoTitle !== undefined) profileUpdateData.showcaseVideoTitle = sanitizedData.showcaseVideoTitle as string;
      if (sanitizedData.showcaseVideoUrl !== undefined) profileUpdateData.showcaseVideoUrl = sanitizedData.showcaseVideoUrl as string;
      if (sanitizedData.showcaseVideoEmbedUrl !== undefined) profileUpdateData.showcaseVideoEmbedUrl = sanitizedData.showcaseVideoEmbedUrl as string;

      // Update the recruiting profile in the database
      updatedProfile = await recruitingOperations.updateRecruitingProfile(profileUserId, profileUpdateData);
      
      // Handle sport-specific recruiting needs updates if provided
      if (sanitizedData.sportSpecificNeeds !== undefined && updatedProfile?.id) {
        const sportSpecificNeeds = sanitizedData.sportSpecificNeeds as { [sport: string]: {
          graduationYears: number[];
          positions: string[];
          scholarshipsAvailable?: number;
          recruitingPhilosophy?: string;
        } };
        
        // Get existing recruiting needs for this profile
        const existingNeeds = await recruitingNeedsOperations.getAllRecruitingProfileNeeds(updatedProfile.id);
        const existingSports = new Set(existingNeeds.map(need => need.sport));
        const newSports = new Set(Object.keys(sportSpecificNeeds));
        
        // Delete recruiting needs for sports that are no longer included
        for (const sport of existingSports) {
          if (!newSports.has(sport)) {
            await recruitingNeedsOperations.deleteRecruitingProfileNeedsBySport(updatedProfile.id, sport);
          }
        }
        
        // Create or update recruiting needs for each sport
        for (const [sport, needs] of Object.entries(sportSpecificNeeds)) {
          const needsData = {
            recruitingProfileId: updatedProfile.id,
            sport: sport,
            graduationYears: needs.graduationYears || [],
            positions: needs.positions || [],
            scholarshipsAvailable: needs.scholarshipsAvailable || null,
            recruitingPhilosophy: needs.recruitingPhilosophy || null
          };
          
          if (existingSports.has(sport)) {
            // Update existing recruiting needs
            await recruitingNeedsOperations.updateRecruitingProfileNeeds(updatedProfile.id, sport, needsData);
          } else {
            // Create new recruiting needs
            await recruitingNeedsOperations.createRecruitingProfileNeeds(needsData);
          }
        }
      }
      
      // Re-fetch the complete profile with all related data to ensure consistency
      const refetchedProfile = await recruitingOperations.getRecruitingProfile(profileUserId);
      if (refetchedProfile) {
        updatedProfile = refetchedProfile;
      }
      
    } else {
      return NextResponse.json(
        { error: 'Invalid profile type' },
        { status: 400 }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Transform the updated profile data to match the component interface
    const transformedProfile = transformProfileData(updatedProfile, profileType);

    return NextResponse.json({
      success: true,
      data: transformedProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    );
  }
} 