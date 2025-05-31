'use client';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Users, Search, MessageSquare, User, MoreVertical, XCircle, ShieldAlert, UserCheck, UserCog, UsersRound, CheckCircle, X, Clock} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

const initialUsers: User[] = [
  { id: 1, name: 'Alex Johnson', sport: 'Basketball', type: 'athlete', avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AJ', mutualConnections: 12 },
  { id: 2, name: 'Maria Garcia', sport: 'Soccer', type: 'athlete', avatar: 'https://placehold.co/100x100/FEE2E2/B91C1C?text=MG', mutualConnections: 8 },
  { id: 3, name: 'Coach David Lee', sport: 'Football', type: 'coach', avatar: 'https://placehold.co/100x100/D1FAE5/065F46?text=DL', mutualConnections: 25 },
  { id: 4, name: 'Sarah Miller', sport: 'Tennis', type: 'athlete', avatar: 'https://placehold.co/100x100/FEF3C7/92400E?text=SM', mutualConnections: 5 },
  { id: 5, name: 'Recruiter Emily White', sport: 'Various', type: 'recruiter', avatar: 'https://placehold.co/100x100/E0E7FF/3730A3?text=EW', mutualConnections: 50 },
  { id: 6, name: 'John Davis', sport: 'Swimming', type: 'athlete', avatar: 'https://placehold.co/100x100/F3E8FF/5B21B6?text=JD', mutualConnections: 3 },
  { id: 7, name: 'Coach Lisa Brown', sport: 'Volleyball', type: 'coach', avatar: 'https://placehold.co/100x100/FFE4E6/9F1239?text=LB', mutualConnections: 18 },
  { id: 8, name: 'Michael Wilson', sport: 'Track & Field', type: 'athlete', avatar: 'https://placehold.co/100x100/E0F2FE/0E7490?text=MW', mutualConnections: 10 },
  { id: 9, name: 'Recruiter Kevin Harris', sport: 'Basketball', type: 'recruiter', avatar: 'https://placehold.co/100x100/F0FDFA/0D9488?text=KH', mutualConnections: 33 },
  { id: 10, name: 'Jessica Martinez', sport: 'Gymnastics', type: 'athlete', avatar: 'https://placehold.co/100x100/FFF7ED/C2410C?text=JM', mutualConnections: 7 },
];

const pendingRequests: PendingRequest[] = [
  { 
    id: 11, 
    name: 'Coach Martinez Rodriguez', 
    sport: 'Basketball', 
    type: 'coach', 
    avatar: 'https://placehold.co/100x100/D1FAE5/065F46?text=CM',
    organization: 'UCLA Basketball',
    requestedAt: '2 hours ago',
    mutualConnections: 15
  },
  { 
    id: 12, 
    name: 'Sophia Chen', 
    sport: 'Swimming', 
    type: 'athlete', 
    avatar: 'https://placehold.co/100x100/FEE2E2/B91C1C?text=SC',
    organization: 'Stanford University',
    requestedAt: '5 hours ago',
    mutualConnections: 8
  },
  { 
    id: 13, 
    name: 'Recruiter Thompson Williams', 
    sport: 'Football', 
    type: 'recruiter', 
    avatar: 'https://placehold.co/100x100/E0E7FF/3730A3?text=TW',
    organization: 'Elite Sports Agency',
    requestedAt: '1 day ago',
    mutualConnections: 22
  },
  { 
    id: 14, 
    name: 'Coach Amanda Foster', 
    sport: 'Soccer', 
    type: 'coach', 
    avatar: 'https://placehold.co/100x100/FFE4E6/9F1239?text=AF',
    organization: 'Duke Soccer',
    requestedAt: '2 days ago',
    mutualConnections: 12
  },
];

interface User {
  id: number;
  name: string;
  sport: string;
  type: 'athlete' | 'coach' | 'recruiter' | 'Various';
  avatar: string;
  mutualConnections: number;
}

interface PendingRequest extends User {
  organization: string;
  requestedAt: string;
}

interface UserCardProps {
  user: User;
  onRemove: (userId: number) => void;
}

interface PendingRequestCardProps {
  request: PendingRequest;
  onAccept: (requestId: number) => void;
  onDecline: (requestId: number) => void;
}

interface FilterButtonsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onRemove }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleRemove = () => {
    onRemove(user.id);
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleSendMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle send message action
  };

  return (
    <Link href={`/profile/${user.id}`} className="block h-full">
      <Card className="group transition-all duration-300 hover:shadow-lg hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 h-full cursor-pointer">
        <CardContent className="p-4 md:p-6 flex flex-col h-full">
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30 group-hover:ring-[#01ae79]/30 dark:group-hover:ring-[#01ae79]/40 transition-colors hover:ring-[#01ae79]/40 dark:hover:ring-[#01ae79]/50">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold text-foreground leading-tight mb-1">{user.name}</h3>
              <p className="text-sm text-[#01ae79] font-medium mb-1">{user.sport}</p>
              <Badge variant="outline" className="text-xs capitalize mb-2">
                {user.type}
              </Badge>
            </div>
            <div className="relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuClick}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical size={16} />
              </Button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto"
                  >
                    <XCircle size={16} className="mr-2" />
                    Remove Connection
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-foreground">{user.mutualConnections}</span> Mutual Connections
            </div>
            <Button 
              className="w-full h-10 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white" 
              size="sm"
              onClick={handleSendMessageClick}
            >
              <MessageSquare size={18} className="mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const PendingRequestCard: React.FC<PendingRequestCardProps> = ({ request, onAccept, onDecline }) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
      <Link href={`/profile/${request.id}`} className="flex-shrink-0 cursor-pointer">
        <Avatar className="h-12 w-12 ring-2 ring-amber-100 dark:ring-amber-900 hover:ring-amber-200 dark:hover:ring-amber-800 transition-colors">
          <AvatarImage src={request.avatar} alt={request.name} />
          <AvatarFallback className="text-sm font-medium">
            {request.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-grow min-w-0">
        <Link href={`/profile/${request.id}`} className="cursor-pointer block hover:opacity-80 transition-opacity">
          <h4 className="font-medium text-foreground leading-tight mb-1">{request.name}</h4>
        </Link>
        <p className="text-sm text-muted-foreground mb-1">{request.organization}</p>
        <p className="text-xs text-muted-foreground">{request.requestedAt}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <Button size="sm" onClick={() => onAccept(request.id)} className="h-8 text-xs">
          <CheckCircle size={14} className="mr-1" />
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDecline(request.id)} className="h-8 text-xs">
          <X size={14} className="mr-1" />
          Decline
        </Button>
      </div>
    </div>
  );
};

const FilterButtons: React.FC<FilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { label: 'All', value: 'all', icon: <UsersRound size={16} /> },
    { label: 'Athletes', value: 'athlete', icon: <UserCheck size={16} /> },
    { label: 'Coaches', value: 'coach', icon: <UserCog size={16} /> },
    { label: 'Recruiters', value: 'recruiter', icon: <ShieldAlert size={16} /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={`h-9 transition-all duration-200 ${
            currentFilter === filter.value
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'border-border/50 hover:border-green-200 dark:hover:border-green-800'
          }`}
        >
          {filter.icon}
          <span className="ml-2">{filter.label}</span>
        </Button>
      ))}
    </div>
  );
};

function App() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [requests, setRequests] = useState(pendingRequests);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('connections');

  // Check for tab parameter in URL and set active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'requests') {
      setActiveTab('requests');
    }
  }, [searchParams]);

  const handleRemoveUser = (userId: number) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const handleAcceptRequest = (requestId: number) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      // Move to connections
      const newUser: User = {
        id: request.id,
        name: request.name,
        sport: request.sport,
        type: request.type,
        avatar: request.avatar,
        mutualConnections: request.mutualConnections
      };
      setUsers(prev => [...prev, newUser]);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: number) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const term = searchTerm.toLowerCase();
        return user.name.toLowerCase().includes(term) ||
               user.sport.toLowerCase().includes(term);
      })
      .filter(user => {
        if (activeFilter === 'all') return true;
        return user.type === activeFilter;
      });
  }, [users, searchTerm, activeFilter]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter(request => {
        const term = searchTerm.toLowerCase();
        return request.name.toLowerCase().includes(term) ||
               request.sport.toLowerCase().includes(term) ||
               request.organization.toLowerCase().includes(term);
      })
      .filter(request => {
        if (activeFilter === 'all') return true;
        return request.type === activeFilter;
      });
  }, [requests, searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
        {/* Unified connections panel */}
        <div className="h-full flex flex-col border border-border/50 rounded-xl shadow-lg bg-card overflow-hidden">
          
          {/* Integrated Header */}
          <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/2 dark:to-[#01ae79]/10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#01ae79] via-[#01ae79]/90 to-[#01ae79]/80 bg-clip-text text-transparent mb-2">
                  Your Network
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {requests.length > 0 && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
                      {requests.length} pending
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {users.length} connections
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search connections and requests..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <FilterButtons currentFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>
          </div>

          {/* Content Area with Tabs */}
          <div className="flex-grow overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b border-border/50 bg-card/50">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-1">
                  <TabsTrigger 
                    value="connections" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#01ae79] data-[state=active]:text-white h-10"
                  >
                    <Users size={16} />
                    <span>Connections</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {users.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="requests" 
                    className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white h-10"
                  >
                    <Clock size={16} />
                    <span>Requests</span>
                    {requests.length > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-800 text-xs">
                        {requests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-grow overflow-y-auto bg-gradient-to-b from-transparent to-[#01ae79]/5 dark:to-[#01ae79]/10">
                <TabsContent value="connections" className="p-4 h-full m-0">
                  {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {filteredUsers.map(user => (
                        <UserCard key={user.id} user={user} onRemove={handleRemoveUser} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-[#01ae79]" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No connections found</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        {searchTerm || activeFilter !== 'all' 
                          ? 'Try adjusting your search or filter.' 
                          : 'Start building your network by connecting with athletes, coaches, and recruiters.'}
                      </p>
                      {!searchTerm && activeFilter === 'all' && (
                        <Button className="mt-2 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                          <Search size={16} className="mr-2" />
                          Find People
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="requests" className="p-4 h-full m-0">
                  {filteredRequests.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Pending Requests ({filteredRequests.length})</h2>
                      </div>
                      {filteredRequests.map((request, index) => (
                        <div key={request.id}>
                          <PendingRequestCard 
                            request={request} 
                            onAccept={handleAcceptRequest}
                            onDecline={handleDeclineRequest}
                          />
                          {index < filteredRequests.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-6">
                        <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No pending requests</h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchTerm || activeFilter !== 'all' 
                          ? 'No requests match your current search or filter.' 
                          : 'New connection requests will appear here when received.'}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  );
}
