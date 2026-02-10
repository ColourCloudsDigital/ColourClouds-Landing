# Implementation Plan: Multipage Portfolio with Google Sheets Integration

## Overview

This implementation plan breaks down the multipage portfolio conversion into discrete, incremental coding tasks. Each task builds on previous work, with property-based tests and unit tests integrated throughout to validate correctness early. The plan follows a phased approach: foundation setup, core features, additional pages, and polish.

## Tasks

- [ ] 1. Upgrade Next.js and setup foundation
  - [x] 1.1 Upgrade Next.js from 14.2.13 to 16
    - Update package.json with Next.js 16 and React 18+ compatible versions
    - Update any deprecated API usage in existing code
    - Test existing landing page functionality after upgrade
    - _Requirements: Foundation for all requirements_
  
  - [x] 1.2 Install required dependencies
    - Add googleapis package for Google Sheets API
    - Add fast-check for property-based testing
    - Add testing libraries (jest, @testing-library/react, @testing-library/jest-dom)
    - Add DOMPurify for input sanitization
    - Add lru-cache for rate limiting
    - _Requirements: 2.1, 11.2, 11.6_
  
  - [x] 1.3 Create TypeScript type definitions
    - Create lib/types.ts with BlogPost, Subscriber, ContactSubmission, GoogleSheetsConfig interfaces
    - Define error types (GoogleSheetsError, ValidationError, RateLimitError)
    - _Requirements: 2.1, 3.5, 4.5, 5.5_

- [ ] 2. Implement Google Sheets service layer
  - [x] 2.1 Create Google Sheets service wrapper
    - Create lib/google-sheets.ts with GoogleSheetsService class
    - Implement JWT authentication with service account
    - Implement initialize(), readSheet(), and appendRow() methods
    - Add error handling with exponential backoff for rate limits
    - Add logging for all operations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 2.2 Write unit tests for Google Sheets service
    - Test authentication initialization
    - Test rate limit error handling (example test)
    - Test generic API error handling
    - _Requirements: 2.4, 2.5_
  
  - [x] 2.3 Write property test for API error handling
    - **Property 3: API Error Handling**
    - **Validates: Requirements 2.5**

- [ ] 3. Implement validation and sanitization utilities
  - [x] 3.1 Create input validators
    - Create lib/validators.ts with validateEmail(), validateContactForm(), validateNewsletterForm()
    - Implement client-side and server-side validation logic
    - _Requirements: 3.3, 3.4, 3.8, 5.3, 5.4, 11.1, 11.5_
  
  - [x] 3.2 Create input sanitization utilities
    - Create lib/sanitize.ts with sanitizeInput() and sanitizeEmail()
    - Use DOMPurify to remove dangerous content
    - _Requirements: 11.2_
  
  - [x] 3.3 Write property test for email validation
    - **Property 8: Email Format Validation**
    - **Validates: Requirements 3.8**
  
  - [x] 3.4 Write property test for input sanitization
    - **Property 29: Input Sanitization**
    - **Validates: Requirements 11.2**
  
  - [x] 3.5 Write property test for dual validation
    - **Property 28: Dual Validation Enforcement**
    - **Validates: Requirements 11.1**
  
  - [x] 3.6 Write unit tests for validators
    - Test valid email formats
    - Test invalid email formats
    - Test empty email (edge case)
    - Test missing required fields
    - _Requirements: 3.3, 3.4, 3.8, 5.3, 5.4_

- [ ] 4. Implement caching layer
  - [x] 4.1 Create cache utilities
    - Create lib/cache.ts with cache tags and revalidation constants
    - Implement getCachedBlogPosts() using unstable_cache
    - Implement revalidateBlogPosts() for on-demand revalidation
    - _Requirements: 2.6, 4.11, 12.1, 12.4_
  
  - [x] 4.2 Write property test for cache serving
    - **Property 31: Cache Serving Before Expiration**
    - **Validates: Requirements 12.5**

- [ ] 5. Implement rate limiting
  - [x] 5.1 Create rate limiting utility
    - Create lib/rate-limit.ts with rateLimit() function using LRU cache
    - Configure rate limits (5 requests per minute for forms, 10 for API)
    - _Requirements: 11.6_
  
  - [x] 5.2 Write unit test for rate limiting
    - Test rate limit enforcement (edge case)
    - Test rate limit reset after window
    - _Requirements: 11.6_

- [x] 6. Checkpoint - Ensure foundation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement newsletter subscription feature
  - [x] 7.1 Create newsletter API route
    - Create app/api/newsletter/route.ts with POST handler
    - Implement validation, sanitization, and rate limiting
    - Integrate with Google Sheets service to store subscriptions
    - Return appropriate success/error responses
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.8_
  
  - [x] 7.2 Create newsletter form component
    - Create components/newsletter-form.tsx with form state management
    - Implement client-side validation
    - Add loading states during submission
    - Display success/error toast notifications using Sonner
    - _Requirements: 3.1, 3.6, 3.7, 9.2, 9.4_
  
  - [x] 7.3 Write property test for valid email storage
    - **Property 4: Newsletter Valid Email Storage**
    - **Validates: Requirements 3.2, 3.5**
  
  - [x] 7.4 Write property test for invalid email rejection
    - **Property 5: Newsletter Invalid Email Rejection**
    - **Validates: Requirements 3.3**
  
  - [x] 7.5 Write property test for success notification
    - **Property 6: Newsletter Success Notification**
    - **Validates: Requirements 3.6**
  
  - [x] 7.6 Write property test for error notification
    - **Property 7: Newsletter Error Notification**
    - **Validates: Requirements 3.7**
  
  - [x] 7.7 Write integration tests for newsletter API
    - Test valid subscription acceptance
    - Test invalid email rejection
    - Test rate limit enforcement
    - _Requirements: 3.2, 3.3, 11.6_

- [ ] 8. Implement contact form enhancement
  - [x] 8.1 Create contact API route
    - Create app/api/contact/route.ts with POST handler
    - Implement validation, sanitization, and rate limiting
    - Add spam protection (honeypot field, time-based validation)
    - Integrate with Google Sheets service to store submissions
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.8_
  
  - [x] 8.2 Create or update contact page
    - Create/update app/contact/page.tsx with enhanced form
    - Add form fields: name, email, subject, message
    - Implement client-side validation
    - Add loading states and toast notifications
    - Display contact information (email: colourclouds042@gmail.com, phone, social media)
    - Add mailto link and click-to-call functionality
    - _Requirements: 5.1, 5.6, 5.7, 5.9, 5.10, 9.2, 9.4_
  
  - [x] 8.3 Write property test for valid submission storage
    - **Property 13: Contact Form Valid Submission Storage**
    - **Validates: Requirements 5.2, 5.5**
  
  - [x] 8.4 Write property test for missing fields validation
    - **Property 14: Contact Form Missing Fields Validation**
    - **Validates: Requirements 5.3**
  
  - [x] 8.5 Write property test for email validation
    - **Property 15: Contact Form Email Validation**
    - **Validates: Requirements 5.4**
  
  - [x] 8.6 Write property test for success notification
    - **Property 16: Contact Success Notification**
    - **Validates: Requirements 5.6**
  
  - [x] 8.7 Write property test for error notification
    - **Property 17: Contact Error Notification**
    - **Validates: Requirements 5.7**
  
  - [x] 8.8 Write property test for invalid data rejection
    - **Property 30: Invalid Data Rejection**
    - **Validates: Requirements 11.5**

- [ ] 9. Implement blog data layer
  - [x] 9.1 Add blog-specific methods to Google Sheets service
    - Implement getBlogPosts() to retrieve all published posts
    - Implement getBlogPostBySlug(slug) to retrieve single post
    - Add filtering logic for published status
    - _Requirements: 4.1, 4.2_
  
  - [x] 9.2 Create blog API route
    - Create app/api/blog/route.ts with GET handler
    - Support query parameters for category, tag, and search filtering
    - Integrate with caching layer
    - _Requirements: 4.9, 4.10_
  
  - [x] 9.3 Write property test for published filter
    - **Property 9: Blog Listing Published Filter**
    - **Validates: Requirements 4.2**
  
  - [x] 9.4 Write property test for required fields
    - **Property 10: Blog Post Required Fields**
    - **Validates: Requirements 4.5**
  
  - [x] 9.5 Write property test for filter accuracy
    - **Property 12: Blog Filter Accuracy**
    - **Validates: Requirements 4.10**

- [ ] 10. Implement blog listing page
  - [x] 10.1 Create blog listing page
    - Create app/blog/page.tsx with server-side rendering
    - Fetch blog posts using cached data
    - Implement ISR with 1-hour revalidation
    - Display loading states during data fetching
    - _Requirements: 1.4, 4.2, 9.1, 12.7_
  
  - [x] 10.2 Create blog card component
    - Create components/blog-card.tsx to display post preview
    - Show title, excerpt, author, date, featured image, category, tags
    - Add link to blog post detail page
    - _Requirements: 4.5_
  
  - [x] 10.3 Create blog search component
    - Create components/blog-search.tsx with search input
    - Implement client-side filtering of posts
    - _Requirements: 4.9_
  
  - [x] 10.4 Create blog filter component
    - Create components/blog-filter.tsx with category and tag filters
    - Implement client-side filtering logic
    - _Requirements: 4.10_
  
  - [x] 10.5 Write property test for data fetching loading indicator
    - **Property 23: Data Fetching Loading Indicator**
    - **Validates: Requirements 9.1**

- [ ] 11. Implement blog post detail page
  - [x] 11.1 Create blog post detail page
    - Create app/blog/[slug]/page.tsx with dynamic routing
    - Implement generateStaticParams() for static generation
    - Fetch blog post by slug with caching
    - Display full blog post content with markdown rendering
    - Handle 404 for non-existent posts
    - _Requirements: 1.5, 4.3, 4.4, 4.6, 4.7_
  
  - [x] 11.2 Implement related posts logic
    - Create function to find related posts by category/tags
    - Create components/related-posts.tsx to display related posts
    - _Requirements: 4.8_
  
  - [x] 11.3 Generate blog post metadata
    - Implement generateMetadata() for dynamic SEO
    - Generate title, description, and Open Graph tags from post data
    - _Requirements: 6.1, 6.6_
  
  - [x] 11.4 Write property test for related posts matching
    - **Property 11: Related Posts Matching**
    - **Validates: Requirements 4.8**
  
  - [x] 11.5 Write property test for blog post metadata
    - **Property 21: Blog Post Metadata Generation**
    - **Validates: Requirements 6.6**
  
  - [x] 11.6 Write unit test for 404 handling
    - Test non-existent blog post returns 404 (example test)
    - _Requirements: 4.6_

- [x] 12. Checkpoint - Ensure blog tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Create services page
  - [x] 13.1 Create services page
    - Create app/services/page.tsx with static content
    - Add hero section with value proposition
    - Create sections for app development and digital content creation
    - Include service descriptions with icons/images
    - Add call-to-action buttons linking to /contact
    - Implement responsive design for mobile, tablet, desktop
    - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 13.2 Add services page metadata
    - Implement metadata export with title, description, Open Graph tags
    - _Requirements: 6.1, 6.3, 6.7_

- [ ] 14. Create about page
  - [x] 14.1 Create about page
    - Create app/about/page.tsx with static content
    - Add company story and mission statement sections
    - Add vision statement section
    - Include company values/principles
    - Add team member profiles (optional)
    - Implement responsive design for mobile, tablet, desktop
    - _Requirements: 1.3, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 14.2 Add about page metadata
    - Implement metadata export with title, description, Open Graph tags
    - _Requirements: 6.1, 6.3, 6.7_

- [ ] 15. Implement navigation and footer components
  - [x] 15.1 Create or update main navigation component
    - Create/update components/navigation.tsx with links to all pages
    - Include links: Home (/), Services (/services), About (/about), Blog (/blog), Contact (/contact)
    - Ensure consistent display across all pages
    - Implement mobile-responsive menu
    - _Requirements: 1.7, 1.9_
  
  - [x] 15.2 Create or update footer component
    - Create/update components/footer.tsx with links to all pages
    - Include newsletter subscription form
    - Add social media links
    - Ensure consistent display across all pages
    - _Requirements: 1.8_
  
  - [x] 15.3 Write property test for navigation consistency
    - **Property 1: Navigation Component Consistency**
    - **Validates: Requirements 1.7**
  
  - [x] 15.4 Write property test for footer consistency
    - **Property 2: Footer Component Consistency**
    - **Validates: Requirements 1.8**

- [ ] 16. Implement breadcrumb navigation
  - [x] 16.1 Create breadcrumb component
    - Create components/breadcrumb.tsx with dynamic breadcrumb generation
    - Add structured data markup for SEO
    - Implement accessible navigation with aria-labels
    - Style consistently with brand colors
    - _Requirements: 10.4, 10.5_
  
  - [x] 16.2 Add breadcrumbs to blog post pages
    - Add breadcrumb to app/blog/[slug]/page.tsx showing "Home > Blog > [Post Title]"
    - _Requirements: 10.1_
  
  - [x] 16.3 Add breadcrumbs to other pages
    - Add breadcrumb to services page: "Home > Services"
    - Add breadcrumb to about page: "Home > About"
    - _Requirements: 10.2, 10.3_
  
  - [x] 16.4 Write property test for blog breadcrumb pattern
    - **Property 27: Blog Post Breadcrumb Pattern**
    - **Validates: Requirements 10.1**
  
  - [x] 16.5 Write unit tests for breadcrumb examples
    - Test services page breadcrumb (example test)
    - Test about page breadcrumb (example test)
    - _Requirements: 10.2, 10.3_

- [ ] 17. Implement SEO and metadata
  - [x] 17.1 Add metadata to all pages
    - Add metadata exports to home, services, about, blog, contact pages
    - Include title, description, Open Graph tags, canonical URLs
    - Ensure proper heading hierarchy (h1, h2, h3) on all pages
    - _Requirements: 6.1, 6.2, 6.3, 6.7_
  
  - [x] 17.2 Create sitemap
    - Create app/sitemap.ts to generate dynamic sitemap
    - Include all static pages and dynamic blog post pages
    - _Requirements: 6.5_
  
  - [x] 17.3 Optimize images
    - Update all image usage to use Next.js Image component
    - Configure image domains in next.config.js
    - Implement lazy loading for below-the-fold images
    - _Requirements: 6.4, 12.2, 12.3_
  
  - [x] 17.4 Write property test for page metadata completeness
    - **Property 18: Page Metadata Completeness**
    - **Validates: Requirements 6.1**
  
  - [x] 17.5 Write property test for heading hierarchy
    - **Property 19: Heading Hierarchy Compliance**
    - **Validates: Requirements 6.2**
  
  - [x] 17.6 Write property test for Open Graph tags
    - **Property 20: Open Graph Tags Presence**
    - **Validates: Requirements 6.3**
  
  - [x] 17.7 Write property test for canonical URLs
    - **Property 22: Canonical URL Presence**
    - **Validates: Requirements 6.7**
  
  - [x] 17.8 Write unit test for sitemap generation
    - Test sitemap includes all expected pages (example test)
    - _Requirements: 6.5_

- [ ] 18. Implement error handling and boundaries
  - [x] 18.1 Create error boundary component
    - Create components/error-boundary.tsx with React error boundary
    - Add fallback UI for caught errors
    - _Requirements: 9.5_
  
  - [x] 18.2 Create custom error pages
    - Create app/not-found.tsx for 404 errors
    - Create app/error.tsx for 500 errors
    - Style consistently with brand design
    - _Requirements: 9.6_
  
  - [x] 18.3 Add error handling to all API routes
    - Ensure all API routes return appropriate error responses
    - Log errors for debugging
    - Return user-friendly error messages
    - _Requirements: 2.5, 9.3, 9.4_
  
  - [x] 18.4 Write property test for data fetching error display
    - **Property 25: Data Fetching Error Display**
    - **Validates: Requirements 9.3**
  
  - [x] 18.5 Write property test for form submission error notification
    - **Property 26: Form Submission Error Notification**
    - **Validates: Requirements 9.4**
  
  - [ ] 18.6 Write property test for form loading state
    - **Property 24: Form Submission Loading State**
    - **Validates: Requirements 9.2**
  
  - [~] 18.7 Write unit test for page load failure
    - Test page load failure displays error page (example test)
    - _Requirements: 9.6_

- [ ] 19. Update root layout and home page
  - [x] 19.1 Update root layout
    - Update app/layout.tsx to include navigation and footer
    - Wrap children with error boundary
    - Ensure consistent layout across all pages
    - _Requirements: 1.7, 1.8, 9.5_
  
  - [~] 19.2 Verify home page
    - Ensure app/page.tsx (home page) works with new layout
    - Maintain existing landing page design and functionality
    - _Requirements: 1.1, 1.10_

- [ ] 20. Environment configuration and security
  - [x] 20.1 Create environment variable template
    - Create .env.example with required variables
    - Document GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
    - Document rate limiting configuration
    - _Requirements: 2.2, 11.3_
  
  - [x] 20.2 Update next.config.js
    - Configure image domains for external images
    - Set up environment variables
    - Configure build settings for Next.js 16
    - _Requirements: 6.4, 12.2_
  
  - [~] 20.3 Verify security measures
    - Ensure API credentials never exposed in client code
    - Verify all API routes use HTTPS
    - Confirm rate limiting is active on all form endpoints
    - _Requirements: 11.3, 11.4, 11.6, 11.7_

- [~] 21. Final checkpoint - Comprehensive testing
  - Run all unit tests and property-based tests
  - Test all pages in development environment
  - Verify mobile responsiveness on all pages
  - Test form submissions end-to-end
  - Verify Google Sheets integration
  - Check loading states and error handling
  - Validate SEO metadata on all pages
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Performance optimization
  - [~] 22.1 Verify caching implementation
    - Confirm blog posts are cached with 1-hour TTL
    - Test cache invalidation works correctly
    - Verify ISR is working for blog pages
    - _Requirements: 2.6, 4.11, 12.1, 12.4, 12.5, 12.6, 12.7_
  
  - [~] 22.2 Optimize bundle size
    - Analyze bundle size with Next.js build analyzer
    - Implement dynamic imports for heavy components
    - Remove unused dependencies
    - _Requirements: 12.1_
  
  - [~] 22.3 Performance testing
    - Test page load times
    - Verify image optimization is working
    - Check API response times
    - _Requirements: 12.2, 12.3_

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities to address issues
- Property tests validate universal correctness properties across all inputs (minimum 100 iterations each)
- Unit tests validate specific examples, edge cases, and error conditions
- All Google Sheets operations must be server-side to protect API credentials
- Brand colors must be maintained: green #01A750, blue #0072FF, red
- Direct email integration: colourclouds042@gmail.com
- Next.js 16 upgrade is the first critical step before other implementation
