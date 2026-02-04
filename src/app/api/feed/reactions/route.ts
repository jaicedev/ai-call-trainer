import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { toggleReaction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, reactionType } = await request.json();

    if (!callId || !reactionType) {
      return NextResponse.json(
        { error: 'Call ID and reaction type are required' },
        { status: 400 }
      );
    }

    if (!['fire', 'clap', 'lightbulb', 'star'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    const result = await toggleReaction(callId, session.userId, reactionType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Toggle reaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
