/**
 * Nodemailer Email Service
 * 
 * Handles sending emails for:
 * - Contact form submissions
 * - Newsletter subscriptions
 * - Welcome emails
 * - Confirmation emails
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email options interface
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create and configure the email transporter
 */
function createTransporter(): Transporter {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  };

  return nodemailer.createTransport(config);
}

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Colour Clouds Digital" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0072FF 0%, #005BCC 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #0072FF; margin-bottom: 5px; }
          .value { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #0072FF; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From:</div>
              <div class="value">${data.name} (${data.email})</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${data.subject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>This email was sent from the Colour Clouds Digital contact form.</p>
              <p>Reply directly to this email to respond to ${data.name}.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'colourclouds042@gmail.com',
    subject: `New Contact: ${data.subject}`,
    html,
  });
}

/**
 * Send confirmation email to contact form submitter
 */
export async function sendContactConfirmation(data: {
  name: string;
  email: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0072FF 0%, #005BCC 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .message { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #0072FF; color: black; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
          </div>
          <div class="content">
            <div class="message">
              <p>Hi ${data.name},</p>
              <p>Thank you for reaching out to Colour Clouds Digital. We've received your message and will get back to you as soon as possible.</p>
              <p>Our team typically responds within 24-48 hours during business days.</p>
              <p>In the meantime, feel free to explore our services and recent projects:</p>
              <center>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital'}/services" class="button">View Our Services</a>
              </center>
            </div>
            <div class="footer">
              <p><strong>Colour Clouds Digital</strong></p>
              <p>Shaping Digital Experiences, One App at a Time</p>
              <p>Email: colourclouds042@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Thank you for contacting Colour Clouds Digital',
    html,
  });
}

/**
 * Send newsletter subscription notification to admin
 */
export async function sendNewsletterNotification(data: {
  email: string;
  name?: string;
  source: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #01A750 0%, #018540 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #01A750; }
          .value { background: white; padding: 10px; border-radius: 4px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Newsletter Subscriber!</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.name ? `
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Subscribed from:</div>
              <div class="value">${data.source}</div>
            </div>
            <div class="footer">
              <p>This subscriber has been added to your newsletter list.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'colourclouds042@gmail.com',
    subject: 'New Newsletter Subscriber',
    html,
  });
}

/**
 * Send welcome email to newsletter subscriber
 */
export async function sendNewsletterWelcome(data: {
  email: string;
  name?: string;
}): Promise<boolean> {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital'}/unsubscribe?email=${encodeURIComponent(data.email)}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0072FF 0%, #005BCC 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .message { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .benefits { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .benefit-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .benefit-item:last-child { border-bottom: none; }
          .button { display: inline-block; background: #0072FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .unsubscribe-link { color: #999; text-decoration: none; }
          .unsubscribe-link:hover { color: #666; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Colour Clouds Digital! 🎉</h1>
          </div>
          <div class="content">
            <div class="message">
              <p>Hi ${data.name || 'there'},</p>
              <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>
              <p>Here's what you can expect from us:</p>
            </div>
            <div class="benefits">
              <div class="benefit-item">
                <strong>� Latest Tech Insights</strong><br>
                Stay updated with the latest in app development and digital trends
              </div>
              <div class="benefit-item">
                <strong>💡 Expert Tips & Tutorials</strong><br>
                Learn from our team's experience and best practices
              </div>
              <div class="benefit-item">
                <strong>🎨 Design Inspiration</strong><br>
                Get inspired by our latest projects and creative work
              </div>
              <div class="benefit-item">
                <strong>🚀 Exclusive Updates</strong><br>
                Be the first to know about our new services and offerings
              </div>
            </div>
            <div class="message">
              <p>Explore our website to learn more about what we do:</p>
              <center>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital'}" class="button">Visit Our Website</a>
              </center>
            </div>
            <div class="footer">
              <p><strong>Colour Clouds Digital</strong></p>
              <p>Shaping Digital Experiences, One App at a Time</p>
              <p>Email: colourclouds042@gmail.com</p>
              <p style="font-size: 12px; margin-top: 20px;">
                You're receiving this email because you subscribed to our newsletter.<br>
                Don't want these emails? <a href="${unsubscribeUrl}" class="unsubscribe-link">Unsubscribe</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: data.email,
    subject: 'Welcome to Colour Clouds Digital Newsletter! 🎉',
    html,
  });
}

/**
 * Send unsubscribe confirmation email
 */
export async function sendUnsubscribeConfirmation(data: {
  email: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #666 0%, #444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .message { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #01A750; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've Been Unsubscribed</h1>
          </div>
          <div class="content">
            <div class="message">
              <p>Hi there,</p>
              <p>We're sorry to see you go! You have been successfully unsubscribed from the Colour Clouds Digital newsletter.</p>
              <p>You will no longer receive marketing emails from us.</p>
              <p>If you change your mind, you can always resubscribe by visiting our website:</p>
              <center>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital'}" class="button">Visit Our Website</a>
              </center>
              <p>If you unsubscribed by mistake or have any questions, please don't hesitate to contact us at colourclouds042@gmail.com</p>
            </div>
            <div class="footer">
              <p><strong>Colour Clouds Digital</strong></p>
              <p>Shaping Digital Experiences, One App at a Time</p>
              <p>Email: colourclouds042@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: data.email,
    subject: 'You have been unsubscribed - Colour Clouds Digital',
    html,
  });
}
