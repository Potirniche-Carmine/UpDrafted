import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { verificationRequests, verificationFiles, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface VerificationLink {
  url: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      role, 
      additionalInfo, 
      links 
    }: { 
      role: 'coach' | 'recruiter';
      additionalInfo?: string;
      links?: VerificationLink[];
    } = body;

    if (!role || !['coach', 'recruiter'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user exists and has the correct role
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing pending verification request
    const existingRequest = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .limit(1);

    if (existingRequest.length > 0 && existingRequest[0].status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending verification request' },
        { status: 400 }
      );
    }

    // Create verification request
    const [verificationRequest] = await db
      .insert(verificationRequests)
      .values({
        userId,
        role,
        additionalInfo: additionalInfo || null,
        status: 'pending',
      })
      .returning();

    // Add links as verification files
    if (links && links.length > 0) {
      const linkFiles = links.map(link => ({
        verificationRequestId: verificationRequest.id,
        fileName: link.description || link.url,
        fileType: 'link' as const,
        linkUrl: link.url,
        description: link.description || null,
      }));

      await db.insert(verificationFiles).values(linkFiles);
    }

    return NextResponse.json({
      success: true,
      verificationRequest: {
        id: verificationRequest.id,
        status: verificationRequest.status,
        submittedAt: verificationRequest.submittedAt,
      },
    });

  } catch (error) {
    console.error('Error submitting verification request:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    );
  }
} 