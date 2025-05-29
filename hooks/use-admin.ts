'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import type { SerializableUser } from '@/lib/admin-api'

// Custom hook for debounced search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Client-side API functions (these will call server actions)
async function fetchUserStats() {
  const response = await fetch('/api/admin/stats')
  if (!response.ok) throw new Error('Failed to fetch user stats')
  return response.json()
}

async function fetchSearchUsers(query: string) {
  const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Failed to search users')
  return response.json()
}

async function fetchUsersByRole(role: string) {
  const response = await fetch(`/api/admin/users/role?role=${encodeURIComponent(role)}`)
  if (!response.ok) throw new Error('Failed to fetch users by role')
  return response.json()
}

async function updateUserRole(userId: string, role: string) {
  const response = await fetch('/api/admin/users/update-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role })
  })
  if (!response.ok) throw new Error('Failed to update user role')
  return response.json()
}

async function banUser(userId: string, banned: boolean) {
  const response = await fetch('/api/admin/users/ban', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, banned })
  })
  if (!response.ok) throw new Error('Failed to ban/unban user')
  return response.json()
}

// React Query hooks
export function useUserStats() {
  return useQuery({
    queryKey: ['admin', 'userStats'],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 5, // 5 minutes - stats don't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useSearchUsers(query: string, enabled = true) {
  // Debounce the search query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, 500) // 500ms delay
  
  return useQuery({
    queryKey: ['admin', 'searchUsers', debouncedQuery],
    queryFn: () => fetchSearchUsers(debouncedQuery),
    enabled: enabled && debouncedQuery.length > 2, // Only search with 3+ characters
    staleTime: 1000 * 60 * 2, // 2 minutes - cache search results longer
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  })
}

export function useUsersByRole(role: string, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'usersByRole', role],
    queryFn: () => fetchUsersByRole(role),
    enabled: enabled && role !== 'all',
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      updateUserRole(userId, role),
    onMutate: async ({ userId, role }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['admin'] })
      
      // Get all current admin queries to update
      const queries = queryClient.getQueriesData({ queryKey: ['admin'] })
      
      // Store previous values for rollback
      const previousQueries: Array<[unknown, unknown]> = []
      
      // Optimistically update all search results and user lists
      queries.forEach(([queryKey, data]) => {
        if (data && Array.isArray(data)) {
          previousQueries.push([queryKey, data])
          
          // Update the user in this query's data
          const updatedData = data.map((user: SerializableUser) => {
            if (user.id === userId) {
              return {
                ...user,
                publicMetadata: {
                  ...user.publicMetadata,
                  role: role || undefined
                }
              }
            }
            return user
          })
          
          queryClient.setQueryData(queryKey, updatedData)
        }
      })
      
      return { previousQueries }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
    },
    onSuccess: () => {
      // Invalidate stats to update counts
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'userStats'],
        exact: true 
      })
    },
  })
}

export function useBanUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, banned }: { userId: string; banned: boolean }) => 
      banUser(userId, banned),
    onMutate: async ({ userId, banned }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin'] })
      
      // Get all current admin queries to update
      const queries = queryClient.getQueriesData({ queryKey: ['admin'] })
      
      // Store previous values for rollback
      const previousQueries: Array<[unknown, unknown]> = []
      
      // Optimistically update all search results and user lists
      queries.forEach(([queryKey, data]) => {
        if (data && Array.isArray(data)) {
          previousQueries.push([queryKey, data])
          
          // Update the user in this query's data
          const updatedData = data.map((user: SerializableUser) => {
            if (user.id === userId) {
              return {
                ...user,
                banned
              }
            }
            return user
          })
          
          queryClient.setQueryData(queryKey, updatedData)
        }
      })
      
      return { previousQueries }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
    },
    onSuccess: () => {
      // Invalidate stats to update banned count
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'userStats'],
        exact: true 
      })
    },
  })
} 