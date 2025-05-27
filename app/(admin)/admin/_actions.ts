'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
  const client = await clerkClient()

  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient()

  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function banUser(formData: FormData) {
  const client = await clerkClient()

  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const userId = formData.get('id') as string
    const res = await client.users.banUser(userId)
    return { message: 'User banned successfully', user: res }
  } catch (err) {
    return { message: err }
  }
}

export async function unbanUser(formData: FormData) {
  const client = await clerkClient()

  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const userId = formData.get('id') as string
    const res = await client.users.unbanUser(userId)
    return { message: 'User unbanned successfully', user: res }
  } catch (err) {
    return { message: err }
  }
}