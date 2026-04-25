import { NextRequest, NextResponse } from 'next/server'
import { getSession } from "@/utils/roles"
import { db } from '@/database/db'
import { connections } from '@/database/schema'
import { eq, and, gte, count } from 'drizzle-orm'
import { SubscriptionManager } from '@/lib/subscription'
import { getCachedWithType, setCachedWithType } from '@/utils/security'

// Usage limits interface
interface UsageLimits {
  connections: {
    current: number;
    limit: number | null;
    monthlyUsed: number;
    monthlyLimit: number;
  };
  readReceipts: boolean;
  profileInsights: boolean;
  activeConnections: {
    current: number;
    limit: number | null;
  };
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    const userId = session?.user?.id;

    if (!userId) {
      return noStoreJson({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Redis/memory cache first with longer TTL for this data
    const cacheKey = `usage-limits:${userId}`
    const cachedData = await getCachedWithType<UsageLimits>(cacheKey)

    if (cachedData) {
      return noStoreJson(cachedData);
    }

    // Force fresh subscription data (in case user just returned from Stripe portal)
    SubscriptionManager.invalidateUserCache(userId)

    // Get user's subscription first to optimize for premium users
    const [subscription, features] = await Promise.all([
      SubscriptionManager.getUserSubscription(userId),
      SubscriptionManager.getSubscriptionFeatures(userId)
    ])

    const isPremium = subscription?.isPremium && subscription?.status === 'active'

    // For premium users with unlimited features, return optimized response without heavy queries
    if (isPremium && features?.maxConnectionsPerMonth === -1) {
      const optimizedUsageLimits = {
        connections: {
          current: 0, // Not meaningful for unlimited users
          limit: null,
          monthlyUsed: 0, // Not meaningful for unlimited users  
          monthlyLimit: -1 // Unlimited
        },
        readReceipts: features?.profileViewInsights || false,
        profileInsights: features?.profileViewInsights || false,
        activeConnections: {
          current: 0, // Not meaningful for unlimited users
          limit: null // Unlimited
        }
      }

      // Cache with longer TTL for premium users (15 minutes)
      await setCachedWithType(cacheKey, optimizedUsageLimits, 'usageLimits')
      return noStoreJson(optimizedUsageLimits)
    }

    // For free users or limited premium users, get actual counts
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Optimize database queries by running them in parallel and combining where possible
    const [monthlyConnectionsResult, sentConnectionsResult, receivedConnectionsResult] = await Promise.all([
      // Monthly connections
      db
        .select({ count: count() })
        .from(connections)
        .where(
          and(
            eq(connections.fromUserId, userId),
            gte(connections.createdAt, monthStart)
          )
        ),
      // Active sent connections
      db
        .select({ count: count() })
        .from(connections)
        .where(
          and(
            eq(connections.fromUserId, userId),
            eq(connections.status, 'connected')
          )
        ),
      // Active received connections
      db
        .select({ count: count() })
        .from(connections)
        .where(
          and(
            eq(connections.toUserId, userId),
            eq(connections.status, 'connected')
          )
        )
    ])

    const monthlyConnectionsUsed = monthlyConnectionsResult[0]?.count || 0
    const activeConnections = (sentConnectionsResult[0]?.count || 0) + (receivedConnectionsResult[0]?.count || 0)

    // Determine limits based on subscription
    const monthlyLimit = features?.maxConnectionsPerMonth || 5
    const activeConnectionLimit = isPremium ? null : 5

    const usageLimits = {
      connections: {
        current: activeConnections,
        limit: activeConnectionLimit,
        monthlyUsed: monthlyConnectionsUsed,
        monthlyLimit: monthlyLimit
      },
      readReceipts: features?.profileViewInsights || false,
      profileInsights: features?.profileViewInsights || false,
      activeConnections: {
        current: activeConnections,
        limit: activeConnectionLimit
      }
    }

    // Cache the result with longer TTL for regular users (15 minutes)
    await setCachedWithType(cacheKey, usageLimits, 'usageLimits')

    return noStoreJson(usageLimits)

  } catch (error) {
    console.error('Error fetching usage limits:', error)
    return noStoreJson(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    )
  }
}
