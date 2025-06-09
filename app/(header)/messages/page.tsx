"use client";

import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Search, PlusCircle, Paperclip, Smile, Users, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
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

// Define connection interface
interface Connection {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  role: string;
  status: 'connected' | 'pending';
}

// Process profile image URL to ensure it works with R2/CloudFlare
const getProfileImageUrl = (profileImage: string | null): string => {
  if (!profileImage) {
    // Try several common placeholder locations in Next.js projects 
    return "/placeholder-avatar.png"; 
  }
  
  // If it's already a full URL, return as is
  if (profileImage.startsWith('http')) {
    return profileImage;
  }
  
  // Construct the full R2 URL using environment variable or fallback to known R2 domain
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
  return `${baseUrl}/${profileImage}`;
};

export default function MessagingPage() {
  // State for conversations and messaging
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noConnection, setNoConnection] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const { refetch: refreshUnreadCount } = useMessages();
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [connections, setConnections] = useState<Array<{id: string, name: string, imageUrl: string | null, role: string}>>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionSearchTerm, setConnectionSearchTerm] = useState("");
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    
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
      
      // Log the request details
      console.log('Fetching conversations with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'getConversations'
        })
      });
      
      console.log('Conversations API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch conversations. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to fetch conversations (${response.status}): ${errorText.substring(0, 100)}`);
      }
      
      const result = await response.json();
      console.log('Conversations fetched successfully:', result);
      
      if (result.success) {
        setConversations(result.conversations || []);
        
        // Select first conversation if none is selected yet
        if (!selectedConversationId && result.conversations?.length > 0) {
          setSelectedConversationId(result.conversations[0].id);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [selectedConversationId]);

  // Fetch messages for the selected conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    if (!conversationId) return;
    
    setLoading(true);
    setError(null);
    
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
        
        setMessages(result.messages || []);
        
        // Update conversations list to mark this conversation as read
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        
        // Refresh unread count in header
        refreshUnreadCount();
      } else {
        throw new Error(result.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);
  
  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

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
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'sendMessage',
          conversationId: selectedConversationId,
          message: newMessage
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
      
      // Clear the message input
      setNewMessage('');
      
      // Refresh the messages to show the new message
      fetchMessages(selectedConversationId);
      
      // Also refresh conversations to update the last message preview
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Find the selected conversation
  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

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
      console.log('Connections API response:', result);
      
      if (result.success) {
        // Filter to only include connected users (not pending requests)
        const connectedUsers = result.connections
          .filter((conn: Connection) => conn.status === 'connected')
          .map((conn: Connection) => ({
            id: conn.userId,
            name: conn.fullName || 'Unknown User',
            imageUrl: conn.profileImageUrl,
            role: conn.role || 'user'
          }));
        
        console.log('Filtered connected users:', connectedUsers);
        setConnections(connectedUsers);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  }, []);
  
  // Start new conversation with a user
  const startConversation = useCallback(async (userId: string) => {
    console.log('Starting conversation with user ID:', userId);
    setIsNewMessageDialogOpen(false);
    setLoading(true);
    
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
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'getConversations'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const result = await response.json();
      console.log('Conversations after selection:', result);
      
      if (result.success) {
        const conversations = result.conversations || [];
        setConversations(conversations);
        
        // Find if a conversation with this user already exists
        const existingConversation = conversations.find((c: Conversation) => c.partnerId === userId);
        console.log('Found existing conversation?', existingConversation || 'No');
        
        if (existingConversation) {
          // If it exists, select it
          setSelectedConversationId(existingConversation.id);
        } else {
          // Create a new conversation implicitly by sending a welcome message
          // For now, we'll just show conversations and let the user start a conversation manually
          console.log('No existing conversation found - user will need to send first message');
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  }, []);
  
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
        <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
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
                            <Image 
                              src={getProfileImageUrl(convo.partnerImageUrl)}
                              alt={convo.partnerName || "Profile picture"} 
                              width={48} 
                              height={48} 
                              className="rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30" 
                            />
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
                              <span className="text-xs text-muted-foreground flex-shrink-0">
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
                      <Link href={`/profile/${activeConversation.partnerId}`} className="relative cursor-pointer hover:opacity-80 transition-opacity">
                        <Image 
                          src={getProfileImageUrl(activeConversation.partnerImageUrl)}
                          alt={activeConversation.partnerName || "Profile picture"} 
                          width={48} 
                          height={48} 
                          className="rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30" 
                        />
                      </Link>
                      <div>
                        <Link href={`/profile/${activeConversation.partnerId}`} className="cursor-pointer hover:opacity-80 transition-opacity">
                          <h2 className="text-lg font-semibold text-foreground">{activeConversation.partnerName}</h2>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {activeConversation.partnerRole === 'athlete' ? 'Athlete' : 
                           activeConversation.partnerRole === 'coach' ? 'Coach' : 
                           activeConversation.partnerRole === 'recruiter' ? 'Recruiter' : 'User'}
                        </p>
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
                        {loading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#01ae79] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                          </div>
                        ) : messages.length > 0 ? (
                          messages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`flex ${msg.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
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
                                    ? 'text-[#01ae79]/20 text-right' 
                                    : 'text-muted-foreground text-left'
                                }`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground/70">No messages yet</p>
                            <p className="text-sm text-muted-foreground/50 mt-1">Start a conversation to connect!</p>
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <Button variant="ghost" size="icon" type="button" className="hidden sm:flex text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/10 dark:hover:bg-[#01ae79]/20">
                            <Paperclip className="h-5 w-5"/>
                          </Button>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="w-full px-4 py-3 pr-12 text-sm rounded-full border border-border/50 bg-background/70 focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] outline-none transition-all"
                              disabled={sendingMessage}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              type="button" 
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-[#01ae79] hover:bg-[#01ae79]/10 dark:hover:bg-[#01ae79]/20"
                            >
                              <Smile className="h-4 w-4"/>
                            </Button>
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
                      key={conn.id}
                      onClick={() => startConversation(conn.id)}
                      className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 border border-transparent hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30 flex items-center"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 mr-3">
                        <Image 
                          src={getProfileImageUrl(conn.imageUrl)}
                          alt={conn.name || "Profile picture"} 
                          fill
                          className="rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {conn.name || "Unknown User"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {conn.role === 'athlete' ? 'Athlete' : 
                           conn.role === 'coach' ? 'Coach' : 
                           conn.role === 'recruiter' ? 'Recruiter' : 'User'}
                        </p>
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
