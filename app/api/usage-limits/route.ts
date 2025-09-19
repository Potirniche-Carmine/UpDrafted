import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
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

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Redis/memory cache first
    const cacheKey = `usage-limits:${userId}`
    const cachedData = await getCachedWithType<UsageLimits>(cacheKey)
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Get current month start
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch monthly connection requests sent this month
    const [monthlyConnectionsResult] = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          eq(connections.fromUserId, userId),
          gte(connections.createdAt, monthStart)
        )
      )

    const monthlyConnectionsUsed = monthlyConnectionsResult?.count || 0

    // Fetch active connections (both sent and received)
    const [sentConnectionsResult] = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          eq(connections.fromUserId, userId),
          eq(connections.status, 'connected')
        )
      )

    const [receivedConnectionsResult] = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          eq(connections.toUserId, userId),
          eq(connections.status, 'connected')
        )
      )

    const activeConnections = (sentConnectionsResult?.count || 0) + (receivedConnectionsResult?.count || 0)

    // Get user's subscription tier to determine limits using SubscriptionManager directly
    const [subscription, features] = await Promise.all([
      SubscriptionManager.getUserSubscription(userId),
      SubscriptionManager.getSubscriptionFeatures(userId)
    ])

    // Determine limits based on subscription
    const isPremium = subscription?.isPremium && subscription?.status === 'active'
    const monthlyLimit = features?.maxConnectionsPerMonth || 5
    
    // For free users, active connection limit is 5, premium users have unlimited
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

    // Cache the result before returning using Redis/memory
    await setCachedWithType(cacheKey, usageLimits, 'userConnections')

    return NextResponse.json(usageLimits)

  } catch (error) {
    console.error('Error fetching usage limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    )
  }
}