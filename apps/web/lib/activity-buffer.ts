import { db } from '@/database/db'
import { activityLog } from '@/database/schema'
import { activityOperations } from '@/database/db-utils'
import { getRedisConfig } from '@/utils/env'
import { and, eq } from 'drizzle-orm'

type BufferedProfileView = {
  viewerId: string
  viewedUserId: string
  action: 'profile_view'
  metadata?: Record<string, unknown>
  createdAt: string
}

type RedisClient = {
  get: (key: string) => Promise<string | null>
  setex: (key: string, ttlSeconds: number, value: string) => Promise<unknown>
  del: (...keys: string[]) => Promise<unknown>
  sadd: (key: string, ...members: string[]) => Promise<unknown>
  srem: (key: string, ...members: string[]) => Promise<unknown>
  smembers: (key: string) => Promise<string[]>
  expire: (key: string, ttlSeconds: number) => Promise<unknown>
}

const PROFILE_VIEW_TTL_SECONDS = 10 * 60
const PENDING_PROFILE_VIEWS_KEY = 'activity:profile_view:pending'

let redisClient: RedisClient | null = null

async function getRedisClient(): Promise<RedisClient | null> {
  const config = getRedisConfig()
  if (!config.enabled || !config.url || !config.token) {
    return null
  }

  if (redisClient) {
    return redisClient
  }

  try {
    const { Redis } = await import('@upstash/redis')
    redisClient = new Redis({
      url: config.url,
      token: config.token,
    }) as unknown as RedisClient
    return redisClient
  } catch (error) {
    console.warn('Failed to initialize Redis activity buffer client:', error)
    return null
  }
}

function getProfileViewKey(viewerId: string, viewedUserId: string): string {
  return `activity:profile_view:${viewerId}:${viewedUserId}`
}

async function upsertProfileViewToDatabase(payload: BufferedProfileView): Promise<void> {
  try {
    await db
      .insert(activityLog)
      .values({
        viewerId: payload.viewerId,
        viewedUserId: payload.viewedUserId,
        action: payload.action,
        metadata: payload.metadata,
        createdAt: new Date(payload.createdAt),
      })
      .onConflictDoUpdate({
        target: [activityLog.viewerId, activityLog.viewedUserId, activityLog.action],
        set: {
          metadata: payload.metadata,
          createdAt: new Date(payload.createdAt),
        },
      })
  } catch {
    // Fallback for environments where unique constraint is not yet migrated.
    await activityOperations.logActivity(
      payload.viewerId,
      payload.viewedUserId,
      payload.action,
      payload.metadata
    )
  }
}

export async function hasBufferedProfileView(viewerId: string, viewedUserId: string): Promise<boolean> {
  const redis = await getRedisClient()
  if (!redis) {
    return false
  }

  try {
    const key = getProfileViewKey(viewerId, viewedUserId)
    const existing = await redis.get(key)
    return Boolean(existing)
  } catch {
    return false
  }
}

export async function queueProfileView(
  viewerId: string,
  viewedUserId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const redis = await getRedisClient()
  if (!redis) {
    await activityOperations.logActivity(viewerId, viewedUserId, 'profile_view', metadata)
    return
  }

  try {
    const key = getProfileViewKey(viewerId, viewedUserId)
    const payload: BufferedProfileView = {
      viewerId,
      viewedUserId,
      action: 'profile_view',
      metadata,
      createdAt: new Date().toISOString(),
    }

    await redis.setex(key, PROFILE_VIEW_TTL_SECONDS, JSON.stringify(payload))
    await redis.sadd(PENDING_PROFILE_VIEWS_KEY, key)
    await redis.expire(PENDING_PROFILE_VIEWS_KEY, PROFILE_VIEW_TTL_SECONDS * 6)
  } catch (error) {
    console.warn('Redis activity buffering failed, falling back to direct DB write:', error)
    await activityOperations.logActivity(viewerId, viewedUserId, 'profile_view', metadata)
  }
}

export async function hasExistingProfileView(
  viewerId: string,
  viewedUserId: string
): Promise<boolean> {
  const existing = await db.query.activityLog.findFirst({
    where: and(
      eq(activityLog.viewerId, viewerId),
      eq(activityLog.viewedUserId, viewedUserId),
      eq(activityLog.action, 'profile_view')
    ),
  })

  if (existing) {
    return true
  }

  return hasBufferedProfileView(viewerId, viewedUserId)
}

export async function flushBufferedProfileViews(limit = 500): Promise<{
  scanned: number
  flushed: number
  failed: number
}> {
  const redis = await getRedisClient()
  if (!redis) {
    return { scanned: 0, flushed: 0, failed: 0 }
  }

  const pendingKeys = (await redis.smembers(PENDING_PROFILE_VIEWS_KEY)).slice(0, limit)
  if (pendingKeys.length === 0) {
    return { scanned: 0, flushed: 0, failed: 0 }
  }

  let flushed = 0
  let failed = 0

  for (const key of pendingKeys) {
    try {
      const rawPayload = await redis.get(key)
      if (!rawPayload) {
        await redis.srem(PENDING_PROFILE_VIEWS_KEY, key)
        continue
      }

      const parsed = JSON.parse(rawPayload) as BufferedProfileView
      if (!parsed.viewerId || !parsed.viewedUserId || parsed.action !== 'profile_view') {
        await redis.del(key)
        await redis.srem(PENDING_PROFILE_VIEWS_KEY, key)
        failed += 1
        continue
      }

      await upsertProfileViewToDatabase(parsed)

      await redis.del(key)
      await redis.srem(PENDING_PROFILE_VIEWS_KEY, key)
      flushed += 1
    } catch (error) {
      console.warn('Failed flushing buffered profile view:', error)
      failed += 1
    }
  }

  return {
    scanned: pendingKeys.length,
    flushed,
    failed,
  }
}
