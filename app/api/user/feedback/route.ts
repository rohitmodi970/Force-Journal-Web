// File: /app/api/user/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utilities/auth'; // Adjust import based on your auth setup
import connectDB from '@/db/connectDB';
import User from '@/models/User';
import Feedback from '@/models/FeedbackForm';
import nodemailer from 'nodemailer';


// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS, 
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to submit feedback' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { name, email, subject, message } = await req.json();
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the user in the database
    const user = await User.findOne({ email: session.user?.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get IP address from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Create feedback entry
    const feedback = new Feedback({
      userId: user.userId,
      name,
      email,
      subject,
      message,
      status: 'pending',
      userAgent,
      ipAddress
    });
    
    // Save feedback to database
    await feedback.save();
    
    // Send confirmation email to the user
    await sendConfirmationEmail(email, name, subject, feedback._id.toString());
    
    // Return success response
    return NextResponse.json(
      { success: true, message: 'Feedback submitted successfully', feedbackId: feedback._id },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * Send a confirmation email to the user with improved design and emojis
 */
async function sendConfirmationEmail(
  email: string,
  name: string,
  subject: string,
  feedbackId: string
) {
  // Current date formatted nicely
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Force" <rohitkumar970ss@gmail.com>`,
    to: email,
    subject: `✨ Thank you for your feedback - ${subject}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f9f9f9;
        }
        .container {
          padding: 25px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          background-color: #ffffff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        .header {
          background: linear-gradient(135deg, #4a6cf7 0%, #2a4cd7 100%);
          color: white;
          padding: 25px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 25px;
          text-align: center;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 15px;
        }
        .footer {
          margin-top: 35px;
          font-size: 12px;
          color: #777;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .highlight {
          background-color: #f0f4ff;
          padding: 20px;
          border-left: 4px solid #4a6cf7;
          margin: 25px 0;
          border-radius: 0 8px 8px 0;
        }
        .button {
          background: linear-gradient(135deg, #4a6cf7 0%, #2a4cd7 100%);
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          margin-top: 20px;
          font-weight: bold;
          text-align: center;
          box-shadow: 0 3px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .step {
          margin: 15px 0;
          padding: 15px;
          background-color: #f8f9ff;
          border-radius: 8px;
        }
        h2, h3 {
          color: #4a6cf7;
        }
        .emoji {
          font-size: 20px;
          margin-right: 8px;
          vertical-align: middle;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          margin: 0 10px;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://cdn.example.com/force-logo.png" alt="Force Logo" class="logo">
          <h2>Thank You for Your Feedback! 🙌</h2>
        </div>
        
        <p>Hello ${name},</p>
        
        <p>We've received your feedback regarding <strong>"${subject}"</strong> on ${currentDate}. Your insights are incredibly valuable to us as we continuously strive to improve our platform. 💯</p>
        
        <div class="highlight">
          <p><span class="emoji">🔖</span> Your feedback has been assigned ID: <strong>${feedbackId}</strong></p>
          <p><span class="emoji">⏱️</span> Our team is reviewing your submission and will address it promptly. If a response is needed, we'll reach out to you within 2-3 business days.</p>
        </div>
        
        <h3><span class="emoji">🚀</span> What happens next:</h3>
        <div class="step">
          <p><strong>1. Review</strong> - Our product team carefully analyzes your feedback</p>
        </div>
        <div class="step">
          <p><strong>2. Prioritize</strong> - We categorize and prioritize based on impact and feasibility</p>
        </div>
        <div class="step">
          <p><strong>3. Action</strong> - We implement improvements or reach out for more information if needed</p>
        </div>
        
        <p><span class="emoji">💡</span> Your insights help shape the future of Force. We're committed to creating the best possible experience for our users, and your input is an essential part of that process.</p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard" class="button">Return to Dashboard 📊</a>
        </div>
        
        <p>If you have any additional comments or questions, feel free to reply directly to this email.</p>
        
        <p>Best regards,<br>The Force Team ⚡</p>
        
        <div class="social-links">
          <a href="https://twitter.com/ForceHQ">Twitter</a> |
          <a href="https://linkedin.com/company/force">LinkedIn</a> |
          <a href="https://instagram.com/force_platform">Instagram</a>
        </div>
        
        <div class="footer">
          <p><span class="emoji">📧</span> This is an automated message from Force.</p>
          <p>&copy; ${new Date().getFullYear()} Force. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    // We don't throw here to avoid failing the request if only the email fails
  }
}