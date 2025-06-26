import { z } from 'zod';

// Base validation schemas
export const BaseValidation = {
  // User ID validation
  userId: z.string().min(1, 'User ID is required').max(100, 'User ID too long'),
  
  // Email validation
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  
  // Text content validation
  text: z.string().max(10000, 'Text too long'),
  shortText: z.string().max(500, 'Text too long'),
  
  // Numbers
  positiveInt: z.number().int().positive('Must be a positive integer'),
  nonNegativeInt: z.number().int().min(0, 'Must be non-negative'),
  
  // IDs
  id: z.number().int().positive('Invalid ID'),
  optionalId: z.number().int().positive('Invalid ID').optional(),
  
  // Pagination
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  offset: z.number().int().min(0, 'Offset must be non-negative').default(0),
  
  // File validation
  fileSize: z.number().int().min(1, 'File cannot be empty').max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  fileName: z.string().min(1, 'Filename required').max(255, 'Filename too long'),
  mimeType: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_.]*$/, 'Invalid MIME type'),
};

// Message validation schemas
export const MessageValidation = {
  // Message operations
  operation: z.enum(['getConversations', 'getMessages', 'sendMessage', 'markRead', 'getUnreadCount', 'getOrCreateConversation']),
  
  // Send message validation
  sendMessage: z.object({
    operation: z.literal('sendMessage'),
    conversationId: z.union([z.string(), z.number()]).transform((val: string | number) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num <= 0) throw new Error('Invalid conversation ID');
      return num;
    }),
    message: z.string()
      .min(1, 'Message cannot be empty')
      .max(5000, 'Message too long')
      .transform((val: string) => val.trim())
      .refine((val: string) => {
        // Word count validation (400 words max)
        const wordCount = val.split(/\s+/).filter((word: string) => word.length > 0).length;
        return wordCount <= 400;
      }, 'Message exceeds 400 word limit')
  }),
  
  // Get messages validation
  getMessages: z.object({
    operation: z.literal('getMessages'),
    conversationId: z.union([z.string(), z.number()]).transform((val: string | number) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num <= 0) throw new Error('Invalid conversation ID');
      return num;
    }),
    limit: BaseValidation.limit,
    offset: BaseValidation.offset,
  }),
  
  // Mark read validation
  markRead: z.object({
    operation: z.literal('markRead'),
    conversationId: z.union([z.string(), z.number()]).transform((val: string | number) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num <= 0) throw new Error('Invalid conversation ID');
      return num;
    }),
  }),
  
  // Get conversations validation
  getConversations: z.object({
    operation: z.literal('getConversations'),
    includeFirstConversationMessages: z.boolean().optional(),
  }),
  
  // Get unread count validation
  getUnreadCount: z.object({
    operation: z.literal('getUnreadCount'),
  }),
  
  // Create conversation validation
  getOrCreateConversation: z.object({
    operation: z.literal('getOrCreateConversation'),
    partnerId: BaseValidation.userId,
  }),
};

// File upload validation schemas
export const FileValidation = {
  // Image upload validation
  imageUpload: z.object({
    file: z.object({
      size: z.number().int().min(1, 'File cannot be empty').max(5 * 1024 * 1024, 'Image too large (max 5MB)'),
      type: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Invalid image type. Only JPEG, PNG, and WebP allowed'),
      name: z.string().min(1, 'Filename required').max(255, 'Filename too long'),
    }),
    imageType: z.enum(['profile', 'organization']),
  }),
  
  // Verification file upload validation
  verificationUpload: z.object({
    file: z.object({
      size: z.number().int().min(1, 'File cannot be empty').max(10 * 1024 * 1024, 'File too large (max 10MB)'),
      type: z.string().regex(/^(application\/pdf|image\/(jpeg|jpg|png|webp))$/i, 'Invalid file type. Only PDF and image files allowed'),
      name: z.string().min(1, 'Filename required').max(255, 'Filename too long'),
    }),
    verificationRequestId: z.string().transform((val: string) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num <= 0) throw new Error('Invalid verification request ID');
      return num;
    }),
    description: z.string().max(500, 'Description too long').optional(),
  }),
};

// Profile validation schemas
export const ProfileValidation = {
  // Search validation
  search: z.object({
    query: z.string().min(1, 'Search query required').max(100, 'Query too long').transform((val: string) => val.trim()),
    filters: z.object({
      role: z.enum(['athlete', 'coach', 'recruiter']).optional(),
      sport: z.string().max(50, 'Sport name too long').optional(),
      division: z.string().max(50, 'Division name too long').optional(),
      state: z.string().max(50, 'State name too long').optional(),
      graduationYear: z.number().int().min(2020, 'Invalid year').max(2035, 'Invalid year').optional(),
    }).optional(),
    limit: BaseValidation.limit,
    offset: BaseValidation.offset,
  }),
};

// Connection validation schemas
export const ConnectionValidation = {
  // Create connection validation
  createConnection: z.object({
    toUserId: BaseValidation.userId,
    notes: z.string().max(500, 'Notes too long').optional(),
  }),
  
  // Update connection validation
  updateConnection: z.object({
    connectionId: BaseValidation.id,
    status: z.enum(['connected', 'pending']),
  }),
};

// Utility functions for validation
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

// Sanitization helpers
export const Sanitization = {
  // Clean HTML and potential XSS
  cleanText: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },
  
  // Clean file names
  cleanFileName: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace invalid chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing special chars
      .substring(0, 255); // Limit length
  },
  
  // Validate and clean search queries
  cleanSearchQuery: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential XSS chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  },
};

// Rate limiting validation
export const RateLimitValidation = {
  // Check rate limit rules
  validateRateLimit: (operation: string, userRole: string): { maxRequests: number; windowMs: number } => {
    const limits = {
      // Message operations
      sendMessage: { athlete: 50, coach: 100, recruiter: 100, admin: 200 },
      getMessages: { athlete: 200, coach: 300, recruiter: 300, admin: 500 },
      
      // File operations
      fileUpload: { athlete: 10, coach: 20, recruiter: 20, admin: 50 },
      
      // Search operations
      search: { athlete: 100, coach: 150, recruiter: 150, admin: 300 },
      
      // Default
      default: { athlete: 100, coach: 150, recruiter: 150, admin: 300 },
    };
    
    const operationLimits = limits[operation as keyof typeof limits] || limits.default;
    const maxRequests = operationLimits[userRole as keyof typeof operationLimits] || operationLimits.athlete;
    
    return {
      maxRequests,
      windowMs: 60 * 1000, // 1 minute window
    };
  },
};

/**
 * Validates that admin role is never assigned through API calls
 * @param role - The role being assigned
 * @param context - Where the role assignment is happening
 * @throws Error if admin role is being assigned through non-webhook context
 */
export const validateRoleAssignment = (
  role: string, 
  context: 'api' | 'webhook' | 'onboarding'
): void => {
  if (role === 'admin') {
    if (context === 'api' || context === 'onboarding') {
      throw new Error('Admin role can only be assigned through Clerk dashboard, not via API');
    }
  }
  
  // Validate role is one of the allowed values
  const allowedRoles = ['athlete', 'coach', 'recruiter'];
  if (context !== 'webhook' && !allowedRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}. Must be one of: ${allowedRoles.join(', ')}`);
  }
};

/**
 * Validates that a user cannot escalate their own role to admin
 * @param requestingUserId - The user making the request
 * @param targetUserId - The user whose role is being changed
 * @param newRole - The new role being assigned
 */
export const validateRoleEscalation = (
  requestingUserId: string,
  targetUserId: string, 
  newRole: string
): void => {
  // Users cannot assign admin role to themselves or others
  if (newRole === 'admin') {
    throw new Error('Admin role assignment is not permitted through this endpoint');
  }
  
  // Users can only change their own role during onboarding
  if (requestingUserId !== targetUserId) {
    throw new Error('Users can only modify their own role during onboarding');
  }
}; 