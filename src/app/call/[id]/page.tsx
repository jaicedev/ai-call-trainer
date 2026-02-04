'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page now redirects to the dashboard since calls are handled in the sidebar
export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  useEffect(() => {
    // Redirect to dashboard - calls are now handled in the sidebar
    router.replace('/');
  }, [callId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="text-center text-white">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
