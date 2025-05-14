"use client";

import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Search, PlusCircle, Paperclip, Smile } from 'lucide-react';
import { useState, useMemo } from 'react';
import Image from 'next/image';

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
}

// Placeholder data
const placeholderConversations: Conversation[] = [
  { id: 'c1', partnerName: 'Coach Emily White', partnerAvatarUrl: 'https://placehold.co/100x100/E0E0E0/B0B0B0?text=EW', lastMessage: "Sounds good, let's discuss next week.", timestamp: '10:30 AM', unreadCount: 2, isOnline: true },
  { id: 'c2', partnerName: 'Athlete John Davis', partnerAvatarUrl: 'https://placehold.co/100x100/D1C4E9/7E57C2?text=JD', lastMessage: 'Thanks for the opportunity!', timestamp: 'Yesterday', unreadCount: 0 },
  { id: 'c3', partnerName: 'Recruiter Lisa Brown', partnerAvatarUrl: 'https://placehold.co/100x100/C8E6C9/66BB6A?text=LB', lastMessage: 'Can you send over your transcript?', timestamp: 'Mon', unreadCount: 0, isOnline: true },
  { id: 'c4', partnerName: 'UpDrafted Support', partnerAvatarUrl: 'https://placehold.co/100x100/FFCDD2/E57373?text=US', lastMessage: 'Welcome to UpDrafted! How can we help?', timestamp: 'Last Week', unreadCount: 1 },
];

const placeholderMessages: { [conversationId: string]: Message[] } = {
  'c1': [
    { id: 'm1', sender: 'partner', text: "Hi there! Interested in your profile.", timestamp: '10:25 AM' },
    { id: 'm2', sender: 'me', text: "Hello Coach! Thanks for reaching out. What specifically caught your eye?", timestamp: '10:27 AM' },
    { id: 'm3', sender: 'partner', text: "Your highlight reel was impressive. Are you available for a quick chat next week?", timestamp: '10:28 AM' },
    { id: 'm4', sender: 'me', text: "Yes, definitely. How about Tuesday afternoon?", timestamp: '10:29 AM' },
    { id: 'm5', sender: 'partner', text: "Sounds good, let's discuss next week.", timestamp: '10:30 AM' },
  ],
  'c2': [
    { id: 'm6', sender: 'me', text: "Thank you for considering me for your program!", timestamp: 'Yesterday' },
    { id: 'm7', sender: 'partner', text: "Thanks for the opportunity!", timestamp: 'Yesterday' },
  ],
   'c3': [
    { id: 'm8', sender: 'partner', text: "Can you send over your transcript?", timestamp: 'Mon' },
  ],
   'c4': [
    { id: 'm9', sender: 'partner', text: "Welcome to UpDrafted! How can we help?", timestamp: 'Last Week' },
  ],
};

export default function MessagingPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(placeholderConversations[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = useMemo(() => {
    return placeholderConversations.filter(convo =>
      convo.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const activeConversation = useMemo(() => {
    return placeholderConversations.find(c => c.id === selectedConversationId);
  }, [selectedConversationId]);

  const activeMessages = useMemo(() => {
    return selectedConversationId ? placeholderMessages[selectedConversationId] || [] : [];
  }, [selectedConversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;
    // This is where you'd normally send the message to a backend
    const newMsg: Message = {
        id: `m${Date.now()}`,
        sender: 'me',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    placeholderMessages[selectedConversationId] = [...(placeholderMessages[selectedConversationId] || []), newMsg];
    // Update conversation's last message (simplified)
    const convoIndex = placeholderConversations.findIndex(c => c.id === selectedConversationId);
    if (convoIndex !== -1) {
        placeholderConversations[convoIndex].lastMessage = newMessage;
        placeholderConversations[convoIndex].timestamp = newMsg.timestamp;
    }
    setNewMessage('');
    // Force re-render (in a real app, state management would handle this)
    setSelectedConversationId(prev => prev ? `${prev}` : null); 
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <section className="w-full flex-grow py-8 md:py-10">
        <div className="container px-2 md:px-4 h-[calc(100vh-20rem)] md:h-[calc(100vh-22rem)]"> {/* Adjusted height */}
          <div className="flex h-full border border-border/50 rounded-lg shadow-lg bg-card overflow-hidden">
            {/* Left Panel: Conversations List */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border/50 flex flex-col">
              <div className="p-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 text-sm rounded-md border border-border/50 bg-background/70 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <PlusCircle className="h-4 w-4 mr-2"/> New Message
                </Button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {filteredConversations.map(convo => (
                  <div
                    key={convo.id}
                    onClick={() => setSelectedConversationId(convo.id)}
                    className={`p-3 flex items-center space-x-3 cursor-pointer border-b border-border/30 hover:bg-muted/50 transition-colors
                      ${selectedConversationId === convo.id ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                  >
                    <div className="relative">
                        <Image src={convo.partnerAvatarUrl} alt={convo.partnerName} width={40} height={40} className="rounded-full object-cover" />
                        {convo.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-sm font-semibold truncate ${selectedConversationId === convo.id ? 'text-primary' : 'text-foreground'}`}>{convo.partnerName}</h3>
                        <span className="text-xs text-muted-foreground">{convo.timestamp}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                        {convo.unreadCount > 0 && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">{convo.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Active Chat Window */}
            <div className="flex-1 flex flex-col bg-background/30 dark:bg-black/10">
              {activeConversation ? (
                <>
                  <div className="p-3 border-b border-border/50 flex items-center space-x-3 bg-card">
                    <Image src={activeConversation.partnerAvatarUrl} alt={activeConversation.partnerName} width={36} height={36} className="rounded-full object-cover" />
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">{activeConversation.partnerName}</h2>
                        {activeConversation.isOnline && <p className="text-xs text-green-500">Online</p>}
                    </div>
                  </div>
                  <div className="flex-grow p-4 space-y-3 overflow-y-auto">
                    {activeMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-2.5 rounded-lg shadow-sm ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-border/40 text-foreground rounded-bl-none'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-border/50 bg-card flex items-center space-x-2">
                    <Button variant="ghost" size="icon" type="button"><Smile className="h-5 w-5 text-muted-foreground"/></Button>
                    <Button variant="ghost" size="icon" type="button"><Paperclip className="h-5 w-5 text-muted-foreground"/></Button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm rounded-md border border-border/50 bg-background/70 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                    <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="h-20 w-20 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging.</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">Or, start a new one from your connections.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
