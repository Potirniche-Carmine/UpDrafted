import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/roles';
import { db } from '@/database/db';
import { verificationRequests, verificationFiles, athleteProfiles } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { withRateLimit } from '@/utils/security';
import { createErrorResponse, createSuccessResponse, invalidateCache } from '@/utils/security';

function isAllowedAthleteVerificationLink(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === 'hudl.com' || hostname === 'www.hudl.com' || hostname === 'maxpreps.com' || hostname === 'www.maxpreps.com';
  } catch {
    return false;
  }
}

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
    const { role, additionalInfo, links, verificationType = 'general', hasFiles = false } = await request.json();

    // Validate role, then bind it to the authenticated session so callers
    // cannot submit verification under a different role.
    if (!role || !['athlete', 'coach', 'recruiter'].includes(role)) {
      return createErrorResponse('Invalid role', 400);
    }

    if (userRole !== 'admin' && role !== userRole) {
      return createErrorResponse('Forbidden - Role mismatch', 403);
    }

    if (!['general', 'transfer_portal'].includes(verificationType)) {
      return createErrorResponse('Invalid verification type', 400);
    }

    if (role === 'athlete') {
      const athleteProfile = await db.query.athleteProfiles.findFirst({
        where: eq(athleteProfiles.userId, userId),
        columns: {
          educationLevel: true,
          division: true,
        },
      });

      if (verificationType === 'transfer_portal') {
        if (!['NCAA Division I', 'NCAA Division II'].includes(athleteProfile?.division || '')) {
          return createErrorResponse('Transfer portal verification is only available for NCAA Division I and II athletes.', 400);
        }

        if (!hasFiles) {
          return createErrorResponse('Transfer portal verification requires an uploaded screenshot or PDF.', 400);
        }
      }

      const isHighSchoolAthlete = athleteProfile?.educationLevel === 'high_school';
      const submittedLinks = Array.isArray(links) ? links : [];

      if (verificationType === 'general' && isHighSchoolAthlete) {
        const hasRequiredProfileLink = submittedLinks.some((link: { url?: string }) =>
          typeof link?.url === 'string' && isAllowedAthleteVerificationLink(link.url)
        );

        if (!hasRequiredProfileLink) {
          return createErrorResponse('High school athlete verification requires at least one Hudl or MaxPreps profile link.', 400);
        }
      }
    } else if (verificationType === 'transfer_portal') {
      return createErrorResponse('Transfer portal verification is only available for athletes.', 400);
    }

    try {
      // Check if user already has a verification request
      const existingRequest = await db
        .select()
        .from(verificationRequests)
        .where(and(
          eq(verificationRequests.userId, userId),
          eq(verificationRequests.verificationType, verificationType)
        ))
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
              verificationType,
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
        verificationType,
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
