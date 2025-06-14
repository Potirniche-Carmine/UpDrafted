import { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles, verificationFiles, verificationRequests } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { deleteFromR2 } from '@/database/r2/config';

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook using Clerk's built-in function
    const event = await verifyWebhook(req);

    // Handle different webhook events
    switch (event.type) {
      case 'user.deleted':
        await handleUserDeleted(event);
        break;
      
      case 'user.created':
      case 'user.updated':
        // No action needed - users only stored after onboarding
        break;
      
      default:
        // Unhandled webhook type - no action needed
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, svix-id, svix-timestamp, svix-signature',
    },
  });
}

async function handleUserDeleted(evt: WebhookEvent) {
  try {
    const userId = evt.data.id;
    if (!userId) {
      return;
    }

    // Check if user exists in our database
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return;
    }

    // Clean up user files from R2 storage before deleting from database
    await cleanupUserFiles(userId);

    // Delete user from our database (this will cascade delete all related data)
    await db.delete(users).where(eq(users.id, userId));

  } catch {
    // Don't throw the error - we want the webhook to return 200
    // This prevents Clerk from retrying the webhook unnecessarily
  }
}

async function cleanupUserFiles(userId: string) {
  try {
    // Get all file references for this user before deletion
    const [athlete, coach, recruiter, verificationFilesList] = await Promise.all([
      // Get athlete profile image
      db.select({ profileImageR3Key: athleteProfiles.profileImageR3Key })
        .from(athleteProfiles)
        .where(eq(athleteProfiles.userId, userId))
        .limit(1),
      
      // Get coach profile image and organization logo
      db.select({ 
        profileImageR3Key: coachProfiles.profileImageR3Key,
        organizationLogoR3Key: coachProfiles.organizationLogoR3Key 
      })
        .from(coachProfiles)
        .where(eq(coachProfiles.userId, userId))
        .limit(1),
      
      // Get recruiter profile image and organization logo
      db.select({ 
        profileImageR3Key: recruitingProfiles.profileImageR3Key,
        organizationLogoR3Key: recruitingProfiles.organizationLogoR3Key 
      })
        .from(recruitingProfiles)
        .where(eq(recruitingProfiles.userId, userId))
        .limit(1),
      
      // Get all verification files for this user via verification requests
      db.select({ r2Key: verificationFiles.r2Key })
        .from(verificationFiles)
        .innerJoin(verificationRequests, eq(verificationRequests.id, verificationFiles.verificationRequestId))
        .where(eq(verificationRequests.userId, userId))
    ]);

    // Collect all file keys to delete
    const filesToDelete: string[] = [];

    // Add profile images and logos
    if (athlete[0]?.profileImageR3Key) {
      filesToDelete.push(athlete[0].profileImageR3Key);
    }
    
    if (coach[0]?.profileImageR3Key) {
      filesToDelete.push(coach[0].profileImageR3Key);
    }
    
    if (coach[0]?.organizationLogoR3Key) {
      filesToDelete.push(coach[0].organizationLogoR3Key);
    }
    
    if (recruiter[0]?.profileImageR3Key) {
      filesToDelete.push(recruiter[0].profileImageR3Key);
    }
    
    if (recruiter[0]?.organizationLogoR3Key) {
      filesToDelete.push(recruiter[0].organizationLogoR3Key);
    }

    // Add verification files
    verificationFilesList.forEach(file => {
      if (file.r2Key) {
        filesToDelete.push(file.r2Key);
      }
    });

    // Delete all files from R2 storage
    await Promise.allSettled(
      filesToDelete.map(async (fileKey) => {
        try {
          // Determine if file is private based on key pattern
          const isPrivateFile = fileKey.includes('verification') || fileKey.includes('users/');
          await deleteFromR2(fileKey, isPrivateFile);
        } catch {
          // Silent fail for individual file deletions to avoid blocking user deletion
        }
      })
    );

  } catch {
    // Silent fail - file cleanup is optional and shouldn't block user deletion
  }
} 