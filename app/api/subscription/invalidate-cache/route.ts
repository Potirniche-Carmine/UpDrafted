import { NextResponse } from 'next/server'
import { SubscriptionManager } from '@/lib/subscription'
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Force invalidate cache for the current user
    SubscriptionManager.invalidateUserCache(userId)
    
    console.log(`Cache invalidated for user ${userId}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error invalidating cache:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}