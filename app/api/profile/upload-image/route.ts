import { NextRequest, NextResponse } from 'next/server';
import { requireOwnershipOrAdmin } from '@/utils/roles';
import { uploadProfilePicture, uploadOrganizationLogo } from '@/database/r2/uploads';
import { deleteFromR2, getR2KeyFromUrl } from '@/database/r2/config';
import { coachOperations, athleteOperations, recruitingOperations, userOperations, adminOperations } from '@/database/db-utils';
import { withRateLimit } from '@/utils/rate-limiting';
import { validateFile, scanContent, createErrorResponse, createSuccessResponse, invalidateCache } from '@/utils/security-cache';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for file uploads
    const rateLimitCheck = await withRateLimit(request, 'fileUpload');
    if (!rateLimitCheck.success) {
      return rateLimitCheck.response;
    }

    // Parse form data
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const file = formData.get('file') as File;
    const imageType = formData.get('imageType') as 'profile' | 'organization';
    const currentImageUrl = formData.get('currentImageUrl') as string | null;
    const removeOnly = formData.get('removeOnly') as string | null;
    const demoProfileType = formData.get('demoProfileType') as 'athlete' | 'coach' | 'recruiter' | null;

    if (!userId) {
      return createErrorResponse('Missing user ID', 400);
    }

    if (!imageType) {
      return createErrorResponse('Missing image type', 400);
    }

    // Verify ownership or admin access
    const auth = await requireOwnershipOrAdmin(userId);
    if (auth instanceof NextResponse) return auth;

    // For admin users, require demoProfileType
    const userWithProfile = await userOperations.getUserWithProfile(userId);
    if (userWithProfile?.role === 'admin' && !demoProfileType) {
      return createErrorResponse('Demo profile type is required for admin users', 400);
    }

    // Handle remove-only operation
    if (removeOnly === 'true') {
      if (!currentImageUrl) {
        return createErrorResponse('No image to remove', 400);
      }

      try {
        // Delete from R2
        const oldKey = getR2KeyFromUrl(currentImageUrl);
        await deleteFromR2(oldKey, false);

        // userWithProfile already fetched above
        if (!userWithProfile) {
          return createErrorResponse('User not found', 404);
        }

        const updateData = imageType === 'profile' 
          ? { profileImageR3Key: null }
          : { organizationLogoR3Key: null };

        // Handle admin demo profiles
        if (userWithProfile.role === 'admin' && demoProfileType) {
          if (demoProfileType === 'athlete' && imageType === 'profile') {
            await adminOperations.updateDemoAthleteProfile(userId, updateData);
          } else if (demoProfileType === 'coach') {
            await adminOperations.updateDemoCoachProfile(userId, updateData);
          } else if (demoProfileType === 'recruiter') {
            await adminOperations.updateDemoRecruitingProfile(userId, updateData);
          }
        } else if (userWithProfile.role === 'athlete' && imageType === 'profile') {
          await athleteOperations.updateAthleteProfile(userId, updateData);
        } else if (userWithProfile.role === 'coach') {
          await coachOperations.updateCoachProfile(userId, updateData);
        } else if (userWithProfile.role === 'recruiter') {
          await recruitingOperations.updateRecruitingProfile(userId, updateData);
        }

        // Invalidate profile cache
        await invalidateCache(`profile:${userId}`);
        
        return createSuccessResponse({
          removed: true,
          message: 'Image removed successfully'
        }, rateLimitCheck.headers);

      } catch {
        return createErrorResponse('Failed to remove image', 500);
      }
    }

    // Validate file for upload
    if (!file) {
      return createErrorResponse('Missing file for upload', 400);
    }

    // File validation
    const validation = validateFile(file);
    if (!validation.valid) {
      return createErrorResponse(validation.error || 'Invalid file', 400);
    }

    // Content scanning
    const buffer = await file.arrayBuffer();
    const scanResult = await scanContent(buffer);
    
    if (!scanResult.safe) {
      return createErrorResponse(`File security check failed: ${scanResult.reason}`, 400);
    }

    try {
      // Get current image URL from database to ensure we have the most up-to-date information
      let currentImageKey: string | null = null;
      
      if (userWithProfile?.role === 'admin' && demoProfileType) {
        // For admin demo profiles, get the current image from the demo profile
        const demoProfiles = await adminOperations.getDemoProfiles(userId);
        if (demoProfileType === 'athlete' && imageType === 'profile') {
          currentImageKey = demoProfiles.athlete?.profileImageR3Key || null;
        } else if (demoProfileType === 'coach') {
          currentImageKey = imageType === 'profile' 
            ? demoProfiles.coach?.profileImageR3Key || null
            : demoProfiles.coach?.organizationLogoR3Key || null;
        } else if (demoProfileType === 'recruiter') {
          currentImageKey = imageType === 'profile' 
            ? demoProfiles.recruiter?.profileImageR3Key || null
            : demoProfiles.recruiter?.organizationLogoR3Key || null;
        }
      } else if (userWithProfile?.role === 'athlete' && imageType === 'profile') {
        currentImageKey = userWithProfile.athleteProfile?.profileImageR3Key || null;
      } else if (userWithProfile?.role === 'coach') {
        currentImageKey = imageType === 'profile' 
          ? userWithProfile.coachProfile?.profileImageR3Key || null
          : userWithProfile.coachProfile?.organizationLogoR3Key || null;
      } else if (userWithProfile?.role === 'recruiter') {
        currentImageKey = imageType === 'profile' 
          ? userWithProfile.recruitingProfile?.profileImageR3Key || null
          : userWithProfile.recruitingProfile?.organizationLogoR3Key || null;
      }

      // Delete old image if exists (try both database key and client-provided URL)
      const imagesToDelete = [];
      if (currentImageKey) {
        imagesToDelete.push(currentImageKey);
      }
      if (currentImageUrl && currentImageUrl !== currentImageKey) {
        const oldKey = getR2KeyFromUrl(currentImageUrl);
        if (oldKey !== currentImageKey) {
          imagesToDelete.push(oldKey);
        }
      }

      // Delete all old images
      for (const keyToDelete of imagesToDelete) {
        try {
          await deleteFromR2(keyToDelete, false);
          console.log(`Successfully deleted old image: ${keyToDelete}`);
        } catch (error) {
          console.error(`Failed to delete old image ${keyToDelete}:`, error);
          // Continue - don't fail the upload if old image deletion fails
        }
      }

      // Upload new image
      const uploadResult = imageType === 'profile'
        ? await uploadProfilePicture(file, userId)
        : await uploadOrganizationLogo(file, userId);

      // userWithProfile already fetched above  
      if (!userWithProfile) {
        return createErrorResponse('User not found', 404);
      }

      const updateData = imageType === 'profile'
        ? { profileImageR3Key: uploadResult.key }
        : { organizationLogoR3Key: uploadResult.key };

      // Handle admin demo profiles
      if (userWithProfile.role === 'admin' && demoProfileType) {
        if (demoProfileType === 'athlete' && imageType === 'profile') {
          await adminOperations.updateDemoAthleteProfile(userId, updateData);
        } else if (demoProfileType === 'coach') {
          await adminOperations.updateDemoCoachProfile(userId, updateData);
        } else if (demoProfileType === 'recruiter') {
          await adminOperations.updateDemoRecruitingProfile(userId, updateData);
        } else {
          return createErrorResponse(`Unsupported demo profile operation for admin with type: ${demoProfileType}`, 400);
        }
      } else if (userWithProfile.role === 'athlete' && imageType === 'profile') {
        await athleteOperations.updateAthleteProfile(userId, updateData);
      } else if (userWithProfile.role === 'coach') {
        await coachOperations.updateCoachProfile(userId, updateData);
      } else if (userWithProfile.role === 'recruiter') {
        await recruitingOperations.updateRecruitingProfile(userId, updateData);
      } else {
        return createErrorResponse(`Unsupported operation for role: ${userWithProfile.role}`, 400);
      }

      // Invalidate profile cache
      await invalidateCache(`profile:${userId}`);

      return createSuccessResponse({
        success: true,
        imageUrl: uploadResult.url,
        key: uploadResult.key,
        message: 'Image uploaded successfully'
      }, rateLimitCheck.headers);

    } catch {
      return createErrorResponse('Failed to upload image', 500);
    }

  } catch {
    return createErrorResponse('Internal server error', 500);
  }
} 