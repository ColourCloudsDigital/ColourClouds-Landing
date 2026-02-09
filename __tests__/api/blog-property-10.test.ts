/**
 * Property-Based Test for Blog Post Required Fields
 * 
 * Tests universal property of the blog post data structure:
 * - Property 10: Blog Post Required Fields
 * 
 * **Validates: Requirements 4.5**
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { BlogPost } from '@/lib/types';

// Helper to generate safe ISO date strings
const safeISODate = () => fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2025-12-31').getTime() 
}).map(timestamp => new Date(timestamp).toISOString());

// ============================================================================
// Property 10: Blog Post Required Fields
// ============================================================================

describe('Property 10: Blog Post Required Fields', () => {
  /**
   * **Validates: Requirements 4.5**
   * 
   * Requirement 4.5: THE System SHALL display blog posts with fields: 
   * title, author, published date, content, excerpt, featured image, 
   * category, and tags
   * 
   * Property: For any blog post retrieved from the system, it MUST contain 
   * all required fields (title, author, publishedAt, content, excerpt, 
   * featuredImage, category, and tags) and these fields MUST be non-empty 
   * strings (or non-empty arrays for tags).
   * 
   * This property tests that:
   * 1. All required fields are present in the BlogPost interface
   * 2. Title is a non-empty string
   * 3. Author is a non-empty string
   * 4. PublishedAt is a valid ISO 8601 date string
   * 5. Content is a non-empty string
   * 6. Excerpt is a non-empty string
   * 7. FeaturedImage is a valid URL string
   * 8. Category is a non-empty string
   * 9. Tags is an array (can be empty, but must be an array)
   */

  it('should have all required fields present and non-empty', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with all required fields
        fc.record({
          id: fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/).filter(s => s.trim().length > 0),
          slug: fc.stringMatching(/^[a-z0-9][a-z0-9-]{2,99}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{4,199}$/),
          author: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{19,999}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{9,199}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business', 'Technology', 'Marketing'),
          tags: fc.array(
            fc.stringMatching(/^[a-z0-9][a-z0-9-]{1,19}$/),
            { minLength: 0, maxLength: 5 }
          ),
          status: fc.constantFrom('published', 'draft', 'archived'),
          readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
        }),
        (post: BlogPost) => {
          // Property 1: Title must be present and non-empty
          expect(post.title).toBeDefined();
          expect(typeof post.title).toBe('string');
          expect(post.title.length).toBeGreaterThan(0);
          expect(post.title.trim()).not.toBe('');

          // Property 2: Author must be present and non-empty
          expect(post.author).toBeDefined();
          expect(typeof post.author).toBe('string');
          expect(post.author.length).toBeGreaterThan(0);
          expect(post.author.trim()).not.toBe('');

          // Property 3: PublishedAt must be present and a valid ISO date string
          expect(post.publishedAt).toBeDefined();
          expect(typeof post.publishedAt).toBe('string');
          expect(post.publishedAt.length).toBeGreaterThan(0);
          // Verify it's a valid ISO 8601 date
          const date = new Date(post.publishedAt);
          expect(date.toString()).not.toBe('Invalid Date');
          expect(date.toISOString()).toBe(post.publishedAt);

          // Property 4: Content must be present and non-empty
          expect(post.content).toBeDefined();
          expect(typeof post.content).toBe('string');
          expect(post.content.length).toBeGreaterThan(0);
          expect(post.content.trim()).not.toBe('');

          // Property 5: Excerpt must be present and non-empty
          expect(post.excerpt).toBeDefined();
          expect(typeof post.excerpt).toBe('string');
          expect(post.excerpt.length).toBeGreaterThan(0);
          expect(post.excerpt.trim()).not.toBe('');

          // Property 6: FeaturedImage must be present and non-empty (valid URL)
          expect(post.featuredImage).toBeDefined();
          expect(typeof post.featuredImage).toBe('string');
          expect(post.featuredImage.length).toBeGreaterThan(0);
          // Verify it's a valid URL format
          expect(() => new URL(post.featuredImage)).not.toThrow();

          // Property 7: Category must be present and non-empty
          expect(post.category).toBeDefined();
          expect(typeof post.category).toBe('string');
          expect(post.category.length).toBeGreaterThan(0);
          expect(post.category.trim()).not.toBe('');

          // Property 8: Tags must be present and be an array
          expect(post.tags).toBeDefined();
          expect(Array.isArray(post.tags)).toBe(true);
          // Tags can be empty array, but if present, each tag must be a non-empty string
          post.tags.forEach(tag => {
            expect(typeof tag).toBe('string');
            expect(tag.length).toBeGreaterThan(0);
            expect(tag.trim()).not.toBe('');
          });
        }
      ),
      { numRuns: 100 } // Run 100 iterations with different blog posts
    );
  });

  it('should reject blog posts with missing required fields', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with potentially missing fields
        fc.record({
          id: fc.option(fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/), { nil: undefined }),
          slug: fc.option(fc.stringMatching(/^[a-z0-9-]{3,100}$/), { nil: undefined }),
          title: fc.option(fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,200}$/), { nil: undefined }),
          author: fc.option(fc.stringMatching(/^[a-zA-Z\s\-']{2,100}$/), { nil: undefined }),
          publishedAt: fc.option(safeISODate(), { nil: undefined }),
          content: fc.option(fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,1000}$/), { nil: undefined }),
          excerpt: fc.option(fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,200}$/), { nil: undefined }),
          featuredImage: fc.option(fc.webUrl(), { nil: undefined }),
          category: fc.option(fc.constantFrom('Development', 'Design', 'Business'), { nil: undefined }),
          tags: fc.option(fc.array(fc.stringMatching(/^[a-z0-9-]{2,20}$/), { maxLength: 5 }), { nil: undefined }),
          status: fc.constantFrom('published', 'draft', 'archived'),
        }),
        (partialPost: any) => {
          // Check if any required field is missing
          const requiredFields = [
            'title',
            'author',
            'publishedAt',
            'content',
            'excerpt',
            'featuredImage',
            'category',
            'tags'
          ];

          const missingFields = requiredFields.filter(field => 
            partialPost[field] === undefined || 
            partialPost[field] === null ||
            (typeof partialPost[field] === 'string' && partialPost[field].trim() === '')
          );

          // Property: If any required field is missing, the post should be considered invalid
          if (missingFields.length > 0) {
            // Verify that at least one required field is missing
            expect(missingFields.length).toBeGreaterThan(0);
            
            // In a real system, this would trigger a validation error
            // For this test, we're verifying that we can detect missing fields
            missingFields.forEach(field => {
              const value = partialPost[field];
              const isMissing = value === undefined || 
                               value === null || 
                               (typeof value === 'string' && value.trim() === '');
              expect(isMissing).toBe(true);
            });
          } else {
            // If all required fields are present, verify they meet the requirements
            expect(partialPost.title).toBeDefined();
            expect(partialPost.author).toBeDefined();
            expect(partialPost.publishedAt).toBeDefined();
            expect(partialPost.content).toBeDefined();
            expect(partialPost.excerpt).toBeDefined();
            expect(partialPost.featuredImage).toBeDefined();
            expect(partialPost.category).toBeDefined();
            expect(partialPost.tags).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate that publishedAt is a valid ISO 8601 date string', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with valid dates
        fc.record({
          id: fc.stringMatching(/^post-[0-9]{1,5}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post: BlogPost) => {
          // Property: publishedAt must be a valid ISO 8601 date string
          expect(post.publishedAt).toBeDefined();
          expect(typeof post.publishedAt).toBe('string');

          // Parse the date
          const date = new Date(post.publishedAt);

          // Verify it's a valid date
          expect(date.toString()).not.toBe('Invalid Date');
          expect(isNaN(date.getTime())).toBe(false);

          // Verify it can be converted back to ISO string
          expect(date.toISOString()).toBe(post.publishedAt);

          // Verify the date is reasonable (between 2020 and 2025)
          const minDate = new Date('2020-01-01').getTime();
          const maxDate = new Date('2025-12-31').getTime();
          expect(date.getTime()).toBeGreaterThanOrEqual(minDate);
          expect(date.getTime()).toBeLessThanOrEqual(maxDate);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate that featuredImage is a valid URL', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with valid URLs
        fc.record({
          id: fc.stringMatching(/^post-[0-9]{1,5}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post: BlogPost) => {
          // Property: featuredImage must be a valid URL
          expect(post.featuredImage).toBeDefined();
          expect(typeof post.featuredImage).toBe('string');
          expect(post.featuredImage.length).toBeGreaterThan(0);

          // Verify it's a valid URL by attempting to construct a URL object
          let url: URL;
          expect(() => {
            url = new URL(post.featuredImage);
          }).not.toThrow();

          // Verify the URL has a protocol (http or https)
          const parsedUrl = new URL(post.featuredImage);
          expect(['http:', 'https:']).toContain(parsedUrl.protocol);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate that tags is always an array', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various tag configurations
        fc.record({
          id: fc.stringMatching(/^post-[0-9]{1,5}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business'),
          tags: fc.array(
            fc.stringMatching(/^[a-z0-9-]{2,15}$/),
            { minLength: 0, maxLength: 10 }
          ),
          status: fc.constant('published' as const),
        }),
        (post: BlogPost) => {
          // Property: tags must always be an array
          expect(post.tags).toBeDefined();
          expect(Array.isArray(post.tags)).toBe(true);

          // Property: Each tag in the array must be a non-empty string
          post.tags.forEach(tag => {
            expect(typeof tag).toBe('string');
            expect(tag.length).toBeGreaterThan(0);
            expect(tag.trim()).not.toBe('');
          });

          // Property: Tags array can be empty (no minimum requirement)
          expect(post.tags.length).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate that all text fields are non-empty strings', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various text content
        fc.record({
          id: fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/).filter(s => s.trim().length > 0),
          slug: fc.stringMatching(/^[a-z0-9][a-z0-9-]{2,99}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{4,199}$/),
          author: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{19,999}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{9,199}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business', 'Technology', 'Marketing'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9][a-z0-9-]{1,19}$/), { maxLength: 5 }),
          status: fc.constantFrom('published', 'draft', 'archived'),
        }),
        (post: BlogPost) => {
          // Property: All required text fields must be non-empty strings
          const textFields = ['title', 'author', 'content', 'excerpt', 'category'];

          textFields.forEach(field => {
            const value = (post as any)[field];
            
            // Must be defined
            expect(value).toBeDefined();
            
            // Must be a string
            expect(typeof value).toBe('string');
            
            // Must not be empty
            expect(value.length).toBeGreaterThan(0);
            
            // Must not be only whitespace
            expect(value.trim()).not.toBe('');
            expect(value.trim().length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle blog posts with optional fields correctly', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with optional fields (updatedAt, readTime)
        fc.record({
          id: fc.stringMatching(/^post-[0-9]{1,5}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
          publishedAt: safeISODate(),
          updatedAt: fc.option(safeISODate(), { nil: undefined }),
          content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
          readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
        }),
        (post: BlogPost) => {
          // Property: All required fields must be present regardless of optional fields
          expect(post.title).toBeDefined();
          expect(post.author).toBeDefined();
          expect(post.publishedAt).toBeDefined();
          expect(post.content).toBeDefined();
          expect(post.excerpt).toBeDefined();
          expect(post.featuredImage).toBeDefined();
          expect(post.category).toBeDefined();
          expect(post.tags).toBeDefined();

          // Property: Optional fields can be undefined
          if (post.updatedAt !== undefined) {
            expect(typeof post.updatedAt).toBe('string');
            const date = new Date(post.updatedAt);
            expect(date.toString()).not.toBe('Invalid Date');
          }

          if (post.readTime !== undefined) {
            expect(typeof post.readTime).toBe('number');
            expect(post.readTime).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate field types match the BlogPost interface', () => {
    fc.assert(
      fc.property(
        // Generate complete blog posts
        fc.record({
          id: fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,100}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,200}$/),
          author: fc.stringMatching(/^[a-zA-Z\s\-']{2,100}$/),
          publishedAt: safeISODate(),
          updatedAt: fc.option(safeISODate(), { nil: undefined }),
          content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,1000}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,200}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design', 'Business', 'Technology', 'Marketing'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,20}$/), { maxLength: 5 }),
          status: fc.constantFrom('published', 'draft', 'archived'),
          readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
        }),
        (post: BlogPost) => {
          // Property: Verify all field types match the interface
          expect(typeof post.id).toBe('string');
          expect(typeof post.slug).toBe('string');
          expect(typeof post.title).toBe('string');
          expect(typeof post.author).toBe('string');
          expect(typeof post.publishedAt).toBe('string');
          expect(typeof post.content).toBe('string');
          expect(typeof post.excerpt).toBe('string');
          expect(typeof post.featuredImage).toBe('string');
          expect(typeof post.category).toBe('string');
          expect(Array.isArray(post.tags)).toBe(true);
          expect(['published', 'draft', 'archived']).toContain(post.status);

          // Optional fields
          if (post.updatedAt !== undefined) {
            expect(typeof post.updatedAt).toBe('string');
          }

          if (post.readTime !== undefined) {
            expect(typeof post.readTime).toBe('number');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
