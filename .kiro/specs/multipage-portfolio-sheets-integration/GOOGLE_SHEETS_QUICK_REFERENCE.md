# Google Sheets - Quick Reference Card

## 📋 What You Need

### Two Sheets (Tabs)
1. **Newsletter** - For newsletter subscriptions
2. **Contact** - For contact form submissions

---

## 📊 Newsletter Sheet

### Columns (Copy & Paste into Row 1):
```
Email	Name	Subscribed At	Source	Status
```

### Example:
| Email | Name | Subscribed At | Source | Status |
|-------|------|---------------|--------|--------|
| john@example.com | John Doe | 2026-02-10T14:30:00.000Z | /blog | active |

---

## 📧 Contact Sheet

### Columns (Copy & Paste into Row 1):
```
ID	Name	Email	Subject	Message	Submitted At	Status	IP Address
```

### Example:
| ID | Name | Email | Subject | Message | Submitted At | Status | IP Address |
|----|------|-------|---------|---------|--------------|--------|------------|
| abc-123 | John | john@example.com | Inquiry | Hello... | 2026-02-10T14:30:00.000Z | new | 192.168.1.1 |

---

## 🔐 Share Settings

**Share with:**
```
colour-clouds-ng-sheet-writer@colour-clouds-ng-server.iam.gserviceaccount.com
```

**Permission:** Editor

**Notify:** Uncheck (it's a service account)

---

## 📝 Get Spreadsheet ID

**From URL:**
```
https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit
```

**Add to `.env.local`:**
```env
GOOGLE_SHEET_ID=your-spreadsheet-id-here
```

---

## ✅ Checklist

- [ ] Created spreadsheet
- [ ] Two sheets: "Newsletter" and "Contact"
- [ ] Newsletter has 5 columns
- [ ] Contact has 8 columns
- [ ] Shared with service account (Editor)
- [ ] ID added to `.env.local`

---

**Full Guide:** See `GOOGLE_SHEETS_SETUP_GUIDE.md`
