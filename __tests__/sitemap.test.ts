/**
 * Unit tests for sitemap generation
 * 
 * Tests that the sitemap includes all expected static and dynamic pages.
 * 
 * Requirements: 6.5
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { MetadataRoute } from 'next';

// Mock the cache module
jest.mock('@/lib/cache', () => ({
  getCachedBlogPosts: jest.fn(),
}));

describe('Sitemap Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include all expected static pages', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock empty blog posts to test static pages only
    mockGetCachedBlogPosts.mockResolvedValue([]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Extract URLs from sitemap
    const urls = result.map((entry: MetadataRoute.Sitemap[number]) => entry.url);

    // Verify all static pages are included
    expect(urls).toContain('https://colourclouds.ng');
    expect(urls).toContain('https://colourclouds.ng/services');
    expect(urls).toContain('https://colourclouds.ng/about');
    expect(urls).toContain('https://colourclouds.ng/blog');
    expect(urls).toContain('https://colourclouds.ng/contact');
    expect(urls).toContain('https://colourclouds.ng/docs');
    expect(urls).toContain('https://colourclouds.ng/inators');
  });

  it('should include dynamic blog post pages', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock blog posts
    mockGetCachedBlogPosts.mockResolvedValue([
      {
        id: '1',
        slug: 'test-post-1',
        title: 'Test Post 1',
        author: 'Test Author',
        publishedAt: '2024-01-15T10:00:00Z',
        content: 'Test content',
        excerpt: 'Test excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['test'],
        status: 'published',
      },
      {
        id: '2',
        slug: 'test-post-2',
        title: 'Test Post 2',
        author: 'Test Author',
        publishedAt: '2024-01-20T10:00:00Z',
        content: 'Test content 2',
        excerpt: 'Test excerpt 2',
        featuredImage: 'https://example.com/image2.jpg',
        category: 'Design',
        tags: ['test'],
        status: 'published',
      },
    ]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Extract URLs from sitemap
    const urls = result.map((entry: MetadataRoute.Sitemap[number]) => entry.url);

    // Verify blog post pages are included
    expect(urls).toContain('https://colourclouds.ng/blog/test-post-1');
    expect(urls).toContain('https://colourclouds.ng/blog/test-post-2');
  });

  it('should handle blog post fetch errors gracefully', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock error when fetching blog posts
    mockGetCachedBlogPosts.mockRejectedValue(new Error('Failed to fetch blog posts'));

    // Spy on console.error to verify error logging
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Extract URLs from sitemap
    const urls = result.map((entry: MetadataRoute.Sitemap[number]) => entry.url);

    // Verify static pages are still included
    expect(urls).toContain('https://colourclouds.ng');
    expect(urls).toContain('https://colourclouds.ng/services');
    expect(urls).toContain('https://colourclouds.ng/about');
    expect(urls).toContain('https://colourclouds.ng/blog');
    expect(urls).toContain('https://colourclouds.ng/contact');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch blog posts for sitemap:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should set correct priorities for pages', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock empty blog posts
    mockGetCachedBlogPosts.mockResolvedValue([]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Find specific pages and check their priorities
    const homePage = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng'
    );
    const servicesPage = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng/services'
    );
    const blogPage = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng/blog'
    );

    // Verify priorities
    expect(homePage?.priority).toBe(1); // Highest priority for home
    expect(servicesPage?.priority).toBe(0.9); // High priority for services
    expect(blogPage?.priority).toBe(0.9); // High priority for blog
  });

  it('should use blog post published date as lastModified', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    const publishedDate = '2024-01-15T10:00:00Z';
    
    // Mock blog post with specific published date
    mockGetCachedBlogPosts.mockResolvedValue([
      {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        author: 'Test Author',
        publishedAt: publishedDate,
        content: 'Test content',
        excerpt: 'Test excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['test'],
        status: 'published',
      },
    ]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Find the blog post entry
    const blogPostEntry = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng/blog/test-post'
    );

    // Verify lastModified matches published date
    expect(blogPostEntry?.lastModified).toEqual(new Date(publishedDate));
  });

  it('should set correct change frequencies for pages', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock empty blog posts
    mockGetCachedBlogPosts.mockResolvedValue([]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Find specific pages and check their change frequencies
    const homePage = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng'
    );
    const blogPage = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng/blog'
    );
    const servicesPage = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng/services'
    );

    // Verify change frequencies
    expect(homePage?.changeFrequency).toBe('yearly');
    expect(blogPage?.changeFrequency).toBe('weekly');
    expect(servicesPage?.changeFrequency).toBe('monthly');
  });

  it('should include all pages with valid URLs', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock blog posts
    mockGetCachedBlogPosts.mockResolvedValue([
      {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        author: 'Test Author',
        publishedAt: '2024-01-15T10:00:00Z',
        content: 'Test content',
        excerpt: 'Test excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['test'],
        status: 'published',
      },
    ]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Verify all URLs are valid
    result.forEach((entry: MetadataRoute.Sitemap[number]) => {
      // URL should be a string
      expect(typeof entry.url).toBe('string');
      
      // URL should start with base URL
      expect(entry.url).toMatch(/^https:\/\/colourclouds\.ng/);
      
      // URL should not have trailing slash (except root)
      if (entry.url !== 'https://colourclouds.ng') {
        expect(entry.url).not.toMatch(/\/$/);
      }
      
      // URL should not have query parameters
      expect(entry.url).not.toContain('?');
      
      // URL should not have fragments
      expect(entry.url).not.toContain('#');
    });
  });

  it('should include lastModified for all pages', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock blog posts
    mockGetCachedBlogPosts.mockResolvedValue([
      {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        author: 'Test Author',
        publishedAt: '2024-01-15T10:00:00Z',
        content: 'Test content',
        excerpt: 'Test excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['test'],
        status: 'published',
      },
    ]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Verify all entries have lastModified
    result.forEach((entry: MetadataRoute.Sitemap[number]) => {
      expect(entry.lastModified).toBeDefined();
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });

  it('should handle blog posts without publishedAt date', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock blog post without publishedAt
    mockGetCachedBlogPosts.mockResolvedValue([
      {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        author: 'Test Author',
        publishedAt: '', // Empty publishedAt
        content: 'Test content',
        excerpt: 'Test excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: ['test'],
        status: 'published',
      },
    ]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Find the blog post entry
    const blogPostEntry = result.find((entry: MetadataRoute.Sitemap[number]) => 
      entry.url === 'https://colourclouds.ng/blog/test-post'
    );

    // Verify it still has a lastModified date (current date)
    expect(blogPostEntry?.lastModified).toBeDefined();
    expect(blogPostEntry?.lastModified).toBeInstanceOf(Date);
  });

  it('should return correct number of pages', async () => {
    const { getCachedBlogPosts } = await import('@/lib/cache');
    const mockGetCachedBlogPosts = getCachedBlogPosts as jest.MockedFunction<typeof getCachedBlogPosts>;
    
    // Mock 3 blog posts
    mockGetCachedBlogPosts.mockResolvedValue([
      {
        id: '1',
        slug: 'post-1',
        title: 'Post 1',
        author: 'Author',
        publishedAt: '2024-01-15T10:00:00Z',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Tech',
        tags: ['test'],
        status: 'published',
      },
      {
        id: '2',
        slug: 'post-2',
        title: 'Post 2',
        author: 'Author',
        publishedAt: '2024-01-16T10:00:00Z',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Tech',
        tags: ['test'],
        status: 'published',
      },
      {
        id: '3',
        slug: 'post-3',
        title: 'Post 3',
        author: 'Author',
        publishedAt: '2024-01-17T10:00:00Z',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Tech',
        tags: ['test'],
        status: 'published',
      },
    ]);

    // Import sitemap function after mocking
    const sitemap = (await import('@/app/sitemap')).default;
    const result = await sitemap();

    // Verify total count: 7 static pages + 3 blog posts = 10
    expect(result.length).toBe(10);
  });
});
