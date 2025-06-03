import { NextRequest, NextResponse } from 'next/server';
import { requireOwnershipOrAdmin } from '@/utils/roles';
import { uploadProfilePicture, uploadOrganizationLogo } from '@/database/r2/uploads';
import { deleteFromR2, getR2KeyFromUrl } from '@/database/r2/config';
import { coachOperations, athleteOperations, recruitingOperations, userOperations } from '@/database/db-utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const imageType = formData.get('imageType') as 'profile' | 'organization';
    const currentImageUrl = formData.get('currentImageUrl') as string | null;
    const removeOnly = formData.get('removeOnly') as string | null;

    if (!userId || !imageType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If removeOnly is true, we only need userId, imageType, and currentImageUrl
    if (removeOnly === 'true') {
      if (!currentImageUrl) {
        return NextResponse.json(
          { error: 'No image to remove' },
          { status: 400 }
        );
      }
    } else if (!file) {
      return NextResponse.json(
        { error: 'Missing file for upload' },
        { status: 400 }
      );
    }

    // Verify ownership or admin access
    const auth = await requireOwnershipOrAdmin(userId);
    if (auth instanceof NextResponse) return auth;

    // Handle remove-only operation
    if (removeOnly === 'true') {
      // Delete the image from R2
      try {
        const oldKey = getR2KeyFromUrl(currentImageUrl!);
        await deleteFromR2(oldKey, false);
      } catch (error) {
        console.error('Remove-only: Failed to delete image from R2:', error);
      }

      // Update database to remove image reference
      try {
        // First, get the user's role from their profile
        const userWithProfile = await userOperations.getUserWithProfile(userId);
        
        if (!userWithProfile) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }

        const userRole = userWithProfile.role;
        
        if (imageType === 'profile') {
          if (userRole === 'athlete') {
            await athleteOperations.updateAthleteProfile(userId, {
              profileImageR3Key: null
            });
          } else if (userRole === 'coach') {
            await coachOperations.updateCoachProfile(userId, {
              profileImageR3Key: null
            });
          } else if (userRole === 'recruiter') {
            await recruitingOperations.updateRecruitingProfile(userId, {
              profileImageR3Key: null
            });
          } else {
            throw new Error(`Unsupported user role: ${userRole}`);
          }
        } else if (imageType === 'organization') {
          // Organization logos are only for coaches and recruiters
          if (userRole === 'coach') {
            await coachOperations.updateCoachProfile(userId, {
              organizationLogoR3Key: null
            });
          } else if (userRole === 'recruiter') {
            await recruitingOperations.updateRecruitingProfile(userId, {
              organizationLogoR3Key: null
            });
          } else {
            throw new Error(`Organization logos are not supported for role: ${userRole}`);
          }
        }
      } catch (error) {
        console.error('Database update error during removal:', error);
        return NextResponse.json(
          { error: 'Failed to remove image from profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        removed: true,
        message: 'Image removed successfully'
      });
    }

    // Continue with regular upload logic...
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Delete old image if it exists
    if (currentImageUrl) {
      try {
        const oldKey = getR2KeyFromUrl(currentImageUrl);
        await deleteFromR2(oldKey, false); // false for public bucket
      } catch (error) {
        console.error('Failed to delete old image from R2:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image
    let uploadResult;
    try {
      if (imageType === 'profile') {
        uploadResult = await uploadProfilePicture(file, userId);
      } else {
        uploadResult = await uploadOrganizationLogo(file, userId);
      }
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Update database with new image key
    try {
      // First, get the user's role from their profile
      const userWithProfile = await userOperations.getUserWithProfile(userId);
      
      if (!userWithProfile) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const userRole = userWithProfile.role;
      
      if (imageType === 'profile') {
        if (userRole === 'athlete') {
          await athleteOperations.updateAthleteProfile(userId, {
            profileImageR3Key: uploadResult.key
          });
        } else if (userRole === 'coach') {
          await coachOperations.updateCoachProfile(userId, {
            profileImageR3Key: uploadResult.key
          });
        } else if (userRole === 'recruiter') {
          await recruitingOperations.updateRecruitingProfile(userId, {
            profileImageR3Key: uploadResult.key
          });
        } else {
          throw new Error(`Unsupported user role: ${userRole}`);
        }
      } else if (imageType === 'organization') {
        // Organization logos are only for coaches and recruiters
        if (userRole === 'coach') {
          await coachOperations.updateCoachProfile(userId, {
            organizationLogoR3Key: uploadResult.key
          });
        } else if (userRole === 'recruiter') {
          await recruitingOperations.updateRecruitingProfile(userId, {
            organizationLogoR3Key: uploadResult.key
          });
        } else {
          throw new Error(`Organization logos are not supported for role: ${userRole}`);
        }
      }
    } catch (error) {
      console.error('Database update error:', error);
      // Clean up uploaded file if database update fails
      try {
        await deleteFromR2(uploadResult.key, false);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
      return NextResponse.json(
        { error: 'Failed to update profile with new image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      key: uploadResult.key
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 