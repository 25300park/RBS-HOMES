import { Resend } from 'resend';

const FROM_ADDRESS = 'RBS HOMES <noreply@mail.rbs-homes.com>';

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// 수신자 이메일을 로그용으로 마스킹한다 (예: a***@domain.com)
export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '***';
  return `${email[0]}***${email.slice(atIndex)}`;
}

interface SendEmailResult {
  success: boolean;
  skipped?: boolean;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<SendEmailResult> {
  const mode = process.env.EMAIL_MODE;

  if (mode === 'redirect') {
    const redirectTo = process.env.EMAIL_REDIRECT_TO;
    if (!redirectTo) {
      console.log(`[email:off] (redirect without EMAIL_REDIRECT_TO) to=${maskEmail(to)} subject="${subject}"`);
      return { success: true, skipped: true };
    }
    console.log(`[email:redirect] original_to=${maskEmail(to)} redirected_to=${maskEmail(redirectTo)} subject="${subject}"`);
    return sendViaResend({
      to: redirectTo,
      subject: `[To: ${to}] ${subject}`,
      html,
    });
  }

  if (mode === 'live') {
    if (process.env.VERCEL_ENV !== 'production') {
      console.log(`[email:off] (live outside production) to=${maskEmail(to)} subject="${subject}"`);
      return { success: true, skipped: true };
    }
    console.log(`[email:live] to=${maskEmail(to)} subject="${subject}"`);
    return sendViaResend({ to, subject, html });
  }

  // off, 값 없음, 알 수 없는 값
  console.log(`[email:off] to=${maskEmail(to)} subject="${subject}"`);
  return { success: true, skipped: true };
}

async function sendViaResend({ to, subject, html }: EmailOptions): Promise<SendEmailResult> {
  try {
    await getResendClient().emails.send({ from: FROM_ADDRESS, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getPasswordResetEmailTemplate(tempPassword: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">RBS HOMES</h1>
      </div>
      <p style="color: #666; margin-bottom: 20px;">
        Hello, this is RBS HOMES.<br>
        We are sending you your temporary password as requested.
      </p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-bottom: 15px;">Your Temporary Password:</h3>
        <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-family: monospace;">
          ${tempPassword}
        </div>
      </div>
      <p style="color: #666; margin: 20px 0;">
        You can log in to RBS HOMES using this temporary password.<br>
        For security purposes, we recommend changing your password after logging in.
      </p>
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
        <p>This email was sent automatically. Please do not reply to this email.</p>
        <p>If you did not request a password reset, please contact our support team.</p>
        <p>&copy; 2024 RBS HOMES. All rights reserved.</p>
      </div>
    </div>
  `;
}
