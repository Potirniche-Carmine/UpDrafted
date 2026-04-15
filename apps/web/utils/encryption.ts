import crypto from 'crypto';

/**
 * Message encryption utilities for UpDrafted
 * Uses AES-256-GCM for authenticated encryption with an initialization vector (IV)
 */

// Get encryption keys from environment
const getEncryptionKey = (): string => {
  const key = process.env.MESSAGE_ENCRYPTION_KEY;
  
  if (!key || key.length < 32) {
    throw new Error('MESSAGE_ENCRYPTION_KEY environment variable must be set and at least 32 characters');
  }
  
  // Use first 32 bytes of the key (AES-256 requires exactly 32 bytes)
  return key.slice(0, 32);
};

/**
 * Encrypts a message
 * 
 * @param {string} text - The plain text message to encrypt
 * @returns {{ encryptedText: string, iv: string }} - Object containing the encrypted text and IV
 */
export const encryptMessage = (text: string): { encryptedText: string, iv: string } => {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher with the key and IV
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return the encrypted data with IV and auth tag
    return {
      encryptedText: encrypted + ':' + authTag, // Store auth tag with the encrypted data
      iv: iv.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypts a message
 * 
 * @param {string} encryptedText - The encrypted message (contains ciphertext and auth tag)
 * @param {string} ivHex - The initialization vector in hex string format
 * @returns {string} - The decrypted plain text message
 */
export const decryptMessage = (encryptedText: string, ivHex: string): string => {
  try {
    // Split the encrypted text into ciphertext and auth tag
    const [ciphertext, authTag] = encryptedText.split(':');
    
    if (!ciphertext || !authTag) {
      throw new Error('Invalid encrypted message format');
    }
    
    // Convert IV from hex to Buffer
    const iv = Buffer.from(ivHex, 'hex');
    
    // Create decipher with the key and IV
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
    
    // Set the auth tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Decrypt the text
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
};

/**
 * Sanitizes and encrypts a message
 * 
 * @param {string} plaintext - The raw message to sanitize and encrypt
 * @returns {Object} - Object containing the encrypted message and IV
 */
export const sanitizeAndEncryptMessage = (plaintext: string): { encryptedText: string, iv: string } => {
  // Basic sanitization before encryption
  const sanitized = plaintext
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, 'data-removed=')
    .trim();
  
  return encryptMessage(sanitized);
}; 