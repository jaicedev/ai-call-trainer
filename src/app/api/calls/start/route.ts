import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCall, createCallWithDynamicPersona, getPersonaById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { personaId, dynamicPersona, personaName, personaDescription, difficulty, mockBusiness } = body;

    // Handle dynamic persona (no database persona needed)
    if (dynamicPersona) {
      const call = await createCallWithDynamicPersona(
        session.userId,
        personaName || 'Dynamic Prospect',
        personaDescription || 'Dynamically generated prospect',
        difficulty || 3,
        mockBusiness // Pass mock business details
      );

      if (!call) {
        return NextResponse.json(
          { error: 'Failed to create call' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        callId: call.id,
        dynamic: true,
        persona: {
          name: personaName,
          description: personaDescription,
        },
        mockBusiness: mockBusiness || null,
      });
    }

    // Legacy: Handle database persona selection
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
