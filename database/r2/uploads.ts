import { uploadToR2, generateFileKey, generatePresignedUrl, R2_FOLDERS } from './config';

// Types
interface UploadResult {
  success: boolean;
  key?: string;
  size?: number;
  contentType?: string;
  publicUrl?: string;
  error?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Utilities
const validateFile = (file: File): ValidationResult => {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only PDF and image files are allowed.' 
    };
  }

  return { valid: true };
};

/**
 * Upload a profile picture to R2 (public access)
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
    R2_FOLDERS.PROFILE_PICTURES,
    false // Public access for profile pictures
  );
  
  // The actual key in R2 includes the folder prefix (uploadToR2 adds it)
  const fullKey = `${R2_FOLDERS.PROFILE_PICTURES}/${key}`;
  
  return {
    key: fullKey, // This is the actual key in R2
    url,
  };
}

/**
 * Upload an organization logo to R2 (public access)
 */
export async function uploadOrganizationLogo(
  file: File,
  userId: string
): Promise<{ key: string; url: string }> {
  const buffer = await file.arrayBuffer();
  const key = generateFileKey(file.name, `org-logo-${userId}`);
  
  const url = await uploadToR2(
    new Uint8Array(buffer),
    key,
    file.type,
    R2_FOLDERS.ORGANIZATION_LOGOS,
    false // Public access for logos
  );
  
  // The actual key in R2 includes the folder prefix (uploadToR2 adds it)
  const fullKey = `${R2_FOLDERS.ORGANIZATION_LOGOS}/${key}`;
  
  return {
    key: fullKey, // This is the actual key in R2
    url,
  };
}

/**
 * Upload a verification file to the private R2 bucket
 */
export async function uploadVerificationFile(
  file: File,
  userId: string,
  verificationRequestId: number
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique file key with user ID organization
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Organize files by user ID: users/{userId}/verification/{requestId}/{timestamp}-{random}-{filename}
    const fileKey = `users/${userId}/verification/${verificationRequestId}/${timestamp}-${randomString}-${sanitizedFileName}`;

    // Upload to private bucket
    const uploadUrl = await generatePresignedUrl(fileKey, 300, 'PUT', true); // 5 minutes

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
 */
export async function uploadPublicFile(
  file: File,
  userId: string,
  fileType: 'profile-picture' | 'logo'
): Promise<UploadResult> {
  try {
    // Validate file (stricter for public files)
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed for public uploads');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for public files
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique file key with user ID organization
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    
    // Organize public files: users/{userId}/{fileType}/{timestamp}.{extension}
    const fileKey = `users/${userId}/${fileType}/${timestamp}.${extension}`;

    // Upload to public bucket
    const uploadUrl = await generatePresignedUrl(fileKey, 300, 'PUT', false); // Public bucket

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

    // Return the public URL for immediate use
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
    // Helper function to construct URL properly
    const constructUrl = (baseUrl: string, path: string) => {
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const cleanPath = path.replace(/^\//, '');
      return `${cleanBaseUrl}/${cleanPath}`;
    };
    const publicUrl = constructUrl(R2_PUBLIC_URL, fileKey);

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
  return await generatePresignedUrl(r2Key, expiresIn, 'GET', true); // true = private file
} 