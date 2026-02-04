import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getAllPersonas, createPersona } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.userId);

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const personas = await getAllPersonas();

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Get personas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.userId);

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      name,
      description,
      personality_prompt,
      difficulty_level,
      is_active,
    } = await request.json();

    if (!name || !description || !personality_prompt) {
      return NextResponse.json(
        { error: 'Name, description, and personality prompt are required' },
        { status: 400 }
      );
    }

    const persona = await createPersona({
      name,
      description,
      personality_prompt,
      difficulty_level: difficulty_level || 3,
      common_objections: [],
      success_criteria: {
        tone_weight: 20,
        product_knowledge_weight: 20,
        objection_handling_weight: 25,
        rapport_building_weight: 15,
        closing_technique_weight: 20,
        minimum_passing_score: 70,
      },
      is_active: is_active ?? true,
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Failed to create persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Create persona error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
