/**
 * Property-Based Tests for Related Posts Logic
 * 
 * Tests universal properties of the related posts matching system:
 * - Property 11: Related Posts Matching
 * 
 * Requirements: 4.8
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { findRelatedPosts } from '@/lib/related-posts';
import { BlogPost } from '@/lib/types';

// ============================================================================
// Test Data Generators
// ============================================================================

/**
 * Generate a valid blog post slug
 */
const slugArbitrary = fc.stringMatching(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/);

/**
 * Generate a valid blog post title
 */
const titleArbitrary = fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,98}[a-zA-Z0-9]$/);

/**
 * Generate a valid author name
 */
const authorArbitrary = fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,49}$/);

/**
 * Generate a valid category
 */
const categoryArbitrary = fc.constantFrom(
  'Technology',
  'Development',
  'Design',
  'Business',
  'Marketing',
  'Tutorial',
  'News',
  'Opinion'
);

/**
 * Generate a valid tag
 */
const tagArbitrary = fc.constantFrom(
  'react',
  'nextjs',
  'typescript',
  'javascript',
  'css',
  'html',
  'nodejs',
  'api',
  'database',
  'testing',
  'deployment',
  'performance',
  'security',
  'ux',
  'ui',
  'design-patterns',
  'best-practices',
  'tutorial',
  'guide',
  'tips'
);

/**
 * Generate an array of unique tags
 */
const tagsArbitrary = fc
  .array(tagArbitrary, { minLength: 0, maxLength: 5 })
  .map(tags => Array.from(new Set(tags))); // Ensure uniqueness

/**
 * Generate a valid ISO 8601 date string
 */
const dateArbitrary = fc
  .date({ 
    min: new Date('2020-01-01T00:00:00.000Z'), 
    max: new Date('2024-12-31T23:59:59.999Z') 
  })
  .map(date => {
    // Ensure the date is valid before converting to ISO string
    if (isNaN(date.getTime())) {
      return new Date('2024-01-01T00:00:00.000Z').toISOString();
    }
    return date.toISOString();
  });

/**
 * Generate a valid blog post
 */
const blogPostArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }).map(n => n.toString()),
  slug: slugArbitrary,
  title: titleArbitrary,
  author: authorArbitrary,
  publishedAt: dateArbitrary,
  content: fc.lorem({ maxCount: 50 }),
  excerpt: fc.lorem({ maxCount: 10 }),
  featuredImage: fc.webUrl(),
  category: categoryArbitrary,
  tags: tagsArbitrary,
  status: fc.constantFrom('published', 'draft', 'archived') as fc.Arbitrary<'published' | 'draft' | 'archived'>,
});

// ============================================================================
// Property 11: Related Posts Matching
// ============================================================================

describe('Property 11: Related Posts Matching', () => {
  /**
   * **Validates: Requirements 4.8**
   * 
   * Requirement 4.8: THE System SHALL display related posts on blog post detail 
   * pages based on category or tags
   * 
   * Property: For any blog post and collection of other posts, the related posts 
   * matching algorithm SHALL:
   * 1. Never include the current post in the results
   * 2. Only include posts with some relevance (shared category or tags)
   * 3. Sort results by relevance score (descending)
   * 4. Respect the limit parameter
   * 5. Return posts with higher scores before posts with lower scores
   * 6. Assign consistent scores based on category and tag matching
   * 7. Handle edge cases (empty arrays, no matches, single post)
   */

  it('should never include the current post in related posts results', () => {
    fc.assert(
      fc.property(
        // Generate a current post and an array of other posts
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (currentPost, otherPosts, limit) => {
          // Create all posts array including the current post
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Current post should never be in the results
          expect(related.every(post => post.id !== currentPost.id)).toBe(true);
          
          // Property: No post in results should have the same ID as current post
          const relatedIds = related.map(post => post.id);
          expect(relatedIds).not.toContain(currentPost.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only include posts with some relevance (shared category or tags)', () => {
    fc.assert(
      fc.property(
        // Generate a current post and an array of other posts
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (currentPost, otherPosts, limit) => {
          // Create all posts array
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Every related post must have either:
          // - Same category as current post, OR
          // - At least one shared tag with current post
          related.forEach(relatedPost => {
            const hasSameCategory = relatedPost.category === currentPost.category;
            const currentTags = new Set(currentPost.tags);
            const hasSharedTag = relatedPost.tags.some(tag => currentTags.has(tag));

            expect(hasSameCategory || hasSharedTag).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sort results by relevance score in descending order', () => {
    fc.assert(
      fc.property(
        // Generate a current post and an array of other posts
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (currentPost, otherPosts, limit) => {
          // Create all posts array
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Calculate scores for each related post
          const scores = related.map(post => {
            let score = 0;
            
            // Same category: +10 points
            if (post.category === currentPost.category) {
              score += 10;
            }
            
            // Each shared tag: +5 points
            const currentTags = new Set(currentPost.tags);
            const sharedTags = post.tags.filter(tag => currentTags.has(tag));
            score += sharedTags.length * 5;
            
            return score;
          });

          // Property: Scores should be in descending order
          for (let i = 0; i < scores.length - 1; i++) {
            expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should respect the limit parameter', () => {
    fc.assert(
      fc.property(
        // Generate a current post and an array of other posts
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (currentPost, otherPosts, limit) => {
          // Create all posts array
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Number of results should not exceed the limit
          expect(related.length).toBeLessThanOrEqual(limit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return posts with higher relevance scores first', () => {
    fc.assert(
      fc.property(
        // Generate a current post with specific category and tags
        categoryArbitrary,
        tagsArbitrary.filter(tags => tags.length > 0),
        fc.array(blogPostArbitrary, { minLength: 5, maxLength: 20 }),
        (category, tags, otherPosts) => {
          // Create current post with known category and tags
          const currentPost: BlogPost = {
            id: '0',
            slug: 'current-post',
            title: 'Current Post',
            author: 'Test Author',
            publishedAt: new Date().toISOString(),
            content: 'Content',
            excerpt: 'Excerpt',
            featuredImage: 'https://example.com/image.jpg',
            category,
            tags,
            status: 'published',
          };

          // Create all posts array
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, 10);

          // If we have at least 2 related posts, verify ordering
          if (related.length >= 2) {
            // Calculate scores for first and second posts
            const calculateScore = (post: BlogPost) => {
              let score = 0;
              if (post.category === currentPost.category) score += 10;
              const currentTags = new Set(currentPost.tags);
              const sharedTags = post.tags.filter(tag => currentTags.has(tag));
              score += sharedTags.length * 5;
              return score;
            };

            const firstScore = calculateScore(related[0]);
            const secondScore = calculateScore(related[1]);

            // Property: First post should have score >= second post
            expect(firstScore).toBeGreaterThanOrEqual(secondScore);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should assign consistent scores based on category and tag matching', () => {
    fc.assert(
      fc.property(
        // Generate posts with known relationships
        categoryArbitrary,
        tagsArbitrary.filter(tags => tags.length >= 2),
        (category, tags) => {
          // Create current post
          const currentPost: BlogPost = {
            id: '0',
            slug: 'current-post',
            title: 'Current Post',
            author: 'Test Author',
            publishedAt: new Date().toISOString(),
            content: 'Content',
            excerpt: 'Excerpt',
            featuredImage: 'https://example.com/image.jpg',
            category,
            tags,
            status: 'published',
          };

          // Create post with same category only (score = 10)
          const sameCategoryPost: BlogPost = {
            ...currentPost,
            id: '1',
            slug: 'same-category',
            tags: ['different-tag'],
          };

          // Create post with one shared tag only (score = 5)
          const oneTagPost: BlogPost = {
            ...currentPost,
            id: '2',
            slug: 'one-tag',
            category: 'Different Category',
            tags: [tags[0], 'other-tag'],
          };

          // Create post with same category and one shared tag (score = 15)
          const categoryAndTagPost: BlogPost = {
            ...currentPost,
            id: '3',
            slug: 'category-and-tag',
            tags: [tags[0], 'other-tag'],
          };

          const allPosts = [currentPost, sameCategoryPost, oneTagPost, categoryAndTagPost];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, 10);

          // Property: Post with category + tag should come first (score 15)
          // Property: Post with category only should come second (score 10)
          // Property: Post with tag only should come third (score 5)
          if (related.length === 3) {
            expect(related[0].id).toBe('3'); // category + tag
            expect(related[1].id).toBe('1'); // category only
            expect(related[2].id).toBe('2'); // tag only
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle edge case: empty posts array', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (currentPost, limit) => {
          // Empty posts array
          const allPosts: BlogPost[] = [];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Should return empty array
          expect(related).toEqual([]);
          expect(related.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle edge case: only current post in array', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (currentPost, limit) => {
          // Only current post in array
          const allPosts = [currentPost];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Should return empty array (current post excluded)
          expect(related).toEqual([]);
          expect(related.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle edge case: no posts with any relevance', () => {
    fc.assert(
      fc.property(
        categoryArbitrary,
        tagsArbitrary,
        fc.array(blogPostArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (category, tags, otherPosts, limit) => {
          // Create current post with specific category and tags
          const currentPost: BlogPost = {
            id: '0',
            slug: 'current-post',
            title: 'Current Post',
            author: 'Test Author',
            publishedAt: new Date().toISOString(),
            content: 'Content',
            excerpt: 'Excerpt',
            featuredImage: 'https://example.com/image.jpg',
            category,
            tags,
            status: 'published',
          };

          // Ensure other posts have no relevance (different category and no shared tags)
          const unrelatedPosts = otherPosts.map((post, index) => ({
            ...post,
            id: (index + 1).toString(),
            category: post.category === category ? 'Completely Different Category' : post.category,
            tags: post.tags.filter(tag => !tags.includes(tag)),
          }));

          const allPosts = [currentPost, ...unrelatedPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Should return empty array when no posts have relevance
          expect(related).toEqual([]);
          expect(related.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle posts with multiple shared tags correctly', () => {
    fc.assert(
      fc.property(
        categoryArbitrary,
        tagsArbitrary.filter(tags => tags.length >= 3),
        (category, tags) => {
          // Create current post with multiple tags
          const currentPost: BlogPost = {
            id: '0',
            slug: 'current-post',
            title: 'Current Post',
            author: 'Test Author',
            publishedAt: new Date().toISOString(),
            content: 'Content',
            excerpt: 'Excerpt',
            featuredImage: 'https://example.com/image.jpg',
            category,
            tags,
            status: 'published',
          };

          // Create post with 1 shared tag (score = 5)
          const oneTagPost: BlogPost = {
            ...currentPost,
            id: '1',
            slug: 'one-tag',
            category: 'Different',
            tags: [tags[0], 'other'],
          };

          // Create post with 2 shared tags (score = 10)
          const twoTagsPost: BlogPost = {
            ...currentPost,
            id: '2',
            slug: 'two-tags',
            category: 'Different',
            tags: [tags[0], tags[1], 'other'],
          };

          // Create post with 3 shared tags (score = 15)
          const threeTagsPost: BlogPost = {
            ...currentPost,
            id: '3',
            slug: 'three-tags',
            category: 'Different',
            tags: [tags[0], tags[1], tags[2], 'other'],
          };

          const allPosts = [currentPost, oneTagPost, twoTagsPost, threeTagsPost];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, 10);

          // Property: Posts should be ordered by number of shared tags
          if (related.length === 3) {
            expect(related[0].id).toBe('3'); // 3 shared tags (15 points)
            expect(related[1].id).toBe('2'); // 2 shared tags (10 points)
            expect(related[2].id).toBe('1'); // 1 shared tag (5 points)
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle default limit of 3 when not specified', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 10, maxLength: 20 }),
        (currentPost, otherPosts) => {
          // Ensure some posts have relevance by giving them the same category
          const relevantPosts = otherPosts.map((post, index) => ({
            ...post,
            id: (index + 1).toString(),
            category: currentPost.category, // Same category for relevance
          }));

          const allPosts = [currentPost, ...relevantPosts];

          // Find related posts without specifying limit (should default to 3)
          const related = findRelatedPosts(currentPost, allPosts);

          // Property: Should return at most 3 posts (default limit)
          expect(related.length).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain referential integrity of returned posts', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (currentPost, otherPosts, limit) => {
          // Create all posts array
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Every related post should be a reference to a post in allPosts
          related.forEach(relatedPost => {
            const foundInAllPosts = allPosts.some(post => post.id === relatedPost.id);
            expect(foundInAllPosts).toBe(true);
          });

          // Property: Related posts should have all required BlogPost fields
          related.forEach(post => {
            expect(post).toHaveProperty('id');
            expect(post).toHaveProperty('slug');
            expect(post).toHaveProperty('title');
            expect(post).toHaveProperty('author');
            expect(post).toHaveProperty('publishedAt');
            expect(post).toHaveProperty('content');
            expect(post).toHaveProperty('excerpt');
            expect(post).toHaveProperty('featuredImage');
            expect(post).toHaveProperty('category');
            expect(post).toHaveProperty('tags');
            expect(post).toHaveProperty('status');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle posts with empty tags arrays', () => {
    fc.assert(
      fc.property(
        categoryArbitrary,
        fc.array(blogPostArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (category, otherPosts, limit) => {
          // Create current post with no tags
          const currentPost: BlogPost = {
            id: '0',
            slug: 'current-post',
            title: 'Current Post',
            author: 'Test Author',
            publishedAt: new Date().toISOString(),
            content: 'Content',
            excerpt: 'Excerpt',
            featuredImage: 'https://example.com/image.jpg',
            category,
            tags: [], // No tags
            status: 'published',
          };

          // Create posts with no tags but some with same category
          const postsWithNoTags = otherPosts.map((post, index) => ({
            ...post,
            id: (index + 1).toString(),
            tags: [], // No tags
          }));

          const allPosts = [currentPost, ...postsWithNoTags];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: Should only match on category (no tag matching possible)
          related.forEach(relatedPost => {
            expect(relatedPost.category).toBe(currentPost.category);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not return duplicate posts', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.array(blogPostArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (currentPost, otherPosts, limit) => {
          // Create all posts array
          const allPosts = [currentPost, ...otherPosts];

          // Find related posts
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Property: All post IDs in results should be unique
          const ids = related.map(post => post.id);
          const uniqueIds = new Set(ids);
          expect(ids.length).toBe(uniqueIds.size);

          // Property: No duplicate posts in results
          for (let i = 0; i < related.length; i++) {
            for (let j = i + 1; j < related.length; j++) {
              expect(related[i].id).not.toBe(related[j].id);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
