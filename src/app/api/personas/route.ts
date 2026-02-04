import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getActivePersonas } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personas = await getActivePersonas();

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Get personas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
