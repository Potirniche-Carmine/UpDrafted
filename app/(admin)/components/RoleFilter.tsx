'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RoleFilterProps {
  currentRole?: string
  currentSearch?: string
  currentTab: string
  roles: string[]
}

export const RoleFilter = ({ currentRole, currentSearch, currentTab, roles }: RoleFilterProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams()
    
    if (currentSearch) {
      params.set('search', currentSearch)
    }
    
    params.set('tab', currentTab)
    
    if (value !== 'all') {
      params.set('role', value)
    }
    
    router.push(pathname + '?' + params.toString())
  }

  return (
    <div className="w-full md:w-48">
      <label className="text-sm font-medium text-foreground block mb-2">
        Filter by Role
      </label>
      <Select value={currentRole || 'all'} onValueChange={handleRoleChange}>
        <SelectTrigger className="bg-background border-border">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </SelectItem>
          ))}
          <SelectItem value="none">No Role</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 