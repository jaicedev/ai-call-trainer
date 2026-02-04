import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCallsForFeed } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const { calls, total } = await getCallsForFeed(page, perPage, session.userId);

    return NextResponse.json({
      calls,
      total,
      page,
      per_page: perPage,
      has_more: page * perPage < total,
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
