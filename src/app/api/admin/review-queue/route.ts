import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getUnreviewedCalls, getReviewQueueStats } from '@/lib/db';

// GET /api/admin/review-queue - Get unreviewed calls queue
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const user = await getUserById(session.userId);
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const [{ calls, total }, stats] = await Promise.all([
      getUnreviewedCalls(page, perPage),
      getReviewQueueStats(),
    ]);

    return NextResponse.json({
      calls,
      total,
      page,
      per_page: perPage,
      has_more: page * perPage < total,
      stats,
    });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}
