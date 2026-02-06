/**
 * Integration tests for Blog API Route
 * 
 * Tests the GET endpoint with various query parameters and error scenarios.
 * 
 * Requirements: 4.9, 4.10
 * 
 * @jest-environment node
 */

import { GET } from '../route';
import { NextRequest } from 'next/server';
import { getCachedBlogPosts } from '@/lib/cache';
import { GoogleSheetsError, RateLimitError, BlogPost } from '@/lib/types';

// Mock the cache module
jest.mock('@/lib/cache', () => ({
  getCachedBlogPosts: jest.fn(),
}));

const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;

// Sample blog posts for testing
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'nextjs-portfolio',
    title: 'Building a Modern Portfolio with Next.js',
    author: 'Jane Smith',
    publishedAt: '2024-01-15T10:00:00Z',
    content: 'Full content about Next.js portfolio development...',
    excerpt: 'Learn how to build a modern portfolio website',
    featuredImage: 'https://example.com/image1.jpg',
    category: 'Development',
    tags: ['nextjs', 'portfolio', 'web'],
    status: 'published',
    readTime: 5,
  },
  {
    id: '2',
    slug: 'react-best-practices',
    title: 'React Best Practices 2024',
    author: 'John Doe',
    publishedAt: '2024-01-20T10:00:00Z',
    content: 'Full content about React best practices...',
    excerpt: 'Essential React patterns and practices',
    featuredImage: 'https://example.com/image2.jpg',
    category: 'Development',
    tags: ['react', 'javascript', 'best-practices'],
    status: 'published',
    readTime: 8,
  },
  {
    id: '3',
    slug: 'design-trends',
    title: 'Design Trends for 2024',
    author: 'Alice Designer',
    publishedAt: '2024-01-25T10:00:00Z',
    content: 'Full content about design trends...',
    excerpt: 'Explore the latest design trends',
    featuredImage: 'https://example.com/image3.jpg',
    category: 'Design',
    tags: ['design', 'trends', 'ui'],
    status: 'published',
    readTime: 6,
  },
];

describe('Blog API Route - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return all blog posts when no filters are applied', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(3);
      expect(data.data.total).toBe(3);
      expect(data.data.filters).toEqual({
        category: null,
        tag: null,
        search: null,
      });
    });
  });

  describe('Category filtering', () => {
    it('should filter posts by category (case-insensitive)', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?category=development');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(2);
      expect(data.data.posts.every((post: BlogPost) => post.category === 'Development')).toBe(true);
      expect(data.data.filters.category).toBe('development');
    });

    it('should return empty array when category has no matches', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?category=NonExistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(0);
      expect(data.data.total).toBe(0);
    });
  });

  describe('Tag filtering', () => {
    it('should filter posts by tag (case-insensitive)', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?tag=nextjs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].slug).toBe('nextjs-portfolio');
      expect(data.data.filters.tag).toBe('nextjs');
    });

    it('should return empty array when tag has no matches', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?tag=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(0);
    });
  });

  describe('Search functionality', () => {
    it('should search in title (case-insensitive)', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?search=portfolio');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].slug).toBe('nextjs-portfolio');
    });

    it('should search in excerpt', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?search=patterns');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].slug).toBe('react-best-practices');
    });

    it('should search in content', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?search=React');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts.length).toBeGreaterThan(0);
    });

    it('should search in author name', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?search=Alice');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].author).toBe('Alice Designer');
    });

    it('should return empty array when search has no matches', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?search=nonexistentterm');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(0);
    });
  });

  describe('Combined filters', () => {
    it('should apply multiple filters together', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?category=Development&tag=nextjs&search=modern');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].slug).toBe('nextjs-portfolio');
      expect(data.data.filters).toEqual({
        category: 'Development',
        tag: 'nextjs',
        search: 'modern',
      });
    });

    it('should return empty array when combined filters have no matches', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?category=Design&tag=nextjs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('should handle RateLimitError with 429 status', async () => {
      mockGetCachedBlogPosts.mockRejectedValue(
        new RateLimitError('Rate limit exceeded', 60)
      );

      const request = new NextRequest('http://localhost:3000/api/blog');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Too many requests');
      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('should handle GoogleSheetsError with 503 status', async () => {
      mockGetCachedBlogPosts.mockRejectedValue(
        new GoogleSheetsError('Sheets API error', 'API_ERROR', 500)
      );

      const request = new NextRequest('http://localhost:3000/api/blog');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Service temporarily unavailable');
    });

    it('should handle generic errors with 500 status', async () => {
      mockGetCachedBlogPosts.mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest('http://localhost:3000/api/blog');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('unexpected error');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty blog posts array', async () => {
      mockGetCachedBlogPosts.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/blog');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(0);
      expect(data.data.total).toBe(0);
    });

    it('should handle posts with empty tags array', async () => {
      const postsWithEmptyTags: BlogPost[] = [
        {
          ...mockBlogPosts[0],
          tags: [],
        },
      ];
      mockGetCachedBlogPosts.mockResolvedValue(postsWithEmptyTags);

      const request = new NextRequest('http://localhost:3000/api/blog?tag=nextjs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(0);
    });

    it('should handle special characters in search query', async () => {
      mockGetCachedBlogPosts.mockResolvedValue(mockBlogPosts);

      const request = new NextRequest('http://localhost:3000/api/blog?search=Next.js');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should still work with special characters
    });
  });
});
