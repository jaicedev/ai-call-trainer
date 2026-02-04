import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const isValid = await verifyCode(email, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);

    return NextResponse.json({
      success: true,
      isNewUser: !user,
      // Include a temporary token for the setup-password step
      tempToken: Buffer.from(`${email}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
