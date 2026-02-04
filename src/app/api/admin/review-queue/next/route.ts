import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getNextCallForReview } from '@/lib/db';

// GET /api/admin/review-queue/next - Get next call to review
export async function GET() {
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

    const call = await getNextCallForReview();

    if (!call) {
      return NextResponse.json({
        call: null,
        message: 'No calls pending review'
      });
    }

    return NextResponse.json({ call });
  } catch (error) {
    console.error('Error fetching next call for review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next call' },
      { status: 500 }
    );
  }
}
