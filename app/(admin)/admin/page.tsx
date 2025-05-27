import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from '../components/SearchUsers'
import { UserManagement } from '../components/UserManagement'
import { RoleFilter } from '../components/RoleFilter'
import { clerkClient } from '@clerk/nextjs/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Users, Shield, TrendingUp, UserCheck, AlertTriangle, BarChart3 } from "lucide-react"

export interface SerializableUser {
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

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string; tab?: string; role?: string; page?: string }>
}) {
  if (!checkRole('admin')) {
    redirect('/')
  }

  const searchParams = await params.searchParams
  const query = searchParams.search
  const activeTab = searchParams.tab || 'users'
  const roleFilter = searchParams.role
  const currentPage = parseInt(searchParams.page || '1')
  const usersPerPage = 10

  const client = await clerkClient()
  
  const allUsers = (await client.users.getUserList({ limit: 500 })).data 
  
  let displayUsers = []
  if (query) {
    displayUsers = (await client.users.getUserList({ 
      query,
      limit: usersPerPage,
      offset: (currentPage - 1) * usersPerPage 
    })).data
  } else {
    displayUsers = (await client.users.getUserList({ 
      limit: usersPerPage,
      offset: (currentPage - 1) * usersPerPage,
      orderBy: '-created_at' 
    })).data
  }

  const allSerializableUsers: SerializableUser[] = allUsers.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map(email => ({
      id: email.id,
      emailAddress: email.emailAddress
    })),
    primaryEmailAddressId: user.primaryEmailAddressId,
    publicMetadata: user.publicMetadata,
    banned: user.banned,
    createdAt: new Date(user.createdAt).toISOString()
  }))

  const displaySerializableUsers: SerializableUser[] = displayUsers.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map(email => ({
      id: email.id,
      emailAddress: email.emailAddress
    })),
    primaryEmailAddressId: user.primaryEmailAddressId,
    publicMetadata: user.publicMetadata,
    banned: user.banned,
    createdAt: new Date(user.createdAt).toISOString()
  }))

  const filteredDisplayUsers = roleFilter && roleFilter !== 'all' 
    ? displaySerializableUsers.filter(user => {
        if (roleFilter === 'none') {
          return !user.publicMetadata.role
        }
        return user.publicMetadata.role === roleFilter
      })
    : displaySerializableUsers

  const roles = ['admin', 'coach', 'athlete', 'recruiter']

  const roleStats = {
    total: allSerializableUsers.length,
    admin: allSerializableUsers.filter(u => u.publicMetadata.role === 'admin').length,
    coach: allSerializableUsers.filter(u => u.publicMetadata.role === 'coach').length,
    athlete: allSerializableUsers.filter(u => u.publicMetadata.role === 'athlete').length,
    recruiter: allSerializableUsers.filter(u => u.publicMetadata.role === 'recruiter').length,
    noRole: allSerializableUsers.filter(u => !u.publicMetadata.role).length,
    banned: allSerializableUsers.filter(u => u.banned).length,
  }

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
                Manage users, roles, and platform security with precision
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Users className="w-4 h-4" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">{roleStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-destructive">{roleStats.admin}</div>
                    <div className="text-sm text-muted-foreground">Admins</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-500">{roleStats.coach}</div>
                    <div className="text-sm text-muted-foreground">Coaches</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-500">{roleStats.athlete}</div>
                    <div className="text-sm text-muted-foreground">Athletes</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-purple-500">{roleStats.recruiter}</div>
                    <div className="text-sm text-muted-foreground">Recruiters</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-muted-foreground">{roleStats.noRole}</div>
                    <div className="text-sm text-muted-foreground">No Role</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-destructive">{roleStats.banned}</div>
                    <div className="text-sm text-muted-foreground">Banned</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter Section */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Search className="w-5 h-5 text-primary" />
                  Search & Filter Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-end">
                  <div className="flex-1">
                    <SearchUsers />
                  </div>
                  <RoleFilter 
                    currentRole={roleFilter}
                    currentSearch={query}
                    currentTab={activeTab}
                    roles={roles}
                  />
                </div>
                
                {/* Display info about current view */}
                <div className="text-sm text-muted-foreground border-t pt-4">
                  {query ? (
                    <p>Search results for "{query}" • Showing {filteredDisplayUsers.length} users</p>
                  ) : (
                    <p>Showing {filteredDisplayUsers.length} most recent users • {roleStats.total} total users in system</p>
                  )}
                  {roleFilter && roleFilter !== 'all' && (
                    <p className="mt-1">Filtered by role: <span className="font-medium">{roleFilter === 'none' ? 'No Role' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}</span></p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users Management */}
            <UserManagement users={filteredDisplayUsers} roles={roles} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Submitted Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Reports Management</h3>
                    <p className="text-muted-foreground">Advanced reporting features coming soon...</p>
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
                  Verification Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Verification System</h3>
                    <p className="text-muted-foreground">User verification management coming soon...</p>
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