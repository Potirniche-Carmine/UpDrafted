import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

export const checkRoleWithAuth = (sessionClaims: { metadata: { role: Roles } }, role: Roles) => {
  return sessionClaims?.metadata.role === role
}

export const requireAnyRole = async (): Promise<{ userId: string; role: Roles } | NextResponse> => {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = sessionClaims?.metadata?.role as Roles
  
  if (!userRole || !['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
    return NextResponse.json({ 
      error: 'Forbidden - Valid role required' 
    }, { status: 403 })
  }

  return { userId, role: userRole }
}

export const requireRole = async (allowedRoles: Roles[]): Promise<{ userId: string; role: Roles } | NextResponse> => {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = sessionClaims?.metadata?.role as Roles
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ 
      error: `Forbidden - Requires one of: ${allowedRoles.join(', ')}` 
    }, { status: 403 })
  }

  return { userId, role: userRole }
}

export const requireAdmin = async (): Promise<{ userId: string; role: 'admin' } | NextResponse> => {
  const result = await requireRole(['admin'])
  if (result instanceof NextResponse) return result
  return result as { userId: string; role: 'admin' }
}

export const requireOwnershipOrAdmin = async (resourceUserId: string): Promise<{ userId: string; role: Roles; isOwner: boolean } | NextResponse> => {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = sessionClaims?.metadata?.role as Roles
  
  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 })
  }

  const isOwner = userId === resourceUserId
  const isAdmin = userRole === 'admin'
  
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ 
      error: 'Forbidden - You can only access your own resources' 
    }, { status: 403 })
  }

  return { userId, role: userRole, isOwner }
}