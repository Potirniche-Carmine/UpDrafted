import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { db } from '@/database/db';
import { verificationRequests, verificationFiles } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { withRateLimit } from '@/utils/rate-limiting';
import { createErrorResponse, createSuccessResponse, invalidateCache } from '@/utils/security-cache';

export async function handleVerificationSubmit(request: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication and valid role
    const auth = await requireRole(['admin', 'athlete', 'coach', 'recruiter']);
    if (auth instanceof NextResponse) return auth;

    const { userId, role: userRole } = auth;

    // Apply rate limiting
    const rateLimitCheck = await withRateLimit(request, 'general', userId, userRole);
    if (!rateLimitCheck.success && rateLimitCheck.response) return rateLimitCheck.response;

    // Parse request body
    const { role, additionalInfo, links } = await request.json();

    // Validate role
    if (!role || !['athlete', 'coach', 'recruiter'].includes(role)) {
      return createErrorResponse('Invalid role', 400);
    }

    try {
      // Check if user already has a verification request
      const existingRequest = await db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.userId, userId))
        .limit(1);

      if (existingRequest.length > 0) {
        const request = existingRequest[0];
        
        // Allow reapplication if the existing request was rejected
        if (request.status === 'rejected') {
          // Update the existing request for reapplication
          const updatedRequest = await db
            .update(verificationRequests)
            .set({
              status: 'pending',
              submittedAt: new Date(),
              reviewedAt: null,
              reviewedBy: null,
              rejectionReason: null,
              additionalInfo: additionalInfo || null,
              updatedAt: new Date()
            })
            .where(eq(verificationRequests.id, request.id))
            .returning();

          // Delete old verification files and links
          await db
            .delete(verificationFiles)
            .where(eq(verificationFiles.verificationRequestId, request.id));

          // Create new link records if any
          if (links && links.length > 0) {
            await db.insert(verificationFiles).values(
              links.map((link: { url: string; description?: string }) => ({
                verificationRequestId: request.id,
                fileName: link.description || link.url,
                fileType: 'link',
                linkUrl: link.url,
                description: link.description || null,
              }))
            );
          }

          // Invalidate verification cache
          await invalidateCache(`verification:${userId}`);

          return createSuccessResponse({
            success: true,
            verificationRequest: updatedRequest[0],
            reapplication: true
          }, rateLimitCheck.headers);
        }
        
        // Block if request is pending or approved
        return createErrorResponse(`You already have a verification request that is currently ${request.status}. Please wait for the review to complete.`, 409);
      }

      // Create verification request
      const verificationRequest = await db.insert(verificationRequests).values({
        userId: userId,
        role: role,
        status: 'pending',
        additionalInfo: additionalInfo || null,
      }).returning();

      // Create link records if any
      if (links && links.length > 0) {
        await db.insert(verificationFiles).values(
          links.map((link: { url: string; description?: string }) => ({
            verificationRequestId: verificationRequest[0].id,
            fileName: link.description || link.url,
            fileType: 'link',
            linkUrl: link.url,
            description: link.description || null,
          }))
        );
      }

      // Invalidate verification cache
      await invalidateCache(`verification:${userId}`);

      return createSuccessResponse({
        success: true,
        verificationRequest: verificationRequest[0],
      }, rateLimitCheck.headers);

    } catch (dbError) {
      console.error('Database error creating verification request:', dbError);
      return createErrorResponse('Failed to create verification request', 500);
    }

  } catch (error) {
    console.error('Error in verification submit API:', error);
    return createErrorResponse('Internal server error', 500);
  }
} 