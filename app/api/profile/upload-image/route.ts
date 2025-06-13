import { NextRequest, NextResponse } from 'next/server';
import { requireOwnershipOrAdmin } from '@/utils/roles';
import { uploadProfilePicture, uploadOrganizationLogo } from '@/database/r2/uploads';
import { deleteFromR2, getR2KeyFromUrl } from '@/database/r2/config';
import { coachOperations, athleteOperations, recruitingOperations, userOperations } from '@/database/db-utils';
import { withRateLimit, scanContent, createErrorResponse, createSuccessResponse, validateFile, invalidateCache } from '@/utils/production-config';

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

    if (!userId) {
      return createErrorResponse('Missing user ID', 400);
    }

    if (!imageType) {
      return createErrorResponse('Missing image type', 400);
    }

    // Verify ownership or admin access
    const auth = await requireOwnershipOrAdmin(userId);
    if (auth instanceof NextResponse) return auth;

    // Handle remove-only operation
    if (removeOnly === 'true') {
      if (!currentImageUrl) {
        return createErrorResponse('No image to remove', 400);
      }

      try {
        // Delete from R2
        const oldKey = getR2KeyFromUrl(currentImageUrl);
        await deleteFromR2(oldKey, false);

        // Update database
        const userWithProfile = await userOperations.getUserWithProfile(userId);
        if (!userWithProfile) {
          return createErrorResponse('User not found', 404);
        }

        const updateData = imageType === 'profile' 
          ? { profileImageR3Key: null }
          : { organizationLogoR3Key: null };

        if (userWithProfile.role === 'athlete' && imageType === 'profile') {
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
         // Delete old image if exists
         if (currentImageUrl) {
           try {
             const oldKey = getR2KeyFromUrl(currentImageUrl);
             await deleteFromR2(oldKey, false);
           } catch {
             // Continue if old image deletion fails
           }
         }

         // Upload new image
         const uploadResult = imageType === 'profile'
           ? await uploadProfilePicture(file, userId)
           : await uploadOrganizationLogo(file, userId);

         // Update database
         const userWithProfile = await userOperations.getUserWithProfile(userId);
         if (!userWithProfile) {
           return createErrorResponse('User not found', 404);
         }

         const updateData = imageType === 'profile'
           ? { profileImageR3Key: uploadResult.key }
           : { organizationLogoR3Key: uploadResult.key };

         if (userWithProfile.role === 'athlete' && imageType === 'profile') {
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