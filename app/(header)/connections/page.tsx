"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import { Users, Search, MessageSquare, Shield, CheckCircle, X, Clock, MoreHorizontal, MapPin, User, UserCheck, Users2, Send } from 'lucide-react';
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { AuthWrapper } from '../../../components/auth-wrapper';
import { sanitizeText } from '@/utils/sanitization';

interface Connection {
  id: number;
  status: 'connected' | 'interested' | 'viewed';
  initiatedBy: 'athlete' | 'coach' | 'recruiter';
  createdAt: string;
  notes: string | null;
  isInitiator: boolean;
  otherUser: {
    userId: string;
    fullName: string;
    profileImage: string | null;
    organizationName: string;
    title?: string;
    sport?: string;
    city: string;
    state: string;
    division?: string;
    graduationYear?: number;
    educationLevel?: string;
    isVerified: boolean;
    role: 'athlete' | 'coach' | 'recruiter';
  };
}

interface PendingRequest {
  id: number;
  status: 'pending';
  initiatedBy: 'athlete' | 'coach' | 'recruiter';
  createdAt: string;
  notes: string | null;
  isInitiator: boolean;
  otherUser: {
    userId: string;
    fullName: string;
    profileImage: string | null;
    organizationName: string;
    title?: string;
    sport?: string;
    city: string;
    state: string;
    division?: string;
    graduationYear?: number;
    educationLevel?: string;
    isVerified: boolean;
    role: 'athlete' | 'coach' | 'recruiter';
  };
}

interface UserCardProps {
  connection: Connection;
  onRemove: (connectionId: number, targetUserId: string) => void;
  isRemoving?: boolean;
}

interface PendingRequestCardProps {
  request: PendingRequest;
  onAccept: (requestId: number) => void;
  onDecline: (requestId: number) => void;
}

interface SentRequestCardProps {
  request: PendingRequest;
  onWithdraw: (requestId: number, targetUserId: string) => void;
  isWithdrawing?: boolean;
}

interface FilterButtonsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

// Helper function to get role badge with descriptive text
const getRoleBadge = (role: string, division?: string, educationLevel?: string) => {
  let roleText = '';
  let roleColor = '';

  if (role === 'athlete') {
    if (educationLevel === 'high_school') {
      roleText = 'High School Athlete';
      roleColor = 'bg-blue-100 text-blue-800';
    } else if (educationLevel === 'undergraduate') {
      roleText = 'College Athlete';
      roleColor = 'bg-purple-100 text-purple-800';
    } else if (educationLevel === 'associate') {
      roleText = 'Community College Athlete';
      roleColor = 'bg-orange-100 text-orange-800';
    } else if (educationLevel === 'graduate') {
      roleText = 'Graduate Athlete';
      roleColor = 'bg-indigo-100 text-indigo-800';
    } else {
      roleText = 'Athlete';
      roleColor = 'bg-blue-100 text-blue-800';
    }
  } else if (role === 'coach') {
    if (division === 'High School') {
      roleText = 'High School Coach';
      roleColor = 'bg-blue-100 text-blue-800';
    } else if (division === 'Club Sports') {
      roleText = 'Club Coach';
      roleColor = 'bg-green-100 text-green-800';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = division === 'Junior College' ? 'Junior College Coach' : 'Community College Coach';
      roleColor = 'bg-orange-100 text-orange-800';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Coach';
      roleColor = 'bg-purple-100 text-purple-800';
    } else {
      roleText = 'Coach';
      roleColor = 'bg-gray-100 text-gray-800';
    }
  } else if (role === 'recruiter') {
    if (division === 'High School') {
      roleText = 'High School Recruiter';
      roleColor = 'bg-blue-100 text-blue-800';
    } else if (division === 'Club Sports') {
      roleText = 'Club Recruiter';
      roleColor = 'bg-green-100 text-green-800';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = division === 'Junior College' ? 'Junior College Recruiter' : 'Community College Recruiter';
      roleColor = 'bg-orange-100 text-orange-800';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Recruiter';
      roleColor = 'bg-purple-100 text-purple-800';
    } else {
      roleText = 'Recruiter';
      roleColor = 'bg-gray-100 text-gray-800';
    }
  }

  return <Badge className={`text-xs ${roleColor}`}>{roleText}</Badge>;
};

const UserCard: React.FC<UserCardProps> = ({ connection, onRemove, isRemoving = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { otherUser } = connection;

  const handleRemove = () => {
    onRemove(connection.id, otherUser.userId);
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
    <Link href={`/profile/${otherUser.userId}`} className="block h-full">
      <Card className="group transition-all duration-300 hover:shadow-md hover:shadow-[#01ae79]/5 border-border/50 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 h-full cursor-pointer">
        <CardContent className="p-3 flex flex-col h-full">
          <div className="flex items-start space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30 group-hover:ring-[#01ae79]/30 dark:group-hover:ring-[#01ae79]/40 transition-colors">
                  <AvatarImage src={otherUser.profileImage || undefined} alt={otherUser.fullName} />
                  <AvatarFallback className="text-xs font-medium">
                    {otherUser.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {/* Verification indicator */}
                {otherUser.isVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 truncate">{otherUser.fullName}</h3>
              <div className="space-y-1">
                {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                <p className="text-xs text-[#01ae79] font-medium truncate">
                  {otherUser.role === 'athlete' ? otherUser.sport : otherUser.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{otherUser.city}, {otherUser.state}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{otherUser.organizationName}</p>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuClick}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal size={14} />
              </Button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-card rounded-lg shadow-lg border border-border py-1 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto text-xs"
                  >
                    <X size={14} className="mr-2" />
                    {isRemoving ? 'Removing...' : 'Remove Connection'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end space-y-2">
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground">Connected</span> • {new Date(connection.createdAt).toLocaleDateString()}
            </div>
            <Button 
              className="w-full h-8 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white text-xs" 
              size="sm"
              onClick={handleSendMessageClick}
            >
              <MessageSquare size={14} className="mr-1" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const PendingRequestCard: React.FC<PendingRequestCardProps> = ({ request, onAccept, onDecline }) => {
  const { otherUser } = request;
  const sanitizedNotes = request.notes ? sanitizeText(request.notes) : null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
      <Link href={`/profile/${otherUser.userId}`} className="flex-shrink-0 cursor-pointer">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-amber-100 dark:ring-amber-900 hover:ring-amber-200 dark:hover:ring-amber-800 transition-colors">
            <AvatarImage src={otherUser.profileImage || undefined} alt={otherUser.fullName} />
            <AvatarFallback className="text-sm font-medium">
              {otherUser.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {/* Verification indicator */}
          {otherUser.isVerified && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex-grow min-w-0">
        <Link href={`/profile/${otherUser.userId}`} className="cursor-pointer block hover:opacity-80 transition-opacity">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground leading-tight truncate">{otherUser.fullName}</h4>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Link>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <p className="truncate">{otherUser.organizationName}</p>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{otherUser.city}, {otherUser.state}</span>
            </div>
          </div>
          
          {sanitizedNotes && (
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs text-muted-foreground mb-1">Message:</p>
              <p className="text-sm text-foreground break-words">{sanitizedNotes}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white flex-1 h-8 text-xs"
              onClick={() => onAccept(request.id)}
            >
              <CheckCircle size={14} className="mr-1" />
              Accept
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={() => onDecline(request.id)}
            >
              <X size={14} className="mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SentRequestCard: React.FC<SentRequestCardProps> = ({ request, onWithdraw, isWithdrawing = false }) => {
  const { otherUser } = request;

  const handleWithdraw = () => {
    onWithdraw(request.id, otherUser.userId);
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
      <Link href={`/profile/${otherUser.userId}`} className="flex-shrink-0 cursor-pointer">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-amber-100 dark:ring-amber-900 hover:ring-amber-200 dark:hover:ring-amber-800 transition-colors">
            <AvatarImage src={otherUser.profileImage || undefined} alt={otherUser.fullName} />
            <AvatarFallback className="text-sm font-medium">
              {otherUser.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {/* Verification indicator */}
          {otherUser.isVerified && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex-grow min-w-0">
        <Link href={`/profile/${otherUser.userId}`} className="cursor-pointer block hover:opacity-80 transition-opacity">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground leading-tight truncate">{otherUser.fullName}</h4>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Link>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <p className="truncate">{otherUser.organizationName}</p>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{otherUser.city}, {otherUser.state}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white flex-1 h-8 text-xs"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <>
                  <Clock size={14} className="mr-1 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <X size={14} className="mr-1" />
                  Withdraw Request
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterButtons: React.FC<FilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'athletes', label: 'Athletes', icon: User },
    { id: 'coaches', label: 'Coaches', icon: UserCheck },
    { id: 'recruiters', label: 'Recruiters', icon: Users2 }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.id}
            variant={currentFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`h-9 ${currentFilter === filter.id ? 'bg-[#01ae79] hover:bg-[#01ae79]/90 text-white' : ''}`}
          >
            <Icon size={16} className="mr-2" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

function App() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingConnection, setRemovingConnection] = useState<number | null>(null);
  const loadingRef = useRef(false); // Track if API call is in progress

  const activeTab = searchParams?.get('tab') || 'connections';

  // Load connections data
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    // Prevent duplicate API calls due to React Strict Mode
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load connections');
      }

      const data = await response.json();
      if (data.success) {
        // All connections from API are established connections
        // Pending requests would be handled by a separate endpoint if needed
        setConnections(data.connections);
        setPendingRequests(data.pendingRequests);
        setSentRequests(data.sentRequests);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleRemoveConnection = async (connectionId: number, targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this connection? This action cannot be undone.')) {
      return;
    }

    setRemovingConnection(connectionId);
    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove connection');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setConnections(prev => prev.filter(c => c.id !== connectionId));
      } else {
        throw new Error(result.error || 'Failed to remove connection');
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection. Please try again.');
    } finally {
      setRemovingConnection(null);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    console.log('Accept request:', requestId);
    
    // Find the request to get the fromUserId
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) {
      console.error('Request not found');
      return;
    }

    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fromUserId: request.otherUser.userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from pending requests and add to connections
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        
        // Create a connected connection object
        const newConnection: Connection = {
          id: result.connection.id,
          status: 'connected',
          initiatedBy: request.initiatedBy,
          createdAt: request.createdAt,
          notes: request.notes,
          isInitiator: false, // This user didn't initiate, they accepted
          otherUser: request.otherUser
        };
        
        setConnections(prev => [...prev, newConnection]);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request accepted successfully!';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      alert('Failed to accept connection request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    console.log('Decline request:', requestId);
    
    // Find the request to get the fromUserId
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) {
      console.error('Request not found');
      return;
    }

    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: request.otherUser.userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request declined.';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to decline connection request');
      }
    } catch (error) {
      console.error('Error declining connection request:', error);
      alert('Failed to decline connection request. Please try again.');
    }
  };

  const handleWithdrawRequest = async (requestId: number, targetUserId: string) => {
    setRemovingConnection(requestId);
    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setSentRequests(prev => prev.filter(r => r.id !== requestId));
        // Use a more user-friendly notification instead of alert
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request withdrawn successfully!';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to withdraw connection request');
      }
    } catch (error) {
      console.error('Error withdrawing connection request:', error);
      alert('Failed to withdraw connection request. Please try again.');
    } finally {
      setRemovingConnection(null);
    }
  };

  const filteredConnections = useMemo(() => {
    let filtered = connections;
    
    if (filter !== 'all') {
      filtered = filtered.filter(connection => {
        if (filter === 'athletes') return connection.otherUser.role === 'athlete';
        if (filter === 'coaches') return connection.otherUser.role === 'coach';
        if (filter === 'recruiters') return connection.otherUser.role === 'recruiter';
        return true;
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(connection =>
        connection.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.otherUser.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (connection.otherUser.sport && connection.otherUser.sport.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [connections, filter, searchTerm]);

  const filteredPendingRequests = useMemo(() => {
    let filtered = pendingRequests;
    
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.otherUser.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.otherUser.sport && request.otherUser.sport.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [pendingRequests, searchTerm]);

  const filteredSentRequests = useMemo(() => {
    let filtered = sentRequests;
    
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.otherUser.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.otherUser.sport && request.otherUser.sport.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [sentRequests, searchTerm]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01ae79] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Connections</h1>
          <p className="text-muted-foreground">Manage your network of athletes, coaches, and recruiters</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#01ae79]/20 focus:border-[#01ae79]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="connections" className="relative text-xs sm:text-sm px-2 sm:px-4">
              <Users size={14} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Connections</span>
              <span className="sm:hidden">Connections</span>
              {connections.length > 0 && (
                <Badge variant="secondary" className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-xs p-0 flex items-center justify-center rounded-full z-10">
                  {connections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative text-xs sm:text-sm px-2 sm:px-4">
              <Clock size={14} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Requests</span>
              <span className="sm:hidden">Incoming</span>
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-xs p-0 flex items-center justify-center rounded-full z-10">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent-requests" className="relative text-xs sm:text-sm px-2 sm:px-4">
              <Send size={14} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sent Requests</span>
              <span className="sm:hidden">Sent</span>
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-xs p-0 flex items-center justify-center rounded-full z-10">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <FilterButtons currentFilter={filter} onFilterChange={setFilter} />
            
            {filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm ? 'No connections found' : 'No connections yet'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters' 
                    : 'Start building your network by connecting with athletes, coaches, and recruiters'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredConnections.map(connection => (
                  <UserCard 
                    key={connection.id} 
                    connection={connection} 
                    onRemove={handleRemoveConnection}
                    isRemoving={removingConnection === connection.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {filteredPendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  You&apos;ll see connection requests from other users here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPendingRequests.map(request => (
                  <PendingRequestCard 
                    key={request.id} 
                    request={request} 
                    onAccept={handleAcceptRequest} 
                    onDecline={handleDeclineRequest} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent-requests" className="space-y-6">
            {filteredSentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No sent requests</h3>
                <p className="text-muted-foreground">
                  You&apos;ll see sent requests here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSentRequests.map(request => (
                  <SentRequestCard 
                    key={request.id} 
                    request={request} 
                    onWithdraw={handleWithdrawRequest}
                    isWithdrawing={removingConnection === request.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <AuthWrapper>
      <Suspense fallback={
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01ae79] mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <App />
      </Suspense>
    </AuthWrapper>
  );
}
