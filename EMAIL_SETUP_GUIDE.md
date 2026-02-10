# Email Integration Setup Guide

## Overview

Nodemailer has been successfully integrated into the Colour Clouds Digital portfolio to send automated emails for:

1. **Contact Form Submissions**
   - Admin notification when someone submits the contact form
   - Confirmation email to the person who submitted the form

2. **Newsletter Subscriptions**
   - Admin notification when someone subscribes to the newsletter
   - Welcome email to the new subscriber

## Features

✅ Professional HTML email templates with brand colors
✅ Non-blocking email sending (won't fail form submissions if emails fail)
✅ Automatic fallback to plain text for email clients that don't support HTML
✅ Comprehensive error logging
✅ Gmail-ready configuration (works with App Passwords)

## Setup Instructions

### 1. Configure SMTP Settings

Copy `.env.example` to `.env.local` and update the email configuration:

```bash
cp .env.example .env.local
```

### 2. Gmail Setup (Recommended)

If using Gmail, you need to create an App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "Signing in to Google," select **2-Step Verification** (enable it if not already)
4. At the bottom, select **App passwords**
5. Select **Mail** and **Windows Computer** (or Other)
6. Click **Generate**
7. Copy the 16-character password

Update your `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=colourclouds042@gmail.com
```

### 3. Other Email Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASSWORD=your-mailgun-smtp-password
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

### 4. Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Test the contact form at: http://localhost:3000/contact

3. Test the newsletter subscription in the footer of any page

4. Check your email inbox for:
   - Admin notifications (sent to ADMIN_EMAIL)
   - User confirmations (sent to the email they provided)

## Email Templates

All emails use professional HTML templates with:
- Colour Clouds Digital branding
- Blue (#0072FF) primary color scheme
- Green (#01A750) for success states
- Responsive design
- Plain text fallback

### Contact Form Emails

**Admin Notification:**
- Subject: "New Contact: [Subject]"
- Contains: Name, email, subject, and full message
- Reply-to: User's email address

**User Confirmation:**
- Subject: "Thank you for contacting Colour Clouds Digital"
- Contains: Thank you message, response time expectation, CTA to services

### Newsletter Emails

**Admin Notification:**
- Subject: "New Newsletter Subscriber"
- Contains: Email, name (if provided), subscription source

**Welcome Email:**
- Subject: "Welcome to Colour Clouds Digital Newsletter! 🎉"
- Contains: Welcome message, benefits list, CTA to website

## Error Handling

Email sending is **non-blocking**, meaning:
- Form submissions will succeed even if emails fail to send
- Email errors are logged to the console for debugging
- Users always receive a success message after valid form submission

This ensures a smooth user experience even if there are temporary email service issues.

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   # Verify your .env.local file has all required variables
   cat .env.local | grep SMTP
   ```

2. **Check console logs:**
   - Look for email error messages in your terminal
   - Errors will be prefixed with "Failed to send" or "Error sending email"

3. **Gmail-specific issues:**
   - Ensure 2-Step Verification is enabled
   - Use an App Password, not your regular password
   - Check if "Less secure app access" is disabled (it should be)

4. **Test SMTP connection:**
   - Try sending a test email using the same credentials with a tool like Mailtrap
   - Verify your SMTP host and port are correct

### Common Errors

**"Invalid login"**
- Wrong SMTP_USER or SMTP_PASSWORD
- For Gmail: Use App Password, not regular password

**"Connection timeout"**
- Wrong SMTP_HOST or SMTP_PORT
- Firewall blocking SMTP ports
- Try port 465 with SMTP_SECURE=true

**"Self-signed certificate"**
- Add `NODE_TLS_REJECT_UNAUTHORIZED=0` to .env.local (development only)

## Production Deployment

### Vercel

Add environment variables in your Vercel project settings:

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add all SMTP_* and ADMIN_EMAIL variables
4. Redeploy your application

### Other Platforms

Ensure all environment variables from `.env.example` are set in your production environment.

## Security Notes

⚠️ **Never commit `.env.local` to version control**
⚠️ **Use App Passwords for Gmail, never your main password**
⚠️ **Rotate SMTP credentials regularly**
⚠️ **Monitor email sending logs for suspicious activity**

## Files Modified

- `lib/nodemailer.ts` - Email service with all email functions
- `app/api/contact/route.ts` - Integrated email sending for contact forms
- `app/api/newsletter/route.ts` - Integrated email sending for newsletter subscriptions
- `.env.example` - Added SMTP configuration variables
- `.gitignore` - Fixed to allow .env.example in repo

## Next Steps

1. ✅ Set up your SMTP credentials in `.env.local`
2. ✅ Test contact form submissions
3. ✅ Test newsletter subscriptions
4. ✅ Verify emails are being received
5. ✅ Deploy to production with environment variables configured

---

**Need help?** Check the console logs for detailed error messages or review the Nodemailer documentation: https://nodemailer.com/
