// utilities/mailService.ts
import nodemailer from 'nodemailer';

// Email configuration types
export interface EmailConfig {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
}

// Email templates
export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  VERIFICATION = 'verification',
  ONBOARDING_COMPLETE = 'onboarding-complete',
}

// User data for templates
export interface UserEmailData {
  name?: string;
  email: string;
  userId?: number;
  username?: string;
  verificationToken?: string;
  resetToken?: string;
  onboardingStatus?: boolean;
}

// Initialize Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Can be changed based on your email provider
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Verifies email configuration is working
 * @returns Promise<boolean> - Whether verification was successful
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
}

/**
 * Send an email with provided configuration
 * @param config - Email configuration
 * @returns Promise<boolean> - Whether email was sent successfully
 */
export async function sendEmail(config: EmailConfig): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      ...config,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${config.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Get template for welcome email
 * @param user - User data for email personalization
 * @returns HTML template for welcome email
 */
function getWelcomeTemplate(user: UserEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .user-info {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px 0;
          cursor: pointer;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.COMPANY_LOGO_URL || 'https://yourcompany.com/logo.png'}" alt="Force Company Logo" class="logo" />
          <h2>Welcome to Force!</h2>
        </div>
        
        <p>Hello ${user.name || 'there'},</p>
        
        <p>Thank you for registering with Force. We're excited to have you join our community!</p>
        
        <div class="user-info">
          <p><strong>Your Account Details:</strong></p>
          <p>Name: ${user.name || 'N/A'}</p>
          <p>Email: ${user.email}</p>
          ${user.userId ? `<p>User ID: ${user.userId}</p>` : ''}
          ${user.username ? `<p>Username: ${user.username}</p>` : ''}
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Log In Now</a>
        
        <p>Best regards,<br>The Force Team</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Force Company. All rights reserved.</p>
          <p>This email was sent to ${user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get template for password reset email
 * @param user - User data including reset token
 * @returns HTML template for password reset email
 */
function getPasswordResetTemplate(user: UserEmailData): string {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${user.resetToken}&email=${encodeURIComponent(user.email)}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .button {
          background-color: #4285F4;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px 0;
          cursor: pointer;
          border-radius: 4px;
        }
        .warning {
          color: #856404;
          background-color: #fff3cd;
          border-color: #ffeeba;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.COMPANY_LOGO_URL || 'https://yourcompany.com/logo.png'}" alt="Force Company Logo" class="logo" />
          <h2>Password Reset Request</h2>
        </div>
        
        <p>Hello ${user.name || 'there'},</p>
        
        <p>We received a request to reset your password for your Force account. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <div class="warning">
          <p>This link will expire in 1 hour for security reasons.</p>
        </div>
        
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        
        <p>Best regards,<br>The Force Team</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Force Company. All rights reserved.</p>
          <p>This email was sent to ${user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get template for verification email
 * @param user - User data including verification token
 * @returns HTML template for verification email
 */
function getVerificationTemplate(user: UserEmailData): string {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${user.verificationToken}&email=${encodeURIComponent(user.email)}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px 0;
          cursor: pointer;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.COMPANY_LOGO_URL || 'https://yourcompany.com/logo.png'}" alt="Force Company Logo" class="logo" />
          <h2>Verify Your Email Address</h2>
        </div>
        
        <p>Hello ${user.name || 'there'},</p>
        
        <p>Thank you for creating an account with Force. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        
        <p>Best regards,<br>The Force Team</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Force Company. All rights reserved.</p>
          <p>This email was sent to ${user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get template for onboarding completion email
 * @param user - User data for email personalization
 * @returns HTML template for onboarding completion email
 */
function getOnboardingCompleteTemplate(user: UserEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f4f8fb;
          color: #222;
          margin: 0;
          padding: 0;
        }
        .container {
          background: #fff;
          max-width: 600px;
          margin: 40px auto;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1.5px 6px rgba(0,0,0,0.03);
          padding: 32px 28px 24px 28px;
        }
        .header {
          text-align: center;
          margin-bottom: 28px;
        }
        .logo {
          max-width: 120px;
          margin-bottom: 12px;
        }
        .success-box {
          background: linear-gradient(90deg, #e0ffe7 0%, #f0fff4 100%);
          border-left: 6px solid #4CAF50;
          color: #256029;
          padding: 18px 20px;
          border-radius: 8px;
          margin: 24px 0 18px 0;
          text-align: center;
        }
        .success-box h3 {
          margin: 0 0 6px 0;
          font-size: 1.25rem;
          letter-spacing: 0.5px;
        }
        .steps {
          margin: 18px 0 24px 0;
          padding: 0;
          list-style: none;
        }
        .steps li {
          margin: 0 0 10px 0;
          padding-left: 24px;
          position: relative;
          font-size: 1rem;
        }
        .steps li:before {
          content: "✓";
          color: #4CAF50;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .button {
          background: linear-gradient(90deg, #4CAF50 0%, #43a047 100%);
          border: none;
          color: #fff;
          padding: 12px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 1.08rem;
          font-weight: 500;
          margin: 18px 0 0 0;
          cursor: pointer;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(76,175,80,0.08);
          transition: background 0.2s;
        }
        .button:hover {
          background: linear-gradient(90deg, #43a047 0%, #388e3c 100%);
        }
        .ai-insights {
          background: linear-gradient(90deg, #f1f6ff 0%, #f8fbff 100%);
          border-left: 6px solid #4285F4;
          padding: 18px 20px;
          border-radius: 8px;
          margin: 24px 0;
        }
        .ai-insights h3 {
          color: #1a57cb;
          margin: 0 0 10px 0;
          font-size: 1.15rem;
        }
        .footer {
          margin-top: 36px;
          text-align: center;
          font-size: 12px;
          color: #888;
        }
        .divider {
          border: none;
          border-top: 1px solid #e0e0e0;
          margin: 28px 0 18px 0;
        }
        .quote {
          font-style: italic;
          color: #555;
          border-left: 3px solid #4285F4;
          padding-left: 12px;
          margin: 16px 0;
        }
        @media (max-width: 600px) {
          .container {
            padding: 16px 6vw 18px 6vw;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.COMPANY_LOGO_URL || 'https://yourcompany.com/logo.png'}" alt="Force Company Logo" class="logo" />
          <h2 style="margin:0;font-weight:600;color:#222;">Onboarding Complete!</h2>
        </div>
        <div class="success-box">
          <h3>🎉 Welcome, ${user.name || 'there'}!</h3>
          <p>You've successfully completed onboarding and your account is ready.</p>
        </div>
        <p style="font-size:1.07rem;line-height:1.7;margin:18px 0 0 0;">
          Here's what you can do next:
        </p>
        <ul class="steps">
          <li>Explore your personalized dashboard</li>
          <li>Update your profile and preferences</li>
          <li>Connect and collaborate with other users</li>
          <li>Access our knowledge base and resources</li>
        </ul>
        
        <div class="ai-insights">
          <h3>Force AI Journal</h3>
          <p>Our AI journal feature is designed to help you track your progress, organize your thoughts, and enhance your productivity.</p>
          <div class="quote">
            "Journaling with AI assistance provides a structured way to reflect on your work and generate new insights."
          </div>
          <p>Try using the AI journal to:</p>
          <ul>
            <li>Document your project milestones</li>
            <li>Receive AI-powered suggestions for improvement</li>
            <li>Analyze patterns in your workflow</li>
            <li>Generate comprehensive reports based on your entries</li>
          </ul>
        </div>
        
        <div style="text-align:center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
        </div>
        <hr class="divider"/>
        <p style="font-size:0.98rem;margin:0 0 10px 0;">
          Need help or have questions? Our support team is here for you at any time.
        </p>
        <p style="margin:0 0 10px 0;">Best regards,<br><b>The Force Team</b></p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Force Company. All rights reserved.</p>
          <p>This email was sent to <span style="color:#4CAF50;">${user.email}</span></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get the appropriate email template based on template type
 * @param template - Type of email template to use
 * @param user - User data for email personalization
 * @returns HTML template for the specified email type
 */
function getEmailTemplate(template: EmailTemplate, user: UserEmailData): string {
  switch (template) {
    case EmailTemplate.WELCOME:
      return getWelcomeTemplate(user);
    case EmailTemplate.PASSWORD_RESET:
      return getPasswordResetTemplate(user);
    case EmailTemplate.VERIFICATION:
      return getVerificationTemplate(user);
    case EmailTemplate.ONBOARDING_COMPLETE:
      return getOnboardingCompleteTemplate(user);
    default:
      throw new Error(`Email template ${template} not found`);
  }
}

/**
 * Send a template-based email to a user
 * @param template - Type of email template to use
 * @param user - User data for email personalization
 * @param customSubject - Optional custom subject line
 * @returns Promise<boolean> - Whether email was sent successfully
 */
export async function sendTemplatedEmail(
  template: EmailTemplate,
  user: UserEmailData,
  customSubject?: string
): Promise<boolean> {
  try {
    // Generate subject based on template if not provided
    let subject = customSubject;
    if (!subject) {
      switch (template) {
        case EmailTemplate.WELCOME:
          subject = 'Welcome to Force - Registration Successful';
          break;
        case EmailTemplate.PASSWORD_RESET:
          subject = 'Reset Your Force Account Password';
          break;
        case EmailTemplate.VERIFICATION:
          subject = 'Verify Your Force Account Email';
          break;
        case EmailTemplate.ONBOARDING_COMPLETE:
          subject = 'Onboarding Complete - Your Force Account is Ready';
          break;
        default:
          subject = 'Force Account Notification';
      }
    }

    const htmlContent = getEmailTemplate(template, user);
    
    return await sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Error sending ${template} email:`, error);
    return false;
  }
}

export default {
  sendEmail,
  sendTemplatedEmail,
  verifyEmailConfig,
  EmailTemplate,
};




// // Import the mail service
// import mailService, { EmailTemplate } from '@/utilities/mailService';

// // Send a welcome email
// await mailService.sendTemplatedEmail(
//   EmailTemplate.WELCOME,
//   {
//     name: user.name,
//     email: user.email,
//     userId: user.userId
//   }
// );

// // Send a password reset email
// await mailService.sendTemplatedEmail(
//   EmailTemplate.PASSWORD_RESET,
//   {
//     name: user.name,
//     email: user.email,
//     resetToken: resetToken
//   }
// );

// // Send a verification email
// await mailService.sendTemplatedEmail(
//   EmailTemplate.VERIFICATION,
//   {
//     name: user.name,
//     email: user.email,
//     verificationToken: verificationToken
//   }
// );

// // Send a custom email
// await mailService.sendEmail({
//   to: user.email,
//   subject: 'Custom Subject',
//   html: '<p>Custom HTML content</p>'
// });