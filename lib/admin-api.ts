import { clerkClient } from '@clerk/nextjs/server'

export interface UserStats {
  total: number
  admin: number
  coach: number
  athlete: number
  recruiter: number
  noRole: number
  banned: number
}

export interface SerializableUser {
  id: string
  firstName: string | null
  lastName: string | null
  emailAddresses: Array<{
    id: string
    emailAddress: string
  }>
  primaryEmailAddressId: string | null
  publicMetadata: Record<string, unknown>
  banned: boolean
  createdAt: string
}

export async function getUserStats(): Promise<UserStats> {
  const client = await clerkClient()
  
  // Only fetch a reasonable sample for stats (100 users max)
  const users = await client.users.getUserList({ 
    limit: 100,
    orderBy: '-created_at'
  })

  const userStats = users.data.reduce((stats, user) => {
    stats.total++
    
    const role = user.publicMetadata.role as string
    if (role === 'admin') stats.admin++
    else if (role === 'coach') stats.coach++
    else if (role === 'athlete') stats.athlete++
    else if (role === 'recruiter') stats.recruiter++
    else stats.noRole++
    
    if (user.banned) stats.banned++
    
    return stats
  }, {
    total: 0,
    admin: 0,
    coach: 0,
    athlete: 0,
    recruiter: 0,
    noRole: 0,
    banned: 0,
  })

  return userStats
}

export async function searchUsers(query: string, limit = 20): Promise<SerializableUser[]> {
  const client = await clerkClient()
  
  const users = await client.users.getUserList({ 
    query,
    limit,
    orderBy: '-created_at'
  })

  return users.data.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map((email: { id: string; emailAddress: string }) => ({
      id: email.id,
      emailAddress: email.emailAddress
    })),
    primaryEmailAddressId: user.primaryEmailAddressId,
    publicMetadata: user.publicMetadata,
    banned: user.banned,
    createdAt: new Date(user.createdAt).toISOString()
  }))
}

export async function getUsersByRole(role: string, limit = 20): Promise<SerializableUser[]> {
  const client = await clerkClient()
  
  // Unfortunately, Clerk doesn't support filtering by metadata in the API directly
  // So we need to fetch more users and filter client-side
  const users = await client.users.getUserList({ 
    limit: Math.min(limit * 5, 100), // Fetch more to account for filtering
    orderBy: '-created_at'
  })

  const filteredUsers = users.data.filter(user => {
    if (role === 'none') return !user.publicMetadata.role
    return user.publicMetadata.role === role
  }).slice(0, limit)

  return filteredUsers.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map((email: { id: string; emailAddress: string }) => ({
      id: email.id,
      emailAddress: email.emailAddress
    })),
    primaryEmailAddressId: user.primaryEmailAddressId,
    publicMetadata: user.publicMetadata,
    banned: user.banned,
    createdAt: new Date(user.createdAt).toISOString()
  }))
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  const client = await clerkClient()
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role }
  })
}

export async function banUser(userId: string, banned: boolean): Promise<void> {
  const client = await clerkClient()
  
  if (banned) {
    await client.users.banUser(userId)
  } else {
    await client.users.unbanUser(userId)
  }
} 