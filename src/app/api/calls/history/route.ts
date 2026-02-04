import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserCalls } from '@/lib/db';

export async function GET() {
  console.log('[History API] GET /api/calls/history called');
  try {
    const session = await getSession();
    console.log('[History API] Session check:', { hasSession: !!session, userId: session?.userId });

    if (!session) {
      console.log('[History API] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[History API] Calling getUserCalls...');
    const calls = await getUserCalls(session.userId);
    console.log('[History API] getUserCalls result:', { callCount: calls.length });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('[History API] Get history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
