# Google Sheets Template - Copy & Paste Ready

## 🎯 Quick Setup

1. Create a new Google Spreadsheet
2. Create three sheets (tabs): **Newsletter**, **Contact**, and **Blog**
3. Copy the headers below into Row 1 of each sheet
4. Share with your service account
5. Done!

---

## 📊 Sheet 1: Newsletter

### Copy This Line (Tab-separated):
```
Email	Name	Subscribed At	Source	Status
```

### Or Copy This Table:

| Email | Name | Subscribed At | Source | Status |
|-------|------|---------------|--------|--------|
|       |      |               |        |        |

### What Each Column Means:

- **Email** (A) - Subscriber's email address
- **Name** (B) - Subscriber's name (can be empty)
- **Subscribed At** (C) - When they subscribed (auto-filled)
- **Source** (D) - Which page they subscribed from (auto-filled)
- **Status** (E) - Subscription status (auto-filled as "active")

### Example Data:
```
Email                  | Name      | Subscribed At              | Source  | Status
-----------------------|-----------|----------------------------|---------|--------
john@example.com       | John Doe  | 2026-02-10T14:30:00.000Z  | /blog   | active
jane@example.com       |           | 2026-02-10T15:45:00.000Z  | /       | active
bob@example.com        | Bob Smith | 2026-02-10T16:00:00.000Z  | /about  | active
```

---

## 📧 Sheet 2: Contact

### Copy This Line (Tab-separated):
```
ID	Name	Email	Subject	Message	Submitted At	Status	IP Address
```

### Or Copy This Table:

| ID | Name | Email | Subject | Message | Submitted At | Status | IP Address |
|----|------|-------|---------|---------|--------------|--------|------------|
|    |      |       |         |         |              |        |            |

### What Each Column Means:

- **ID** (A) - Unique submission ID (auto-generated)
- **Name** (B) - Sender's name
- **Email** (C) - Sender's email address
- **Subject** (D) - Message subject
- **Message** (E) - Full message content
- **Submitted At** (F) - When submitted (auto-filled)
- **Status** (G) - Submission status (auto-filled as "new")
- **IP Address** (H) - Sender's IP address (optional, can be empty)

### Example Data:
```
ID                                   | Name      | Email            | Subject         | Message                    | Submitted At              | Status | IP Address
-------------------------------------|-----------|------------------|-----------------|----------------------------|---------------------------|--------|------------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | John Doe  | john@example.com | Project Inquiry | I'd like to discuss a new  | 2026-02-10T14:30:00.000Z | new    | 192.168.1.1
                                     |           |                  |                 | mobile app project...      |                           |        |
-------------------------------------|-----------|------------------|-----------------|----------------------------|---------------------------|--------|------------
b2c3d4e5-f6a7-8901-bcde-f12345678901 | Jane Doe  | jane@example.com | Question        | Can you help with my       | 2026-02-10T15:45:00.000Z | new    |
                                     |           |                  |                 | website redesign?          |                           |        |
```

---

## 🎨 Formatting Tips (Optional)

### Make Headers Stand Out:
1. Select Row 1
2. **Bold** the text
3. Add background color (light blue or light gray)
4. Center align the text

### Freeze Header Row:
1. Click on Row 2
2. View → Freeze → 1 row
3. Now headers stay visible when scrolling

### Auto-resize Columns:
1. Select all columns (click top-left corner)
2. Double-click any column border
3. Columns auto-resize to fit content

### Add Borders:
1. Select all cells with data
2. Click border icon in toolbar
3. Choose "All borders"

---

## � Sheet 3: Blog

### Copy This Line (Tab-separated):
```
ID	Slug	Title	Author	Published At	Content	Excerpt	Featured Image	Category	Tags	Status	Read Time
```

### Or Copy This Table:

| ID | Slug | Title | Author | Published At | Content | Excerpt | Featured Image | Category | Tags | Status | Read Time |
|----|------|-------|--------|--------------|---------|---------|----------------|----------|------|--------|-----------|
|    |      |       |        |              |         |         |                |          |      |        |           |

### What Each Column Means:

- **ID** (A) - Unique post identifier (e.g., `post-001`)
- **Slug** (B) - URL-friendly identifier (e.g., `my-first-post`)
- **Title** (C) - Post title
- **Author** (D) - Author name
- **Published At** (E) - Publication date (ISO 8601 format)
- **Content** (F) - Full post content (Markdown supported, use `\n` for line breaks)
- **Excerpt** (G) - Short summary (150-200 characters)
- **Featured Image** (H) - Image URL
- **Category** (I) - Post category
- **Tags** (J) - Comma-separated tags
- **Status** (K) - `published`, `draft`, or `archived` (only published posts appear on site)
- **Read Time** (L) - Reading time in minutes (optional)

### Example Data:
```
ID       | Slug              | Title                    | Author         | Published At              | Content                                    | Excerpt                                      | Featured Image                                | Category        | Tags                    | Status    | Read Time
---------|-------------------|--------------------------|----------------|---------------------------|--------------------------------------------|----------------------------------------------|-----------------------------------------------|-----------------|-------------------------|-----------|----------
post-001 | getting-started   | Getting Started          | Williams Iyoha | 2026-02-10T00:00:00.000Z | # Hello World\n\nThis is my first post!   | My first blog post on the new site.          | https://images.unsplash.com/photo-1499750... | Tutorial        | intro, getting-started  | published | 2
post-002 | web-design-tips   | 10 Web Design Tips       | Williams Iyoha | 2026-02-09T00:00:00.000Z | # Design Tips\n\nHere are my top 10 tips  | Learn essential web design principles.       | https://images.unsplash.com/photo-1561070... | Design          | design, tips, ui-ux     | published | 5
post-003 | draft-post        | This is a Draft          | Williams Iyoha | 2026-02-11T00:00:00.000Z | # Coming Soon\n\nStill writing this...    | This post won't appear on the website yet.   | https://images.unsplash.com/photo-1633356... | Tutorial        | draft, wip              | draft     | 3
```

**Important:** Only posts with `Status` = `published` will appear on your blog!

---

## 🔐 Share with Service Account

**Email to share with:**
```
colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com
```

**Steps:**
1. Click "Share" button (top right)
2. Paste the email above
3. Set permission to **"Editor"**
4. **Uncheck** "Notify people"
5. Click "Share"

---

## 📝 Get Your Spreadsheet ID

**Your URL looks like:**
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                      ↑_____________THIS_PART_____________↑
```

**Copy the ID and add to `.env.local`:**
```env
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

## ✅ Final Checklist

Before testing, verify:

- [ ] Spreadsheet created
- [ ] Three sheets exist: "Newsletter", "Contact", and "Blog" (exact names, case-sensitive)
- [ ] Newsletter sheet has 5 columns in correct order
- [ ] Contact sheet has 8 columns in correct order
- [ ] Blog sheet has 12 columns in correct order
- [ ] Headers are in Row 1 of each sheet
- [ ] Spreadsheet shared with service account (Editor permission)
- [ ] Spreadsheet ID copied to `.env.local`

---

## 🧪 Test Your Setup

```bash
# Start dev server
npm run dev

# Test newsletter (any page footer)
# Enter email → Subscribe → Check Newsletter sheet

# Test contact form (http://localhost:3000/contact)
# Fill form → Submit → Check Contact sheet

# Test blog (http://localhost:3000/blog)
# Add a published post to Blog sheet → Visit blog page → See your post!
```

---

## 🎯 Expected Results

### After Newsletter Subscription:
- New row appears in **Newsletter** sheet
- Email notification sent to admin
- Welcome email sent to subscriber

### After Contact Form Submission:
- New row appears in **Contact** sheet
- Email notification sent to admin
- Confirmation email sent to submitter

### After Blog Post Published:
- Post appears at http://localhost:3000/blog
- Post is accessible at http://localhost:3000/blog/[your-slug]
- Changes may take up to 5 minutes (cache refresh)

---

**Need more help?** See `GOOGLE_SHEETS_SETUP_GUIDE.md` for detailed instructions!
