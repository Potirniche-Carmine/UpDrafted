import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { uploadVerificationFile } from '../uploads';
import { db } from '@/database/db';
import { verificationFiles, verificationRequests } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { withRateLimit } from '@/utils/security';
import { createErrorResponse, createSuccessResponse, validateFileSecure, scanContent } from '@/utils/security';

export async function handleVerificationUpload(request: NextRequest): Promise<NextResponse> {
  try {
    // Only authenticated users can upload verification files
    const auth = await requireRole(['admin', 'athlete', 'coach', 'recruiter']);
    if (auth instanceof NextResponse) return auth;

    const { userId, role } = auth;

    // Apply rate limiting for file uploads
    const rateLimitCheck = await withRateLimit(request, 'fileUpload', userId, role);
    if (!rateLimitCheck.success && rateLimitCheck.response) return rateLimitCheck.response;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const verificationRequestIdStr = formData.get('verificationRequestId') as string;
    const description = formData.get('description') as string | null;

    // Validate inputs
    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    // File validation
    const validation = await validateFileSecure(file, 'verification');
    if (!validation.isValid) {
      return createErrorResponse(validation.error || 'Invalid file', 400);
    }

    // Content scanning
    const buffer = await file.arrayBuffer();
    const scanResult = await scanContent(buffer);

    if (!scanResult.safe) {
      return createErrorResponse(`File security check failed: ${scanResult.reason}`, 400);
    }

    if (!verificationRequestIdStr || !/^\d+$/.test(verificationRequestIdStr)) {
      return createErrorResponse('Invalid verification request ID', 400);
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
        return createErrorResponse('Verification request not found', 404);
      }

      if (verificationRequest[0].userId !== userId) {
        return createErrorResponse('Forbidden - You can only upload files to your own verification requests', 403);
      }

      // Upload file to R2
      const uploadResult = await uploadVerificationFile(
        file,
        userId,
        verificationRequestId
      );

      if (!uploadResult.success) {
        return createErrorResponse(uploadResult.error || 'Upload failed', 500);
      }

      // Save file record to database
      const fileRecord = await db.insert(verificationFiles).values({
        verificationRequestId: verificationRequestId,
        fileName: file.name,
        fileType: file.type,
        r2Key: uploadResult.key!,
        description: description || null,
      }).returning();

      return createSuccessResponse({
        success: true,
        file: fileRecord[0],
      }, rateLimitCheck.headers);

    } catch (dbError) {
      console.error('Database error during verification upload:', dbError);
      return createErrorResponse('Failed to save file record', 500);
    }

  } catch (error) {
    console.error('Error in verification upload API:', error);
    return createErrorResponse('Internal server error', 500);
  }
} 