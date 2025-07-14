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

export const requireAnyRole = async (): Promise<{ 
  userId: string; 
  role: Roles; 
  isImpersonation?: boolean;
  actorUserId?: string;
  actorRole?: Roles;
} | NextResponse> => {
  const authResult = await auth()
  const { userId, sessionClaims } = authResult
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = sessionClaims?.metadata?.role as Roles
  
  if (!userRole || !['admin', 'athlete', 'coach', 'recruiter'].includes(userRole)) {
    return NextResponse.json({ 
      error: 'Forbidden - Valid role required' 
    }, { status: 403 })
  }

  // Check for impersonation by examining the session claims
  // During impersonation, Clerk provides actor information in the session
  const isImpersonation = !!(authResult as any).actor || !!(sessionClaims as any)?.actor
  let actorUserId: string | undefined
  let actorRole: Roles | undefined

  if (isImpersonation) {
    // Extract actor information from the session
    const actorInfo = (authResult as any).actor || (sessionClaims as any)?.actor
    if (actorInfo) {
      actorUserId = actorInfo.sub || actorInfo.id
      // Strong validation: check if actor is actually an admin
      const actorRoleFromMetadata = actorInfo.metadata?.role || actorInfo.publicMetadata?.role
      if (actorRoleFromMetadata === 'admin') {
        actorRole = 'admin'
      }
    }
  }

  return { 
    userId, 
    role: userRole,
    isImpersonation,
    actorUserId,
    actorRole
  }
}

export const requireRole = async (allowedRoles: Roles[]): Promise<{ 
  userId: string; 
  role: Roles;
  isImpersonation?: boolean;
  actorUserId?: string;
  actorRole?: Roles;
} | NextResponse> => {
  const authResult = await auth()
  const { userId, sessionClaims } = authResult
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = sessionClaims?.metadata?.role as Roles
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ 
      error: `Forbidden - Requires one of: ${allowedRoles.join(', ')}` 
    }, { status: 403 })
  }

  // Check for impersonation
  const isImpersonation = !!(authResult as any).actor || !!(sessionClaims as any)?.actor
  let actorUserId: string | undefined
  let actorRole: Roles | undefined

  if (isImpersonation) {
    const actorInfo = (authResult as any).actor || (sessionClaims as any)?.actor
    if (actorInfo) {
      actorUserId = actorInfo.sub || actorInfo.id
      const actorRoleFromMetadata = actorInfo.metadata?.role || actorInfo.publicMetadata?.role
      if (actorRoleFromMetadata === 'admin') {
        actorRole = 'admin'
      }
    }
  }

  return { 
    userId, 
    role: userRole,
    isImpersonation,
    actorUserId,
    actorRole
  }
}

export const requireAdmin = async (): Promise<{ 
  userId: string; 
  role: 'admin';
  isImpersonation?: boolean;
  actorUserId?: string;
  actorRole?: Roles;
} | NextResponse> => {
  const result = await requireRole(['admin'])
  if (result instanceof NextResponse) return result
  return result as { 
    userId: string; 
    role: 'admin';
    isImpersonation?: boolean;
    actorUserId?: string;
    actorRole?: Roles;
  }
}

export const requireOwnershipOrAdmin = async (resourceUserId: string): Promise<{ 
  userId: string; 
  role: Roles; 
  isOwner: boolean;
  isImpersonation?: boolean;
  actorUserId?: string;
  actorRole?: Roles;
} | NextResponse> => {
  const authResult = await auth()
  const { userId, sessionClaims } = authResult
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = sessionClaims?.metadata?.role as Roles
  
  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden - Valid role required' }, { status: 403 })
  }

  const isOwner = userId === resourceUserId
  const isAdmin = userRole === 'admin'
  
  // Check for impersonation
  const isImpersonation = !!(authResult as any).actor || !!(sessionClaims as any)?.actor
  let actorUserId: string | undefined
  let actorRole: Roles | undefined

  if (isImpersonation) {
    const actorInfo = (authResult as any).actor || (sessionClaims as any)?.actor
    if (actorInfo) {
      actorUserId = actorInfo.sub || actorInfo.id
      const actorRoleFromMetadata = actorInfo.metadata?.role || actorInfo.publicMetadata?.role
      if (actorRoleFromMetadata === 'admin') {
        actorRole = 'admin'
      }
    }
  }

  // During impersonation, treat as if the actor (admin) has access
  const hasAccess = isOwner || isAdmin || isImpersonation
  
  if (!hasAccess) {
    return NextResponse.json({ 
      error: 'Forbidden - You can only access your own resources' 
    }, { status: 403 })
  }

  return { 
    userId, 
    role: userRole, 
    isOwner,
    isImpersonation,
    actorUserId,
    actorRole
  }
}