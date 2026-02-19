/**
 * Cache Utilities
 * 
 * Provides caching functionality for blog posts and other frequently accessed data
 * to minimize Google Sheets API calls and improve performance.
 * 
 * Uses Next.js built-in caching with unstable_cache and revalidation tags.
 * 
 * Requirements: 2.6, 4.11, 12.1, 12.4
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { getGoogleSheetsService } from './google-sheets';
import { BlogPost } from './types';

/**
 * Cache tags for organizing and invalidating cached data
 */
export const CACHE_TAGS = {
  BLOG_POSTS: 'blog-posts',
  BLOG_POST: 'blog-post',
  CATEGORIES: 'categories',
  TAGS: 'tags',
} as const;

/**
 * Cache revalidation time-to-live (TTL) in seconds
 */
export const CACHE_REVALIDATE = {
  BLOG: 60,        // 1 minute for blog posts
  STATIC: 86400,     // 24 hours for static content
  DYNAMIC: 300,      // 5 minutes for dynamic content
} as const;

/**
 * Get cached blog posts from Google Sheets
 * 
 * This function uses Next.js unstable_cache to cache blog post data
 * for the configured TTL (1 hour by default). The cache is tagged with
 * 'blog-posts' for on-demand revalidation.
 * 
 * Requirements: 2.6, 4.11, 12.1, 12.4
 * 
 * @returns Promise<BlogPost[]> Array of published blog posts
 * @throws {GoogleSheetsError} If fetching blog posts fails
 */
export const getCachedBlogPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const sheetsService = getGoogleSheetsService();
    
    // Ensure service is initialized
    if (!(sheetsService as any).initialized) {
      await sheetsService.initialize();
    }
    
    // Fetch blog posts from Google Sheets
    const posts = await sheetsService.getBlogPosts();
    
    return posts;
  },
  ['blog-posts-list'], // Cache key
  {
    revalidate: CACHE_REVALIDATE.BLOG, // Revalidate every hour
    tags: [CACHE_TAGS.BLOG_POSTS], // Tag for on-demand revalidation
  }
);

/**
 * Get a cached blog post by slug
 * 
 * This function uses Next.js unstable_cache to cache individual blog posts
 * by their slug. Each post is cached separately with its own cache key.
 * 
 * Requirements: 2.6, 4.11, 12.1, 12.4
 * 
 * @param slug - URL-friendly identifier for the blog post
 * @returns Promise<BlogPost | null> Blog post or null if not found
 * @throws {GoogleSheetsError} If fetching the blog post fails
 */
export const getCachedBlogPostBySlug = (slug: string) => {
  return unstable_cache(
    async (): Promise<BlogPost | null> => {
      const sheetsService = getGoogleSheetsService();
      
      // Ensure service is initialized
      if (!(sheetsService as any).initialized) {
        await sheetsService.initialize();
      }
      
      // Fetch blog post by slug
      const post = await sheetsService.getBlogPostBySlug(slug);
      
      return post;
    },
    [`blog-post-${slug}`], // Unique cache key per slug
    {
      revalidate: CACHE_REVALIDATE.BLOG, // Revalidate every hour
      tags: [CACHE_TAGS.BLOG_POST, `blog-post-${slug}`], // Tags for on-demand revalidation
    }
  )();
};

/**
 * Revalidate all cached blog posts
 * 
 * This function triggers on-demand revalidation of all cached blog post data.
 * Use this when blog posts are updated in Google Sheets and you want to
 * immediately refresh the cache without waiting for the TTL to expire.
 * 
 * Requirements: 2.6, 12.4
 * 
 * @example
 * // After updating a blog post in Google Sheets
 * revalidateBlogPosts();
 */
export async function revalidateBlogPosts(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.BLOG_POSTS, 'default');
}

/**
 * Revalidate a specific cached blog post by slug
 * 
 * This function triggers on-demand revalidation of a specific blog post.
 * Use this when a single blog post is updated in Google Sheets.
 * 
 * Requirements: 2.6, 12.4
 * 
 * @param slug - URL-friendly identifier for the blog post to revalidate
 * 
 * @example
 * // After updating a specific blog post
 * revalidateBlogPost('my-blog-post-slug');
 */
export async function revalidateBlogPost(slug: string): Promise<void> {
  'use server';
  revalidateTag(`blog-post-${slug}`, 'default');
  revalidateTag(CACHE_TAGS.BLOG_POST, 'default');
}

/**
 * Revalidate all blog-related caches
 * 
 * This function triggers on-demand revalidation of all blog-related cached data,
 * including the blog post list and all individual blog posts.
 * 
 * Requirements: 2.6, 12.4
 * 
 * @example
 * // After making multiple blog post updates
 * revalidateAllBlogCaches();
 */
export async function revalidateAllBlogCaches(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.BLOG_POSTS, 'default');
  revalidateTag(CACHE_TAGS.BLOG_POST, 'default');
  revalidateTag(CACHE_TAGS.CATEGORIES, 'default');
  revalidateTag(CACHE_TAGS.TAGS, 'default');
}

/**
 * Get all unique categories from cached blog posts
 * 
 * This function extracts unique categories from the cached blog posts.
 * Useful for building category filters.
 * 
 * Requirements: 4.10
 * 
 * @returns Promise<string[]> Array of unique category names
 */
export async function getCachedCategories(): Promise<string[]> {
  const posts = await getCachedBlogPosts();
  const categories = new Set(posts.map(post => post.category).filter(Boolean));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags from cached blog posts
 * 
 * This function extracts unique tags from the cached blog posts.
 * Useful for building tag filters.
 * 
 * Requirements: 4.10
 * 
 * @returns Promise<string[]> Array of unique tag names
 */
export async function getCachedTags(): Promise<string[]> {
  const posts = await getCachedBlogPosts();
  const tags = new Set(
    posts.flatMap(post => post.tags || []).filter(Boolean)
  );
  return Array.from(tags).sort();
}
