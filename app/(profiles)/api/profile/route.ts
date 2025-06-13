import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/utils/roles';
import { profileOperations } from '@/database/db-utils';
import { withRateLimit } from '@/utils/rate-limiting';
import { getCachedWithType, setCachedWithType, createErrorResponse, createSuccessResponse } from '@/utils/security-cache';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await withRateLimit(request, 'general');
    if (!rateLimit.success) return rateLimit.response;

    // Authentication
    const auth = await requireAnyRole();
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('userId') || auth.userId;

    // Try cache first
    const cacheKey = `profile:${targetUserId}`;
    const cachedProfile = await getCachedWithType<Record<string, unknown>>(cacheKey);
    
    if (cachedProfile) {
      return createSuccessResponse({
        profile: cachedProfile,
        cached: true,
      }, rateLimit.headers);
    }

    // Fetch from database
    const profileInfo = await profileOperations.getUserProfileInfo(targetUserId);

    if (!profileInfo) {
      return createErrorResponse('Profile not found', 404);
    }

    // Cache the result
    await setCachedWithType(cacheKey, profileInfo, 'profileInfo');

    return createSuccessResponse({
      profile: profileInfo,
      cached: false,
    }, rateLimit.headers);

  } catch {
    return createErrorResponse('Failed to fetch profile', 500);
  }
} 