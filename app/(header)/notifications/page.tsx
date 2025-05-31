"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Bell, Eye, UserPlus, MessageCircle, CheckCheck, Trash2, Circle, Star, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

// Placeholder data types
interface Notification {
  id: string;
  type: 'profileView' | 'newConnection' | 'newMessage' | 'systemUpdate' | 'premiumFeature';
  text: string;
  timestamp: string;
  isRead: boolean;
  link?: string; // Optional link to navigate to
  actorName?: string; // Person who initiated the notification
  actorAvatar?: string; // Avatar of the person
}

// Placeholder data
const placeholderNotifications: Notification[] = [
  { id: 'n1', type: 'profileView', text: 'viewed your profile.', actorName: 'Coach K.', actorAvatar: 'https://placehold.co/40x40/E0E0E0/B0B0B0?text=CK', timestamp: '2 hours ago', isRead: false, link: '/profile/coach-k' },
  { id: 'n2', type: 'newConnection', text: 'accepted your connection request.', actorName: 'Jane Smith (Soccer)', actorAvatar: 'https://placehold.co/40x40/D1C4E9/7E57C2?text=JS', timestamp: '5 hours ago', isRead: false, link: '/connections' },
  { id: 'n3', type: 'newMessage', text: 'sent you a new message.', actorName: 'Alex Ray', actorAvatar: 'https://placehold.co/40x40/C8E6C9/66BB6A?text=AR', timestamp: '1 day ago', isRead: true, link: '/messaging/alex-ray' },
  { id: 'n4', type: 'systemUpdate', text: 'Terms of Service have been updated. Please review the changes.', timestamp: '3 days ago', isRead: true, link: '/terms-of-service' },
  { id: 'n5', type: 'premiumFeature', text: 'Unlock "Drafted Connections" with Premium to boost your visibility!', timestamp: '1 week ago', isRead: true, link: '/premium' },
  { id: 'n6', type: 'profileView', text: 'and 2 other programs viewed your profile.', actorName: 'UCLA Athletics', actorAvatar: 'https://placehold.co/40x40/BBDEFB/42A5F5?text=UA', timestamp: '10 hours ago', isRead: false, link: '/profile/ucla-athletics' },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'profileView': return <Eye className="h-5 w-5 text-blue-500" />;
    case 'newConnection': return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'newMessage': return <MessageCircle className="h-5 w-5 text-purple-500" />;
    case 'premiumFeature': return <Star className="h-5 w-5 text-amber-500" />;
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

type NotificationFilter = 'all' | 'unread';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(placeholderNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.actorName && n.actorName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply read/unread filter
    if (activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }
    
    return filtered;
  }, [notifications, activeFilter, searchTerm]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
        {/* Unified notifications panel */}
        <div className="h-full flex flex-col border border-border/50 rounded-xl shadow-lg bg-card overflow-hidden">
          
          {/* Integrated Header */}
          <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/2 dark:to-[#01ae79]/10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#01ae79] via-[#01ae79] to-[#01ae79] bg-clip-text text-transparent mb-2">
                  Notifications
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-[#01ae79]/10 text-[#01ae79] dark:bg-[#01ae79]/20 dark:text-[#01ae79] text-xs">
                      {unreadCount} unread
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {notifications.length} total
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01ae79] focus:border-[#01ae79] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex space-x-2">
                  {(['all', 'unread'] as NotificationFilter[]).map(filter => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(filter)}
                      className={`transition-all duration-200 capitalize ${
                        activeFilter === filter
                          ? 'bg-[#01ae79] hover:bg-[#01ae79]/90 text-white'
                          : 'border-border/50 hover:border-[#01ae79]/30 dark:hover:border-[#01ae79]/40'
                      }`}
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead} 
                    disabled={notifications.every(n => n.isRead) || filteredNotifications.filter(n=>!n.isRead).length === 0}
                    className="border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/40 dark:hover:bg-[#01ae79]/10 text-sm"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={deleteAllNotifications} 
                    disabled={notifications.length === 0}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20 text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Clear all
                  </Button>
                </div>
              </div>
              
              {searchTerm.trim() && (
                <p className="text-sm text-muted-foreground">
                  {filteredNotifications.length} results for &ldquo;{searchTerm}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Notifications Content */}
          <div className="flex-grow overflow-y-auto bg-gradient-to-b from-transparent to-[#01ae79]/5 dark:to-[#01ae79]/5">
            {filteredNotifications.length > 0 ? (
              <div className="p-4 space-y-2">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`group p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      notification.isRead 
                        ? 'bg-card/70 dark:bg-card/50 hover:bg-card border-border/40 hover:border-[#01ae79]/20 dark:hover:border-[#01ae79]/30' 
                        : 'bg-[#01ae79]/5 dark:bg-[#01ae79]/10 hover:bg-[#01ae79]/10 dark:hover:bg-[#01ae79]/20 border-[#01ae79]/30 dark:border-[#01ae79]/40'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {!notification.isRead && (
                        <Circle 
                          fill="currentColor" 
                          className="h-2 w-2 text-[#01ae79] mt-2 flex-shrink-0" 
                        />
                      )}
                      {notification.isRead && (
                        <div className="w-2 h-2 mt-2 flex-shrink-0"></div>
                      )}
                      
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.actorAvatar ? (
                          <div className="relative">
                            <Image 
                              src={notification.actorAvatar} 
                              alt={notification.actorName || 'Notification'} 
                              width={40} 
                              height={40} 
                              className="rounded-full object-cover ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30 group-hover:ring-[#01ae79]/40 dark:group-hover:ring-[#01ae79]/50 transition-colors"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center ring-2 ring-[#01ae79]/30 dark:ring-[#01ae79]/40">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">
                              {notification.actorName && (
                                <span className="font-semibold text-[#01ae79] dark:text-[#01ae79]">
                                  {notification.actorName}
                                </span>
                              )} {notification.text}
                            </p>
                            <p className={`text-xs mt-1 ${
                              notification.isRead 
                                ? 'text-muted-foreground' 
                                : 'text-[#01ae79] dark:text-[#01ae79] font-medium'
                            }`}>
                              {notification.timestamp}
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0">
                            {notification.link && (
                              <Link 
                                href={notification.link} 
                                className="inline-flex items-center text-xs text-[#01ae79] hover:text-[#01ae79]/80 dark:text-[#01ae79] dark:hover:text-[#01ae79]/80 hover:underline transition-colors font-medium" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                View →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center mb-6">
                  <Bell className="h-10 w-10 text-[#01ae79] dark:text-[#01ae79]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {activeFilter === 'unread' ? "No unread notifications" : "You're all caught up!"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm 
                    ? "No notifications match your search. Try adjusting your search terms."
                    : activeFilter === 'unread' 
                      ? "All your notifications have been read. New notifications will appear here when received."
                      : "No new notifications. We'll notify you when there's something important to share."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

