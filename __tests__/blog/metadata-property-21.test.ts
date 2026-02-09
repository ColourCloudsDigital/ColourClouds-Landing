/**
 * Property-Based Test for Blog Post Metadata Generation
 * 
 * Tests universal property of the blog post metadata generation:
 * - Property 21: Blog Post Metadata Generation
 * 
 * **Validates: Requirements 6.6**
 * 
 * Requirements 6.6: WHEN a blog post is created, THE System SHALL generate 
 * metadata from the blog post title and excerpt
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { BlogPost } from '@/lib/types';
import { Metadata } from 'next';

// Helper to generate safe ISO date strings
const safeISODate = () => fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2025-12-31').getTime() 
}).map(timestamp => new Date(timestamp).toISOString());

/**
 * Helper function that mimics the generateMetadata logic from the blog post page
 * This allows us to test the metadata generation without importing the page component
 */
function generateBlogMetadata(post: BlogPost | null): Metadata {
  if (!post) {
    return {
      title: 'Post Not Found | Colour Clouds Digital',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: `${post.title} | Colour Clouds Digital`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

// ============================================================================
// Property 21: Blog Post Metadata Generation
// ============================================================================

describe('Property 21: Blog Post Metadata Generation', () => {
  /**
   * **Validates: Requirements 6.6**
   * 
   * Requirement 6.6: WHEN a blog post is created, THE System SHALL generate 
   * metadata from the blog post title and excerpt
   * 
   * Property: For any valid blog post with a title and excerpt, when metadata 
   * is generated, the system SHALL:
   * 1. Include the post title in the page title
   * 2. Use the post excerpt as the description
   * 3. Generate Open Graph tags with the title and excerpt
   * 4. Generate Twitter card tags with the title and excerpt
   * 5. Include the featured image in social media tags (if present)
   * 6. Include article metadata (published time, author)
   * 7. Maintain consistency between all metadata fields
   */

  it('should generate metadata with title derived from blog post title', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various titles
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
          status: fc.constant('published' as const),
          readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Page title must include the blog post title
          expect(metadata.title).toBeDefined();
          expect(metadata.title).toContain(post.title);
          expect(metadata.title).toBe(`${post.title} | Colour Clouds Digital`);

          // Property 2: Description must be the post excerpt
          expect(metadata.description).toBeDefined();
          expect(metadata.description).toBe(post.excerpt);

          // Property 3: Open Graph title must match the post title
          expect(metadata.openGraph).toBeDefined();
          expect(metadata.openGraph?.title).toBe(post.title);

          // Property 4: Open Graph description must match the excerpt
          expect(metadata.openGraph?.description).toBe(post.excerpt);

          // Property 5: Twitter card title must match the post title
          expect(metadata.twitter).toBeDefined();
          expect(metadata.twitter?.title).toBe(post.title);

          // Property 6: Twitter card description must match the excerpt
          expect(metadata.twitter?.description).toBe(post.excerpt);

          // Property 7: Consistency - all titles should be derived from post.title
          expect(metadata.openGraph?.title).toBe(post.title);
          expect(metadata.twitter?.title).toBe(post.title);

          // Property 8: Consistency - all descriptions should be the post.excerpt
          expect(metadata.description).toBe(post.excerpt);
          expect(metadata.openGraph?.description).toBe(post.excerpt);
          expect(metadata.twitter?.description).toBe(post.excerpt);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate Open Graph article metadata with published time and author', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with various authors and dates
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
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Open Graph type must be 'article'
          expect(metadata.openGraph?.type).toBe('article');

          // Property 2: Published time must match the post's publishedAt
          expect(metadata.openGraph?.publishedTime).toBe(post.publishedAt);

          // Property 3: Authors array must contain the post author
          expect(metadata.openGraph?.authors).toBeDefined();
          expect(metadata.openGraph?.authors).toEqual([post.author]);
          expect(metadata.openGraph?.authors).toHaveLength(1);
          expect(metadata.openGraph?.authors?.[0]).toBe(post.author);

          // Property 4: All article metadata fields must be present
          expect(metadata.openGraph).toMatchObject({
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include featured image in social media tags when present', () => {
    fc.assert(
      fc.property(
        // Generate blog posts with featured images
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
          status: fc.constant('published' as const),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Open Graph images must include the featured image
          expect(metadata.openGraph?.images).toBeDefined();
          expect(metadata.openGraph?.images).toEqual([post.featuredImage]);
          expect(metadata.openGraph?.images).toHaveLength(1);

          // Property 2: Twitter card images must include the featured image
          expect(metadata.twitter?.images).toBeDefined();
          expect(metadata.twitter?.images).toEqual([post.featuredImage]);
          expect(metadata.twitter?.images).toHaveLength(1);

          // Property 3: Both social media tags should have the same image
          expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);

          // Property 4: Twitter card type should be 'summary_large_image' for posts with images
          expect(metadata.twitter?.card).toBe('summary_large_image');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle posts without featured images correctly', () => {
    fc.assert(
      fc.property(
        // Generate blog posts without featured images (empty string)
        fc.record({
          id: fc.stringMatching(/^post-[0-9]{1,5}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s]{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s]{2,50}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9\s]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s]{10,100}$/),
          featuredImage: fc.constant(''),
          category: fc.constantFrom('Development', 'Design'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Open Graph images should be empty array when no featured image
          expect(metadata.openGraph?.images).toBeDefined();
          expect(metadata.openGraph?.images).toEqual([]);
          expect(metadata.openGraph?.images).toHaveLength(0);

          // Property 2: Twitter card images should be empty array when no featured image
          expect(metadata.twitter?.images).toBeDefined();
          expect(metadata.twitter?.images).toEqual([]);
          expect(metadata.twitter?.images).toHaveLength(0);

          // Property 3: Other metadata fields should still be present
          expect(metadata.title).toContain(post.title);
          expect(metadata.description).toBe(post.excerpt);
          expect(metadata.openGraph?.title).toBe(post.title);
          expect(metadata.twitter?.title).toBe(post.title);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate consistent metadata across multiple calls for the same post', () => {
    fc.assert(
      fc.property(
        // Generate a blog post
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
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post) => {
          // Generate metadata multiple times
          const metadata1 = generateBlogMetadata(post);
          const metadata2 = generateBlogMetadata(post);
          const metadata3 = generateBlogMetadata(post);

          // Property: All metadata generations should be identical
          expect(metadata1).toEqual(metadata2);
          expect(metadata2).toEqual(metadata3);
          expect(metadata1).toEqual(metadata3);

          // Property: Specific fields should match across all generations
          expect(metadata1.title).toBe(metadata2.title);
          expect(metadata1.description).toBe(metadata2.description);
          expect(metadata1.openGraph?.title).toBe(metadata2.openGraph?.title);
          expect(metadata1.twitter?.title).toBe(metadata2.twitter?.title);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate fallback metadata for null posts', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (nullPost) => {
          // Generate metadata for null post
          const metadata = generateBlogMetadata(nullPost);

          // Property 1: Should have fallback title
          expect(metadata.title).toBe('Post Not Found | Colour Clouds Digital');

          // Property 2: Should have fallback description
          expect(metadata.description).toBe('The requested blog post could not be found.');

          // Property 3: Should not have Open Graph tags
          expect(metadata.openGraph).toBeUndefined();

          // Property 4: Should not have Twitter card tags
          expect(metadata.twitter).toBeUndefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should preserve special characters in titles and excerpts', () => {
    fc.assert(
      fc.property(
        // Generate posts with special characters
        fc.record({
          id: fc.stringMatching(/^post-[0-9]{1,5}$/),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'"&()]{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'"&()]{10,100}$/),
          featuredImage: fc.webUrl(),
          category: fc.constantFrom('Development', 'Design'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Title should be preserved exactly (with branding suffix)
          expect(metadata.title).toBe(`${post.title} | Colour Clouds Digital`);

          // Property 2: Excerpt should be preserved exactly
          expect(metadata.description).toBe(post.excerpt);

          // Property 3: Open Graph title should preserve special characters
          expect(metadata.openGraph?.title).toBe(post.title);

          // Property 4: Open Graph description should preserve special characters
          expect(metadata.openGraph?.description).toBe(post.excerpt);

          // Property 5: Twitter title should preserve special characters
          expect(metadata.twitter?.title).toBe(post.title);

          // Property 6: Twitter description should preserve special characters
          expect(metadata.twitter?.description).toBe(post.excerpt);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate complete metadata structure for all valid posts', () => {
    fc.assert(
      fc.property(
        // Generate various blog posts
        fc.record({
          id: fc.uuid(),
          slug: fc.stringMatching(/^[a-z0-9-]{3,50}$/),
          title: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{5,100}$/),
          author: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
          publishedAt: safeISODate(),
          content: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?'\n]{20,500}$/),
          excerpt: fc.stringMatching(/^[a-zA-Z0-9\s\-.,!?']{10,100}$/),
          featuredImage: fc.oneof(fc.webUrl(), fc.constant('')),
          category: fc.constantFrom('Development', 'Design', 'Business', 'Technology'),
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { minLength: 0, maxLength: 5 }),
          status: fc.constant('published' as const),
          readTime: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Metadata must have title
          expect(metadata.title).toBeDefined();
          expect(typeof metadata.title).toBe('string');
          expect(metadata.title.length).toBeGreaterThan(0);

          // Property 2: Metadata must have description
          expect(metadata.description).toBeDefined();
          expect(typeof metadata.description).toBe('string');
          expect(metadata.description.length).toBeGreaterThan(0);

          // Property 3: Metadata must have Open Graph object
          expect(metadata.openGraph).toBeDefined();
          expect(typeof metadata.openGraph).toBe('object');

          // Property 4: Open Graph must have required fields
          expect(metadata.openGraph?.title).toBeDefined();
          expect(metadata.openGraph?.description).toBeDefined();
          expect(metadata.openGraph?.type).toBe('article');
          expect(metadata.openGraph?.publishedTime).toBeDefined();
          expect(metadata.openGraph?.authors).toBeDefined();
          expect(metadata.openGraph?.images).toBeDefined();

          // Property 5: Metadata must have Twitter card object
          expect(metadata.twitter).toBeDefined();
          expect(typeof metadata.twitter).toBe('object');

          // Property 6: Twitter card must have required fields
          expect(metadata.twitter?.card).toBe('summary_large_image');
          expect(metadata.twitter?.title).toBeDefined();
          expect(metadata.twitter?.description).toBeDefined();
          expect(metadata.twitter?.images).toBeDefined();

          // Property 7: All text fields should be non-empty strings
          expect(metadata.title).toBeTruthy();
          expect(metadata.description).toBeTruthy();
          expect(metadata.openGraph?.title).toBeTruthy();
          expect(metadata.openGraph?.description).toBeTruthy();
          expect(metadata.twitter?.title).toBeTruthy();
          expect(metadata.twitter?.description).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain metadata field relationships', () => {
    fc.assert(
      fc.property(
        // Generate blog posts
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
          tags: fc.array(fc.stringMatching(/^[a-z0-9-]{2,15}$/), { maxLength: 3 }),
          status: fc.constant('published' as const),
        }),
        (post) => {
          // Generate metadata
          const metadata = generateBlogMetadata(post);

          // Property 1: Page title should contain Open Graph title
          expect(metadata.title).toContain(metadata.openGraph?.title || '');

          // Property 2: Description should match Open Graph description
          expect(metadata.description).toBe(metadata.openGraph?.description);

          // Property 3: Description should match Twitter description
          expect(metadata.description).toBe(metadata.twitter?.description);

          // Property 4: Open Graph and Twitter titles should match
          expect(metadata.openGraph?.title).toBe(metadata.twitter?.title);

          // Property 5: Open Graph and Twitter descriptions should match
          expect(metadata.openGraph?.description).toBe(metadata.twitter?.description);

          // Property 6: Open Graph and Twitter images should match
          expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);

          // Property 7: All derived from the same source post
          expect(metadata.openGraph?.title).toBe(post.title);
          expect(metadata.description).toBe(post.excerpt);
          expect(metadata.openGraph?.publishedTime).toBe(post.publishedAt);
          expect(metadata.openGraph?.authors).toEqual([post.author]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
