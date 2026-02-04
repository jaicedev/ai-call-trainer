import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, tempToken } = await request.json();

    if (!email || !password || !tempToken) {
      return NextResponse.json(
        { error: 'Email, password, and verification are required' },
        { status: 400 }
      );
    }

    // Validate temp token (simple check - in production, use proper token validation)
    try {
      const decoded = Buffer.from(tempToken, 'base64').toString('utf-8');
      const [tokenEmail, timestamp] = decoded.split(':');

      if (tokenEmail !== email) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      // Token valid for 10 minutes
      if (Date.now() - parseInt(timestamp) > 10 * 60 * 1000) {
        return NextResponse.json({ error: 'Token expired' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Account already exists. Please login instead.' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create session
    await createSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Setup password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
