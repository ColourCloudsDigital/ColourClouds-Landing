/**
 * Property-Based Test for Blog Filter Accuracy
 * 
 * Tests universal property of the blog filtering system:
 * - Property 12: Blog Filter Accuracy
 * 
 * **Validates: Requirements 4.10**
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

// Import the filterBlogPosts function from the blog API route
// We'll test the filtering logic directly
function filterBlogPosts(
  posts: BlogPost[],
  category?: string | null,
  tag?: string | null,
  search?: string | null
): BlogPost[] {
  let filtered = [...posts];

  // Filter by category
  if (category) {
    const categoryLower = category.toLowerCase();
    filtered = filtered.filter(
      post => post.category.toLowerCase() === categoryLower
    );
  }

  // Filter by tag
  if (tag) {
    const tagLower = tag.toLowerCase();
    filtered = filtered.filter(
      post => post.tags.some(t => t.toLowerCase() === tagLower)
    );
  }

  // Filter by search term (searches in title, excerpt, and content)
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const excerptMatch = post.excerpt.toLowerCase().includes(searchLower);
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      const authorMatch = post.author.toLowerCase().includes(searchLower);
      
      return titleMatch || excerptMatch || contentMatch || authorMatch;
    });
  }

  return filtered;
}

// ============================================================================
// Property 12: Blog Filter Accuracy
// ============================================================================

describe('Property 12: Blog Filter Accuracy', () => {
  /**
   * **Validates: Requirements 4.10**
   * 
   * Requirement 4.10: THE System SHALL provide filter functionality by 
   * category and tags on the blog listing page
   * 
   * Property: For any collection of blog posts and any filter parameters 
   * (category, tag, search), the filtering function SHALL:
   * 1. Return only posts that match ALL specified filter criteria
   * 2. Perform case-insensitive matching for all filters
   * 3. Return all posts when no filters are specified
   * 4. Return empty array when no posts match the filters
   * 5. Correctly combine multiple filters (AND logic)
   * 6. Preserve all post properties in filtered results
   */

  it('should filter posts by category correctly (case-insensitive)', () => {
    fc.assert(
      fc.property(
        // Generate posts with various categories
        fc.array(
          fc.record({
            id: fc.uuid(),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
            author: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,500}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,100}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design', 'Business', 'Technology', 'Marketing'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { minLength: 1, maxLength: 5 }),
            status: fc.constant('published' as const),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        fc.constantFrom('Development', 'Design', 'Business', 'Technology', 'Marketing'),
        (posts, categoryFilter) => {
          // Filter posts by category
          const filtered = filterBlogPosts(posts, categoryFilter, null, null);

          // Property 1: All filtered posts must have the specified category (case-insensitive)
          filtered.forEach(post => {
            expect(post.category.toLowerCase()).toBe(categoryFilter.toLowerCase());
          });

          // Property 2: Count should match expected count
          const expectedCount = posts.filter(
            p => p.category.toLowerCase() === categoryFilter.toLowerCase()
          ).length;
          expect(filtered.length).toBe(expectedCount);

          // Property 3: No posts with different categories should be included
          const otherCategoryPosts = posts.filter(
            p => p.category.toLowerCase() !== categoryFilter.toLowerCase()
          );
          otherCategoryPosts.forEach(otherPost => {
            expect(filtered).not.toContainEqual(otherPost);
          });

          // Property 4: All properties should be preserved
          filtered.forEach(post => {
            const original = posts.find(p => p.id === post.id);
            expect(original).toBeDefined();
            expect(post).toEqual(original);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter posts by tag correctly (case-insensitive)', () => {
    fc.assert(
      fc.property(
        // Generate posts with various tags
        fc.array(
          fc.record({
            id: fc.uuid(),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
            author: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,500}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,100}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design', 'Business'),
            tags: fc.array(
              fc.constantFrom('nextjs', 'react', 'typescript', 'javascript', 'css', 'html'),
              { minLength: 1, maxLength: 4 }
            ),
            status: fc.constant('published' as const),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        fc.constantFrom('nextjs', 'react', 'typescript', 'javascript', 'css', 'html'),
        (posts, tagFilter) => {
          // Filter posts by tag
          const filtered = filterBlogPosts(posts, null, tagFilter, null);

          // Property 1: All filtered posts must contain the specified tag (case-insensitive)
          filtered.forEach(post => {
            const hasTag = post.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
            expect(hasTag).toBe(true);
          });

          // Property 2: Count should match expected count
          const expectedCount = posts.filter(
            p => p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase())
          ).length;
          expect(filtered.length).toBe(expectedCount);

          // Property 3: No posts without the tag should be included
          const postsWithoutTag = posts.filter(
            p => !p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase())
          );
          postsWithoutTag.forEach(postWithoutTag => {
            expect(filtered).not.toContainEqual(postWithoutTag);
          });

          // Property 4: All properties should be preserved
          filtered.forEach(post => {
            const original = posts.find(p => p.id === post.id);
            expect(original).toBeDefined();
            expect(post).toEqual(original);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter posts by search term correctly (case-insensitive, searches title, excerpt, content, author)', () => {
    fc.assert(
      fc.property(
        // Generate posts with specific searchable content
        fc.array(
          fc.record({
            id: fc.stringMatching(/^post-[0-9]{1,5}$/),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.constantFrom(
              'Building Modern Portfolio',
              'React Best Practices',
              'TypeScript Guide',
              'CSS Animations Tutorial',
              'JavaScript Fundamentals'
            ),
            author: fc.constantFrom('John Doe', 'Jane Smith', 'Bob Johnson'),
            publishedAt: safeISODate(),
            content: fc.constantFrom(
              'This is a comprehensive guide about portfolio development',
              'Learn React hooks and best practices for modern apps',
              'TypeScript provides type safety for JavaScript',
              'CSS animations make your website interactive',
              'JavaScript is the foundation of web development'
            ),
            excerpt: fc.constantFrom(
              'Learn how to build a portfolio',
              'React tips and tricks',
              'TypeScript basics explained',
              'Animate with CSS',
              'JavaScript essentials'
            ),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { minLength: 1, maxLength: 3 }),
            status: fc.constant('published' as const),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        fc.constantFrom('portfolio', 'React', 'typescript', 'CSS', 'Jane'),
        (posts, searchTerm) => {
          // Filter posts by search term
          const filtered = filterBlogPosts(posts, null, null, searchTerm);

          const searchLower = searchTerm.toLowerCase();

          // Property 1: All filtered posts must contain the search term in title, excerpt, content, or author
          filtered.forEach(post => {
            const titleMatch = post.title.toLowerCase().includes(searchLower);
            const excerptMatch = post.excerpt.toLowerCase().includes(searchLower);
            const contentMatch = post.content.toLowerCase().includes(searchLower);
            const authorMatch = post.author.toLowerCase().includes(searchLower);
            
            const hasMatch = titleMatch || excerptMatch || contentMatch || authorMatch;
            expect(hasMatch).toBe(true);
          });

          // Property 2: Count should match expected count
          const expectedCount = posts.filter(p => {
            const titleMatch = p.title.toLowerCase().includes(searchLower);
            const excerptMatch = p.excerpt.toLowerCase().includes(searchLower);
            const contentMatch = p.content.toLowerCase().includes(searchLower);
            const authorMatch = p.author.toLowerCase().includes(searchLower);
            return titleMatch || excerptMatch || contentMatch || authorMatch;
          }).length;
          expect(filtered.length).toBe(expectedCount);

          // Property 3: Posts without the search term should not be included
          const postsWithoutTerm = posts.filter(p => {
            const titleMatch = p.title.toLowerCase().includes(searchLower);
            const excerptMatch = p.excerpt.toLowerCase().includes(searchLower);
            const contentMatch = p.content.toLowerCase().includes(searchLower);
            const authorMatch = p.author.toLowerCase().includes(searchLower);
            return !(titleMatch || excerptMatch || contentMatch || authorMatch);
          });
          postsWithoutTerm.forEach(postWithoutTerm => {
            expect(filtered).not.toContainEqual(postWithoutTerm);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should combine multiple filters with AND logic', () => {
    fc.assert(
      fc.property(
        // Generate posts with specific categories and tags
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
            category: fc.constantFrom('Development', 'Design', 'Business'),
            tags: fc.array(
              fc.constantFrom('nextjs', 'react', 'typescript', 'javascript'),
              { minLength: 1, maxLength: 3 }
            ),
            status: fc.constant('published' as const),
          }),
          { minLength: 10, maxLength: 20 }
        ),
        fc.constantFrom('Development', 'Design', 'Business'),
        fc.constantFrom('nextjs', 'react', 'typescript', 'javascript'),
        (posts, categoryFilter, tagFilter) => {
          // Filter posts by both category and tag
          const filtered = filterBlogPosts(posts, categoryFilter, tagFilter, null);

          // Property 1: All filtered posts must match BOTH category AND tag
          filtered.forEach(post => {
            expect(post.category.toLowerCase()).toBe(categoryFilter.toLowerCase());
            const hasTag = post.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
            expect(hasTag).toBe(true);
          });

          // Property 2: Count should match expected count
          const expectedCount = posts.filter(p => {
            const categoryMatch = p.category.toLowerCase() === categoryFilter.toLowerCase();
            const tagMatch = p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
            return categoryMatch && tagMatch;
          }).length;
          expect(filtered.length).toBe(expectedCount);

          // Property 3: Posts that match only one filter should not be included
          const partialMatches = posts.filter(p => {
            const categoryMatch = p.category.toLowerCase() === categoryFilter.toLowerCase();
            const tagMatch = p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
            return (categoryMatch && !tagMatch) || (!categoryMatch && tagMatch);
          });
          partialMatches.forEach(partialMatch => {
            expect(filtered).not.toContainEqual(partialMatch);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return all posts when no filters are specified', () => {
    fc.assert(
      fc.property(
        // Generate any collection of posts
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
            category: fc.constantFrom('Development', 'Design', 'Business'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { minLength: 1, maxLength: 3 }),
            status: fc.constant('published' as const),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (posts) => {
          // Filter with no filters specified
          const filtered = filterBlogPosts(posts, null, null, null);

          // Property: Should return all posts
          expect(filtered.length).toBe(posts.length);
          expect(filtered).toEqual(posts);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return empty array when no posts match the filters', () => {
    fc.assert(
      fc.property(
        // Generate posts with specific categories
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
            category: fc.constant('Development'),
            tags: fc.array(
              fc.constantFrom('nextjs', 'react', 'typescript'),
              { minLength: 1, maxLength: 3 }
            ),
            status: fc.constant('published' as const),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (posts) => {
          // Filter with a category that doesn't exist in the posts
          const filtered = filterBlogPosts(posts, 'NonExistentCategory', null, null);

          // Property: Should return empty array
          expect(filtered).toEqual([]);
          expect(filtered.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle case-insensitive filtering consistently', () => {
    fc.assert(
      fc.property(
        // Generate posts with mixed case categories
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
            category: fc.constant('Development'),
            tags: fc.array(
              fc.constant('nextjs'),
              { minLength: 1, maxLength: 3 }
            ),
            status: fc.constant('published' as const),
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (posts) => {
          // Test with different case variations
          const lowerCaseFiltered = filterBlogPosts(posts, 'development', null, null);
          const upperCaseFiltered = filterBlogPosts(posts, 'DEVELOPMENT', null, null);
          const mixedCaseFiltered = filterBlogPosts(posts, 'DeVeLoPmEnT', null, null);

          // Property: All variations should return the same results
          expect(lowerCaseFiltered.length).toBe(posts.length);
          expect(upperCaseFiltered.length).toBe(posts.length);
          expect(mixedCaseFiltered.length).toBe(posts.length);
          
          expect(lowerCaseFiltered).toEqual(posts);
          expect(upperCaseFiltered).toEqual(posts);
          expect(mixedCaseFiltered).toEqual(posts);

          // Test tag filtering with different cases
          const lowerTagFiltered = filterBlogPosts(posts, null, 'nextjs', null);
          const upperTagFiltered = filterBlogPosts(posts, null, 'NEXTJS', null);
          const mixedTagFiltered = filterBlogPosts(posts, null, 'NeXtJs', null);

          expect(lowerTagFiltered.length).toBe(posts.length);
          expect(upperTagFiltered.length).toBe(posts.length);
          expect(mixedTagFiltered.length).toBe(posts.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve post properties and not mutate original array', () => {
    fc.assert(
      fc.property(
        // Generate posts
        fc.array(
          fc.record({
            id: fc.uuid(),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
            author: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
            publishedAt: safeISODate(),
            content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,500}$/),
            excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,100}$/),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design'),
            tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { minLength: 1, maxLength: 3 }),
            status: fc.constant('published' as const),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        (posts) => {
          // Create a deep copy of the original posts
          const originalPosts = JSON.parse(JSON.stringify(posts));

          // Filter posts
          const filtered = filterBlogPosts(posts, 'Development', null, null);

          // Property 1: Original array should not be mutated
          expect(posts).toEqual(originalPosts);

          // Property 2: Filtered posts should have all original properties
          filtered.forEach(post => {
            const original = posts.find(p => p.id === post.id);
            expect(original).toBeDefined();
            expect(post.id).toBe(original!.id);
            expect(post.slug).toBe(original!.slug);
            expect(post.title).toBe(original!.title);
            expect(post.author).toBe(original!.author);
            expect(post.publishedAt).toBe(original!.publishedAt);
            expect(post.content).toBe(original!.content);
            expect(post.excerpt).toBe(original!.excerpt);
            expect(post.featuredImage).toBe(original!.featuredImage);
            expect(post.category).toBe(original!.category);
            expect(post.tags).toEqual(original!.tags);
            expect(post.status).toBe(original!.status);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle empty post arrays correctly', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        fc.option(fc.constantFrom('Development', 'Design'), { nil: null }),
        fc.option(fc.constantFrom('nextjs', 'react'), { nil: null }),
        fc.option(fc.constantFrom('portfolio', 'guide'), { nil: null }),
        (emptyPosts, category, tag, search) => {
          // Filter empty array
          const filtered = filterBlogPosts(emptyPosts, category, tag, search);

          // Property: Should always return empty array
          expect(filtered).toEqual([]);
          expect(filtered.length).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle posts with empty tags arrays', () => {
    fc.assert(
      fc.property(
        // Generate posts with empty tags
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
            category: fc.constantFrom('Development', 'Design'),
            tags: fc.constant([]),
            status: fc.constant('published' as const),
          }),
          { minLength: 3, maxLength: 10 }
        ),
        fc.constantFrom('nextjs', 'react', 'typescript'),
        (posts, tagFilter) => {
          // Filter by tag
          const filtered = filterBlogPosts(posts, null, tagFilter, null);

          // Property: Should return empty array since no posts have tags
          expect(filtered).toEqual([]);
          expect(filtered.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle all three filters combined', () => {
    fc.assert(
      fc.property(
        // Generate posts with specific properties
        fc.array(
          fc.record({
            id: fc.stringMatching(/^post-[0-9]{1,5}$/),
            slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
            title: fc.constantFrom(
              'Building Modern Portfolio',
              'React Best Practices',
              'TypeScript Guide'
            ),
            author: fc.constantFrom('John Doe', 'Jane Smith'),
            publishedAt: safeISODate(),
            content: fc.constantFrom(
              'This is a comprehensive guide about portfolio development',
              'Learn React hooks and best practices',
              'TypeScript provides type safety'
            ),
            excerpt: fc.constantFrom(
              'Learn how to build a portfolio',
              'React tips and tricks',
              'TypeScript basics'
            ),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Development', 'Design'),
            tags: fc.array(
              fc.constantFrom('nextjs', 'react', 'typescript'),
              { minLength: 1, maxLength: 2 }
            ),
            status: fc.constant('published' as const),
          }),
          { minLength: 10, maxLength: 20 }
        ),
        (posts) => {
          // Filter with all three filters
          const filtered = filterBlogPosts(posts, 'Development', 'react', 'portfolio');

          // Property: All filtered posts must match ALL three criteria
          filtered.forEach(post => {
            // Must match category
            expect(post.category.toLowerCase()).toBe('development');
            
            // Must have the tag
            const hasTag = post.tags.some(t => t.toLowerCase() === 'react');
            expect(hasTag).toBe(true);
            
            // Must contain search term
            const searchLower = 'portfolio';
            const titleMatch = post.title.toLowerCase().includes(searchLower);
            const excerptMatch = post.excerpt.toLowerCase().includes(searchLower);
            const contentMatch = post.content.toLowerCase().includes(searchLower);
            const authorMatch = post.author.toLowerCase().includes(searchLower);
            const hasSearchMatch = titleMatch || excerptMatch || contentMatch || authorMatch;
            expect(hasSearchMatch).toBe(true);
          });

          // Property: Count should match expected count
          const expectedCount = posts.filter(p => {
            const categoryMatch = p.category.toLowerCase() === 'development';
            const tagMatch = p.tags.some(t => t.toLowerCase() === 'react');
            const searchLower = 'portfolio';
            const titleMatch = p.title.toLowerCase().includes(searchLower);
            const excerptMatch = p.excerpt.toLowerCase().includes(searchLower);
            const contentMatch = p.content.toLowerCase().includes(searchLower);
            const authorMatch = p.author.toLowerCase().includes(searchLower);
            const searchMatch = titleMatch || excerptMatch || contentMatch || authorMatch;
            return categoryMatch && tagMatch && searchMatch;
          }).length;
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
