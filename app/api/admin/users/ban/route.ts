import { NextResponse, NextRequest } from 'next/server'
import { checkRole } from '@/utils/roles'
import { banUser } from '@/lib/admin-api'

export async function POST(request: NextRequest) {
  try {
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, banned } = body
    
    if (!userId || typeof banned !== 'boolean') {
      return NextResponse.json({ error: 'userId and banned (boolean) required' }, { status: 400 })
    }

    await banUser(userId, banned)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error banning/unbanning user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 