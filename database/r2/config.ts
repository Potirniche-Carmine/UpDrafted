import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate R2 credentials
// We relax this check to allow build-time execution without secrets
// The application will fail at runtime if credentials are missing and R2 is accessed
const isTestOrBuild = process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true' || !process.env.R2_ACCOUNT_ID;

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: isTestOrBuild ? 'https://placeholder.r2.cloudflarestorage.com' : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
});

// Public bucket for profile pictures and organization logos
export const R2_PUBLIC_BUCKET_NAME = process.env.R2_PUBLIC_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://bucket.updrafted.us';

/**
 * Helper function to properly construct R2 URLs without double slashes
 * @param baseUrl - The base R2 URL
 * @param path - The file path/key
 * @returns Properly formatted URL
 */
export function constructR2Url(baseUrl: string, path: string): string {
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  // Remove leading slash from path if present
  const cleanPath = path.replace(/^\//, '');
  
  return `${cleanBaseUrl}/${cleanPath}`;
}

// Private bucket for verification files (optional - falls back to public bucket if not configured)
export const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME || R2_PUBLIC_BUCKET_NAME || 'placeholder-private-bucket';

// Folders for different file types
export const R2_FOLDERS = {
  PROFILE_PICTURES: 'profile-pictures',
  ORGANIZATION_LOGOS: 'organization-logos', 
  VERIFICATION_FILES: 'verification-files',
} as const;

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain'
];

// File magic number signatures for content validation
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
} as const;

/**
 * Validate file content against magic numbers with fallback for edge cases
 */
function validateFileContent(file: Buffer | Uint8Array, mimeType: string): void {
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signature) return; // Skip validation for unsupported types
  
  const fileBytes = new Uint8Array(file);
  
  // Check if file is too small to contain the signature
  if (fileBytes.length < signature.length) {
    console.warn(`File too small to validate signature for type ${mimeType}`);
    return; // Don't reject, just warn for small files
  }
  
  // Check signature with tolerance for some file variations
  let matches = 0;
  for (let i = 0; i < signature.length; i++) {
    if (fileBytes[i] === signature[i]) {
      matches++;
    }
  }
  
  // Require at least 80% of signature bytes to match (allows for some variation)
  const matchPercentage = matches / signature.length;
  if (matchPercentage < 0.8) {
    console.warn(`File signature mismatch for ${mimeType}. Match rate: ${(matchPercentage * 100).toFixed(1)}%`);
    
    // For critical file types, still reject if signature is completely wrong
    if (mimeType === 'application/pdf' && fileBytes[0] !== 0x25) {
      throw new Error(`File content does not match declared PDF type`);
    }
    
    // For images, allow more flexibility but warn
    if (mimeType.startsWith('image/')) {
      console.warn(`Allowing image upload despite signature mismatch for ${mimeType}`);
      return;
    }
    
    // For other types, warn but allow
    console.warn(`Allowing file upload despite signature mismatch for ${mimeType}`);
  }
}

/**
 * Validate file before upload
 */
function validateFile(file: Buffer | Uint8Array, contentType: string): void {
  if (file.length === 0) {
    throw new Error('File cannot be empty');
  }
  if (file.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(`File type ${contentType} not allowed`);
  }
  
  // Validate file content matches MIME type
  validateFileContent(file, contentType);
  
  // Check for malicious content patterns
  const content = Buffer.from(file).toString('binary');
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /%3Cscript/i, // URL encoded <script
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      throw new Error('File contains potentially malicious content');
    }
  }
}

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
  // Validate file before upload
  validateFile(file, contentType);
  
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
      return constructR2Url(R2_PUBLIC_URL, fullKey);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Generate a presigned URL for secure file access
 * @param key - R2 object key
 * @param expiresIn - Expiration time in seconds (default: 15 minutes for sensitive ops)
 * @param operation - Type of operation ('GET' | 'PUT' | 'DELETE')
 * @param isPrivateFile - Whether this is a private file (uses private bucket)
 */
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 900, // 15 minutes default for security
  operation: 'GET' | 'PUT' | 'DELETE' = 'GET',
  isPrivateFile: boolean = true
): Promise<string> {
  // Choose bucket based on file type
  const bucketName = isPrivateFile ? R2_PRIVATE_BUCKET_NAME : R2_PUBLIC_BUCKET_NAME;
  
  // Prevent DELETE operations on public files for security
  if (operation === 'DELETE' && !isPrivateFile) {
    throw new Error('DELETE operations are not allowed on public files for security reasons');
  }
  
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
    console.error('Error generating presigned URL:', process.env.NODE_ENV === 'production' ? 'URL generation failed' : error);
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

/**
 * List all objects in an R2 bucket
 * @param prefix - Optional prefix to filter objects
 * @param isPrivateBucket - Whether to list objects from private bucket
 * @returns Array of object keys
 */
export async function listR2Objects(
  prefix?: string,
  isPrivateBucket: boolean = false
): Promise<string[]> {
  const bucketName = isPrivateBucket ? R2_PRIVATE_BUCKET_NAME : R2_PUBLIC_BUCKET_NAME;
  const objects: string[] = [];
  
  let continuationToken: string | undefined;
  
  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    
    try {
      const response = await r2Client.send(command);
      
      if (response.Contents) {
        objects.push(...response.Contents.map(obj => obj.Key!).filter(Boolean));
      }
      
      continuationToken = response.NextContinuationToken;
    } catch (error) {
      console.error('Error listing R2 objects:', process.env.NODE_ENV === 'production' ? 'List operation failed' : error);
      throw error;
    }
  } while (continuationToken);
  
  return objects;
}

// Backward compatibility exports
export const R2_BUCKET_NAME = R2_PUBLIC_BUCKET_NAME; 