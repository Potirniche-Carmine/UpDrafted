"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Ban, UserCheck, Mail, Calendar, Users, Trash2 } from "lucide-react"
import { removeRole, setRole, banUser, unbanUser } from '../admin/_actions'

interface SerializableUser {
  id: string
  firstName: string | null
  lastName: string | null
  emailAddresses: Array<{
    id: string
    emailAddress: string
  }>
  primaryEmailAddressId: string | null
  publicMetadata: Record<string, any>
  banned: boolean
  createdAt: string
}

interface UserManagementProps {
  users: SerializableUser[]
  roles: string[]
}

export function UserManagement({ users, roles }: UserManagementProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
      case 'coach': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:text-blue-400'
      case 'athlete': return 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:text-green-400'
      case 'recruiter': return 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20 dark:text-purple-400'
      default: return 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    const formData = new FormData()
    formData.append('id', userId)
    formData.append('role', role)
    await setRole(formData)
    window.location.reload()
  }

  const handleRemoveRole = async (userId: string) => {
    const formData = new FormData()
    formData.append('id', userId)
    await removeRole(formData)
    window.location.reload()
  }

  const handleBanUser = async (userId: string) => {
    const formData = new FormData()
    formData.append('id', userId)
    await banUser(formData)
    window.location.reload()
  }

  const handleUnbanUser = async (userId: string) => {
    const formData = new FormData()
    formData.append('id', userId)
    await unbanUser(formData)
    window.location.reload()
  }

  if (users.length === 0) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-12 text-center space-y-4">
          <Users className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Users ({users.length})
        </h3>
      </div>
      
      <div className="grid gap-4">
        {users.map((user) => {
          const userRole = user.publicMetadata?.role as string | undefined
          
          return (
            <Card 
              key={user.id} 
              className={`border-border/50 transition-all duration-200 hover:shadow-lg hover:border-primary/20 ${
                user.banned ? 'border-destructive/30 bg-destructive/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0">
                      {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || '?'}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                        {userRole && (
                          <Badge className={getRoleBadgeColor(userRole)}>
                            <Shield className="w-3 h-3 mr-1" />
                            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                          </Badge>
                        )}
                        {user.banned && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                            <Ban className="w-3 h-3 mr-1" />
                            Banned
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select onValueChange={(value: string) => handleRoleChange(user.id, value)}>
                      <SelectTrigger className="w-40 bg-background border-border">
                        <SelectValue placeholder="Change Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRole(user.id)}
                      className="border-border hover:bg-muted"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Role
                    </Button>

                    {user.banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-950"
                        onClick={() => handleUnbanUser(user.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unban
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleBanUser(user.id)}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 