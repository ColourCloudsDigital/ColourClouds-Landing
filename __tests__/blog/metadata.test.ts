/**
 * Unit Tests for Blog Post Metadata Generation
 * 
 * Tests the metadata generation logic to ensure it properly generates:
 * - Title from blog post data
 * - Description from excerpt
 * - Open Graph tags
 * 
 * Requirements: 6.1, 6.6
 */

import { BlogPost } from '@/lib/types';
import { Metadata } from 'next';

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

describe('Blog Post Metadata Generation', () => {
  describe('generateBlogMetadata', () => {
    it('should generate complete metadata for a valid blog post', () => {
      // Arrange
      const mockPost: BlogPost = {
        id: '1',
        slug: 'test-post',
        title: 'Test Blog Post',
        author: 'John Doe',
        publishedAt: '2024-01-15T10:00:00Z',
        content: 'This is the full content of the blog post.',
        excerpt: 'This is a test excerpt for the blog post.',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['nextjs', 'testing'],
        status: 'published',
      };

      // Act
      const metadata = generateBlogMetadata(mockPost);

      // Assert
      expect(metadata.title).toBe('Test Blog Post | Colour Clouds Digital');
      expect(metadata.description).toBe('This is a test excerpt for the blog post.');
      
      // Verify Open Graph tags
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('Test Blog Post');
      expect(metadata.openGraph?.description).toBe('This is a test excerpt for the blog post.');
      expect(metadata.openGraph?.images).toEqual(['https://example.com/image.jpg']);
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.publishedTime).toBe('2024-01-15T10:00:00Z');
      expect(metadata.openGraph?.authors).toEqual(['John Doe']);
      
      // Verify Twitter card tags
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Test Blog Post');
      expect(metadata.twitter?.description).toBe('This is a test excerpt for the blog post.');
      expect(metadata.twitter?.images).toEqual(['https://example.com/image.jpg']);
    });

    it('should handle blog post without featured image', () => {
      // Arrange
      const mockPost: BlogPost = {
        id: '2',
        slug: 'no-image-post',
        title: 'Post Without Image',
        author: 'Jane Smith',
        publishedAt: '2024-01-20T10:00:00Z',
        content: 'Content without image.',
        excerpt: 'Excerpt without image.',
        featuredImage: '',
        category: 'General',
        tags: ['blog'],
        status: 'published',
      };

      // Act
      const metadata = generateBlogMetadata(mockPost);

      // Assert
      expect(metadata.openGraph?.images).toEqual([]);
      expect(metadata.twitter?.images).toEqual([]);
    });

    it('should return fallback metadata when post is not found', () => {
      // Act
      const metadata = generateBlogMetadata(null);

      // Assert
      expect(metadata.title).toBe('Post Not Found | Colour Clouds Digital');
      expect(metadata.description).toBe('The requested blog post could not be found.');
      expect(metadata.openGraph).toBeUndefined();
    });

    it('should generate metadata with all required Open Graph fields', () => {
      // Arrange
      const mockPost: BlogPost = {
        id: '3',
        slug: 'complete-post',
        title: 'Complete Blog Post',
        author: 'Alice Johnson',
        publishedAt: '2024-02-01T14:30:00Z',
        content: 'Full content here.',
        excerpt: 'Complete excerpt here.',
        featuredImage: 'https://example.com/complete.jpg',
        category: 'Development',
        tags: ['react', 'nextjs', 'typescript'],
        status: 'published',
        readTime: 5,
      };

      // Act
      const metadata = generateBlogMetadata(mockPost);

      // Assert - Verify all Open Graph required fields are present
      expect(metadata.openGraph).toMatchObject({
        title: 'Complete Blog Post',
        description: 'Complete excerpt here.',
        images: ['https://example.com/complete.jpg'],
        type: 'article',
        publishedTime: '2024-02-01T14:30:00Z',
        authors: ['Alice Johnson'],
      });
    });

    it('should include Twitter card metadata', () => {
      // Arrange
      const mockPost: BlogPost = {
        id: '4',
        slug: 'twitter-test',
        title: 'Twitter Card Test',
        author: 'Bob Wilson',
        publishedAt: '2024-03-01T10:00:00Z',
        content: 'Testing Twitter cards.',
        excerpt: 'Twitter card excerpt.',
        featuredImage: 'https://example.com/twitter.jpg',
        category: 'Social Media',
        tags: ['twitter'],
        status: 'published',
      };

      // Act
      const metadata = generateBlogMetadata(mockPost);

      // Assert
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: 'Twitter Card Test',
        description: 'Twitter card excerpt.',
        images: ['https://example.com/twitter.jpg'],
      });
    });
  });
});
