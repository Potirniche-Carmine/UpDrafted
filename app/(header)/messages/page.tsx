"use client";

import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Search, PlusCircle, Users, ArrowLeft, Lock} from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { AuthWrapper } from '../../../components/auth-wrapper';
import { useMessages } from '@/hooks/use-messages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define real API types
interface Conversation {
  id: number;
  partnerId: string;
  partnerName: string;
  partnerImageUrl: string | null;
  partnerRole: string;
  lastMessagePreview: string;
  lastMessageTime: string | null;
  unreadCount: number;
  connectionActive: boolean;
  createdAt: string;
  division?: string;
  educationLevel?: string;
}

interface Message {
  id: number;
  senderId: string;
  content: string;
  isFromCurrentUser: boolean;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  messageType: string;
}

interface ClerkSession {
  getToken: () => Promise<string>;
}

interface WindowWithClerk extends Window {
  Clerk?: {
    session?: ClerkSession;
  };
}

// Define connection interface
interface ApiConnection {
  otherUser: {
    userId: string;
    fullName: string;
    profileImage: string | null;
    role: string;
    division?: string;
    educationLevel?: string;
  };
}

// Process profile image URL to ensure it works with R2/CloudFlare
const getProfileImageUrl = (profileImage: string | null): string | null => {
  if (!profileImage || typeof profileImage !== 'string') {
    return null;
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

export default function MessagingPage() {
  // State for conversations and messaging
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesCache, setMessagesCache] = useState<{[key: number]: Message[]}>({});
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noConnection, setNoConnection] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const { setUnreadCount } = useMessages();
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [connections, setConnections] = useState<Array<{id: string, name: string, imageUrl: string | null, role: string, division?: string, educationLevel?: string}>>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionSearchTerm, setConnectionSearchTerm] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get messages for the current conversation from cache or set empty if not cached
  const messages = useMemo(() => {
    if (!selectedConversationId || !messagesCache[selectedConversationId]) {
      return [];
    }
    
    // Get messages and sort them by createdAt timestamp to ensure consistent ordering
    // This ensures oldest messages are at the top and newest at the bottom
    const sortedMessages = [...messagesCache[selectedConversationId]].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return sortedMessages;
  }, [selectedConversationId, messagesCache]);

  // Find the selected conversation
  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

  // Get/store selected conversation from localStorage to persist across refreshes
  useEffect(() => {
    // Try to restore selectedConversationId from localStorage on initial load
    if (!selectedConversationId && !initialLoadComplete) {
      const savedId = localStorage.getItem('selectedConversationId');
      if (savedId) {
        setSelectedConversationId(Number(savedId));
      }
    }
    
    // Save selectedConversationId to localStorage whenever it changes
    if (selectedConversationId) {
      localStorage.setItem('selectedConversationId', selectedConversationId.toString());
    }
  }, [selectedConversationId, initialLoadComplete]);

  // Use ref to track if component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch conversations - only on component mount
  const fetchConversations = useCallback(async () => {
    if (loading && initialLoadComplete) return; // Prevent multiple calls but always run on initial load
    
    setLoading(true);
    
    try {
      // Get auth token
      const windowWithClerk = window as WindowWithClerk;
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      if (!token) {
        console.error('No auth token available for fetchConversations');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'getConversations',
          includeFirstConversationMessages: false,
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch conversations (${response.status}): ${errorText.substring(0, 100)}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const conversationsData = result.conversations || [];
        setConversations(conversationsData);
        
        // Only auto-select first conversation if none is selected
        if (conversationsData.length > 0 && !selectedConversationId) {
          setSelectedConversationId(conversationsData[0].id);
        } else if (selectedConversationId) {
          // Verify the selected conversation still exists
          const exists = conversationsData.some((conv: Conversation) => conv.id === selectedConversationId);
          if (!exists && conversationsData.length > 0) {
            // If previously selected conversation is gone, select the first available one
            setSelectedConversationId(conversationsData[0].id);
          }
        }
        
        // Mark initial load as complete
        setInitialLoadComplete(true);
      } else {
        throw new Error(result.error || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch conversations');
      setConversations([]);
      setInitialLoadComplete(true); // Still mark as complete to prevent infinite loading
    } finally {
      setLoading(false);
    }
  }, [initialLoadComplete, loading, selectedConversationId]);

  // Use a stable reference for fetchConversations to prevent infinite re-renders
  const stableFetchConversations = useRef(fetchConversations);
  
  // Update the stable reference when needed (but only runs once due to empty deps)
  useEffect(() => {
    stableFetchConversations.current = fetchConversations;
  }, [fetchConversations]);

  // Fetch conversations only on component mount - using a more reliable approach
  useEffect(() => {
    // Only run this effect once on mount
    const timeoutId = setTimeout(() => {
      stableFetchConversations.current();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  // Empty dependency array ensures this only runs once on mount
  }, []);

  // Fetch messages for the selected conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    if (!conversationId || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'getMessages',
          conversationId,
          limit: 50,
          offset: 0
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Check if connection is active
        if (result.conversation?.connectionActive === false) {
          setNoConnection(true);
          setOtherUserId(result.otherUserId || null);
        } else {
          setNoConnection(false);
          setOtherUserId(null);
        }
        
        // Update cache with fetched messages
        setMessagesCache(prevCache => ({
          ...prevCache,
          [conversationId]: result.messages || []
        }));
        
        // Update conversations list to mark this conversation as read
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          );
          
          return updatedConversations;
        });
        
        // Don't update unread count here - we'll do it in a useEffect
      } else {
        throw new Error(result.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loading]);

  // Calculate and update total unread count when conversations change
  useEffect(() => {
    // Skip during initial render or when conversations is empty
    if (!initialLoadComplete || conversations.length === 0) return;
    
    // Calculate total unread count from all conversations
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    
    // Update global unread count
    setUnreadCount(totalUnread);
  }, [conversations, setUnreadCount, initialLoadComplete]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversationId && initialLoadComplete) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages, initialLoadComplete]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || sendingMessage) return;
    
    setSendingMessage(true);
    const messageContent = newMessage.trim();
    
    try {
      // Clear the message input immediately for better UX
      setNewMessage('');
      
      // Create temporary message for immediate display
      const tempMsg: Message = {
        id: Date.now(), // Temporary ID, will be updated on refresh
        senderId: 'currentUser', // Temporary, will be updated
        content: messageContent,
        isFromCurrentUser: true,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        messageType: 'text'
      };
      
      // Update messages cache immediately
      setMessagesCache(prevCache => ({
        ...prevCache,
        [selectedConversationId]: [...(prevCache[selectedConversationId] || []), tempMsg]
      }));
      
      // Update conversation preview on the left side immediately
      setConversations(prevConversations => {
        return prevConversations.map(conv => 
          conv.id === selectedConversationId 
            ? { 
                ...conv, 
                lastMessagePreview: messageContent,
                lastMessageTime: new Date().toISOString()
              }
            : conv
        );
      });
      
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'sendMessage',
          conversationId: selectedConversationId,
          message: messageContent
        })
      });
      
      if (!response.ok) {
        const result = await response.json();
        if (result.connectionStatus === 'inactive') {
          setNoConnection(true);
          setOtherUserId(result.otherUserId || null);
          throw new Error('Cannot send message: No longer connected with this user');
        }
        throw new Error('Failed to send message');
      }
      
      // No need to refresh conversations here as we've already updated the UI
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      
      // Revert the optimistic UI updates on error
      setMessagesCache(prevCache => {
        const messages = prevCache[selectedConversationId] || [];
        return {
          ...prevCache,
          [selectedConversationId]: messages.slice(0, -1) // Remove the last message
        };
      });
      
      // Revert conversation preview update
      fetchConversations();
    } finally {
      setSendingMessage(false);
    }
  };

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (searchTerm.trim()) {
      return conversations.filter(conv => 
        conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (conv.lastMessagePreview && conv.lastMessagePreview.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return conversations;
  }, [searchTerm, conversations]);

  // Function to initiate a connection request
  const handleConnectionRequest = () => {
    if (!otherUserId) return;
    
    // Redirect to the connections page with the user ID to pre-fill the form
    window.location.href = `/connections/add?userId=${otherUserId}`;
  };

  // Fetch user connections for the new message dialog
  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    
    try {
      // Check if connections were recently cached (within 5 minutes)
      const cachedConnections = sessionStorage.getItem('connections_cache');
      const cacheTimestamp = sessionStorage.getItem('connections_cache_time');
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
      
      if (cachedConnections && cacheAge < 300000) {
        setConnections(JSON.parse(cachedConnections));
        setLoadingConnections(false);
        return;
      }
      
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
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Filter to only include connected users (not pending requests)
        const connectedUsers = result.connections.map((conn: ApiConnection) => ({
          id: conn.otherUser.userId,
          name: conn.otherUser.fullName || 'Unknown User',
          imageUrl: conn.otherUser.profileImage,
          role: conn.otherUser.role || 'user',
          division: conn.otherUser.division,
          educationLevel: conn.otherUser.educationLevel,
        }));
        
        // Get list of partner IDs from existing conversations
        const existingPartnerIds = conversations.map(convo => convo.partnerId);
        
        // Filter out connections that already have conversations
        const filteredUsers = connectedUsers.filter(
          (conn: {id: string}) => !existingPartnerIds.includes(conn.id)
        );
        
        // Cache the filtered connections
        sessionStorage.setItem('connections_cache', JSON.stringify(filteredUsers));
        sessionStorage.setItem('connections_cache_time', Date.now().toString());
        
        setConnections(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  }, [conversations]);
  
  // Start new conversation with a user
  const startConversation = useCallback(async (userId: string) => {
    console.log('Starting conversation with user ID:', userId);
    setIsNewMessageDialogOpen(false);
    setLoading(true);
    
    try {
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'getOrCreateConversation',
          partnerId: userId
        })
      });

      const result = await response.json();

      if (result.success) {
        const newConversationId = result.conversationId;
        // Refetch conversations to update the list, which will happen automatically
        // when we switch to the new conversation due to useEffect dependencies.
        await fetchConversations();
        // Select the new conversation
        setSelectedConversationId(newConversationId);
      } else {
        throw new Error(result.error || 'Failed to start conversation');
      }

    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  }, [fetchConversations]);
  
  // Filter connections based on search
  const filteredConnections = useMemo(() => {
    if (!connectionSearchTerm) return connections;
    return connections.filter(conn => 
      conn.name.toLowerCase().includes(connectionSearchTerm.toLowerCase())
    );
  }, [connections, connectionSearchTerm]);
  
  // Open dialog and fetch connections
  const handleNewMessageClick = useCallback(() => {
    setIsNewMessageDialogOpen(true);
    fetchConnections();
  }, [fetchConnections]);

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto h-[85vh]">
          {/* Unified messaging interface */}
          <div className="h-full flex border border-border/50 rounded-xl shadow-lg bg-card overflow-hidden">
            
            {/* Sidebar - Conversations */}
            <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-border/50 flex-col bg-gradient-to-b from-[#01ae79]/20 to-[#01ae79]/20 dark:from-[#01ae79]/10 dark:to-[#01ae79]/10`}>
              
              {/* Sidebar Header with search */}
              <div className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#01ae79] via-[#01ae79] to-[#01ae79] bg-clip-text text-transparent">
                      Messages
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0) > 0 && (
                        <Badge variant="secondary" className="bg-[#01ae79]/10 text-[#01ae79] dark:bg-[#01ae79]/20 dark:text-[#01ae79] text-xs">
                          {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {conversations.length} conversations
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#01ae79]/30 hover:border-[#01ae79]/50 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/40 dark:hover:border-[#01ae79]/60 dark:hover:bg-[#01ae79]/10"
                    onClick={handleNewMessageClick}
                  >
                    <PlusCircle className="h-4 w-4 mr-2"/> New
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-grow overflow-y-auto">
                {loading && !conversations.length ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#01ae79] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-4 text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map(convo => (
                      <div
                        key={convo.id}
                        onClick={() => setSelectedConversationId(convo.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedConversationId === convo.id
                            ? 'bg-[#01ae79]/10 dark:bg-[#01ae79]/20 border border-[#01ae79]/30 dark:border-[#01ae79]/40 shadow-sm'
                            : 'hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 border border-transparent hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-12 h-12 rounded-full ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30">
                              <AvatarImage src={getProfileImageUrl(convo.partnerImageUrl) || undefined} alt={convo.partnerName || "Profile picture"} className="object-cover" />
                              <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                                {convo.partnerName ? convo.partnerName.split(' ').map(n => n[0]).join('').toUpperCase() : "U"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className={`text-sm font-semibold truncate ${
                                selectedConversationId === convo.id 
                                  ? 'text-[#01ae79] dark:text-[#01ae79]' 
                                  : 'text-foreground'
                              }`}>
                                {convo.partnerName}
                              </h3>
                              <span className="text-xs text-muted-foreground dark:text-muted-foreground flex-shrink-0">
                                {convo.lastMessageTime 
                                  ? new Date(convo.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : ''}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-muted-foreground truncate">
                                {convo.lastMessagePreview || 'No messages yet'}
                              </p>
                              {convo.unreadCount > 0 && (
                                <span className="ml-2 bg-[#01ae79] text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">{convo.unreadCount}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No matching conversations' : 'No conversations yet'}
                    </p>
                    <p className="text-sm text-muted-foreground/80 mt-1">
                      {searchTerm ? 'Try different keywords' : 'Connect with others to start messaging'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gradient-to-b from-background to-[#01ae79]/10 dark:to-[#01ae79]/5`}>
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversationId(null)}
                        className="md:hidden mr-2 hover:bg-[#01ae79]/10 dark:hover:bg-[#01ae79]/20"
                      >
                        <ArrowLeft size={18} />
                      </Button>
                      <Link href={`/profile/${activeConversation?.partnerId}`} className="relative cursor-pointer hover:opacity-80 transition-opacity">
                        <Avatar className="w-12 h-12 rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30">
                          <AvatarImage src={getProfileImageUrl(activeConversation?.partnerImageUrl || null) || undefined} alt={activeConversation?.partnerName || "Profile picture"} className="object-cover" />
                          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                            {activeConversation?.partnerName ? activeConversation.partnerName.split(' ').map(n => n[0]).join('').toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Link href={`/profile/${activeConversation?.partnerId}`} className="cursor-pointer hover:opacity-80 transition-opacity">
                            <h2 className="text-lg font-semibold text-foreground">{activeConversation?.partnerName}</h2>
                          </Link>
                          <div className="ml-2 cursor-help flex items-center" title="Messages are encrypted. UpDrafted may access them only to monitor for safety violations such as harassment, hate speech, or spam.">
                            <Lock size={14} className="text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap pt-1.5">
                            {activeConversation && getRoleBadge(activeConversation.partnerRole, activeConversation.division, activeConversation.educationLevel)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  {noConnection ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                      <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                        <Users className="h-12 w-12 text-amber-500 dark:text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">Connection required</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        You are no longer connected with this user. To continue messaging, you need to re-establish the connection.
                      </p>
                      <Button variant="default" className="bg-[#01ae79] hover:bg-[#01ae79]/90" onClick={handleConnectionRequest}>
                        <Users className="h-4 w-4 mr-2" />
                        Send Connection Request
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div 
                        ref={messagesContainerRef}
                        className="flex-grow p-4 space-y-4 overflow-y-auto bg-gradient-to-b from-transparent to-[#01ae79]/5 dark:to-[#01ae79]/5"
                      >
                        {loading && !initialLoadComplete ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#01ae79] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                          </div>
                        ) : loading && messages.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#01ae79] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                          </div>
                        ) : messages.length > 0 ? (
                          <div className="flex flex-col justify-end min-h-full">
                            <div>
                              {messages.map((msg) => (
                                <div 
                                  key={msg.id}
                                  className={`flex ${msg.isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                                >
                                  <div className={`max-w-[75%] md:max-w-[70%] p-3 rounded-2xl shadow-sm relative ${
                                    msg.isFromCurrentUser 
                                      ? 'bg-[#01ae79] text-white rounded-br-md' 
                                      : `bg-card border text-foreground rounded-bl-md ${
                                          !msg.isRead
                                            ? 'border-[#01ae79]/30 dark:border-[#01ae79]/40 bg-[#01ae79]/5 dark:bg-[#01ae79]/10' 
                                            : 'border-border/40'
                                        }`
                                  }`}>
                                    {!msg.isRead && !msg.isFromCurrentUser && (
                                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#01ae79] rounded-full transition-opacity duration-300"></div>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-xs mt-2 ${
                                      msg.isFromCurrentUser 
                                        ? 'text-white/80 text-right' 
                                        : 'text-muted-foreground text-left'
                                    }`}>
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 text-center">
                              <p className="text-xs text-muted-foreground/60 px-4 py-1 bg-background/40 rounded-full inline-block border border-border/30">
                                🔒 Messages are encrypted. UpDrafted may access them only for safety monitoring.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground/70">No messages yet</p>
                            <p className="text-sm text-muted-foreground/50 mt-1">Start a conversation to connect!</p>
                            <p className="text-xs text-muted-foreground/60 mt-4 px-4 py-1 bg-background/40 rounded-full inline-block border border-border/30">
                              🔒 Messages are encrypted. UpDrafted may access them only for safety monitoring.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          {/* TODO Add file upload}
                          <Button variant="ghost" size="icon" type="button" className="hidden sm:flex text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/10 dark:hover:bg-[#01ae79]/20">
                            <Paperclip className="h-5 w-5"/>
                          </Button>
                          */}
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="w-full px-4 py-3 pr-12 text-sm rounded-full border border-border/50 bg-background/70 focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] outline-none transition-all"
                              disabled={sendingMessage}
                            />
                          </div>
                          <Button 
                            type="submit" 
                            size="icon" 
                            disabled={!newMessage.trim() || sendingMessage}
                            className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white h-12 w-12 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingMessage ? (
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                        {error && (
                          <p className="mt-2 text-xs text-red-500">Error: {error}</p>
                        )}
                      </form>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center mb-6">
                    <MessageSquare className="h-12 w-12 text-[#01ae79] dark:text-[#01ae79]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">Welcome to Messages</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {conversations.length > 0 
                      ? 'Choose a conversation from the sidebar to start messaging.' 
                      : 'Connect with athletes, coaches and recruiters to start messaging.'}
                  </p>
                  {conversations.length === 0 && (
                    <Link href="/connections">
                      <Button variant="outline" className="border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/40 dark:hover:bg-[#01ae79]/10">
                        <Users className="h-4 w-4 mr-2" />
                        View Connections
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* New Message Dialog */}
        <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Select a connection to start a conversation with.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] transition-all"
                  value={connectionSearchTerm}
                  onChange={(e) => setConnectionSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {loadingConnections ? (
                  <div key="loading-connections" className="p-8 text-center">
                    <Spinner size="md" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading connections...</p>
                  </div>
                ) : filteredConnections.length > 0 ? (
                  filteredConnections.map(conn => (
                    <div
                      key={`connection-${conn.id}`}
                      onClick={() => startConversation(conn.id)}
                      className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 border border-transparent hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 flex items-center"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 mr-3">
                        <Avatar className="w-10 h-10 rounded-full ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30">
                          <AvatarImage src={getProfileImageUrl(conn.imageUrl) || undefined} alt={conn.name || "Profile picture"} className="object-cover" />
                          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                            {conn.name ? conn.name.split(' ').map(n => n[0]).join('').toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {conn.name || "Unknown User"}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap pt-1.5">
                          {getRoleBadge(conn.role, conn.division, conn.educationLevel)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Users size={40} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {connectionSearchTerm ? 'No matching connections' : 'No connections found'}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      {connectionSearchTerm ? 'Try different keywords' : 'Connect with others to start messaging'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthWrapper>
  );
}
