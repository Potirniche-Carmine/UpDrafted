"use client";

import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Search, PlusCircle, Paperclip, Smile, Users, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import Link from 'next/link';

// Placeholder data types
interface Conversation {
  id: string;
  partnerName: string;
  partnerAvatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: string;
  isRead?: boolean;
  // For database integration later
  messageId?: number;
  senderId?: string;
}

interface SearchResult {
  type: 'conversation' | 'message';
  conversation: Conversation;
  message?: Message;
  matchText?: string;
}

// Initial placeholder data
const initialConversations: Conversation[] = [
  { id: 'c1', partnerName: 'Coach Emily White', partnerAvatarUrl: 'https://placehold.co/100x100/E0E0E0/B0B0B0?text=EW', lastMessage: "Sounds good, let's discuss next week.", timestamp: '10:30 AM', unreadCount: 2, isOnline: true },
  { id: 'c2', partnerName: 'Athlete John Davis', partnerAvatarUrl: 'https://placehold.co/100x100/D1C4E9/7E57C2?text=JD', lastMessage: 'Thanks for the opportunity!', timestamp: 'Yesterday', unreadCount: 0 },
  { id: 'c3', partnerName: 'Recruiter Lisa Brown', partnerAvatarUrl: 'https://placehold.co/100x100/C8E6C9/66BB6A?text=LB', lastMessage: 'Can you send over your transcript?', timestamp: 'Mon', unreadCount: 0, isOnline: true },
  { id: 'c4', partnerName: 'UpDrafted Support', partnerAvatarUrl: 'https://placehold.co/100x100/FFCDD2/E57373?text=US', lastMessage: 'Welcome to UpDrafted! How can we help?', timestamp: 'Last Week', unreadCount: 1 },
];

const initialMessages: { [conversationId: string]: Message[] } = {
  'c1': [
    { id: 'm1', sender: 'partner', text: "Hi there! Interested in your profile.", timestamp: '10:25 AM', isRead: true },
    { id: 'm2', sender: 'me', text: "Hello Coach! Thanks for reaching out. What specifically caught your eye?", timestamp: '10:27 AM', isRead: true },
    { id: 'm3', sender: 'partner', text: "Your highlight reel was impressive. Are you available for a quick chat next week?", timestamp: '10:28 AM', isRead: true },
    { id: 'm4', sender: 'me', text: "Yes, definitely. How about Tuesday afternoon?", timestamp: '10:29 AM', isRead: true },
    { id: 'm5', sender: 'partner', text: "Sounds good, let's discuss next week.", timestamp: '10:30 AM', isRead: false },
    { id: 'm6', sender: 'partner', text: "I'll send you the meeting details later today.", timestamp: '10:31 AM', isRead: false },
  ],
  'c2': [
    { id: 'm7', sender: 'me', text: "Thank you for considering me for your program!", timestamp: 'Yesterday', isRead: true },
    { id: 'm8', sender: 'partner', text: "Thanks for the opportunity!", timestamp: 'Yesterday', isRead: true },
  ],
   'c3': [
    { id: 'm9', sender: 'partner', text: "Can you send over your transcript?", timestamp: 'Mon', isRead: true },
  ],
   'c4': [
    { id: 'm10', sender: 'partner', text: "Welcome to UpDrafted! How can we help?", timestamp: 'Last Week', isRead: false },
  ],
};

export default function MessagingPage() {
  // Convert to proper state
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>(initialMessages);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversations[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToUnreadOrBottom = useCallback(() => {
    if (!messagesContainerRef.current || !selectedConversationId) return;

    const activeMessages = messages[selectedConversationId] || [];
    const firstUnreadIndex = activeMessages.findIndex(msg => !msg.isRead && msg.sender === 'partner');
    
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        
        if (firstUnreadIndex !== -1) {
          // Scroll to first unread message within container only
          const messageElements = container.querySelectorAll('[data-message-id]');
          const unreadElement = messageElements[firstUnreadIndex] as HTMLElement;
          if (unreadElement) {
            const relativeTop = unreadElement.offsetTop - container.offsetTop;
            const scrollPosition = relativeTop - (container.clientHeight / 2) + (unreadElement.clientHeight / 2);
            
            container.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        } else {
          // Scroll to bottom smoothly within container
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  }, [selectedConversationId, messages]);

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

  // Mark messages as read for the current user (simulate API call)
  const markMessagesAsRead = useCallback((conversationId: string) => {
    if (!conversationId) return;
    
    const conversationMessages = messages[conversationId] || [];
    const unreadPartnerMessages = conversationMessages.filter(msg => 
      msg.sender === 'partner' && !msg.isRead
    );
    
    if (unreadPartnerMessages.length === 0) return;
    
    // Update messages to mark partner messages as read
    setMessages(prevMessages => ({
      ...prevMessages,
      [conversationId]: prevMessages[conversationId]?.map(msg => 
        msg.sender === 'partner' ? { ...msg, isRead: true } : msg
      ) || []
    }));
    
    // Update conversation unread count
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    
    // API call to mark messages as read in database (commented out for now)
    /*
    const markMessagesReadAPI = async () => {
      try {
        const response = await fetch('/api/messages/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            userId: 'current-user-id' // Replace with actual current user ID
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to mark messages as read');
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };
    
    markMessagesReadAPI();
    */
  }, [messages, setMessages, setConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      scrollToUnreadOrBottom();
      // Mark messages as read when conversation is viewed
      markMessagesAsRead(selectedConversationId);
    }
  }, [selectedConversationId, scrollToUnreadOrBottom, markMessagesAsRead]);

  // Enhanced search that includes both conversations and messages
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search through conversations
    conversations.forEach(conversation => {
      if (conversation.partnerName.toLowerCase().includes(term) ||
          conversation.lastMessage.toLowerCase().includes(term)) {
        results.push({
          type: 'conversation',
          conversation,
          matchText: conversation.partnerName.toLowerCase().includes(term) ? conversation.partnerName : conversation.lastMessage
        });
      }

      // Search through messages in this conversation
      const conversationMessages = messages[conversation.id] || [];
      conversationMessages.forEach(message => {
        if (message.text.toLowerCase().includes(term)) {
          results.push({
            type: 'message',
            conversation,
            message,
            matchText: message.text
          });
        }
      });
    });

    return results;
  }, [searchTerm, conversations, messages]);

  const filteredConversations = useMemo(() => {
    if (searchTerm.trim()) return [];
    return conversations;
  }, [searchTerm, conversations]);

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

  const activeMessages = useMemo(() => {
    return selectedConversationId ? messages[selectedConversationId] || [] : [];
  }, [selectedConversationId, messages]);

  // Auto-scroll when new messages are added to the current conversation
  useEffect(() => {
    if (selectedConversationId && activeMessages.length > 0) {
      scrollToBottom();
    }
  }, [activeMessages.length, selectedConversationId, scrollToBottom]);

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;
    
    const newMsg: Message = {
        id: `m${Date.now()}`,
        sender: 'me',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true
    };
    
    // Update messages state properly to trigger re-render
    setMessages(prevMessages => ({
      ...prevMessages,
      [selectedConversationId]: [...(prevMessages[selectedConversationId] || []), newMsg]
    }));
    
    // Update conversation last message and timestamp
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === selectedConversationId 
          ? { ...conv, lastMessage: newMessage, timestamp: newMsg.timestamp }
          : conv
      )
    );
    
    setNewMessage('');
    
    // Scroll to bottom after sending message
    scrollToBottom();
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSelectedConversationId(result.conversation.id);
    setSearchTerm('');
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
        {/* Unified messaging interface */}
        <div className="h-full flex border border-border/50 rounded-xl shadow-lg bg-card overflow-hidden">
          
          {/* Sidebar - Conversations/Search Results */}
          <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-border/50 flex-col bg-gradient-to-b from-green-50/20 to-emerald-50/20 dark:from-green-950/10 dark:to-emerald-950/10`}>
            
            {/* Sidebar Header with integrated search */}
            <div className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Messages
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        {unreadCount} unread
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {conversations.length} conversations
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950/20">
                  <PlusCircle className="h-4 w-4 mr-2"/> New
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations and messages..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {searchTerm.trim() && (
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} results for &ldquo;{searchTerm}&rdquo;
                </p>
              )}
            </div>

            {/* Conversations/Search Results List */}
            <div className="flex-grow overflow-y-auto">
              {searchTerm.trim() ? (
                // Search Results
                searchResults.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.conversation.id}-${result.type}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="p-3 rounded-lg cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-950/20 transition-colors border border-transparent hover:border-green-200/50 dark:hover:border-green-800/50"
                      >
                        <div className="flex items-start space-x-3">
                          <Image 
                            src={result.conversation.partnerAvatarUrl} 
                            alt={result.conversation.partnerName} 
                            width={40} 
                            height={40} 
                            className="rounded-full object-cover ring-2 ring-green-100 dark:ring-green-900 flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {highlightSearchTerm(result.conversation.partnerName, searchTerm)}
                              </h4>
                              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.type === 'message' ? (
                                <>
                                  <span className="font-medium">
                                    {result.message?.sender === 'me' ? 'You: ' : `${result.conversation.partnerName}: `}
                                  </span>
                                  {highlightSearchTerm(result.matchText || '', searchTerm)}
                                </>
                              ) : (
                                highlightSearchTerm(result.matchText || '', searchTerm)
                              )}
                            </p>
                            {result.message && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {result.message.timestamp}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No results found</p>
                    <p className="text-sm text-muted-foreground/80 mt-1">Try different keywords</p>
                  </div>
                )
              ) : (
                // Regular Conversations
                filteredConversations.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map(convo => (
                      <div
                        key={convo.id}
                        onClick={() => setSelectedConversationId(convo.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedConversationId === convo.id
                            ? 'bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-700 shadow-sm'
                            : 'hover:bg-green-50/50 dark:hover:bg-green-950/10 border border-transparent hover:border-green-200/50 dark:hover:border-green-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <Image 
                              src={convo.partnerAvatarUrl} 
                              alt={convo.partnerName} 
                              width={48} 
                              height={48} 
                              className="rounded-full object-cover ring-2 ring-green-100 dark:ring-green-900" 
                            />
                            {convo.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card"></span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className={`text-sm font-semibold truncate ${
                                selectedConversationId === convo.id 
                                  ? 'text-green-700 dark:text-green-300' 
                                  : 'text-foreground'
                              }`}>
                                {convo.partnerName}
                              </h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{convo.timestamp}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                              {convo.unreadCount > 0 && (
                                <span className="ml-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">{convo.unreadCount}</span>
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
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground/80 mt-1">Start a new conversation</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gradient-to-b from-background to-green-50/10 dark:to-green-950/5`}>
            {activeConversation ? (
              <>
                {/* Simplified Chat Header */}
                <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversationId(null)}
                      className="md:hidden mr-2 hover:bg-green-100 dark:hover:bg-green-950/20"
                    >
                      <ArrowLeft size={18} />
                    </Button>
                    <Link href={`/profile/${activeConversation.id}`} className="relative cursor-pointer hover:opacity-80 transition-opacity">
                      <Image 
                        src={activeConversation.partnerAvatarUrl} 
                        alt={activeConversation.partnerName} 
                        width={48} 
                        height={48} 
                        className="rounded-full object-cover ring-2 ring-green-100 dark:ring-green-900" 
                      />
                      {activeConversation.isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card"></span>
                      )}
                    </Link>
                    <div>
                      <Link href={`/profile/${activeConversation.id}`} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <h2 className="text-lg font-semibold text-foreground">{activeConversation.partnerName}</h2>
                      </Link>
                      {activeConversation.isOnline ? (
                        <p className="text-sm text-green-600 dark:text-green-400">Online now</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Last seen {activeConversation.timestamp}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-grow p-4 space-y-4 overflow-y-auto bg-gradient-to-b from-transparent to-green-50/5 dark:to-green-950/5"
                >
                  {activeMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      data-message-id={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[70%] p-3 rounded-2xl shadow-sm relative ${
                        msg.sender === 'me' 
                          ? 'bg-green-600 text-white rounded-br-md' 
                          : `bg-card border text-foreground rounded-bl-md ${
                              !msg.isRead && msg.sender === 'partner' 
                                ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/20' 
                                : 'border-border/40'
                            }`
                      }`}>
                        {!msg.isRead && msg.sender === 'partner' && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full transition-opacity duration-300"></div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-xs mt-2 ${
                          msg.sender === 'me' 
                            ? 'text-green-100 text-right' 
                            : 'text-muted-foreground text-left'
                        }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="icon" type="button" className="hidden sm:flex text-muted-foreground hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-950/20">
                      <Paperclip className="h-5 w-5"/>
                    </Button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 pr-12 text-sm rounded-full border border-border/50 bg-background/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-950/20"
                      >
                        <Smile className="h-4 w-4"/>
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white h-12 w-12 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
                  <MessageSquare className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Choose a conversation from the sidebar to start messaging, or search for specific conversations and messages.
                </p>
                <Button variant="outline" className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
