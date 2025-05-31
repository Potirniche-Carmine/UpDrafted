import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { validateClerkHeaders } from '@/utils/clerk-security';
import { uploadProfilePicture } from '@/lib/r2';
import { db } from '@/lib/db';
import { athleteProfiles, coachProfiles, recruitingProfiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Validate required Clerk headers
    const validation = validateClerkHeaders(request);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Missing required security headers',
          missingHeaders: validation.missingHeaders
        },
        { status: 400 }
      );
    }

    // Check if user has valid role
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageType = formData.get('imageType') as string; // 'profile' or 'logo'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!imageType || !['profile', 'logo'].includes(imageType)) {
      return NextResponse.json({ error: 'Invalid image type. Must be "profile" or "logo"' }, { status: 400 });
    }

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 });
    }

    // Upload to R2 with proper folder structure
    const { key, url } = await uploadProfilePicture(file, userId);

    // Update the appropriate profile with the new image key
    try {
      if (role === 'athlete') {
        await db
          .update(athleteProfiles)
          .set({ profileImageR3Key: key })
          .where(eq(athleteProfiles.userId, userId));
          
      } else if (role === 'coach') {
        if (imageType === 'logo') {
          await db
            .update(coachProfiles)
            .set({ organizationLogo: key })
            .where(eq(coachProfiles.userId, userId));
        }
        // Note: Coach profiles don't have personal profile images, only organization logos
        
      } else if (role === 'recruiter') {
        if (imageType === 'logo') {
          await db
            .update(recruitingProfiles)
            .set({ organizationLogo: key })
            .where(eq(recruitingProfiles.userId, userId));
        }
        // Note: Recruiter profiles don't have personal profile images, only organization logos
      }
    } catch (dbError) {
      console.error('Failed to update profile with image key:', dbError);
      // Image was uploaded but database update failed
      return NextResponse.json({
        error: 'Image uploaded but failed to update profile. Please try again.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      image: {
        key,
        url,
      },
      message: `${imageType === 'profile' ? 'Profile image' : 'Organization logo'} uploaded successfully`,
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 