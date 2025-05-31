import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Folders for different file types
export const R2_FOLDERS = {
  PROFILE_PICTURES: 'profile-pictures',
  VERIFICATION_FILES: 'verification-files',
} as const;

/**
 * Upload a file to R2 storage
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string,
  folder?: string
): Promise<string> {
  const fullKey = folder ? `${folder}/${key}` : key;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fullKey,
    Body: file,
    ContentType: contentType,
  });

  try {
    await r2Client.send(command);
    
    // Return the public URL
    const publicUrl = `${R2_PUBLIC_URL}/${fullKey}`;
    
    return publicUrl;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate a unique file key with timestamp and random string
 */
export function generateFileKey(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalName.split('.').pop()?.toLowerCase();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  const cleanBaseName = baseName
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  const keyPrefix = prefix ? `${prefix}-` : '';
  return `${keyPrefix}${timestamp}-${randomString}-${cleanBaseName}.${fileExtension}`;
}

/**
 * Get the R2 key from a full URL
 */
export function getR2KeyFromUrl(url: string): string {
  return url.replace(`${R2_PUBLIC_URL}/`, '');
}

/**
 * Upload a profile picture to R2
 */
export async function uploadProfilePicture(
  file: File,
  userId: string
): Promise<{ key: string; url: string }> {
  const buffer = await file.arrayBuffer();
  const key = generateFileKey(file.name, `profile-${userId}`);
  
  const url = await uploadToR2(
    new Uint8Array(buffer),
    key,
    file.type,
    R2_FOLDERS.PROFILE_PICTURES
  );
  
  const fullKey = `${R2_FOLDERS.PROFILE_PICTURES}/${key}`;
  
  return {
    key: fullKey,
    url,
  };
}

/**
 * Upload a verification file to R2
 */
export async function uploadVerificationFile(
  file: File,
  userId: string,
  verificationRequestId: number
): Promise<{ key: string; url: string }> {
  const buffer = await file.arrayBuffer();
  const key = generateFileKey(file.name, `verification-${userId}-${verificationRequestId}`);
  
  const url = await uploadToR2(
    new Uint8Array(buffer),
    key,
    file.type,
    R2_FOLDERS.VERIFICATION_FILES
  );
  
  return {
    key: `${R2_FOLDERS.VERIFICATION_FILES}/${key}`,
    url,
  };
} 