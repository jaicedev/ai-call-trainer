'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, MessageCircle, Star, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?page=${page}&per_page=20`);
      const data = await res.json();

      if (page === 1) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications((prev) => [...prev, ...(data.notifications || [])]);
      }
      setHasMore(data.has_more);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Dispatch event to update the sidebar badge
      window.dispatchEvent(new Event('notifications-update'));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      // Dispatch event to update the sidebar badge
      window.dispatchEvent(new Event('notifications-update'));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const actorName = notification.actor?.name || 'Someone';
    const callName =
      notification.call?.mock_business_name ||
      notification.call?.dynamic_persona_name ||
      'your call';

    switch (notification.type) {
      case 'comment':
        return (
          <>
            <strong>{actorName}</strong> commented on{' '}
            <strong>{callName}</strong>
          </>
        );
      case 'review':
        return (
          <>
            <strong>{actorName}</strong> reviewed your call with{' '}
            <strong>{callName}</strong>
          </>
        );
      default:
        return 'You have a new notification';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading && page === 1) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {total === 0
              ? 'No notifications yet'
              : `${total} notification${total === 1 ? '' : 's'}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No notifications yet. You&apos;ll see notifications here when someone
            comments on or reviews your calls.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={`/?highlight=${notification.call_id}`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
            >
              <div
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-zinc-50',
                  !notification.read && 'bg-blue-50/50 border-blue-100'
                )}
              >
                {/* Actor Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage
                    src={notification.actor?.profile_picture_url || undefined}
                  />
                  <AvatarFallback>
                    {notification.actor?.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                      {getNotificationMessage(notification)}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Preview of notification content */}
                  {notification.content && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      &quot;{notification.content}&quot;
                    </p>
                  )}

                  {/* Type Badge */}
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        notification.type === 'review' &&
                          'bg-purple-100 text-purple-700',
                        notification.type === 'comment' &&
                          'bg-blue-100 text-blue-700'
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                      <span className="ml-1 capitalize">{notification.type}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
