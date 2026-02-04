'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { StartCallModal } from '@/components/call/start-call-modal';

interface User {
  id: string;
  email: string;
  name: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStartCall, setShowStartCall] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.user) {
          router.push('/login');
          return;
        }

        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={user} onStartCall={() => setShowStartCall(true)} />
      <main className="flex-1 overflow-auto bg-white">
        {children}
      </main>
      <StartCallModal
        open={showStartCall}
        onOpenChange={setShowStartCall}
        userId={user.id}
      />
    </div>
  );
}
