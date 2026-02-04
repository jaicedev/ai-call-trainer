import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCallsForFeed } from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log('[Feed API] GET /api/feed called');
  try {
    const session = await getSession();
    console.log('[Feed API] Session check:', { hasSession: !!session, userId: session?.userId });

    if (!session) {
      console.log('[Feed API] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    console.log('[Feed API] Query params:', { page, perPage });

    console.log('[Feed API] Calling getCallsForFeed...');
    const { calls, total } = await getCallsForFeed(page, perPage, session.userId);
    console.log('[Feed API] getCallsForFeed result:', { callCount: calls.length, total });

    return NextResponse.json({
      calls,
      total,
      page,
      per_page: perPage,
      has_more: page * perPage < total,
    });
  } catch (error) {
    console.error('[Feed API] Get feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
