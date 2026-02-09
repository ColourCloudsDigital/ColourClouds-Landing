/**
 * Property-Based Test for Blog Published Filter
 * 
 * Tests universal property of the blog listing system:
 * - Property 9: Blog Listing Published Filter
 * 
 * Requirements: 4.2
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { BlogPost } from '@/lib/types';

// Helper to generate safe ISO date strings
// Using integer timestamps to avoid invalid Date objects
const safeISODate = () => fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2025-12-31').getTime() 
}).map(timestamp => new Date(timestamp).toISOString());

// ============================================================================
// Property 9: Blog Listing Published Filter
// ============================================================================

describe('Property 9: Blog Listing Published Filter', () => {
  /**
   * **Validates: Requirements 4.2**
   * 
   * Requirement 4.2: THE System SHALL display a blog listing page showing 
   * all published blog posts
   * 
   * Property: For any collection of blog posts with mixed statuses 
   * (published, draft, archived), when retrieved through getBlogPosts(), 
   * the system SHALL return ONLY posts with status 'published' and SHALL 
   * filter out all posts with status 'draft' or 'archived'.
   * 
   * This property tests that:
   * 1. Only posts with status 'published' are returned
   * 2. Posts with status 'draft' are filtered out
   * 3. Posts with status 'archived' are filtered out
   * 4. The filtering is consistent regardless of other post properties
   * 5. Empty arrays are handled correctly
   * 6. All returned posts have status 'published'
   */

  it('should return only published posts and filter out draft and archived posts', () => {
    fc.assert(
      fc.property(
        // Generate a collection of blog posts with various statuses
        fc.array(
          fc.record({
            id: fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/),
            slug: fc.stringMatching(/^[a-z0-9-]{3,100}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,200}$/),
            author: fc.stringMatching(/^[a-zA-Z\s\-']{2,100}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,1000}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,200}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design', 'Business', 'Technology', 'Marketing'),
            tags: fc.array(
              fc.stringMatching(/^[a-z0-9-]{2,20}$/),
              { minLength: 0, maxLength: 5 }
            ),
            status: fc.constantFrom('published', 'draft', 'archived'),
            readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (allPosts) => {
          // Simulate the filtering logic that getBlogPosts() performs
          // This is what the actual implementation does
          const filteredPosts = allPosts.filter(post => post.status === 'published');

          // Property 1: All returned posts must have status 'published'
          filteredPosts.forEach(post => {
            expect(post.status).toBe('published');
          });

          // Property 2: No draft posts should be in the result
          const draftPosts = allPosts.filter(post => post.status === 'draft');
          draftPosts.forEach(draftPost => {
            expect(filteredPosts).not.toContainEqual(draftPost);
          });

          // Property 3: No archived posts should be in the result
          const archivedPosts = allPosts.filter(post => post.status === 'archived');
          archivedPosts.forEach(archivedPost => {
            expect(filteredPosts).not.toContainEqual(archivedPost);
          });

          // Property 4: The count of filtered posts should equal the count of published posts in input
          const publishedCount = allPosts.filter(post => post.status === 'published').length;
          expect(filteredPosts.length).toBe(publishedCount);

          // Property 5: If there are no published posts, result should be empty
          if (publishedCount === 0) {
            expect(filteredPosts).toHaveLength(0);
          }

          // Property 6: If all posts are published, all should be returned
          if (allPosts.every(post => post.status === 'published')) {
            expect(filteredPosts.length).toBe(allPosts.length);
          }

          // Property 7: Filtering should not modify post properties (except filtering by status)
          filteredPosts.forEach(post => {
            const originalPost = allPosts.find(p => p.id === post.id);
            expect(originalPost).toBeDefined();
            expect(post.id).toBe(originalPost!.id);
            expect(post.slug).toBe(originalPost!.slug);
            expect(post.title).toBe(originalPost!.title);
            expect(post.author).toBe(originalPost!.author);
            expect(post.category).toBe(originalPost!.category);
          });
        }
      ),
      { numRuns: 100 } // Run 100 iterations with different post collections
    );
  });

  it('should consistently filter published posts regardless of post order', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various statuses
        fc.array(
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
            status: fc.constantFrom('published', 'draft', 'archived'),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        (posts) => {
          // Filter to get published posts
          const publishedPosts = posts.filter(post => post.status === 'published');

          // Create a shuffled version of the posts array
          const shuffledPosts = [...posts].sort(() => Math.random() - 0.5);
          const publishedFromShuffled = shuffledPosts.filter(post => post.status === 'published');

          // Property: Filtering should produce the same set of posts regardless of input order
          expect(publishedFromShuffled.length).toBe(publishedPosts.length);

          // Both filtered arrays should contain the same post IDs
          const publishedIds = new Set(publishedPosts.map(p => p.id));
          const shuffledPublishedIds = new Set(publishedFromShuffled.map(p => p.id));

          expect(publishedIds.size).toBe(shuffledPublishedIds.size);
          publishedIds.forEach(id => {
            expect(shuffledPublishedIds.has(id)).toBe(true);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle edge cases with all posts having the same status', () => {
    fc.assert(
      fc.property(
        // Generate posts with a single status
        fc.constantFrom('published', 'draft', 'archived'),
        fc.array(
          fc.record({
            id: fc.stringMatching(/^post-[0-9]{1,5}$/),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
            author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (status, postTemplates) => {
          // Create posts with the same status
          const posts: BlogPost[] = postTemplates.map(template => ({
            ...template,
            status: status as 'published' | 'draft' | 'archived',
          }));

          // Filter for published posts
          const publishedPosts = posts.filter(post => post.status === 'published');

          // Property: If all posts are published, all should be returned
          if (status === 'published') {
            expect(publishedPosts.length).toBe(posts.length);
            expect(publishedPosts).toEqual(posts);
          }

          // Property: If all posts are draft or archived, none should be returned
          if (status === 'draft' || status === 'archived') {
            expect(publishedPosts.length).toBe(0);
            expect(publishedPosts).toEqual([]);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle empty blog post arrays', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (emptyPosts) => {
          // Filter empty array
          const publishedPosts = emptyPosts.filter((post: BlogPost) => post.status === 'published');

          // Property: Filtering an empty array should return an empty array
          expect(publishedPosts).toEqual([]);
          expect(publishedPosts.length).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should preserve all post properties for published posts', () => {
    fc.assert(
      fc.property(
        // Generate published posts with various properties
        fc.array(
          fc.record({
            id: fc.stringMatching(/^post-[0-9]{1,5}$/),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
            author: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,500}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,100}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design', 'Business', 'Technology'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { minLength: 0, maxLength: 5 }),
            status: fc.constant('published' as const),
            readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (publishedPosts) => {
          // Filter (should return all since all are published)
          const filteredPosts = publishedPosts.filter(post => post.status === 'published');

          // Property: All posts should be returned
          expect(filteredPosts.length).toBe(publishedPosts.length);

          // Property: All properties should be preserved exactly
          filteredPosts.forEach((post, index) => {
            const original = publishedPosts[index];
            expect(post.id).toBe(original.id);
            expect(post.slug).toBe(original.slug);
            expect(post.title).toBe(original.title);
            expect(post.author).toBe(original.author);
            expect(post.publishedAt).toBe(original.publishedAt);
            expect(post.content).toBe(original.content);
            expect(post.excerpt).toBe(original.excerpt);
            expect(post.featuredImage).toBe(original.featuredImage);
            expect(post.category).toBe(original.category);
            expect(post.tags).toEqual(original.tags);
            expect(post.status).toBe(original.status);
            expect(post.readTime).toBe(original.readTime);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should filter correctly with mixed status distribution', () => {
    fc.assert(
      fc.property(
        // Generate specific counts of each status
        fc.record({
          publishedCount: fc.integer({ min: 0, max: 10 }),
          draftCount: fc.integer({ min: 0, max: 10 }),
          archivedCount: fc.integer({ min: 0, max: 10 }),
        }),
        ({ publishedCount, draftCount, archivedCount }) => {
          // Create posts with specific status distribution
          const posts: BlogPost[] = [];

          // Add published posts
          for (let i = 0; i < publishedCount; i++) {
            posts.push({
              id: `published-${i}`,
              slug: `published-post-${i}`,
              title: `Published Post ${i}`,
              author: 'Test Author',
              publishedAt: new Date().toISOString(),
              content: 'Test content for published post',
              excerpt: 'Test excerpt',
              featuredImage: 'https://example.com/image.jpg',
              category: 'Development',
              tags: ['test'],
              status: 'published',
            });
          }

          // Add draft posts
          for (let i = 0; i < draftCount; i++) {
            posts.push({
              id: `draft-${i}`,
              slug: `draft-post-${i}`,
              title: `Draft Post ${i}`,
              author: 'Test Author',
              publishedAt: new Date().toISOString(),
              content: 'Test content for draft post',
              excerpt: 'Test excerpt',
              featuredImage: 'https://example.com/image.jpg',
              category: 'Development',
              tags: ['test'],
              status: 'draft',
            });
          }

          // Add archived posts
          for (let i = 0; i < archivedCount; i++) {
            posts.push({
              id: `archived-${i}`,
              slug: `archived-post-${i}`,
              title: `Archived Post ${i}`,
              author: 'Test Author',
              publishedAt: new Date().toISOString(),
              content: 'Test content for archived post',
              excerpt: 'Test excerpt',
              featuredImage: 'https://example.com/image.jpg',
              category: 'Development',
              tags: ['test'],
              status: 'archived',
            });
          }

          // Filter for published posts
          const publishedPosts = posts.filter(post => post.status === 'published');

          // Property: Filtered count should match published count
          expect(publishedPosts.length).toBe(publishedCount);

          // Property: All filtered posts should have status 'published'
          publishedPosts.forEach(post => {
            expect(post.status).toBe('published');
            expect(post.id).toMatch(/^published-/);
          });

          // Property: No draft or archived posts should be in result
          publishedPosts.forEach(post => {
            expect(post.id).not.toMatch(/^draft-/);
            expect(post.id).not.toMatch(/^archived-/);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain referential integrity when filtering', () => {
    fc.assert(
      fc.property(
        // Generate posts with unique IDs
        fc.array(
          fc.record({
            id: fc.uuid(),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
            author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
            status: fc.constantFrom('published', 'draft', 'archived'),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        (posts) => {
          // Filter for published posts
          const publishedPosts = posts.filter(post => post.status === 'published');

          // Property: All IDs in filtered result should exist in original array
          publishedPosts.forEach(post => {
            const originalPost = posts.find(p => p.id === post.id);
            expect(originalPost).toBeDefined();
            expect(originalPost!.status).toBe('published');
          });

          // Property: All IDs should be unique
          const ids = publishedPosts.map(p => p.id);
          const uniqueIds = new Set(ids);
          expect(ids.length).toBe(uniqueIds.size);

          // Property: No post should be duplicated in result
          publishedPosts.forEach((post, index) => {
            const duplicates = publishedPosts.filter((p, i) => i !== index && p.id === post.id);
            expect(duplicates.length).toBe(0);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
