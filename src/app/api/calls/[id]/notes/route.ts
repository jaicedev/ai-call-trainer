import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateCallNotes } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

    if (typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes must be a string' },
        { status: 400 }
      );
    }

    const call = await updateCallNotes(id, notes);

    if (!call) {
      return NextResponse.json(
        { error: 'Failed to update notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, call_notes: call.call_notes });
  } catch (error) {
    console.error('Update notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
