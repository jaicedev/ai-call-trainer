import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, generateVerificationCode } from '@/lib/auth';
import { createVerificationCode, getUserByEmail } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please use a valid @ccapsolution.com email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    // Generate and store verification code
    const code = generateVerificationCode();
    const stored = await createVerificationCode(email, code);

    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    // Send email
    const emailResult = await sendVerificationEmail(email, code);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
