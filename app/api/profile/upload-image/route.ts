import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadProfilePicture } from '@/lib/r2';
import { db } from '@/lib/db';
import { athleteProfiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const profileType = formData.get('profileType') as string; // 'athlete' or 'coach'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!profileType || !['athlete', 'coach'].includes(profileType)) {
      return NextResponse.json({ error: 'Invalid profile type' }, { status: 400 });
    }

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB for profile pictures
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
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Upload to R2
    const { key, url } = await uploadProfilePicture(file, userId);

    // Update the appropriate profile with the new image
    if (profileType === 'athlete') {
      await db
        .update(athleteProfiles)
        .set({ profileImageR3Key: key })
        .where(eq(athleteProfiles.userId, userId));
    } else if (profileType === 'coach') {
      // Note: You might need to add a profileImageR3Key field to coachProfiles table too
      // For now, this will just upload to R2 but not save to coach profile
      console.log('Coach profile image uploaded but not saved to database yet');
    }

    return NextResponse.json({
      success: true,
      image: {
        key,
        url,
      },
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 