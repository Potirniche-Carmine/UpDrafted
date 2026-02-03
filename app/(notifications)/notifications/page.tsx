"use client";

import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, UserPlus, MessageCircle, Trash2, Circle, Check, User, Lock } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AuthWrapper } from '../../../components/auth-wrapper';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  type: 'newMessage' | 'newConnection' | 'profileView';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date | null;
  timestamp: string;
  actorName?: string;
  actorImageUrl?: string;
  actorRole?: string;
  link?: string;
  isLocked?: boolean;
}

const getNotificationIcon = (type: Notification['type'], isLocked?: boolean) => {
  if (isLocked) {
    return <Lock className="h-5 w-5 text-amber-500" />;
  }

  switch (type) {
    case 'newConnection': return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'newMessage': return <MessageCircle className="h-5 w-5 text-purple-500" />;
    case 'profileView': return <User className="h-5 w-5 text-[#01ae79]" />;
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

type NotificationFilter = 'all' | 'unread';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const isRequestInProgressRef = useRef(false);


  const { setUnreadCount } = useNotifications();
  const router = useRouter();

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply read/unread filter
    if (activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered;
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    // Prevent duplicate calls
    if (isRequestInProgressRef.current) {
      return;
    }

    isRequestInProgressRef.current = true;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        operation: 'getNotifications',
        limit: '50',
        offset: '0',
        unreadOnly: unreadOnly.toString()
      });

      const response = await fetch(`/api/notifications?${params.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setError(null);
        // Clear the banner count when visiting the notifications page
        setUnreadCount(0);
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      isRequestInProgressRef.current = false;
    }
  }, [setUnreadCount]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'markAsRead',
          notificationId: id
        })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date() } : n));
      }
    } catch {
      // Silently handle error
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'markAllAsRead'
        })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
        setUnreadCount(0);
      }
    } catch {
      // Silently handle error
    }
  }, [setUnreadCount]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'dismissAllNotifications'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Clear notifications locally after successful dismissal
          setNotifications([]);
          setUnreadCount(0);
          // Force a refetch of the notification count for other components
          window.dispatchEvent(new CustomEvent('notifications-dismissed'));
        } else {
          console.error('Failed to dismiss notifications:', data.error);
        }
      } else {
        console.error('Failed to dismiss notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Error dismissing notifications:', error);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      // Clear banner count immediately when visiting this page
      setUnreadCount(0);
      // Fetch notifications without calling createNotifications again
      fetchNotifications();
    }
  }, [fetchNotifications, setUnreadCount]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read if not already read (for all notification types)
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to the link if it exists
    if (notification.link) {
      router.push(notification.link);
    }
  }, [markAsRead, router]);

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background p-4 md:p-6">
          <div className="max-w-5xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
            <div className="h-full flex flex-col border border-border/50 rounded-xl shadow-lg bg-card overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79] mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading notifications...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper>
        <div className="bg-background p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col border border-border/50 rounded-xl shadow-lg bg-card overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => fetchNotifications()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex space-x-2">
                    {(['all', 'unread'] as NotificationFilter[]).map(filter => (
                      <Button
                        key={filter}
                        variant={activeFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter(filter)}
                        className={`transition-all duration-200 capitalize ${activeFilter === filter
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
                      disabled={notifications.every(n => n.isRead) || filteredNotifications.filter(n => !n.isRead).length === 0}
                      className="border-[#01ae79]/30 hover:bg-[#01ae79]/5 dark:border-[#01ae79]/40 dark:hover:bg-[#01ae79]/10 text-sm"
                    >
                      <Check className="h-4 w-4 mr-1" /> Mark all read
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
              </div>
            </div>

            {/* Notifications Content */}
            <div className="flex-grow overflow-y-auto bg-gradient-to-b from-transparent to-[#01ae79]/5 dark:to-[#01ae79]/5">
              {filteredNotifications.length > 0 ? (
                <div className="p-4 space-y-2">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${notification.isLocked
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700/60'
                          : notification.isRead
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
                          {!notification.isLocked && notification.actorImageUrl &&
                            notification.actorImageUrl !== 'undefined' &&
                            !notification.actorImageUrl.startsWith('undefined/') &&
                            (notification.actorImageUrl.startsWith('http://') ||
                              notification.actorImageUrl.startsWith('https://') ||
                              notification.actorImageUrl.startsWith('/')) ? (
                            <Avatar className="w-10 h-10 ring-2 ring-[#01ae79]/20 dark:ring-[#01ae79]/30 group-hover:ring-[#01ae79]/40 dark:group-hover:ring-[#01ae79]/50 transition-colors">
                              <AvatarImage
                                src={notification.actorImageUrl}
                                alt={notification.actorName || 'Notification'}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-[#01ae79]/10 dark:bg-[#01ae79]/20">
                                {getNotificationIcon(notification.type, notification.isLocked)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 transition-colors ${notification.isLocked
                                ? 'bg-amber-100 dark:bg-amber-900/20 ring-amber-200 dark:ring-amber-800/40'
                                : 'bg-[#01ae79]/10 dark:bg-[#01ae79]/20 ring-[#01ae79]/30 dark:ring-[#01ae79]/40'
                              }`}>
                              {getNotificationIcon(notification.type, notification.isLocked)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">
                            {notification.isLocked ? (
                              <span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  {notification.message}
                                </span>
                                <span className="ml-2 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-medium">
                                  VIEW INSIGHTS
                                </span>
                              </span>
                            ) : (
                              <span>
                                {notification.actorName && (
                                  <span className="font-semibold text-[#01ae79] dark:text-[#01ae79]">
                                    {notification.actorName}
                                  </span>
                                )} {notification.message}
                              </span>
                            )}
                          </p>
                          <p className={`text-xs mt-1 ${notification.isRead
                              ? 'text-muted-foreground'
                              : notification.isLocked
                                ? 'text-amber-600 dark:text-amber-400 font-medium'
                                : 'text-[#01ae79] dark:text-[#01ae79] font-medium'
                            }`}>
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center p-8">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#01ae79]/10 dark:bg-[#01ae79]/20 flex items-center justify-center">
                      <Bell className="h-8 w-8 text-[#01ae79] dark:text-[#01ae79]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {activeFilter === 'unread' ? "No unread notifications" : "You're all caught up!"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {activeFilter === 'unread'
                        ? "All your notifications have been read. New notifications will appear here when received."
                        : "No new notifications. We'll notify you when there's something important to share."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}

