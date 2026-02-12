# Timezone Configuration - WAT (West Africa Time)

## 📍 Overview

Your Colour Clouds Digital portfolio now uses **WAT (West Africa Time, UTC+1)** for all timestamps throughout the application.

## ⏰ Timezone Details

- **Name:** West Africa Time
- **Abbreviation:** WAT
- **Offset:** UTC+1 (1 hour ahead of UTC)
- **IANA Timezone:** Africa/Lagos
- **Format:** 24-hour format (e.g., 16:30 instead of 4:30 PM)

## 📝 What Changed

### Before (EST/UTC)
```
2026-02-10T15:30:45.123Z  (UTC format)
```

### After (WAT)
```
2026-02-10T16:30:45.123+01:00  (WAT format, 24-hour)
```

## 🔧 Implementation

### Timezone Utility Functions

All timezone functions are in `lib/timezone.ts`:

#### 1. Get Current WAT Timestamp
```typescript
import { getWATTimestamp } from '@/lib/timezone';

const timestamp = getWATTimestamp();
// Returns: "2026-02-10T16:30:45.123+01:00"
```

#### 2. Format Date in WAT (24-hour)
```typescript
import { formatWATDate } from '@/lib/timezone';

const formatted = formatWATDate(new Date());
// Returns: "10 Feb 2026, 16:30"
```

#### 3. Format Full Date in WAT
```typescript
import { formatWATDateFull } from '@/lib/timezone';

const formatted = formatWATDateFull(new Date());
// Returns: "Monday, 10 February 2026, 16:30:45"
```

#### 4. Format Time Only in WAT
```typescript
import { formatWATTime } from '@/lib/timezone';

const time = formatWATTime(new Date());
// Returns: "16:30:45"
```

#### 5. Convert Existing Timestamp to WAT
```typescript
import { convertToWAT } from '@/lib/timezone';

const watTime = convertToWAT("2026-02-10T15:30:45.123Z");
// Returns: "2026-02-10T16:30:45.123+01:00"
```

## 📊 Where Timestamps Are Used

### 1. Contact Form Submissions
- **Field:** `submittedAt`
- **Format:** ISO 8601 with WAT offset
- **Example:** `2026-02-10T16:30:45.123+01:00`
- **Location:** `app/api/contact/route.ts`

### 2. Newsletter Subscriptions
- **Field:** `subscribedAt`
- **Format:** ISO 8601 with WAT offset
- **Example:** `2026-02-10T16:30:45.123+01:00`
- **Location:** `app/api/newsletter/route.ts`

### 3. Blog Posts
- **Field:** `publishedAt`
- **Format:** ISO 8601 with WAT offset
- **Example:** `2026-02-10T16:30:45.123+01:00`
- **Location:** Google Sheets (manually entered)

## 📋 Google Sheets Format

When adding timestamps to Google Sheets (especially for blog posts), use this format:

### WAT Timestamp Format
```
2026-02-10T16:30:00.000+01:00
```

### Breaking It Down
- `2026-02-10` - Date (YYYY-MM-DD)
- `T` - Separator
- `16:30:00` - Time in 24-hour format (HH:MM:SS)
- `.000` - Milliseconds
- `+01:00` - WAT timezone offset (1 hour ahead of UTC)

### Quick Reference
| Time | 12-hour | 24-hour (WAT) |
|------|---------|---------------|
| Midnight | 12:00 AM | 00:00 |
| Morning | 9:00 AM | 09:00 |
| Noon | 12:00 PM | 12:00 |
| Afternoon | 3:00 PM | 15:00 |
| Evening | 6:00 PM | 18:00 |
| Night | 9:00 PM | 21:00 |

## 🔄 Timestamp Examples

### Contact Form Submission
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to discuss...",
  "submittedAt": "2026-02-10T16:30:45.123+01:00",
  "status": "new"
}
```

### Newsletter Subscription
```json
{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "subscribedAt": "2026-02-10T16:30:45.123+01:00",
  "source": "/blog",
  "status": "active"
}
```

### Blog Post
```
ID: post-001
Slug: my-first-post
Title: Getting Started
Author: Williams Iyoha
Published At: 2026-02-10T16:30:00.000+01:00
...
```

## 🌍 Timezone Conversion

### From UTC to WAT
Add 1 hour to UTC time:
- UTC: `15:30` → WAT: `16:30`
- UTC: `23:00` → WAT: `00:00` (next day)

### From EST to WAT
Add 6 hours to EST time (during standard time):
- EST: `10:30` → WAT: `16:30`
- EST: `18:00` → WAT: `00:00` (next day)

### From GMT to WAT
Add 1 hour to GMT time:
- GMT: `15:30` → WAT: `16:30`

## 🎨 Display Formatting

### In UI Components

When displaying timestamps to users, use the formatting functions:

```typescript
import { formatWATDate, formatWATTime } from '@/lib/timezone';

// In your component
const displayDate = formatWATDate(new Date(post.publishedAt));
// Shows: "10 Feb 2026, 16:30"

const displayTime = formatWATTime(new Date(submission.submittedAt));
// Shows: "16:30:45"
```

### Example Component
```tsx
import { formatWATDate } from '@/lib/timezone';

export function BlogPost({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>Published: {formatWATDate(new Date(post.publishedAt))}</p>
      {/* Shows: Published: 10 Feb 2026, 16:30 */}
    </div>
  );
}
```

## 🔍 Troubleshooting

### Timestamps Look Wrong

**Problem:** Timestamps showing wrong time

**Solution:**
1. Check that you're using `getWATTimestamp()` instead of `new Date().toISOString()`
2. Verify the timezone offset is `+01:00`
3. Ensure 24-hour format is being used

### Google Sheets Timestamps

**Problem:** Blog posts not showing correct time

**Solution:**
1. Use the format: `2026-02-10T16:30:00.000+01:00`
2. Include the `+01:00` timezone offset
3. Use 24-hour format (16:30, not 4:30 PM)

### Converting Old Timestamps

**Problem:** Existing timestamps in UTC format

**Solution:**
```typescript
import { convertToWAT } from '@/lib/timezone';

// Convert old UTC timestamp
const oldTimestamp = "2026-02-10T15:30:45.123Z";
const watTimestamp = convertToWAT(oldTimestamp);
// Result: "2026-02-10T16:30:45.123+01:00"
```

## 📚 Additional Resources

- **ISO 8601 Format:** https://en.wikipedia.org/wiki/ISO_8601
- **WAT Timezone:** https://www.timeanddate.com/time/zones/wat
- **24-hour Time:** https://en.wikipedia.org/wiki/24-hour_clock
- **IANA Timezone Database:** https://www.iana.org/time-zones

## ✅ Summary

- ✅ All timestamps now use WAT (UTC+1)
- ✅ 24-hour format throughout the application
- ✅ ISO 8601 format with timezone offset
- ✅ Consistent formatting across all features
- ✅ Easy-to-use utility functions in `lib/timezone.ts`

---

**Need help?** Check the examples above or see `lib/timezone.ts` for all available functions!
