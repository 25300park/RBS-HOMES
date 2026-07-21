import { Resend } from 'resend';

const FROM_ADDRESS = 'RBS HOMES <noreply@mail.rbs-homes.com>';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
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
