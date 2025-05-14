"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Bell, Eye, UserPlus, MessageCircle, CheckCheck, Trash2, Circle, Star } from 'lucide-react';
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
    case 'premiumFeature': return <Star className="h-5 w-5 text-amber-500" />; // Assuming Star is imported
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

type NotificationFilter = 'all' | 'unread';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(placeholderNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

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
    <div className="flex flex-col items-center min-h-screen">
      <section className="w-full py-8 md:py-12 flex-grow">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <div className="flex space-x-2">
                {(['all', 'unread'] as NotificationFilter[]).map(filter => (
                     <Button
                        key={filter}
                        variant={activeFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter(filter)}
                        className="capitalize"
                    >
                        {filter}
                    </Button>
                ))}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={notifications.every(n => n.isRead) || filteredNotifications.filter(n=>!n.isRead).length === 0}>
                <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteAllNotifications} disabled={notifications.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear all
              </Button>
            </div>
          </div>

          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`p-4 rounded-lg border border-border/50 flex items-start space-x-3 transition-colors duration-200 cursor-pointer
                    ${notification.isRead ? 'bg-card/70 dark:bg-card/50 hover:bg-card' : 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/15 border-primary/30'}
                  `}
                >
                  {!notification.isRead && <Circle fill="currentColor" className="h-2.5 w-2.5 text-primary mt-1.5 flex-shrink-0" />}
                  {notification.isRead && <div className="w-2.5 h-2.5 mt-1.5 flex-shrink-0"></div>}
                  
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.actorAvatar ? (
                        <Image src={notification.actorAvatar} alt={notification.actorName || 'Notification icon'} width={32} height={32} className="rounded-full object-cover"/>
                    ) : (
                        getNotificationIcon(notification.type)
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {notification.actorName && <span className="font-semibold">{notification.actorName}</span>} {notification.text}
                    </p>
                    <p className={`text-xs ${notification.isRead ? 'text-muted-foreground/80' : 'text-primary/90'}`}>{notification.timestamp}</p>
                    {notification.link && (
                      <Link href={notification.link} className="text-xs text-primary hover:underline mt-1 inline-block" onClick={(e) => e.stopPropagation()}>
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {activeFilter === 'unread' ? "No unread notifications." : "You're all caught up! No new notifications."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

