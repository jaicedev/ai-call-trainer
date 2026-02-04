import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserCalls } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calls = await getUserCalls(session.userId);

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
