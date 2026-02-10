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
 * Response:
 * Success (200): { success: true, data: { posts: BlogPost[], total: number, filters: {...} } }
 * Rate Limit (429): { success: false, error: "Too many requests. Please try again later." }
 * Server Error (500/503): { success: false, error: "Error message" }
 * 
 * Requirements: 4.9, 4.10, 2.5, 9.3, 9.4
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
    // Requirements: 2.5 - Handle Google Sheets API errors gracefully
    let posts;
    try {
      posts = await getCachedBlogPosts();
    } catch (error) {
      // Log the specific error for debugging
      // Requirements: 2.5 - Log errors for debugging
      if (error instanceof GoogleSheetsError) {
        logger.error('Google Sheets API error while fetching blog posts', error, {
          code: error.code,
          statusCode: error.statusCode,
        });
        return NextResponse.json(
          {
            success: false,
            error: 'Service temporarily unavailable. Please try again later.',
          },
          { status: 503 }
        );
      }

      if (error instanceof RateLimitError) {
        logger.error('Rate limit exceeded while fetching blog posts', error, {
          retryAfter: error.retryAfter,
        });
        return NextResponse.json(
          {
            success: false,
            error: 'Service is currently busy. Please try again in a moment.',
          },
          {
            status: 429,
            headers: {
              'Retry-After': error.retryAfter.toString(),
            },
          }
        );
      }

      // Re-throw unexpected errors to be caught by outer catch block
      throw error;
    }

    // Filter posts based on query parameters
    const filteredPosts = filterBlogPosts(posts, category, tag, search);

    logger.info(`Returning ${filteredPosts.length} blog posts (filtered from ${posts.length} total)`);

    // Return filtered posts
    // Requirements: 9.3 - Return appropriate error responses
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
    // Log unexpected errors for debugging
    // Requirements: 2.5, 9.3 - Log errors and return user-friendly messages
    logger.error('Unexpected error in blog API', error, {
      errorName: error?.name,
      errorMessage: error?.message,
    });

    // Handle rate limit errors
    // Requirements: 2.4 - Handle rate limit errors gracefully
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service is currently busy. Please try again in a moment.',
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
    // Requirements: 2.5 - Return user-friendly error message for API failures
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
    // Requirements: 9.4 - Return user-friendly error messages (not exposing internal details)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while fetching blog posts.',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, OPTIONS',
      },
    }
  );
}
