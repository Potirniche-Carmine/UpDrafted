import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

export const checkRoleWithAuth = (sessionClaims: { metadata: { role: Roles } }, role: Roles) => {
  return sessionClaims?.metadata.role === role
}