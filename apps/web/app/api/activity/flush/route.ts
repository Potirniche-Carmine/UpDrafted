import { NextRequest, NextResponse } from 'next/server'
import { validateTimestamp } from '@/utils/security'
import { flushBufferedProfileViews } from '@/lib/activity-buffer'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-cron-secret')
    const timestampHeader = request.headers.get('x-timestamp')

    if (!process.env.CRON_SECRET_TOKEN || authHeader !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timestampValidation = validateTimestamp(timestampHeader)
    if (!timestampValidation.valid) {
      return NextResponse.json({ error: timestampValidation.error }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const requestedLimit = parseInt(searchParams.get('limit') || '500', 10)
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 2000) : 500

    const result = await flushBufferedProfileViews(limit)
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Failed to flush buffered profile views:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to flush buffered profile views',
    }, { status: 500 })
  }
}
