import { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/database/db';
import { users, athleteProfiles, coachProfiles, recruitingProfiles, verificationFiles, verificationRequests, messages, conversations } from '@/database/schema';
import { eq, or, and, isNotNull } from 'drizzle-orm';
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
    const [athlete, coach, recruiter, verificationFilesList, messageAttachments] = await Promise.all([
      // Get athlete profile image
      db.select({ 
        profileImageR3Key: athleteProfiles.profileImageR3Key,
        id: athleteProfiles.id
      })
        .from(athleteProfiles)
        .where(eq(athleteProfiles.userId, userId))
        .limit(1),
      
      // Get coach profile image and organization logo
      db.select({ 
        profileImageR3Key: coachProfiles.profileImageR3Key,
        organizationLogoR3Key: coachProfiles.organizationLogoR3Key,
        id: coachProfiles.id
      })
        .from(coachProfiles)
        .where(eq(coachProfiles.userId, userId))
        .limit(1),
      
      // Get recruiter profile image and organization logo
      db.select({ 
        profileImageR3Key: recruitingProfiles.profileImageR3Key,
        organizationLogoR3Key: recruitingProfiles.organizationLogoR3Key,
        id: recruitingProfiles.id
      })
        .from(recruitingProfiles)
        .where(eq(recruitingProfiles.userId, userId))
        .limit(1),
      
      // Get all verification files for this user via verification requests
      db.select({ r2Key: verificationFiles.r2Key })
        .from(verificationFiles)
        .innerJoin(verificationRequests, eq(verificationRequests.id, verificationFiles.verificationRequestId))
        .where(eq(verificationRequests.userId, userId)),
      
      // Get message attachments that might be R2 files
      db.select({ attachmentUrl: messages.attachmentUrl })
        .from(messages)
        .innerJoin(conversations, or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        ))
        .where(and(
          eq(messages.conversationId, conversations.id),
          eq(messages.senderId, userId),
          isNotNull(messages.attachmentUrl)
        ))
    ]);

    // Collect all file keys to delete
    const filesToDelete: { key: string; isPrivate: boolean }[] = [];

    // Add profile images and logos (public files)
    if (athlete[0]?.profileImageR3Key) {
      filesToDelete.push({ key: athlete[0].profileImageR3Key, isPrivate: false });
    }
    
    if (coach[0]?.profileImageR3Key) {
      filesToDelete.push({ key: coach[0].profileImageR3Key, isPrivate: false });
    }
    
    if (coach[0]?.organizationLogoR3Key) {
      filesToDelete.push({ key: coach[0].organizationLogoR3Key, isPrivate: false });
    }
    
    if (recruiter[0]?.profileImageR3Key) {
      filesToDelete.push({ key: recruiter[0].profileImageR3Key, isPrivate: false });
    }
    
    if (recruiter[0]?.organizationLogoR3Key) {
      filesToDelete.push({ key: recruiter[0].organizationLogoR3Key, isPrivate: false });
    }

    // Add verification files (private files)
    verificationFilesList.forEach(file => {
      if (file.r2Key) {
        filesToDelete.push({ key: file.r2Key, isPrivate: true });
      }
    });

    // Add message attachments (private files)
    messageAttachments.forEach(file => {
      if (file.attachmentUrl) {
        filesToDelete.push({ key: file.attachmentUrl, isPrivate: true });
      }
    });

    // Delete all files from R2 storage
    const deleteResults = await Promise.allSettled(
      filesToDelete.map(async ({ key, isPrivate }) => {
        try {
          console.log(`Deleting file: ${key} (private: ${isPrivate})`);
          await deleteFromR2(key, isPrivate);
          console.log(`Successfully deleted file: ${key}`);
          return { success: true, key };
        } catch (error) {
          console.error(`Failed to delete file ${key}:`, error);
          return { success: false, key, error };
        }
      })
    );

    // Log results for debugging
    const successful = deleteResults.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    const failed = deleteResults.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.success)
    ).length;

    console.log(`File cleanup for user ${userId}: ${successful} successful, ${failed} failed`);

  } catch (error) {
    console.error(`Error during file cleanup for user ${userId}:`, error);
    // Don't throw - file cleanup is optional and shouldn't block user deletion
  }
} 