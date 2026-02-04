import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCall, getPersonaById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personaId } = await request.json();

    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }

    // Verify persona exists
    const persona = await getPersonaById(personaId);

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Create call record
    const call = await createCall(session.userId, personaId);

    if (!call) {
      return NextResponse.json(
        { error: 'Failed to create call' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      callId: call.id,
      persona: {
        id: persona.id,
        name: persona.name,
        description: persona.description,
      },
    });
  } catch (error) {
    console.error('Start call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
