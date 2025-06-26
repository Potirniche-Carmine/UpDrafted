import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Public bucket for profile pictures and organization logos
export const R2_PUBLIC_BUCKET_NAME = process.env.R2_PUBLIC_BUCKET_NAME!;
export const R2_PUBLIC_URL = 'https://bucket.updrafted.us';

// Private bucket for verification files (optional - falls back to public bucket if not configured)
export const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME || R2_PUBLIC_BUCKET_NAME;

// Folders for different file types
export const R2_FOLDERS = {
  PROFILE_PICTURES: 'profile-pictures',
  ORGANIZATION_LOGOS: 'organization-logos', 
  VERIFICATION_FILES: 'verification-files',
} as const;

/**
 * Upload a file to R2 storage
 * @param file - File buffer
 * @param key - File key
 * @param contentType - MIME type
 * @param folder - Folder name
 * @param isPrivate - Whether the file should be private (uses private bucket)
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string,
  folder?: string,
  isPrivate: boolean = false
): Promise<string> {
  const fullKey = folder ? `${folder}/${key}` : key;
  
  // Choose bucket based on privacy requirement
  const bucketName = isPrivate ? R2_PRIVATE_BUCKET_NAME : R2_PUBLIC_BUCKET_NAME;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fullKey,
    Body: file,
    ContentType: contentType,
  });

  try {
    await r2Client.send(command);
    
    if (isPrivate) {
      // For private files, return just the key (no public URL)
      return fullKey;
    } else {
      // Return the public URL for public files
      return `${R2_PUBLIC_URL}/${fullKey}`;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Generate a presigned URL for secure file access
 * @param key - R2 object key
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @param operation - Type of operation ('GET' | 'PUT' | 'DELETE')
 * @param isPrivateFile - Whether this is a private file (uses private bucket)
 */
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 3600, // 1 hour default
  operation: 'GET' | 'PUT' | 'DELETE' = 'GET',
  isPrivateFile: boolean = true
): Promise<string> {
  // Choose bucket based on file type
  const bucketName = isPrivateFile ? R2_PRIVATE_BUCKET_NAME : R2_PUBLIC_BUCKET_NAME;
  
  let command;
  
  switch (operation) {
    case 'GET':
      command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      break;
    case 'PUT':
      command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      break;
    case 'DELETE':
      command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      break;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  try {
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

/**
 * Delete a file from R2 storage
 * @param key - File key
 * @param isPrivateFile - Whether this is a private file (uses private bucket)
 */
export async function deleteFromR2(key: string, isPrivateFile: boolean = false): Promise<void> {
  const bucketName = isPrivateFile ? R2_PRIVATE_BUCKET_NAME : R2_PUBLIC_BUCKET_NAME;
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
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

// Backward compatibility exports
export const R2_BUCKET_NAME = R2_PUBLIC_BUCKET_NAME; 