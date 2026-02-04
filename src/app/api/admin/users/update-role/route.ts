import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, updateUserRole } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const currentUser = await getUserById(session.userId);
    if (!currentUser?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'advisor') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "advisor"' },
        { status: 400 }
      );
    }

    // Prevent self-demotion
    if (userId === session.userId && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot demote yourself' },
        { status: 400 }
      );
    }

    const success = await updateUserRole(userId, role);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
