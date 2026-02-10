# Blog Management with Google Sheets

## 📝 Overview

Your Colour Clouds Digital portfolio includes a **complete blog system** powered by Google Sheets! You can write, publish, and manage all your blog posts directly in Google Sheets - no database needed.

---

## 🚀 Quick Setup

### Step 1: Create the "Blog" Sheet

1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1qWFL1KvqV2ayIXsAm1ufDIAGcoLh0Z09oUvVlH4H6TQ/edit
2. Click the **"+"** button to add a new sheet
3. Rename it to exactly: **Blog** (capital B)

### Step 2: Add Column Headers

Copy and paste this into **Row 1** of your Blog sheet:

```
ID	Slug	Title	Author	Published At	Content	Excerpt	Featured Image	Category	Tags	Status	Read Time
```

---

## 📊 Column Structure (12 Columns)

| Column | Name | Required | Description | Example |
|--------|------|----------|-------------|---------|
| **A** | ID | Yes | Unique post identifier | `post-001` |
| **B** | Slug | Yes | URL-friendly identifier | `my-first-blog-post` |
| **C** | Title | Yes | Post title | `Getting Started with Next.js` |
| **D** | Author | Yes | Author name | `Williams Iyoha` |
| **E** | Published At | Yes | Publication date (ISO 8601) | `2026-02-10T00:00:00.000Z` |
| **F** | Content | Yes | Full post content (Markdown supported) | `# Introduction\n\nThis is my post...` |
| **G** | Excerpt | Yes | Short summary (150-200 chars) | `Learn how to build modern web apps...` |
| **H** | Featured Image | Yes | Image URL | `https://images.unsplash.com/photo-...` |
| **I** | Category | Yes | Post category | `Web Development` |
| **J** | Tags | No | Comma-separated tags | `nextjs, react, typescript` |
| **K** | Status | Yes | Publication status | `published` or `draft` or `archived` |
| **L** | Read Time | No | Reading time in minutes | `5` |

---

## 📝 How to Create a Blog Post

### Example Blog Post (Copy & Paste Ready)

```
post-001	getting-started-nextjs	Getting Started with Next.js	Williams Iyoha	2026-02-10T00:00:00.000Z	# Getting Started with Next.js\n\nNext.js is a powerful React framework that makes building web applications easier.\n\n## Why Next.js?\n\n- Server-side rendering\n- Static site generation\n- API routes\n- Built-in optimization\n\n## Getting Started\n\nFirst, install Next.js:\n\n```bash\nnpx create-next-app@latest\n```\n\nThen start your development server:\n\n```bash\nnpm run dev\n```\n\n## Conclusion\n\nNext.js is an excellent choice for modern web development!	Learn how to build modern web applications with Next.js, the React framework for production.	https://images.unsplash.com/photo-1633356122544-f134324a6cee	Web Development	nextjs, react, typescript, tutorial	published	5
```

### Step-by-Step Instructions

1. **ID** - Create a unique identifier:
   - Format: `post-001`, `post-002`, etc.
   - Must be unique for each post

2. **Slug** - Create URL-friendly version of title:
   - Use lowercase letters
   - Replace spaces with hyphens
   - No special characters
   - Example: "My First Post" → `my-first-post`

3. **Title** - Your post title:
   - Clear and descriptive
   - 50-60 characters ideal
   - Example: `Getting Started with Next.js`

4. **Author** - Your name:
   - Example: `Williams Iyoha`

5. **Published At** - Publication date:
   - Format: ISO 8601 timestamp
   - Example: `2026-02-10T00:00:00.000Z`
   - Use: https://timestampgenerator.com/ for easy generation

6. **Content** - Your full blog post:
   - Supports Markdown formatting
   - Use `\n` for line breaks
   - Use `\n\n` for paragraphs
   - Example:
     ```
     # Heading\n\nThis is a paragraph.\n\n## Subheading\n\nAnother paragraph.
     ```

7. **Excerpt** - Short summary:
   - 150-200 characters
   - Appears on blog listing page
   - Should entice readers to click

8. **Featured Image** - Image URL:
   - Use Unsplash, Pexels, or your own hosted images
   - Example: `https://images.unsplash.com/photo-1633356122544-f134324a6cee`
   - Recommended size: 1200x630px

9. **Category** - Post category:
   - Examples: `Web Development`, `Mobile Apps`, `Design`, `Tutorial`
   - Keep consistent across posts

10. **Tags** - Comma-separated keywords:
    - Example: `nextjs, react, typescript, tutorial`
    - No spaces after commas
    - Lowercase recommended

11. **Status** - Publication status:
    - `published` - Visible on website
    - `draft` - Hidden from website
    - `archived` - Hidden from website
    - **Only `published` posts appear on your blog!**

12. **Read Time** - Estimated reading time:
    - In minutes
    - Example: `5` (for 5 minutes)
    - Optional - leave blank if you don't want to show it

---

## 🎨 Markdown Formatting Guide

Your blog posts support Markdown! Here's what you can use:

### Headings
```
# Heading 1\n## Heading 2\n### Heading 3
```

### Bold & Italic
```
**bold text**\n*italic text*
```

### Lists
```
- Item 1\n- Item 2\n- Item 3
```

### Links
```
[Link text](https://example.com)
```

### Code Blocks
```
```javascript\nconst hello = 'world';\n```
```

### Images
```
![Alt text](https://image-url.com/image.jpg)
```

### Quotes
```
> This is a quote
```

---

## 📋 Example Blog Posts

### Post 1: Tutorial
```
post-001	building-modern-web-apps	Building Modern Web Apps with Next.js	Williams Iyoha	2026-02-10T00:00:00.000Z	# Building Modern Web Apps\n\nLearn how to create fast, scalable web applications using Next.js and React.\n\n## What You'll Learn\n\n- Server-side rendering\n- Static generation\n- API routes\n- Deployment	Discover how to build production-ready web applications with Next.js, the React framework trusted by top companies.	https://images.unsplash.com/photo-1633356122544-f134324a6cee	Web Development	nextjs, react, tutorial, web-dev	published	8
```

### Post 2: Case Study
```
post-002	redesigning-ecommerce-platform	Redesigning an E-commerce Platform	Williams Iyoha	2026-02-09T00:00:00.000Z	# E-commerce Platform Redesign\n\nA case study on how we transformed an outdated e-commerce site into a modern shopping experience.\n\n## The Challenge\n\nOur client had a 5-year-old platform with poor mobile experience and slow load times.\n\n## Our Solution\n\nWe rebuilt the entire platform using modern technologies and best practices.	See how we increased conversion rates by 45% through a complete platform redesign and optimization.	https://images.unsplash.com/photo-1556742049-0cfed4f6a45d	Case Study	ecommerce, design, ux, case-study	published	6
```

### Post 3: Draft (Not Visible)
```
post-003	upcoming-post	This Post is Not Published Yet	Williams Iyoha	2026-02-11T00:00:00.000Z	# Coming Soon\n\nThis post is still being written.	This is a draft post that won't appear on the website.	https://images.unsplash.com/photo-1499750310107-5fef28a66643	Tutorial	draft, wip	draft	3
```

---

## 🔄 Publishing Workflow

### To Publish a Post:
1. Write your post in the Blog sheet
2. Set **Status** to `published`
3. Save the sheet
4. Visit your blog: http://localhost:3000/blog
5. Your post appears immediately! (cached for 5 minutes)

### To Hide a Post:
1. Change **Status** to `draft` or `archived`
2. Save the sheet
3. Post disappears from website

### To Update a Post:
1. Edit the content in Google Sheets
2. Save the sheet
3. Changes appear within 5 minutes (cache refresh)
4. Or manually revalidate cache (see below)

---

## ⚡ Cache & Performance

Your blog uses **smart caching** for fast performance:

- Blog posts are cached for **5 minutes**
- After 5 minutes, cache automatically refreshes
- This means changes may take up to 5 minutes to appear

### Manual Cache Refresh (Advanced)

If you need immediate updates, you can trigger cache revalidation:

```typescript
// In your code
import { revalidateBlogPosts } from '@/lib/cache';

// Refresh all blog posts
await revalidateBlogPosts();

// Or refresh a specific post
await revalidateBlogPost('my-post-slug');
```

---

## 🎯 Best Practices

### Writing Great Blog Posts

1. **Compelling Titles**
   - Clear and specific
   - Include keywords
   - 50-60 characters

2. **Strong Excerpts**
   - Hook the reader
   - 150-200 characters
   - Include main benefit

3. **Quality Content**
   - Use headings for structure
   - Break up long paragraphs
   - Include code examples
   - Add images where relevant

4. **SEO-Friendly**
   - Use descriptive slugs
   - Include relevant tags
   - Write meta-friendly excerpts

5. **Consistent Categories**
   - Stick to 4-6 main categories
   - Use title case
   - Examples: `Web Development`, `Mobile Apps`, `Design Tips`

### Image Guidelines

- **Size:** 1200x630px (optimal for social sharing)
- **Format:** JPG or PNG
- **Sources:** Unsplash, Pexels, or your own
- **Quality:** High resolution, relevant to content

### Slug Guidelines

- **Format:** lowercase-with-hyphens
- **Length:** 3-5 words ideal
- **Keywords:** Include main topic
- **Unique:** Each post needs unique slug

---

## 🔍 Troubleshooting

### Posts Not Appearing

**Check:**
- [ ] Status is set to `published` (not `draft` or `archived`)
- [ ] Sheet is named exactly **"Blog"** (case-sensitive)
- [ ] All required columns are filled
- [ ] Spreadsheet is shared with service account
- [ ] Wait 5 minutes for cache to refresh

### Images Not Loading

**Check:**
- [ ] Image URL is complete and valid
- [ ] Image is publicly accessible
- [ ] URL starts with `https://`
- [ ] Try opening URL in browser to verify

### Formatting Issues

**Check:**
- [ ] Using `\n` for line breaks (not actual line breaks in cell)
- [ ] Markdown syntax is correct
- [ ] No smart quotes (use straight quotes)
- [ ] Code blocks use triple backticks

---

## 📚 Complete Example Sheet

Here's what your Blog sheet should look like:

### Row 1 (Headers):
```
ID | Slug | Title | Author | Published At | Content | Excerpt | Featured Image | Category | Tags | Status | Read Time
```

### Row 2 (First Post):
```
post-001 | getting-started | Getting Started | Williams Iyoha | 2026-02-10T00:00:00.000Z | # Hello World\n\nThis is my first post! | My first blog post on the new site. | https://images.unsplash.com/photo-1499750310107-5fef28a66643 | Tutorial | intro, getting-started | published | 2
```

### Row 3 (Second Post):
```
post-002 | web-design-tips | 10 Web Design Tips | Williams Iyoha | 2026-02-09T00:00:00.000Z | # Design Tips\n\nHere are my top 10 tips... | Learn essential web design principles that will improve your projects. | https://images.unsplash.com/photo-1561070791-2526d30994b5 | Design | design, tips, ui-ux | published | 5
```

---

## 🎉 You're Ready!

Now you can:
- ✅ Create blog posts in Google Sheets
- ✅ Publish and unpublish with one click
- ✅ Use Markdown for rich formatting
- ✅ Add images, categories, and tags
- ✅ Manage everything without touching code

**Next Steps:**
1. Create your "Blog" sheet
2. Add the column headers
3. Write your first post
4. Set status to `published`
5. Visit http://localhost:3000/blog

---

**Need help?** See `GOOGLE_SHEETS_SETUP_GUIDE.md` for general Google Sheets setup, or check the troubleshooting section above!
