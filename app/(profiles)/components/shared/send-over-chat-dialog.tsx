"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageCircle, Send, Users } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  imageUrl: string | undefined;
  role: string;
  division?: string;
  educationLevel?: string;
}

interface SendOverChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileToShare: {
    id: string;
    name: string;
    imageUrl: string | undefined;
    role: string;
    division?: string;
    educationLevel?: string;
  };

}

// Helper function to get role badge with descriptive text and improved styling
const getRoleBadge = (role: string, division?: string, educationLevel?: string) => {
  let roleText = '';
  let roleColor = '';

  if (role === 'athlete') {
    if (educationLevel === 'high_school') {
      roleText = 'HS Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (educationLevel === 'undergraduate') {
      roleText = 'College Athlete';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else if (educationLevel === 'associate') {
      roleText = 'JC Athlete';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (educationLevel === 'graduate') {
      roleText = 'Grad Athlete';
      roleColor = 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-700';
    } else {
      roleText = 'Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    }
  } else if (role === 'coach') {
    if (division === 'High School') {
      roleText = 'HS Coach';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (division === 'Club Sports') {
      roleText = 'Club Coach';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = 'JC Coach';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Coach';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Coach';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  } else if (role === 'recruiter') {
    if (division === 'High School') {
      roleText = 'HS Recruiter';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (division === 'Club Sports') {
      roleText = 'Club Recruiter';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = 'JC Recruiter';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Recruiter';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Recruiter';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  }

  return <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 border ${roleColor} whitespace-nowrap`}>{roleText}</Badge>;
};

// Process profile image URL to ensure it works with R2/CloudFlare
const getProfileImageUrl = (profileImage: string | null | undefined): string | undefined => {
  if (!profileImage || typeof profileImage !== 'string') {
    return undefined;
  }
  
  // Clean up "undefined/" from the path, which seems to be a data issue
  const cleanedProfileImage = profileImage.replace('undefined/', '');

  // If it's already a full URL, return as is
  if (cleanedProfileImage.startsWith('http')) {
    return cleanedProfileImage;
  }
  
  // Construct the full R2 URL using environment variable or fallback to known R2 domain
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
  return `${baseUrl}/${cleanedProfileImage}`;
};

export function SendOverChatDialog({
  open,
  onOpenChange,
  profileToShare
}: SendOverChatDialogProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [rawConnectionsData, setRawConnectionsData] = useState<{
    connected: Array<{
      otherUser: {
        userId: string;
        fullName: string;
        profileImage: string | undefined;
        role: string;
        division?: string;
        educationLevel?: string;
      };
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter connections based on search term
  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get auth token
      const windowWithClerk = window as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const response = await fetch('/api/connections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch connections (${response.status})`);
      }
      
      const data = await response.json();
      
      // Store raw data for reference
      setRawConnectionsData(data);
      
      // Filter out the profile being shared to prevent self-sharing
      let availableConnections = data.connected;
      
      if (profileToShare.id) {
        availableConnections = data.connected.filter((conn: {
          otherUser: {
            userId: string;
            fullName: string;
            profileImage: string | undefined;
            role: string;
            division?: string;
            educationLevel?: string;
          };
        }) => {
          const isProfileBeingShared = conn.otherUser.userId === profileToShare.id;
          if (isProfileBeingShared) {
            console.log(`Filtering out profile being shared: ${profileToShare.name} (${profileToShare.id})`);
          }
          return !isProfileBeingShared;
        });
      }
      
      console.log(`Found ${data.connected.length} total connections, ${availableConnections.length} available for sharing`);
      
      // Transform the filtered data to match our interface
      const transformedConnections: Connection[] = availableConnections.map((conn: {
        otherUser: {
          userId: string;
          fullName: string;
          profileImage: string | undefined;
          role: string;
          division?: string;
          educationLevel?: string;
        };
      }) => ({
        id: conn.otherUser.userId,
        name: conn.otherUser.fullName,
        imageUrl: conn.otherUser.profileImage,
        role: conn.otherUser.role,
        division: conn.otherUser.division,
        educationLevel: conn.otherUser.educationLevel
      }));
      
      setConnections(transformedConnections);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [profileToShare.id, profileToShare.name]);

  // Fetch connections when dialog opens
  useEffect(() => {
    if (open) {
      fetchConnections();
    } else {
      // Clear data when dialog closes
      setConnections([]);
      setRawConnectionsData(null);
      setSearchTerm('');
      setError(null);
    }
  }, [open, fetchConnections]);

  const handleSendToConnection = (connectionId: string) => {
    // Find the connection name for a more personalized message
    const connection = connections.find(conn => conn.id === connectionId);
    const connectionName = connection?.name || 'there';
    
    // Create a pre-filled message with the profile link
    const profileLink = `${window.location.origin}/profile/${profileToShare.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'user'}/${profileToShare.id}`;
    const preMessage = `Hi ${connectionName}! I wanted to share this profile with you: ${profileLink}`;
    
    // Encode the message for URL parameters
    const encodedMessage = encodeURIComponent(preMessage);
    
    // Redirect to messages page with conversation and pre-filled message
    // Use the connectionId as the conversation parameter - this will work for both existing and new conversations
    window.location.href = `/messages?conversation=${connectionId}&message=${encodedMessage}`;
    
    // Close the dialog
    onOpenChange(false);
  };

  const handleStartNewChat = (connectionId: string) => {
    // Find the connection name for a more personalized message
    const connection = connections.find(conn => conn.id === connectionId);
    const connectionName = connection?.name || 'there';
    
    // Create a pre-filled message with the profile link
    const profileLink = `${window.location.origin}/profile/${profileToShare.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'user'}/${profileToShare.id}`;
    const preMessage = `Hi ${connectionName}! I wanted to share this profile with you: ${profileLink}`;
    
    // Encode the message for URL parameters
    const encodedMessage = encodeURIComponent(preMessage);
    
    // Navigate to messages page with conversation and pre-filled message
    window.location.href = `/messages?conversation=${connectionId}&message=${encodedMessage}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <MessageCircle className="w-5 h-5 text-[#01ae79]" />
            Send Profile Over Chat
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose a connection to share {profileToShare.name}&apos;s profile with
          </DialogDescription>
        </DialogHeader>

        {/* Profile to Share Preview */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 rounded-lg border border-[#01ae79]/20 mb-4">
          <Avatar className="w-12 h-12 rounded-full object-cover ring-2 ring-[#01ae79]/20">
            <AvatarImage 
              src={getProfileImageUrl(profileToShare.imageUrl)} 
              alt={profileToShare.name} 
              className="object-cover" 
            />
            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
              {profileToShare.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{profileToShare.name}</h4>
              {getRoleBadge(profileToShare.role, profileToShare.division, profileToShare.educationLevel)}
            </div>
            <p className="text-xs text-muted-foreground">Profile to share</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 focus:border-[#01ae79]/50 focus:ring-[#01ae79]/20"
          />
        </div>

        {/* Connections List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#01ae79] border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading connections...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="text-red-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchConnections}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm ? 'No connections found matching your search' : 
                   connections.length === 0 ? 'No connections found' : 
                   'No other connections available to share this profile with'}
                </p>
                {!searchTerm && connections.length === 0 && rawConnectionsData?.connected && rawConnectionsData.connected.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    This profile is already in your connections
                  </p>
                )}
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => handleSendToConnection(connection.id)}
              >
                <Avatar className="w-12 h-12 rounded-full object-cover ring-2 ring-[#01ae79]/20 group-hover:ring-[#01ae79]/40 transition-all">
                  <AvatarImage 
                    src={getProfileImageUrl(connection.imageUrl)} 
                    alt={connection.name} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                    {connection.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{connection.name}</h4>
                    {getRoleBadge(connection.role, connection.division, connection.educationLevel)}
                  </div>
                  <p className="text-xs text-muted-foreground">Click to send profile</p>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#01ae79] hover:text-[#01ae79]/80 hover:bg-[#01ae79]/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartNewChat(connection.id);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => window.location.href = '/messages'}
              className="flex-1 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              View All Messages
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

