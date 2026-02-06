# Design Document: Multipage Portfolio with Google Sheets Integration

## Overview

This design document outlines the architecture and implementation approach for converting the Colour Clouds Digital single-page landing site into a comprehensive multipage portfolio website. The system will leverage Next.js 14's App Router, integrate with Google Sheets API v4 for content management, and maintain the existing design language while adding new pages for services, about, blog, and enhanced contact functionality.

The solution uses a server-side architecture for Google Sheets operations to ensure API credentials remain secure, implements caching strategies for optimal performance, and provides a seamless user experience with proper loading states and error handling.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Browser]
        B[React Components]
        C[UI Components]
    end
    
    subgraph "Next.js App Router"
        D[Pages]
        E[Server Components]
        F[Client Components]
        G[API Routes]
    end
    
    subgraph "Data Layer"
        H[Google Sheets Service]
        I[Cache Manager]
        J[Data Validators]
    end
    
    subgraph "External Services"
        K[Google Sheets API v4]
        L[Google Sheets Document]
    end
    
    A --> B
    B --> C
    B --> D
    D --> E
    D --> F
    E --> G
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    K --> L
    
    style A fill:#e1f5ff
    style K fill:#fff4e1
    style L fill:#fff4e1
```

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (existing)
- **Notifications**: Sonner (existing)
- **API Integration**: googleapis npm package
- **Authentication**: Google Service Account
- **Caching**: Next.js built-in caching with revalidation
- **Image Optimization**: Next.js Image component

### Directory Structure

```
/app
  /page.tsx                          # Home/Landing page
  /layout.tsx                        # Root layout (existing)
  /services
    /page.tsx                        # Services page
  /about
    /page.tsx                        # About page
  /blog
    /page.tsx                        # Blog listing page
    /[slug]
      /page.tsx                      # Blog post detail page
  /contact
    /page.tsx                        # Enhanced contact page (existing)
  /api
    /newsletter
      /route.ts                      # Newsletter subscription endpoint
    /blog
      /route.ts                      # Blog data fetching endpoint
    /contact
      /route.ts                      # Contact form submission endpoint
    /sheets
      /route.ts                      # Generic Sheets operations endpoint
/lib
  /google-sheets.ts                  # Google Sheets service wrapper
  /cache.ts                          # Caching utilities
  /validators.ts                     # Input validation functions
  /types.ts                          # TypeScript type definitions
/components
  /ui                                # Existing UI components
  /newsletter-form.tsx               # Newsletter subscription form
  /blog-card.tsx                     # Blog post card component
  /blog-search.tsx                   # Blog search component
  /blog-filter.tsx                   # Blog filter component
  /breadcrumb.tsx                    # Breadcrumb navigation
  /related-posts.tsx                 # Related posts component
```

## Components and Interfaces

### Google Sheets Service

The Google Sheets service provides a centralized interface for all Sheets operations with authentication, error handling, and rate limiting.

**Interface:**
```typescript
interface GoogleSheetsService {
  // Initialize service with credentials
  initialize(): Promise<void>
  
  // Generic read operation
  readSheet(sheetName: string, range: string): Promise<any[][]>
  
  // Generic write operation
  appendRow(sheetName: string, values: any[]): Promise<void>
  
  // Blog-specific operations
  getBlogPosts(): Promise<BlogPost[]>
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>
  
  // Newsletter operations
  addSubscriber(subscriber: Subscriber): Promise<void>
  
  // Contact form operations
  addContactSubmission(submission: ContactSubmission): Promise<void>
}
```

**Implementation Details:**
- Uses Google Service Account authentication with JWT
- Credentials stored in environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID)
- Implements exponential backoff for rate limit handling
- Validates all inputs before writing to Sheets
- Logs all operations for debugging

**Authentication Flow:**
```typescript
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
```

### Cache Manager

Implements caching strategy for blog posts and other frequently accessed data to minimize API calls.

**Interface:**
```typescript
interface CacheManager {
  // Get cached data
  get<T>(key: string): T | null
  
  // Set cached data with TTL
  set<T>(key: string, value: T, ttl: number): void
  
  // Invalidate cache
  invalidate(key: string): void
  
  // Clear all cache
  clear(): void
}
```

**Implementation Strategy:**
- Use Next.js built-in caching with `revalidate` option
- Blog posts cached for 3600 seconds (1 hour)
- Implement on-demand revalidation for immediate updates
- Use `unstable_cache` for server-side caching

**Example Usage:**
```typescript
import { unstable_cache } from 'next/cache';

export const getCachedBlogPosts = unstable_cache(
  async () => {
    return await googleSheetsService.getBlogPosts();
  },
  ['blog-posts'],
  {
    revalidate: 3600, // 1 hour
    tags: ['blog'],
  }
);
```

### API Routes

#### Newsletter Subscription Route (`/api/newsletter/route.ts`)

**Request:**
```typescript
POST /api/newsletter
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "/services"
}
```

**Response:**
```typescript
// Success
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}

// Error
{
  "success": false,
  "error": "Invalid email format"
}
```

**Validation:**
- Email format validation using regex
- Name sanitization (remove special characters)
- Source page validation (must be valid route)
- Rate limiting: 5 requests per minute per IP

#### Blog Data Route (`/api/blog/route.ts`)

**Request:**
```typescript
GET /api/blog?category=tech&tag=nextjs&search=portfolio

// Or for single post
GET /api/blog/[slug]
```

**Response:**
```typescript
{
  "posts": [
    {
      "id": "1",
      "slug": "building-modern-portfolio",
      "title": "Building a Modern Portfolio",
      "author": "Jane Smith",
      "publishedAt": "2024-01-15T10:00:00Z",
      "content": "Full markdown content...",
      "excerpt": "Learn how to build...",
      "featuredImage": "https://...",
      "category": "Development",
      "tags": ["nextjs", "portfolio", "web"],
      "status": "published"
    }
  ],
  "total": 42
}
```

#### Contact Form Route (`/api/contact/route.ts`)

**Request:**
```typescript
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss..."
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

**Spam Protection:**
- Honeypot field (hidden from users)
- Time-based validation (submission must take > 3 seconds)
- Rate limiting: 3 submissions per hour per IP

### Page Components

#### Blog Listing Page (`/app/blog/page.tsx`)

**Features:**
- Server-side rendering with ISR
- Search functionality (client-side filtering)
- Category and tag filters
- Pagination (12 posts per page)
- Loading skeleton states

**Component Structure:**
```typescript
export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; page?: string }
}) {
  const posts = await getCachedBlogPosts();
  
  // Filter posts based on search params
  const filteredPosts = filterPosts(posts, searchParams);
  
  return (
    <div>
      <BlogSearch />
      <BlogFilter categories={categories} tags={tags} />
      <BlogGrid posts={filteredPosts} />
      <Pagination />
    </div>
  );
}

export const revalidate = 3600; // ISR: revalidate every hour
```

#### Blog Post Detail Page (`/app/blog/[slug]/page.tsx`)

**Features:**
- Dynamic route generation
- Static generation with ISR
- Related posts based on category/tags
- Social sharing buttons
- Breadcrumb navigation

**Metadata Generation:**
```typescript
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}
```

#### Services Page (`/app/services/page.tsx`)

**Content Structure:**
- Hero section with value proposition
- Service categories (App Development, Digital Content Creation)
- Detailed service descriptions with icons
- Call-to-action sections linking to contact page
- Client testimonials (optional)

**Layout:**
```typescript
export default function ServicesPage() {
  return (
    <main>
      <HeroSection title="Our Services" />
      <ServiceGrid services={services} />
      <CTASection />
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Services | Colour Clouds Digital',
  description: 'App development and digital content creation services',
};
```

#### About Page (`/app/about/page.tsx`)

**Content Structure:**
- Company story section
- Mission and vision statements
- Team member profiles (optional)
- Company values
- Timeline of achievements (optional)

#### Newsletter Form Component

**Component Interface:**
```typescript
interface NewsletterFormProps {
  source: string; // Current page path
  variant?: 'inline' | 'modal' | 'footer';
}

export function NewsletterForm({ source, variant = 'inline' }: NewsletterFormProps) {
  // Form state and submission logic
}
```

**Features:**
- Client-side validation
- Loading states during submission
- Success/error toast notifications
- Accessible form labels and error messages

#### Breadcrumb Component

**Component Interface:**
```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Breadcrumb rendering logic
}
```

**Features:**
- Accessible navigation with aria-labels
- Structured data markup for SEO
- Responsive design for mobile devices
- Consistent styling with brand colors

#### Contact Page Enhancement (`/app/contact/page.tsx`)

**Content Structure:**
- Contact form (name, email, subject, message)
- Direct contact information section
- Social media links
- Office location/map (optional)

**Contact Information Display:**
```typescript
const contactInfo = {
  email: 'colourclouds042@gmail.com',
  phone: '+1 (XXX) XXX-XXXX', // To be provided
  social: {
    twitter: 'https://twitter.com/colourclouds',
    linkedin: 'https://linkedin.com/company/colourclouds',
    instagram: 'https://instagram.com/colourclouds',
  }
};

export default function ContactPage() {
  return (
    <main>
      <ContactForm />
      <ContactInfo info={contactInfo} />
      <SocialLinks links={contactInfo.social} />
    </main>
  );
}
```

**Email Integration:**
- Direct mailto link: `mailto:colourclouds042@gmail.com`
- Click-to-call functionality for phone numbers
- Social media icon links with hover effects

## Design System

### Color Palette

The design maintains the existing Colour Clouds Digital brand colors:

```typescript
const colors = {
  primary: {
    green: '#01A750',    // Primary brand color
    blue: '#0072FF',     // Secondary brand color
    red: '#FF0000',      // Accent color (exact shade TBD)
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    }
  }
};
```

**Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'cc-green': '#01A750',
        'cc-blue': '#0072FF',
        'cc-red': '#FF0000',
      }
    }
  }
}
```

**Usage Guidelines:**
- Primary CTA buttons: `cc-green`
- Secondary buttons: `cc-blue`
- Error states/alerts: `cc-red`
- Text: neutral gray scale
- Backgrounds: white with gray accents

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  }
};
```

### Spacing and Layout

- Container max-width: 1280px
- Section padding: 80px vertical, 20px horizontal (mobile), 40px horizontal (desktop)
- Component spacing: 24px between major sections
- Grid system: 12-column responsive grid

## Data Models

### TypeScript Interfaces

```typescript
// lib/types.ts

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  readTime?: number;
}

export interface Subscriber {
  email: string;
  name?: string;
  subscribedAt: string;
  source: string;
  status: 'active' | 'unsubscribed';
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  ipAddress?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheets: {
    blog: string;
    newsletter: string;
    contact: string;
  };
}
```

### Google Sheets Structure

**Blog Posts Sheet:**
| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique identifier |
| slug | string | URL-friendly identifier |
| title | string | Post title |
| author | string | Author name |
| publishedAt | ISO 8601 | Publication date |
| content | string | Full markdown content |
| excerpt | string | Short description |
| featuredImage | URL | Image URL |
| category | string | Post category |
| tags | string | Comma-separated tags |
| status | enum | published/draft/archived |

**Newsletter Subscribers Sheet:**
| Column | Type | Description |
|--------|------|-------------|
| email | string | Subscriber email |
| name | string | Subscriber name (optional) |
| subscribedAt | ISO 8601 | Subscription date |
| source | string | Page where subscribed |
| status | enum | active/unsubscribed |

**Contact Submissions Sheet:**
| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique identifier |
| name | string | Submitter name |
| email | string | Submitter email |
| subject | string | Message subject |
| message | string | Message content |
| submittedAt | ISO 8601 | Submission date |
| status | enum | new/read/responded/archived |

## Error Handling Strategy

### Error Types

```typescript
export class GoogleSheetsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'GoogleSheetsError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
```

### Error Handling Flow

```typescript
// Example error handling in API route
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate input
    const validated = validateContactForm(data);
    
    // Submit to Google Sheets
    await googleSheetsService.addContactSubmission(validated);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, field: error.field },
        { status: 400 }
      );
    }
    
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }
    
    if (error instanceof GoogleSheetsError) {
      console.error('Google Sheets error:', error);
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    // Generic error
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

### User-Facing Error Messages

```typescript
const errorMessages = {
  validation: {
    email: 'Please enter a valid email address',
    required: 'This field is required',
    minLength: 'This field must be at least {min} characters',
    maxLength: 'This field must be no more than {max} characters',
  },
  api: {
    network: 'Unable to connect. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
    rateLimit: 'Too many requests. Please wait a moment and try again.',
    serverError: 'Something went wrong. Please try again later.',
  },
  sheets: {
    unavailable: 'Service temporarily unavailable. Please try again later.',
    notFound: 'The requested content could not be found.',
  }
};
```

## Security Considerations

### Environment Variables

```bash
# .env.local (never commit to repository)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id

# Optional: Rate limiting configuration
RATE_LIMIT_WINDOW=60000  # 1 minute in milliseconds
RATE_LIMIT_MAX_REQUESTS=5
```

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  // Remove HTML tags and scripts
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Trim whitespace
  return cleaned.trim();
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
```

### Rate Limiting Implementation

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Usage in API route
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  try {
    await limiter.check(5, ip); // 5 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Process request...
}
```

## Performance Optimization

### Caching Strategy

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';

export const CACHE_TAGS = {
  BLOG_POSTS: 'blog-posts',
  BLOG_POST: 'blog-post',
  CATEGORIES: 'categories',
  TAGS: 'tags',
} as const;

export const CACHE_REVALIDATE = {
  BLOG: 3600,        // 1 hour
  STATIC: 86400,     // 24 hours
  DYNAMIC: 300,      // 5 minutes
} as const;

// Cached blog posts fetcher
export const getCachedBlogPosts = unstable_cache(
  async () => {
    const posts = await googleSheetsService.getBlogPosts();
    return posts.filter(post => post.status === 'published');
  },
  ['blog-posts-list'],
  {
    revalidate: CACHE_REVALIDATE.BLOG,
    tags: [CACHE_TAGS.BLOG_POSTS],
  }
);

// On-demand revalidation
import { revalidateTag } from 'next/cache';

export async function revalidateBlogPosts() {
  revalidateTag(CACHE_TAGS.BLOG_POSTS);
}
```

### Image Optimization

```typescript
// components/optimized-image.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 1200,
  height = 630,
  priority = false
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
    />
  );
}
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const BlogSearch = dynamic(() => import('@/components/blog-search'), {
  loading: () => <SearchSkeleton />,
  ssr: false, // Client-side only
});

const NewsletterForm = dynamic(() => import('@/components/newsletter-form'), {
  loading: () => <FormSkeleton />,
});
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/validators.test.ts
import { validateEmail, validateContactForm } from '@/lib/validators';

describe('Email Validation', () => {
  it('should validate correct email format', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

describe('Contact Form Validation', () => {
  it('should validate complete form data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Inquiry',
      message: 'Hello world'
    };
    
    expect(() => validateContactForm(data)).not.toThrow();
  });

  it('should throw error for missing required fields', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
    };
    
    expect(() => validateContactForm(data)).toThrow(ValidationError);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/newsletter.test.ts
import { POST } from '@/app/api/newsletter/route';

describe('Newsletter API', () => {
  it('should accept valid subscription', async () => {
    const request = new Request('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        source: '/services'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject invalid email', async () => {
    const request = new Request('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        source: '/services'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

## Deployment Considerations

### Environment Setup

1. **Google Service Account Setup:**
   - Create service account in Google Cloud Console
   - Generate JSON key file
   - Share Google Sheet with service account email
   - Add credentials to environment variables

2. **Vercel Deployment:**
   - Add environment variables in Vercel dashboard
   - Configure build settings for Next.js 16
   - Set up automatic deployments from main branch

3. **Domain Configuration:**
   - Configure custom domain
   - Set up SSL certificate
   - Configure DNS records

### Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital',
  },
};

module.exports = nextConfig;
```

## Migration Plan

### Phase 1: Foundation (Week 1)
1. Upgrade Next.js to version 16
2. Set up Google Sheets API integration
3. Implement authentication and basic service wrapper
4. Create type definitions and validators

### Phase 2: Core Features (Week 2)
1. Implement blog listing and detail pages
2. Create newsletter subscription functionality
3. Enhance contact form with Google Sheets integration
4. Implement caching strategy

### Phase 3: Additional Pages (Week 3)
1. Build services page
2. Build about page
3. Update navigation and footer components
4. Implement breadcrumb navigation

### Phase 4: Polish & Testing (Week 4)
1. Implement error handling and loading states
2. Add SEO metadata and sitemap
3. Performance optimization
4. Testing and bug fixes
5. Documentation

### Phase 5: Deployment
1. Environment setup
2. Production deployment
3. Monitoring and analytics setup
4. Post-launch testing

## Maintenance and Monitoring

### Logging Strategy

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  }
};
```

### Monitoring Checklist

- [ ] Set up error tracking (Sentry or similar)
- [ ] Monitor API response times
- [ ] Track Google Sheets API quota usage
- [ ] Monitor cache hit rates
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical errors
- [ ] Track form submission success rates

## Conclusion

This design document provides a comprehensive blueprint for converting the Colour Clouds Digital single-page site into a multipage portfolio with Google Sheets integration. The architecture prioritizes security, performance, and maintainability while providing a seamless user experience. The phased migration plan ensures systematic implementation with minimal disruption to existing functionality.

Key design decisions:
- Server-side Google Sheets operations for security
- Next.js 16 with App Router for modern React features
- Comprehensive caching strategy for performance
- Robust error handling and validation
- Maintainable color scheme (#01A750 green, #0072FF blue, red accents)
- Direct email integration (colourclouds042@gmail.com)
- Mobile-first responsive design
- SEO-optimized metadata and sitemap generation
