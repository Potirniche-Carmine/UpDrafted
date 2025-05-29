'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Search, 
  Users, 
  Shield, 
  UserCheck, 
  AlertTriangle, 
  BarChart3,
  Loader2,
  UserX,
  Settings,
  Ban,
  UserCog
} from "lucide-react"
import { useUserStats, useSearchUsers, useUpdateUserRole, useBanUser } from '@/hooks/use-admin'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { SerializableUser } from '@/lib/admin-api'
import { Separator } from "@/components/ui/separator"

// Helper function to get role badge color styling
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
    case 'coach':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
    case 'athlete':
      return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
    case 'recruiter':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
  }
}

// Ban Confirmation Dialog Component
function BanConfirmationDialog({ 
  user, 
  onConfirm, 
  isLoading 
}: { 
  user: SerializableUser; 
  onConfirm: () => void; 
  isLoading: boolean; 
}) {
  const userName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'this user';
  
  const userEmail = user.emailAddresses[0]?.emailAddress || 'No email';
  const isBanned = user.banned;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={isBanned ? "outline" : "destructive"}
          size="sm"
          disabled={isLoading}
          className="shadow-sm min-w-[70px] h-8 text-xs"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isBanned ? (
            <>
              <UserCheck className="w-3 h-3 mr-1" />
              Unban
            </>
          ) : (
            <>
              <Ban className="w-3 h-3 mr-1" />
              Ban
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isBanned ? (
              <>
                <UserCheck className="w-5 h-5 text-green-600" />
                Unban User
              </>
            ) : (
              <>
                <Ban className="w-5 h-5 text-red-600" />
                Ban User
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBanned 
              ? `Are you sure you want to unban ${userName}?` 
              : `Are you sure you want to ban ${userName}?`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium text-sm">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
          {!isBanned && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ This action will immediately restrict the user&apos;s access to the platform.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isBanned 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
            }
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isBanned ? 'Unbanning...' : 'Banning...'}
              </>
            ) : (
              <>
                {isBanned ? 'Yes, Unban User' : 'Yes, Ban User'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UserStatsCards() {
  const { data: stats, isLoading, error } = useUserStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="border-border/50 animate-pulse">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-4">
          <p className="text-destructive text-sm">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
            <div className="text-sm text-red-700 dark:text-red-300">Admins</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-blue-600">{stats.coach}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Coaches</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-green-600">{stats.athlete}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Athletes</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-purple-50/50 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-purple-600">{stats.recruiter}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Recruiters</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gray-50/50 dark:bg-gray-950/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-gray-600">{stats.noRole}</div>
            <div className="text-sm text-gray-700 dark:text-gray-400">No Role</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
            <div className="text-sm text-red-700 dark:text-red-300">Banned</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const { 
    data: searchResults, 
    isLoading: isSearchLoading, 
    error: searchError,
    refetch: refetchSearch 
  } = useSearchUsers(searchQuery, hasSearched && searchQuery.length > 2)

  const updateRoleMutation = useUpdateUserRole()
  const banUserMutation = useBanUser()

  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      setHasSearched(true)
      refetchSearch()
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setHasSearched(false)
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole })
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      await banUserMutation.mutateAsync({ userId, banned })
    } catch (error) {
      console.error('Failed to ban/unban user:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Search Users
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Find users by name, email, or user ID to manage their roles and access
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or user ID (minimum 2 characters)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                className="text-base"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={searchQuery.trim().length < 2 || isSearchLoading}
              className="px-6"
            >
              {isSearchLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
            {hasSearched && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="px-4"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Search Results
              </CardTitle>
              {searchResults && searchResults.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isSearchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Searching users...</p>
                </div>
              </div>
            ) : searchError ? (
              <div className="text-center py-12">
                <div className="space-y-3">
                  <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                  <div>
                    <p className="text-destructive font-medium">Search failed</p>
                    <p className="text-sm text-muted-foreground">Please try again or contact support</p>
                  </div>
                </div>
              </div>
            ) : !searchResults || searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="space-y-3">
                  <UserX className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search terms or check the spelling
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((user: SerializableUser) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700 font-semibold">
                          {((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-medium text-base">
                          {user.firstName || user.lastName 
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : 'No name'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.emailAddresses[0]?.emailAddress || 'No email'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user.id}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge 
                            className={`${getRoleBadgeColor(user.publicMetadata.role as string || '')} border-0 shadow-sm text-xs`}
                          >
                            {(user.publicMetadata.role as string) || 'No Role'}
                          </Badge>
                          {user.banned && (
                            <Badge variant="destructive" className="shadow-sm text-xs">
                              <Ban className="w-3 h-3 mr-1" />
                              Banned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-center">
                      <div className="flex flex-col gap-2">
                        <Select
                          value={(user.publicMetadata.role as string) || 'no-role'}
                          onValueChange={(role) => handleUpdateRole(user.id, role === 'no-role' ? '' : role)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-36 shadow-sm h-8 text-xs">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-role">No Role</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="athlete">Athlete</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <BanConfirmationDialog
                          user={user}
                          onConfirm={() => handleBanUser(user.id, !user.banned)}
                          isLoading={banUserMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card className="border-border/50 shadow-lg">
          <CardContent className="py-16">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <UserCog className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">User Management</h3>
                <p className="text-muted-foreground">
                  Search for specific users to manage their roles and access permissions. 
                  Use the search bar above to find users by name, email, or user ID.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-4">
                <div className="space-y-2">
                  <div className="font-medium">Available Actions:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Change user roles</li>
                    <li>• Ban/unban users</li>
                    <li>• View user details</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Search Tips:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Use full or partial names</li>
                    <li>• Search by email address</li>
                    <li>• Use complete user IDs</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage user roles and platform security with precision
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="users" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <UserCog className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <UserCheck className="w-4 h-4" />
              Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Statistics Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Statistics
              </h2>
              <UserStatsCards />
            </div>
            
            <Separator />

            {/* User Management */}
            <UserManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Content Reports
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and manage user-submitted reports and content moderation
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <Settings className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Reports Management</h3>
                    <p className="text-muted-foreground">Advanced reporting and moderation features coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UserCheck className="w-5 h-5 text-primary" />
                  User Verification
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage athlete verification requests and profile authenticity
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <UserCheck className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Verification System</h3>
                    <p className="text-muted-foreground">User verification management system coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}