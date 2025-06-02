import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { uploadVerificationFile } from '../uploads';
import { db } from '@/database/db';
import { verificationFiles, verificationRequests } from '@/database/schema';
import { eq } from 'drizzle-orm';

export async function handleVerificationUpload(request: NextRequest) {
  try {
    // Only authenticated users can upload verification files
    const auth = await requireRole(['admin', 'athlete', 'coach', 'recruiter']);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const verificationRequestIdStr = formData.get('verificationRequestId') as string;
    const description = formData.get('description') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!verificationRequestIdStr || !/^\d+$/.test(verificationRequestIdStr)) {
      return NextResponse.json(
        { error: 'Invalid verification request ID' },
        { status: 400 }
      );
    }

    const verificationRequestId = parseInt(verificationRequestIdStr);

    try {
      // Verify the verification request exists and belongs to the user
      const verificationRequest = await db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.id, verificationRequestId))
        .limit(1);

      if (!verificationRequest.length) {
        return NextResponse.json(
          { error: 'Verification request not found' },
          { status: 404 }
        );
      }

      if (verificationRequest[0].userId !== userId) {
        return NextResponse.json(
          { error: 'Forbidden - You can only upload files to your own verification requests' },
          { status: 403 }
        );
      }

      // Upload file to R2
      const uploadResult = await uploadVerificationFile(
        file,
        userId,
        verificationRequestId
      );

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || 'Upload failed' },
          { status: 500 }
        );
      }

      // Save file record to database
      const fileRecord = await db.insert(verificationFiles).values({
        verificationRequestId: verificationRequestId,
        fileName: file.name,
        fileType: file.type,
        r2Key: uploadResult.key!,
        description: description || null,
      }).returning();

      return NextResponse.json({
        success: true,
        file: fileRecord[0],
      });

    } catch (dbError) {
      console.error('Database error during verification upload:', dbError);
      return NextResponse.json(
        { error: 'Failed to save file record' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in verification upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 