'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Phone,
  History,
  Settings,
  LogOut,
  Shield,
  ChevronUp,
  Trophy,
  Award,
  MessageCircle,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { XPProgressBar } from '@/components/gamification/xp-progress-bar';

interface User {
  id: string;
  email: string;
  name: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
  xp?: number;
  level?: number;
}

interface SidebarProps {
  user: User;
  onStartCall: () => void;
}

const navItems = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/notifications', label: 'Notifications', icon: Bell, showBadge: true },
  { href: '/history', label: 'Call History', icon: History },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Award },
];

export function Sidebar({ user, onStartCall }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userStats, setUserStats] = useState<{ xp: number; level: number } | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    // Fetch user stats for XP display
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user/stats');
        if (res.ok) {
          const data = await res.json();
          setUserStats({ xp: data.xp, level: data.level });
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    // Fetch unread notification count
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadNotificationCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchStats();
    fetchNotificationCount();

    // Listen for gamification updates
    const handleGamificationUpdate = () => {
      fetchStats();
    };

    // Listen for notification updates
    const handleNotificationsUpdate = () => {
      fetchNotificationCount();
    };

    window.addEventListener('gamification-update', handleGamificationUpdate);
    window.addEventListener('notifications-update', handleNotificationsUpdate);
    return () => {
      window.removeEventListener('gamification-update', handleGamificationUpdate);
      window.removeEventListener('notifications-update', handleNotificationsUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-zinc-50">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-zinc-800" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-tight">
              <span className="italic">Talk</span>
              <span className="text-zinc-600">MCA</span>
            </span>
            <span className="text-[10px] text-zinc-500 tracking-wide uppercase">Master the Art of Sales</span>
          </div>
        </Link>
      </div>

      {/* Start Call Button */}
      <div className="p-4">
        <Button onClick={onStartCall} className="w-full" size="lg">
          <Phone className="mr-2 h-4 w-4" />
          Start Call
        </Button>
      </div>

      {/* XP Progress */}
      {userStats && (
        <div className="px-4 pb-4">
          <Link href="/achievements" className="block hover:opacity-80 transition-opacity">
            <XPProgressBar
              xp={userStats.xp}
              level={userStats.level}
              compact
            />
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.showBadge && unreadNotificationCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-200 text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )}
            >
              <div className="relative">
                <item.icon className="h-4 w-4" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin Link */}
      {user.is_admin && (
        <div className="px-3 pb-2">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </div>
      )}

      {/* User Menu */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile_picture_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-sm">
                <span className="font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
