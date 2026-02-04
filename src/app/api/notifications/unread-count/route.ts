import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/lib/db';

// GET /api/notifications/unread-count - Get unread notification count
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await getUnreadNotificationCount(session.userId);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get unread notification count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
