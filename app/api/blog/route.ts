/**
 * Blog API Route
 * 
 * Provides a GET endpoint for fetching blog posts with support for:
 * - Category filtering
 * - Tag filtering
 * - Search functionality
 * - Caching integration
 * 
 * Requirements: 4.9, 4.10
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedBlogPosts } from '@/lib/cache';
import { GoogleSheetsError, RateLimitError } from '@/lib/types';
import { BlogPost } from '@/lib/types';

/**
 * Logger utility for API operations
 */
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[Blog API INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(`[Blog API ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  },
};

/**
 * Filter blog posts based on query parameters
 * 
 * @param posts - Array of blog posts to filter
 * @param category - Category to filter by (optional)
 * @param tag - Tag to filter by (optional)
 * @param search - Search term to filter by (optional)
 * @returns Filtered array of blog posts
 */
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

/**
 * GET handler for blog posts
 * 
 * Query parameters:
 * - category: Filter by category (case-insensitive)
 * - tag: Filter by tag (case-insensitive)
 * - search: Search in title, excerpt, content, and author (case-insensitive)
 * 
 * Example requests:
 * - GET /api/blog
 * - GET /api/blog?category=Development
 * - GET /api/blog?tag=nextjs
 * - GET /api/blog?search=portfolio
 * - GET /api/blog?category=Development&tag=nextjs&search=modern
 * 
 * Requirements: 4.9, 4.10
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching blog posts', {
      url: request.url,
    });

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    logger.info('Query parameters', { category, tag, search });

    // Fetch cached blog posts
    const posts = await getCachedBlogPosts();

    // Filter posts based on query parameters
    const filteredPosts = filterBlogPosts(posts, category, tag, search);

    logger.info(`Returning ${filteredPosts.length} blog posts (filtered from ${posts.length} total)`);

    // Return filtered posts
    return NextResponse.json({
      success: true,
      data: {
        posts: filteredPosts,
        total: filteredPosts.length,
        filters: {
          category: category || null,
          tag: tag || null,
          search: search || null,
        },
      },
    });

  } catch (error: any) {
    logger.error('Failed to fetch blog posts', error);

    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': error.retryAfter.toString(),
          },
        }
      );
    }

    // Handle Google Sheets errors
    if (error instanceof GoogleSheetsError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while fetching blog posts.',
      },
      { status: 500 }
    );
  }
}
