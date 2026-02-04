import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getNotificationsForUser } from '@/lib/db';

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);

    const { notifications, total } = await getNotificationsForUser(
      session.userId,
      page,
      perPage
    );

    return NextResponse.json({
      notifications,
      total,
      page,
      per_page: perPage,
      has_more: page * perPage < total,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
