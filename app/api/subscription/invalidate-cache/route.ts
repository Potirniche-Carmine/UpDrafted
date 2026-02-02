import { NextResponse } from 'next/server'
import { SubscriptionManager } from '@/lib/subscription'
import { getSession } from "@/utils/roles"

export async function POST() {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Force invalidate server-side cache for the current user
    SubscriptionManager.invalidateUserCache(userId)

    console.log(`Server cache invalidated for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated - client should refetch',
      timestamp: Date.now() // This can be used by client to detect cache invalidation
    })
  } catch (error) {
    console.error('Error invalidating cache:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}