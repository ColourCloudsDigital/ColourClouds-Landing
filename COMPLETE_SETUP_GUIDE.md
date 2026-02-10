# Complete Setup Guide - Email & Google Sheets Integration

## 🎯 What You Have vs What You Need

### ✅ Already Configured (Google Sheets)
- **File:** `config/colour-clouds-ng-server-dafd4cf6ebff.json`
- **Purpose:** Store contact form submissions and newsletter subscriptions in Google Sheets
- **Status:** ✅ Credentials imported and added to `.env.local`

### ⚠️ Still Need to Configure (Email/SMTP)
- **Purpose:** Send emails to visitors and admin
- **Status:** ⚠️ Requires Gmail App Password setup
- **Time:** 2-3 minutes

---

## 📋 Quick Setup Checklist

- [x] Google Sheets credentials imported
- [x] `.env.local` file created with Google credentials
- [ ] **Add your Google Sheets ID** to `.env.local`
- [ ] **Create Gmail App Password** and add to `.env.local`
- [ ] Test contact form
- [ ] Test newsletter subscription

---

## Step 1: Set Up Google Sheets 📊

**First time?** You need to create your Google Sheets spreadsheet.

👉 **See detailed instructions:** `GOOGLE_SHEETS_SETUP_GUIDE.md`

### Quick Summary:

1. Create a new Google Spreadsheet
2. Create two sheets (tabs): **"Newsletter"** and **"Contact"**
3. Add column headers:
   - **Newsletter:** `Email | Name | Subscribed At | Source | Status`
   - **Contact:** `ID | Name | Email | Subject | Message | Submitted At | Status | IP Address`
4. Share with service account: `colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com`
5. Copy the spreadsheet ID from the URL

---

## Step 2: Add Your Google Sheets ID ✏️

1. Open your Google Sheets spreadsheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
3. Copy the `SPREADSHEET_ID` part
4. Open `.env.local` and replace:
   ```env
   GOOGLE_SHEET_ID=YOUR_SPREADSHEET_ID_HERE
   ```
   with:
   ```env
   GOOGLE_SHEET_ID=your-actual-spreadsheet-id
   ```

---

## Step 3: Create Gmail App Password 🔐

### Why App Password?
Gmail requires App Passwords for third-party applications. Your regular password won't work.

### How to Create:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" from the dropdown
   - Select "Windows Computer" (or "Other")
   - Click "Generate"
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

3. **Add to `.env.local`**
   - Open `.env.local`
   - Find the line: `SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE`
   - Replace with your 16-character password (remove spaces):
   ```env
   SMTP_PASSWORD=abcdefghijklmnop
   ```

---

## Step 4: Verify Your `.env.local` File 📝

Your `.env.local` should look like this (with your actual values):

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Sheets (Already configured ✅)
GOOGLE_SERVICE_ACCOUNT_EMAIL=colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-actual-spreadsheet-id  # ⚠️ ADD THIS

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=5

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=colourclouds042@gmail.com
SMTP_PASSWORD=your-16-char-app-password  # ⚠️ ADD THIS
ADMIN_EMAIL=colourclouds042@gmail.com
```

---

## Step 5: Test Everything 🧪

### Start Development Server
```bash
npm run dev
```

### Test Contact Form
1. Go to: http://localhost:3000/contact
2. Fill out and submit the form
3. Check for:
   - ✅ Success message on the website
   - ✅ Email to `colourclouds042@gmail.com` (admin notification)
   - ✅ Email to the address you entered (confirmation)
   - ✅ New row in your Google Sheets

### Test Newsletter
1. Go to any page (footer has newsletter form)
2. Enter an email and subscribe
3. Check for:
   - ✅ Success message on the website
   - ✅ Email to `colourclouds042@gmail.com` (admin notification)
   - ✅ Welcome email to the subscriber
   - ✅ New row in your Google Sheets

### Check Console Logs
If something doesn't work, check your terminal for error messages:
- Email errors: Look for "Failed to send email"
- Google Sheets errors: Look for "Failed to add"

---

## 🔍 Troubleshooting

### Emails Not Sending

**Error: "Invalid login"**
- ❌ Using regular Gmail password instead of App Password
- ✅ Solution: Create and use App Password (see Step 2)

**Error: "Connection timeout"**
- ❌ Wrong SMTP host or port
- ✅ Solution: Use `smtp.gmail.com` and port `587`

**No error but emails not arriving**
- Check spam folder
- Verify `SMTP_USER` matches your Gmail address
- Ensure 2-Step Verification is enabled

### Google Sheets Not Working

**Error: "Failed to initialize Google Sheets"**
- ❌ Wrong spreadsheet ID
- ✅ Solution: Double-check the ID from your Google Sheets URL

**Error: "Permission denied"**
- ❌ Service account doesn't have access to the sheet
- ✅ Solution: Share your Google Sheet with the service account email:
  `colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com`

---

## 🚀 Production Deployment (Vercel)

When deploying to production:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SITE_URL` = `https://colourclouds.digital`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (copy the entire value with quotes)
   - `GOOGLE_SHEET_ID`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `ADMIN_EMAIL`
4. Redeploy your application

---

## 📧 What Emails Are Sent?

### Contact Form Submission
1. **To Admin** (`colourclouds042@gmail.com`)
   - Subject: "New Contact: [Subject]"
   - Contains: Full message details
   - Can reply directly to the sender

2. **To Visitor**
   - Subject: "Thank you for contacting Colour Clouds Digital"
   - Contains: Confirmation message, link to services

### Newsletter Subscription
1. **To Admin** (`colourclouds042@gmail.com`)
   - Subject: "New Newsletter Subscriber"
   - Contains: Subscriber email and name

2. **To Subscriber**
   - Subject: "Welcome to Colour Clouds Digital Newsletter! 🎉"
   - Contains: Welcome message, benefits, link to website

---

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ `config/` folder is in `.gitignore` (credentials safe)
- ⚠️ Never share your App Password
- ⚠️ Never commit `.env.local` to GitHub
- ⚠️ Rotate credentials regularly

---

## 📚 Additional Resources

- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Google Sheets API:** https://developers.google.com/sheets/api
- **Nodemailer Docs:** https://nodemailer.com/
- **Email Setup Guide:** See `EMAIL_SETUP_GUIDE.md`
- **Quick Start:** See `EMAIL_QUICK_START.md`

---

## ✅ Summary

**What the config folder contains:**
- Google Service Account credentials for Google Sheets API
- **NOT** email credentials

**What you still need to do:**
1. Add your Google Sheets ID to `.env.local`
2. Create Gmail App Password and add to `.env.local`
3. Test contact form and newsletter
4. Deploy to production with environment variables

**Estimated time:** 5 minutes

---

Need help? Check the console logs for detailed error messages!
