/**
 * Property-Based Test for Blog Post Breadcrumb Pattern
 * 
 * Tests universal property of breadcrumb navigation on blog post pages:
 * - Property 27: Blog Post Breadcrumb Pattern
 * 
 * **Validates: Requirements 10.1**
 * 
 * Requirement 10.1: WHEN a user is on a blog post detail page, THE System SHALL 
 * display breadcrumb navigation showing Home > Blog > [Post Title]
 */

/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb';

// Helper to generate safe ISO date strings
const safeISODate = () => fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2025-12-31').getTime() 
}).map(timestamp => new Date(timestamp).toISOString());

// ============================================================================
// Property 27: Blog Post Breadcrumb Pattern
// ============================================================================

describe('Property 27: Blog Post Breadcrumb Pattern', () => {
  /**
   * **Validates: Requirements 10.1**
   * 
   * Requirement 10.1: WHEN a user is on a blog post detail page, THE System SHALL 
   * display breadcrumb navigation showing Home > Blog > [Post Title]
   * 
   * Property: For any blog post with a title and slug, when the breadcrumb 
   * component is rendered on the blog post detail page, the system SHALL:
   * 1. Display exactly 3 breadcrumb items
   * 2. First item must be "Home" with href "/"
   * 3. Second item must be "Blog" with href "/blog"
   * 4. Third item must be the post title with href "/blog/[slug]"
   * 5. First two items must be clickable links
   * 6. Last item (post title) must be plain text with aria-current="page"
   * 7. Items must be separated by visual separators
   * 8. Maintain consistent structure regardless of post title content
   */

  it('should display breadcrumb with Home > Blog > [Post Title] pattern for any blog post', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various titles and slugs
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,100}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'"&()]{5,200}$/),
          author: fc.stringMatching(/^[a-zA-Z\s\-']{2,100}$/),
          publishedAt: safeISODate(),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,200}$/),
        }),
        (post) => {
          // Create breadcrumb items following the required pattern
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb component
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Must have exactly 3 breadcrumb items
            const listItems = container.querySelectorAll('li');
            expect(listItems.length).toBe(3);

            // Property 2: First item must be "Home" with href "/"
            const homeText = container.querySelector('a[href="/"]');
            expect(homeText).toBeTruthy();
            expect(homeText?.textContent).toBe('Home');

            // Property 3: Second item must be "Blog" with href "/blog"
            const blogText = container.querySelector('a[href="/blog"]');
            expect(blogText).toBeTruthy();
            expect(blogText?.textContent).toBe('Blog');

            // Property 4: Third item must be the post title with correct href
            const postTitleText = container.querySelector('span[aria-current="page"]');
            expect(postTitleText).toBeTruthy();
            expect(postTitleText?.textContent).toBe(post.title);
            
            // Property 5: First two items must be clickable links
            expect(homeText?.tagName).toBe('A');
            expect(blogText?.tagName).toBe('A');

            // Property 6: Last item (post title) must be plain text with aria-current="page"
            expect(postTitleText?.tagName).toBe('SPAN');
            expect(postTitleText?.getAttribute('aria-current')).toBe('page');
            
            // Verify it's not a link
            const postTitleLink = postTitleText?.closest('a');
            expect(postTitleLink).toBeNull();

            // Property 7: Items must be separated by visual separators
            // Should have 2 separators for 3 items (between items, not before first)
            const separators = container.querySelectorAll('svg[aria-hidden="true"]');
            expect(separators.length).toBe(2);

            // Property 8: Breadcrumb must have accessible navigation label
            const nav = container.querySelector('nav[aria-label="Breadcrumb navigation"]');
            expect(nav).toBeTruthy();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain correct breadcrumb order for all blog posts', () => {
    fc.assert(
      fc.property(
        // Generate various blog post titles and slugs
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property: Items must appear in the correct order
            const listItems = container.querySelectorAll('li');
            expect(listItems.length).toBe(3);

            // Get text content of each item (trimmed to match browser behavior)
            const itemTexts = Array.from(listItems).map(li => {
              const link = li.querySelector('a');
              const span = li.querySelector('span');
              return (link?.textContent || span?.textContent || '').trim();
            });

            // Property: Order must be Home, Blog, Post Title (trimmed)
            expect(itemTexts[0]).toBe('Home');
            expect(itemTexts[1]).toBe('Blog');
            expect(itemTexts[2]).toBe(post.title.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct href attributes for all breadcrumb items', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various slugs
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Home link must point to "/"
            const homeLink = container.querySelector('a[href="/"]');
            expect(homeLink).toBeTruthy();
            expect(homeLink?.getAttribute('href')).toBe('/');

            // Property 2: Blog link must point to "/blog"
            const blogLink = container.querySelector('a[href="/blog"]');
            expect(blogLink).toBeTruthy();
            expect(blogLink?.getAttribute('href')).toBe('/blog');

            // Property 3: Post title should not be a link (it's the current page)
            const postTitle = container.querySelector('span[aria-current="page"]');
            expect(postTitle).toBeTruthy();
            expect(postTitle?.textContent).toBe(post.title);
            expect(postTitle?.getAttribute('aria-current')).toBe('page');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve special characters in blog post titles', () => {
    fc.assert(
      fc.property(
        // Generate posts with special characters in titles
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'"&()]{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property: Post title should be preserved exactly as provided
            const postTitle = container.querySelector('span[aria-current="page"]');
            expect(postTitle).toBeTruthy();
            expect(postTitle?.textContent).toBe(post.title);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include structured data with correct breadcrumb hierarchy', () => {
    fc.assert(
      fc.property(
        // Generate blog posts
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Must include structured data script
            const script = container.querySelector('script[type="application/ld+json"]');
            expect(script).toBeTruthy();

            if (script) {
              const structuredData = JSON.parse(script.textContent || '{}');

              // Property 2: Must be BreadcrumbList type
              expect(structuredData['@type']).toBe('BreadcrumbList');
              expect(structuredData['@context']).toBe('https://schema.org');

              // Property 3: Must have exactly 3 items
              expect(structuredData.itemListElement).toHaveLength(3);

              // Property 4: First item must be Home
              expect(structuredData.itemListElement[0].name).toBe('Home');
              expect(structuredData.itemListElement[0].position).toBe(1);
              expect(structuredData.itemListElement[0]['@type']).toBe('ListItem');

              // Property 5: Second item must be Blog
              expect(structuredData.itemListElement[1].name).toBe('Blog');
              expect(structuredData.itemListElement[1].position).toBe(2);
              expect(structuredData.itemListElement[1]['@type']).toBe('ListItem');

              // Property 6: Third item must be the post title
              expect(structuredData.itemListElement[2].name).toBe(post.title);
              expect(structuredData.itemListElement[2].position).toBe(3);
              expect(structuredData.itemListElement[2]['@type']).toBe('ListItem');

              // Property 7: All items must have correct URLs
              const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital';
              expect(structuredData.itemListElement[0].item).toBe(`${baseUrl}/`);
              expect(structuredData.itemListElement[1].item).toBe(`${baseUrl}/blog`);
              expect(structuredData.itemListElement[2].item).toBe(`${baseUrl}/blog/${post.slug}`);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply consistent styling to breadcrumb links', () => {
    fc.assert(
      fc.property(
        // Generate blog posts
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Home link should have brand color classes
            const homeLink = container.querySelector('a[href="/"]');
            expect(homeLink).toBeTruthy();
            expect(homeLink?.classList.contains('text-cc-blue')).toBe(true);
            expect(homeLink?.classList.contains('hover:text-cc-green')).toBe(true);

            // Property 2: Blog link should have brand color classes
            const blogLink = container.querySelector('a[href="/blog"]');
            expect(blogLink).toBeTruthy();
            expect(blogLink?.classList.contains('text-cc-blue')).toBe(true);
            expect(blogLink?.classList.contains('hover:text-cc-green')).toBe(true);

            // Property 3: Current page (post title) should have gray text
            const postTitle = container.querySelector('span[aria-current="page"]');
            expect(postTitle).toBeTruthy();
            expect(postTitle?.classList.contains('text-gray-600')).toBe(true);
            expect(postTitle?.classList.contains('font-medium')).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain breadcrumb pattern consistency across multiple renders', () => {
    fc.assert(
      fc.property(
        // Generate blog post and render count
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
          renderCount: fc.integer({ min: 2, max: 5 }),
        }),
        ({ slug, title, renderCount }) => {
          const capturedStructures: Array<{
            itemCount: number;
            firstLabel: string;
            secondLabel: string;
            thirdLabel: string;
            firstHref: string | null;
            secondHref: string | null;
            thirdIsLink: boolean;
          }> = [];

          // Render multiple times
          for (let i = 0; i < renderCount; i++) {
            const breadcrumbItems: BreadcrumbItem[] = [
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: title, href: `/blog/${slug}` },
            ];

            const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

            // Capture structure
            const listItems = container.querySelectorAll('li');
            const homeLink = container.querySelector('a[href="/"]');
            const blogLink = container.querySelector('a[href="/blog"]');
            const postTitle = container.querySelector('span[aria-current="page"]');

            const structure = {
              itemCount: listItems.length,
              firstLabel: homeLink?.textContent || '',
              secondLabel: blogLink?.textContent || '',
              thirdLabel: postTitle?.textContent || '',
              firstHref: homeLink?.getAttribute('href') || null,
              secondHref: blogLink?.getAttribute('href') || null,
              thirdIsLink: postTitle?.tagName === 'A',
            };

            capturedStructures.push(structure);
            unmount();
          }

          // Property: All renders should have identical structure
          for (let i = 1; i < capturedStructures.length; i++) {
            expect(capturedStructures[i]).toEqual(capturedStructures[0]);
          }

          // Property: Structure should match expected pattern
          expect(capturedStructures[0].itemCount).toBe(3);
          expect(capturedStructures[0].firstLabel).toBe('Home');
          expect(capturedStructures[0].secondLabel).toBe('Blog');
          expect(capturedStructures[0].thirdLabel).toBe(title);
          expect(capturedStructures[0].firstHref).toBe('/');
          expect(capturedStructures[0].secondHref).toBe('/blog');
          expect(capturedStructures[0].thirdIsLink).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle blog posts with very long titles', () => {
    fc.assert(
      fc.property(
        // Generate posts with long titles
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{50,200}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Must still have exactly 3 items
            const listItems = container.querySelectorAll('li');
            expect(listItems.length).toBe(3);

            // Property 2: Long title should be preserved completely
            const postTitle = container.querySelector('span[aria-current="page"]');
            expect(postTitle).toBeTruthy();
            expect(postTitle?.textContent).toBe(post.title);

            // Property 3: Pattern should still be maintained
            const homeLink = container.querySelector('a[href="/"]');
            const blogLink = container.querySelector('a[href="/blog"]');
            expect(homeLink?.textContent).toBe('Home');
            expect(blogLink?.textContent).toBe('Blog');
            expect(postTitle?.getAttribute('aria-current')).toBe('page');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should have accessible navigation for all blog posts', () => {
    fc.assert(
      fc.property(
        // Generate blog posts
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Must have navigation role with label
            const nav = container.querySelector('nav[aria-label="Breadcrumb navigation"]');
            expect(nav).toBeTruthy();
            expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb navigation');

            // Property 2: Links must have accessible labels
            const homeLink = container.querySelector('a[aria-label="Navigate to Home"]');
            expect(homeLink).toBeTruthy();
            expect(homeLink?.getAttribute('aria-label')).toBe('Navigate to Home');

            const blogLink = container.querySelector('a[aria-label="Navigate to Blog"]');
            expect(blogLink).toBeTruthy();
            expect(blogLink?.getAttribute('aria-label')).toBe('Navigate to Blog');

            // Property 3: Current page must have aria-current
            const postTitle = container.querySelector('span[aria-current="page"]');
            expect(postTitle).toBeTruthy();
            expect(postTitle?.getAttribute('aria-current')).toBe('page');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should render separators correctly between breadcrumb items', () => {
    fc.assert(
      fc.property(
        // Generate blog posts
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property 1: Must have exactly 2 separators for 3 items
            const separators = container.querySelectorAll('svg[aria-hidden="true"]');
            expect(separators.length).toBe(2);

            // Property 2: Separators should be hidden from screen readers
            separators.forEach(separator => {
              expect(separator.getAttribute('aria-hidden')).toBe('true');
            });

            // Property 3: No separator before the first item
            const firstListItem = container.querySelector('li');
            const firstSeparator = firstListItem?.querySelector('svg[aria-hidden="true"]');
            expect(firstSeparator).toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain breadcrumb pattern for posts with minimal titles', () => {
    fc.assert(
      fc.property(
        // Generate posts with short titles
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]{3,20}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,15}$/),
        }),
        (post) => {
          // Create breadcrumb items
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ];

          // Render breadcrumb
          const { container, unmount } = render(<Breadcrumb items={breadcrumbItems} />);

          try {
            // Property: Pattern should be maintained even for short titles
            const listItems = container.querySelectorAll('li');
            expect(listItems.length).toBe(3);

            const homeLink = container.querySelector('a[href="/"]');
            const blogLink = container.querySelector('a[href="/blog"]');
            const postTitle = container.querySelector('span[aria-current="page"]');

            expect(homeLink?.textContent).toBe('Home');
            expect(blogLink?.textContent).toBe('Blog');
            expect(postTitle?.textContent).toBe(post.title);
            expect(postTitle?.getAttribute('aria-current')).toBe('page');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
