import { uploadToR2, generatePresignedUrl, listR2Objects, deleteFromR2, R2_PUBLIC_URL, constructR2Url } from './config';

// Types
interface UploadResult {
  success: boolean;
  key?: string;
  size?: number;
  contentType?: string;
  publicUrl?: string;
  error?: string;
}

import { validateFileSecure } from '@/utils/security';


/**
 * Clean up existing files in a specific folder
 * Used before uploading a new profile/org picture to ensure 1:1 relationship
 */
async function cleanFolder(folderPrefix: string, isPrivateBucket: boolean): Promise<void> {
  try {
    const existingFiles = await listR2Objects(folderPrefix, isPrivateBucket);
    if (existingFiles.length > 0) {
      console.log(`Cleaning up ${existingFiles.length} files from ${folderPrefix}`);
      // Delete in parallel
      await Promise.all(existingFiles.map(key => deleteFromR2(key, isPrivateBucket)));
    }
  } catch (error) {
    console.error(`Failed to clean folder ${folderPrefix}:`, error);
    // Proceed anyway, strict cleanup shouldn't block upload if list fails
  }
}

/**
 * Upload a profile picture to R2 (Profile Bucket)
 * Replaces any existing picture for this user.
 */
export async function uploadProfilePicture(
  file: File,
  userId: string
): Promise<{ key: string; url: string }> {
  try {
    const buffer = await file.arrayBuffer();
    // Stable folder: users/{userId}/profile/
    const folder = `users/${userId}/profile`;

    // Clean up existing profile pictures first
    await cleanFolder(folder, false); // false = Profile Bucket

    // Generate simple key: timestamp.ext to avoid caching issues while keeping it clean
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}.${extension}`;

    const url = await uploadToR2(
      new Uint8Array(buffer),
      filename, // file name references
      file.type,
      folder,
      false // Profile Bucket (treated as private storage, public access via Worker)
    );

    const fullKey = `${folder}/${filename}`;

    return {
      key: fullKey,
      url,
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

/**
 * Upload an organization logo to R2 (Profile Bucket)
 * Replaces any existing logo for this user.
 */
export async function uploadOrganizationLogo(
  file: File,
  userId: string
): Promise<{ key: string; url: string }> {
  try {
    const buffer = await file.arrayBuffer();
    // Stable folder: users/{userId}/organization/
    const folder = `users/${userId}/organization`;

    // Clean up existing logos first
    await cleanFolder(folder, false); // false = Profile Bucket

    // Generate simple key
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}.${extension}`;

    const url = await uploadToR2(
      new Uint8Array(buffer),
      filename,
      file.type,
      folder,
      false // Profile Bucket
    );

    const fullKey = `${folder}/${filename}`;

    return {
      key: fullKey,
      url,
    };
  } catch (error) {
    console.error('Error uploading organization logo:', error);
    throw error;
  }
}

/**
 * Upload a verification file to the private R2 bucket
 * Stored in users/{userId}/verification/
 */
export async function uploadVerificationFile(
  file: File,
  userId: string,
  verificationRequestId: number
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = await validateFileSecure(file, 'verification');
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique file key 
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Organize files by user ID: users/{userId}/verification/{requestId}/{timestamp}-{random}-{filename}
    // We don't auto-clean here because a user might submit multiple files for one request.
    const fileKey = `users/${userId}/verification/${verificationRequestId}/${timestamp}-${randomString}-${sanitizedFileName}`;

    // Upload to private bucket
    const uploadUrl = await generatePresignedUrl(fileKey, 300, 'PUT', true); // 5 minutes, Private Bucket

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
    }

    return {
      success: true,
      key: fileKey,
      size: file.size,
      contentType: file.type,
    };

  } catch (error) {
    console.error('Error uploading verification file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Upload a public file (profile pictures, logos) to the public R2 bucket
 * NOTE: Prefer robust wrappers above
 */
export async function uploadPublicFile(
  file: File,
  userId: string,
  fileType: 'profile-picture' | 'logo'
): Promise<UploadResult> {
  try {
    // Validate file (stricter for public files)
    const validation = await validateFileSecure(file, 'images');
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Map legacy fileTypes to new structure
    const folderType = fileType === 'profile-picture' ? 'profile' : 'organization';
    const folder = `users/${userId}/${folderType}`;

    // Clean up first
    await cleanFolder(folder, false);

    const extension = file.name.split('.').pop() || 'jpg';
    const fileKey = `${folder}/${Date.now()}.${extension}`;

    // Upload to profile bucket
    const uploadUrl = await generatePresignedUrl(fileKey, 300, 'PUT', false);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const publicUrl = constructR2Url(R2_PUBLIC_URL, fileKey);

    return {
      success: true,
      key: fileKey,
      size: file.size,
      contentType: file.type,
      publicUrl,
    };

  } catch (error) {
    console.error('Error uploading public file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Generate a secure access URL for verification files
 * Only accessible by authorized users (admins or file owners)
 */
export async function getVerificationFileUrl(
  r2Key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  return await generatePresignedUrl(r2Key, expiresIn, 'GET', true); // true = private bucket
}

/**
 * COMPLETELY delete all files associated with a user
 * Used during account deletion.
 * Scans both Profile and Private buckets for "users/{userId}/" prefix and deletes everything.
 */
export async function deleteAllUserFiles(userId: string): Promise<void> {
  const prefix = `users/${userId}/`;

  try {
    console.log(`Starting full R2 cleanup for user ${userId}...`);

    // 1. Clean Profile Bucket
    const profileFiles = await listR2Objects(prefix, false); // false = Profile Bucket
    if (profileFiles.length > 0) {
      console.log(`Deleting ${profileFiles.length} files from Profile Bucket for user ${userId}`);
      await Promise.all(profileFiles.map(key => deleteFromR2(key, false)));
    }

    // 2. Clean Private Bucket
    const privateFiles = await listR2Objects(prefix, true); // true = Private Bucket
    if (privateFiles.length > 0) {
      console.log(`Deleting ${privateFiles.length} files from Private Bucket for user ${userId}`);
      await Promise.all(privateFiles.map(key => deleteFromR2(key, true)));
    }

    console.log(`Completed R2 cleanup for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting user files for ${userId}:`, error);
    // Don't throw, we want deletion to proceed even if R2 cleanup partially fails
  }
}