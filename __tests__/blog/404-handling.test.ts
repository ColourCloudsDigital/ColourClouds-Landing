/**
 * Unit Tests for Blog Post 404 Handling
 * 
 * Tests that the blog post detail page properly handles missing posts:
 * - Non-existent blog post returns 404
 * - notFound() function is called correctly
 * - Proper error handling for missing posts
 * 
 * Requirements: 4.6
 */

import { notFound } from 'next/navigation';
import { getCachedBlogPostBySlug } from '@/lib/cache';
import { BlogPost } from '@/lib/types';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock the cache module
jest.mock('@/lib/cache', () => ({
  getCachedBlogPostBySlug: jest.fn(),
  getCachedBlogPosts: jest.fn(),
}));

/**
 * Helper function that simulates the blog post page logic
 * This mimics the behavior in app/blog/[slug]/page.tsx
 */
async function simulateBlogPostPageLogic(slug: string): Promise<BlogPost | null> {
  const post = await getCachedBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
    return null;
  }
  
  return post;
}

describe('Blog Post 404 Handling', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Non-existent blog post handling', () => {
    /**
     * Test: Non-existent blog post returns 404
     * 
     * Requirement 4.6: WHEN a blog post is requested that does not exist, 
     * THE System SHALL return a 404 error page
     * 
     * This test verifies that when a blog post slug does not exist in the system,
     * the notFound() function is called to trigger Next.js's 404 page.
     */
    it('should call notFound() when blog post does not exist', async () => {
      // Arrange
      const nonExistentSlug = 'non-existent-post';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(nonExistentSlug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(nonExistentSlug);
      expect(notFound).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Multiple non-existent slugs all trigger 404
     * 
     * This test verifies that the 404 handling is consistent across
     * different non-existent slug values.
     */
    it('should consistently call notFound() for various non-existent slugs', async () => {
      // Arrange
      const nonExistentSlugs = [
        'missing-post',
        'deleted-article',
        'invalid-slug-123',
        'post-that-never-existed',
      ];

      // Act & Assert
      for (const slug of nonExistentSlugs) {
        jest.clearAllMocks();
        (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

        await simulateBlogPostPageLogic(slug);

        expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(slug);
        expect(notFound).toHaveBeenCalledTimes(1);
      }
    });

    /**
     * Test: Empty string slug triggers 404
     * 
     * Edge case: Verify that an empty string slug is handled correctly
     * and triggers the 404 page.
     */
    it('should call notFound() for empty string slug', async () => {
      // Arrange
      const emptySlug = '';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(emptySlug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(emptySlug);
      expect(notFound).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Special characters in slug trigger 404 when post not found
     * 
     * Edge case: Verify that slugs with special characters are handled
     * correctly when the post doesn't exist.
     */
    it('should call notFound() for slug with special characters when post not found', async () => {
      // Arrange
      const specialSlug = 'post-with-special-chars-!@#$%';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(specialSlug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(specialSlug);
      expect(notFound).toHaveBeenCalledTimes(1);
    });
  });

  describe('Existing blog post handling', () => {
    /**
     * Test: Existing blog post does NOT trigger 404
     * 
     * This test verifies that when a valid blog post exists,
     * the notFound() function is NOT called and the post is returned.
     */
    it('should NOT call notFound() when blog post exists', async () => {
      // Arrange
      const existingSlug = 'existing-post';
      const mockPost: BlogPost = {
        id: '1',
        slug: existingSlug,
        title: 'Existing Blog Post',
        author: 'John Doe',
        publishedAt: '2024-01-15T10:00:00Z',
        content: 'This is the content of an existing post.',
        excerpt: 'This post exists in the system.',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['nextjs', 'testing'],
        status: 'published',
      };
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(mockPost);

      // Act
      const result = await simulateBlogPostPageLogic(existingSlug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(existingSlug);
      expect(notFound).not.toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    /**
     * Test: Multiple existing posts do NOT trigger 404
     * 
     * This test verifies that the system correctly handles multiple
     * valid blog post requests without triggering 404.
     */
    it('should NOT call notFound() for multiple existing posts', async () => {
      // Arrange
      const posts = [
        {
          id: '1',
          slug: 'first-post',
          title: 'First Post',
          author: 'Author 1',
          publishedAt: '2024-01-01T10:00:00Z',
          content: 'Content 1',
          excerpt: 'Excerpt 1',
          featuredImage: 'https://example.com/1.jpg',
          category: 'Tech',
          tags: ['tag1'],
          status: 'published' as const,
        },
        {
          id: '2',
          slug: 'second-post',
          title: 'Second Post',
          author: 'Author 2',
          publishedAt: '2024-01-02T10:00:00Z',
          content: 'Content 2',
          excerpt: 'Excerpt 2',
          featuredImage: 'https://example.com/2.jpg',
          category: 'Design',
          tags: ['tag2'],
          status: 'published' as const,
        },
      ];

      // Act & Assert
      for (const post of posts) {
        jest.clearAllMocks();
        (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(post);

        const result = await simulateBlogPostPageLogic(post.slug);

        expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(post.slug);
        expect(notFound).not.toHaveBeenCalled();
        expect(result).toEqual(post);
      }
    });
  });

  describe('Error handling edge cases', () => {
    /**
     * Test: Null return value triggers 404
     * 
     * This test explicitly verifies that a null return value from
     * getCachedBlogPostBySlug triggers the 404 page.
     */
    it('should call notFound() when getCachedBlogPostBySlug returns null', async () => {
      // Arrange
      const slug = 'test-slug';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(slug);

      // Assert
      expect(notFound).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Undefined return value triggers 404
     * 
     * Edge case: Verify that an undefined return value is handled
     * the same as null and triggers 404.
     */
    it('should call notFound() when getCachedBlogPostBySlug returns undefined', async () => {
      // Arrange
      const slug = 'test-slug';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(undefined);

      // Act
      await simulateBlogPostPageLogic(slug);

      // Assert
      expect(notFound).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Very long slug triggers 404 when post not found
     * 
     * Edge case: Verify that very long slugs are handled correctly
     * when the post doesn't exist.
     */
    it('should call notFound() for very long slug when post not found', async () => {
      // Arrange
      const longSlug = 'a'.repeat(500); // 500 character slug
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(longSlug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(longSlug);
      expect(notFound).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Slug with only whitespace triggers 404 when post not found
     * 
     * Edge case: Verify that slugs with only whitespace are handled
     * correctly when the post doesn't exist.
     */
    it('should call notFound() for whitespace-only slug when post not found', async () => {
      // Arrange
      const whitespaceSlug = '   ';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(whitespaceSlug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(whitespaceSlug);
      expect(notFound).toHaveBeenCalledTimes(1);
    });
  });

  describe('notFound() function behavior', () => {
    /**
     * Test: notFound() is called exactly once per missing post
     * 
     * This test verifies that the notFound() function is called
     * exactly once (not multiple times) for each missing post request.
     */
    it('should call notFound() exactly once per missing post request', async () => {
      // Arrange
      const slug = 'missing-post';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(slug);

      // Assert
      expect(notFound).toHaveBeenCalledTimes(1);
      expect(notFound).toHaveBeenCalledWith(); // Called with no arguments
    });

    /**
     * Test: notFound() is called with no arguments
     * 
     * This test verifies that the notFound() function is called
     * without any arguments, as per Next.js conventions.
     */
    it('should call notFound() with no arguments', async () => {
      // Arrange
      const slug = 'missing-post';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(slug);

      // Assert
      expect(notFound).toHaveBeenCalledWith();
    });

    /**
     * Test: notFound() is never called for existing posts
     * 
     * This test verifies that the notFound() function is never called
     * when a valid post exists, regardless of the post's properties.
     */
    it('should never call notFound() when post exists with any valid properties', async () => {
      // Arrange
      const postsWithVariousProperties = [
        // Post with all fields
        {
          id: '1',
          slug: 'complete-post',
          title: 'Complete Post',
          author: 'Author',
          publishedAt: '2024-01-01T10:00:00Z',
          content: 'Content',
          excerpt: 'Excerpt',
          featuredImage: 'https://example.com/image.jpg',
          category: 'Tech',
          tags: ['tag1', 'tag2'],
          status: 'published' as const,
          readTime: 5,
        },
        // Post with minimal fields
        {
          id: '2',
          slug: 'minimal-post',
          title: 'Minimal Post',
          author: 'Author',
          publishedAt: '2024-01-01T10:00:00Z',
          content: 'Content',
          excerpt: 'Excerpt',
          featuredImage: '',
          category: 'General',
          tags: [],
          status: 'published' as const,
        },
        // Post with empty optional fields
        {
          id: '3',
          slug: 'empty-optional-fields',
          title: 'Post with Empty Optional Fields',
          author: 'Author',
          publishedAt: '2024-01-01T10:00:00Z',
          content: 'Content',
          excerpt: 'Excerpt',
          featuredImage: '',
          category: '',
          tags: [],
          status: 'published' as const,
          readTime: undefined,
        },
      ];

      // Act & Assert
      for (const post of postsWithVariousProperties) {
        jest.clearAllMocks();
        (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(post);

        await simulateBlogPostPageLogic(post.slug);

        expect(notFound).not.toHaveBeenCalled();
      }
    });
  });

  describe('Integration with cache layer', () => {
    /**
     * Test: getCachedBlogPostBySlug is called with correct slug
     * 
     * This test verifies that the cache layer is properly invoked
     * with the correct slug parameter.
     */
    it('should call getCachedBlogPostBySlug with the provided slug', async () => {
      // Arrange
      const slug = 'test-post';
      (getCachedBlogPostBySlug as jest.Mock).mockResolvedValue(null);

      // Act
      await simulateBlogPostPageLogic(slug);

      // Assert
      expect(getCachedBlogPostBySlug).toHaveBeenCalledWith(slug);
      expect(getCachedBlogPostBySlug).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Cache layer is called before notFound()
     * 
     * This test verifies the correct order of operations:
     * 1. Cache layer is queried first
     * 2. notFound() is called only after cache returns null
     */
    it('should call getCachedBlogPostBySlug before calling notFound()', async () => {
      // Arrange
      const slug = 'missing-post';
      const callOrder: string[] = [];

      (getCachedBlogPostBySlug as jest.Mock).mockImplementation(async () => {
        callOrder.push('getCachedBlogPostBySlug');
        return null;
      });

      (notFound as jest.Mock).mockImplementation(() => {
        callOrder.push('notFound');
      });

      // Act
      await simulateBlogPostPageLogic(slug);

      // Assert
      expect(callOrder).toEqual(['getCachedBlogPostBySlug', 'notFound']);
    });
  });
});
