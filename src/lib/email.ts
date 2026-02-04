import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: 'TalkMCA <noreply@ccapsolution.com>',
      to: email,
      subject: 'Your TalkMCA Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
            <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="margin: 0 0 8px; font-size: 24px; color: #111;"><span style="font-style: italic;">Talk</span><span style="color: #52525b;">MCA</span></h1>
              <p style="margin: 0 0 24px; font-size: 10px; color: #71717a; letter-spacing: 1px; text-transform: uppercase;">Master the Art of Sales</p>
              <p style="margin: 0 0 24px; color: #666; line-height: 1.5;">
                Enter this code to verify your email address:
              </p>
              <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111;">${code}</span>
              </div>
              <p style="margin: 0; color: #999; font-size: 14px;">
                This code expires in 10 minutes. If you didn't request this, you can ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: 'Failed to send email' };
  }
}
