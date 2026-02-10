# Google Sheets Setup Guide

## 📋 Overview

Your Colour Clouds Digital portfolio stores contact form submissions and newsletter subscriptions in Google Sheets. This guide shows you exactly how to set up your spreadsheet.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a New Google Spreadsheet

1. Go to: https://sheets.google.com
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: **"Colour Clouds Digital - Submissions"** (or any name you prefer)

### Step 2: Create Two Sheets (Tabs)

Your spreadsheet needs **three separate sheets** (tabs at the bottom):

1. **Newsletter** - For newsletter subscriptions
2. **Contact** - For contact form submissions
3. **Blog** - For blog post management

#### How to Create Sheets:

- The first sheet is created automatically (rename it to "Newsletter")
- Click the **"+"** button at the bottom left to add more sheets
- Right-click each tab to rename them

---

## 📊 Sheet 1: Newsletter

### Column Headers (Row 1)

Copy and paste this into Row 1 of your **Newsletter** sheet:

```
Email	Name	Subscribed At	Source	Status
```

### Column Details

| Column | Description | Example |
|--------|-------------|---------|
| **Email** | Subscriber's email address | `john@example.com` |
| **Name** | Subscriber's name (optional) | `John Doe` or empty |
| **Subscribed At** | Timestamp of subscription | `2026-02-10T14:30:00.000Z` |
| **Source** | Page where they subscribed | `/blog` or `/` |
| **Status** | Subscription status | `active` |

### Visual Layout

```
A          | B        | C                    | D        | E
-----------|----------|----------------------|----------|--------
Email      | Name     | Subscribed At        | Source   | Status
-----------|----------|----------------------|----------|--------
(data)     | (data)   | (data)               | (data)   | (data)
```

### Example Data

```
Email                  | Name      | Subscribed At              | Source  | Status
-----------------------|-----------|----------------------------|---------|--------
john@example.com       | John Doe  | 2026-02-10T14:30:00.000Z  | /blog   | active
jane@example.com       |           | 2026-02-10T15:45:00.000Z  | /       | active
```

---

## 📧 Sheet 2: Contact

### Column Headers (Row 1)

Copy and paste this into Row 1 of your **Contact** sheet:

```
ID	Name	Email	Subject	Message	Submitted At	Status	IP Address
```

### Column Details

| Column | Description | Example |
|--------|-------------|---------|
| **ID** | Unique submission ID | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **Name** | Sender's name | `John Doe` |
| **Email** | Sender's email | `john@example.com` |
| **Subject** | Message subject | `Project Inquiry` |
| **Message** | Full message content | `I'd like to discuss...` |
| **Submitted At** | Timestamp | `2026-02-10T14:30:00.000Z` |
| **Status** | Submission status | `new` |
| **IP Address** | Sender's IP (optional) | `192.168.1.1` or empty |

### Visual Layout

```
A      | B      | C       | D        | E        | F              | G       | H
-------|--------|---------|----------|----------|----------------|---------|------------
ID     | Name   | Email   | Subject  | Message  | Submitted At   | Status  | IP Address
-------|--------|---------|----------|----------|----------------|---------|------------
(data) | (data) | (data)  | (data)   | (data)   | (data)         | (data)  | (data)
```

### Example Data

```
ID          | Name      | Email            | Subject         | Message              | Submitted At              | Status | IP Address
------------|-----------|------------------|-----------------|----------------------|---------------------------|--------|------------
abc-123...  | John Doe  | john@example.com | Project Inquiry | I'd like to discuss  | 2026-02-10T14:30:00.000Z | new    | 192.168.1.1
def-456...  | Jane Doe  | jane@example.com | Question        | Can you help with... | 2026-02-10T15:45:00.000Z | new    |
```

---

## 📝 Sheet 3: Blog

### Column Headers (Row 1)

Copy and paste this into Row 1 of your **Blog** sheet:

```
ID	Slug	Title	Author	Published At	Content	Excerpt	Featured Image	Category	Tags	Status	Read Time
```

### Column Details

| Column | Description | Example |
|--------|-------------|---------|
| **ID** | Unique post identifier | `post-001` |
| **Slug** | URL-friendly identifier | `my-first-blog-post` |
| **Title** | Post title | `Getting Started with Next.js` |
| **Author** | Author name | `Williams Iyoha` |
| **Published At** | Publication date (ISO 8601) | `2026-02-10T00:00:00.000Z` |
| **Content** | Full post content (Markdown) | `# Heading\n\nParagraph text...` |
| **Excerpt** | Short summary (150-200 chars) | `Learn how to build modern web apps...` |
| **Featured Image** | Image URL | `https://images.unsplash.com/photo-...` |
| **Category** | Post category | `Web Development` |
| **Tags** | Comma-separated tags | `nextjs, react, typescript` |
| **Status** | Publication status | `published` or `draft` or `archived` |
| **Read Time** | Reading time in minutes | `5` |

### Visual Layout

```
A        | B      | C       | D        | E              | F        | G        | H               | I         | J     | K       | L
---------|--------|---------|----------|----------------|----------|----------|-----------------|-----------|-------|---------|----------
ID       | Slug   | Title   | Author   | Published At   | Content  | Excerpt  | Featured Image  | Category  | Tags  | Status  | Read Time
---------|--------|---------|----------|----------------|----------|----------|-----------------|-----------|-------|---------|----------
(data)   | (data) | (data)  | (data)   | (data)         | (data)   | (data)   | (data)          | (data)    |(data) | (data)  | (data)
```

### Example Data

```
ID       | Slug            | Title                  | Author         | Published At              | Content                                  | Excerpt                                    | Featured Image                              | Category        | Tags                  | Status    | Read Time
---------|-----------------|------------------------|----------------|---------------------------|------------------------------------------|--------------------------------------------|--------------------------------------------|-----------------|----------------------|-----------|----------
post-001 | getting-started | Getting Started        | Williams Iyoha | 2026-02-10T00:00:00.000Z | # Hello World\n\nThis is my first post! | My first blog post on the new site.        | https://images.unsplash.com/photo-1499... | Tutorial        | intro, getting-started | published | 2
post-002 | web-design-tips | 10 Web Design Tips     | Williams Iyoha | 2026-02-09T00:00:00.000Z | # Design Tips\n\nHere are my top 10...  | Learn essential web design principles.     | https://images.unsplash.com/photo-1561... | Design          | design, tips, ui-ux   | published | 5
```

**Important:** Only posts with `Status` = `published` will appear on your blog!

**For detailed blog management instructions, see:** `BLOG_MANAGEMENT_GUIDE.md`

---

## 🔐 Step 3: Share with Service Account

Your service account needs permission to write to the spreadsheet.

### Get Your Service Account Email

From your `config/colour-clouds-ng-server-dafd4cf6ebff.json` file:
```
colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com
```

### Share the Spreadsheet

1. Click the **"Share"** button (top right of Google Sheets)
2. Paste the service account email:
   ```
   colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com
   ```
3. Set permission to **"Editor"**
4. **Uncheck** "Notify people" (it's a service account, not a person)
5. Click **"Share"** or **"Done"**

---

## 📝 Step 4: Get Your Spreadsheet ID

1. Look at your Google Sheets URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```

2. Copy the ID part (between `/d/` and `/edit`):
   ```
   1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

3. Add it to your `.env.local` file:
   ```env
   GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Spreadsheet created with a name
- [ ] Three sheets exist: **"Newsletter"**, **"Contact"**, and **"Blog"**
- [ ] Newsletter sheet has 5 columns: Email, Name, Subscribed At, Source, Status
- [ ] Contact sheet has 8 columns: ID, Name, Email, Subject, Message, Submitted At, Status, IP Address
- [ ] Blog sheet has 12 columns: ID, Slug, Title, Author, Published At, Content, Excerpt, Featured Image, Category, Tags, Status, Read Time
- [ ] Headers are in Row 1 of each sheet
- [ ] Spreadsheet is shared with service account email (as Editor)
- [ ] Spreadsheet ID is added to `.env.local`

---

## 🧪 Test Your Setup

### Start Development Server
```bash
npm run dev
```

### Test Newsletter Subscription

1. Go to any page (footer has newsletter form)
2. Enter an email: `test@example.com`
3. Click "Subscribe"
4. Check your **Newsletter** sheet - you should see a new row!

### Test Contact Form

1. Go to: http://localhost:3000/contact
2. Fill out the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Subject: `Test Submission`
   - Message: `This is a test message`
3. Submit the form
4. Check your **Contact** sheet - you should see a new row!

---

## 🎨 Optional: Format Your Sheets

### Make Headers Stand Out

1. Select Row 1 (the header row)
2. Make it **bold**
3. Add a background color (e.g., light blue)
4. Freeze the row: View → Freeze → 1 row

### Auto-resize Columns

1. Select all columns (click the square at top-left)
2. Double-click any column border to auto-resize

### Add Data Validation (Optional)

For the **Status** column in both sheets:
1. Select the Status column (E for Newsletter, G for Contact)
2. Data → Data validation
3. Criteria: List of items
4. Items: `active, inactive, new, read, archived`

---

## 🔍 Troubleshooting

### Error: "Permission denied"

**Problem:** Service account doesn't have access to the sheet

**Solution:**
1. Check that you shared the sheet with the correct email
2. Ensure permission is set to "Editor" (not "Viewer")
3. Try sharing again

### Error: "Sheet not found"

**Problem:** Sheet names don't match what the code expects

**Solution:**
- Ensure you have sheets named exactly **"Newsletter"** and **"Contact"** (case-sensitive)
- Check for extra spaces in sheet names

### Error: "Invalid spreadsheet ID"

**Problem:** Wrong spreadsheet ID in `.env.local`

**Solution:**
1. Double-check the ID from your Google Sheets URL
2. Make sure there are no extra spaces or quotes
3. Restart your dev server after changing `.env.local`

### Data Not Appearing

**Problem:** Form submits successfully but no data in sheets

**Solution:**
1. Check console logs for errors
2. Verify service account email is correct in `.env.local`
3. Ensure `GOOGLE_PRIVATE_KEY` is properly formatted with `\n` characters
4. Try re-sharing the spreadsheet with the service account

---

## 📊 Understanding the Data

### Newsletter Data

- **Email:** Always lowercase, validated
- **Name:** Optional, may be empty
- **Subscribed At:** ISO 8601 timestamp (UTC)
- **Source:** The page path where they subscribed
- **Status:** Always "active" for new subscriptions

### Contact Data

- **ID:** UUID v4 format (unique identifier)
- **Name:** Required, sanitized for safety
- **Email:** Required, lowercase, validated
- **Subject:** Required, sanitized
- **Message:** Required, sanitized, preserves line breaks
- **Submitted At:** ISO 8601 timestamp (UTC)
- **Status:** Always "new" for new submissions
- **IP Address:** Optional, may be empty for privacy

---

## 🚀 Production Considerations

### Data Management

- Regularly review and respond to contact submissions
- Archive old submissions to keep sheets manageable
- Consider exporting data periodically for backup

### Privacy & GDPR

- The IP address field is optional and may be empty
- Consider adding a privacy policy link
- Implement data retention policies
- Provide unsubscribe functionality for newsletters

### Monitoring

- Set up Google Sheets notifications for new rows
- Monitor for spam submissions
- Check error logs regularly

---

## 📚 Additional Resources

- **Google Sheets API:** https://developers.google.com/sheets/api
- **Service Accounts:** https://cloud.google.com/iam/docs/service-accounts
- **ISO 8601 Timestamps:** https://en.wikipedia.org/wiki/ISO_8601

---

## ✅ Quick Reference

### Sheet Names (Case-Sensitive!)
- `Newsletter`
- `Contact`

### Newsletter Columns (5)
```
Email | Name | Subscribed At | Source | Status
```

### Contact Columns (8)
```
ID | Name | Email | Subject | Message | Submitted At | Status | IP Address
```

### Service Account Email
```
colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com
```

---

**Need help?** Check the console logs for detailed error messages or see `COMPLETE_SETUP_GUIDE.md` for the full setup process.
