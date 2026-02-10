# Email Integration - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Create `.env.local`
```bash
cp .env.example .env.local
```

### Step 2: Configure Gmail (Easiest Option)

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Update `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=colourclouds042@gmail.com
```

### Step 3: Test It!
```bash
npm run dev
```

Visit http://localhost:3000/contact and submit the form. You should receive:
- ✉️ Admin notification at `ADMIN_EMAIL`
- ✉️ Confirmation email to the submitter

## 📧 What Gets Sent?

### Contact Form
- **To Admin:** New contact notification with full message
- **To User:** Thank you confirmation with link to services

### Newsletter
- **To Admin:** New subscriber notification
- **To User:** Welcome email with benefits and website link

## ⚙️ Environment Variables

Required in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com          # Your SMTP server
SMTP_PORT=587                      # 587 for TLS, 465 for SSL
SMTP_SECURE=false                  # false for 587, true for 465
SMTP_USER=your-email@gmail.com     # Your email address
SMTP_PASSWORD=your-app-password    # App password (not regular password!)
ADMIN_EMAIL=colourclouds042@gmail.com  # Where to receive notifications
```

## 🔧 Troubleshooting

**Emails not sending?**
1. Check console for error messages
2. Verify App Password (not regular password)
3. Ensure 2-Step Verification is enabled
4. Try port 465 with `SMTP_SECURE=true`

**Still having issues?**
See `EMAIL_SETUP_GUIDE.md` for detailed troubleshooting.

## 📝 Note

Email sending is **non-blocking** - forms will work even if emails fail. Check console logs for email errors.
