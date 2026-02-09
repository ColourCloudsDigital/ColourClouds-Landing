/**
 * Blog Listing Page
 * 
 * Server-side rendered blog listing page with ISR (Incremental Static Regeneration).
 * Displays all published blog posts with loading states during data fetching.
 * Includes search and filter functionality for categories and tags.
 * 
 * Features:
 * - Server-side rendering with Next.js App Router
 * - ISR with 1-hour revalidation (3600 seconds)
 * - Displays blog posts from Google Sheets via cached data
 * - Client-side search and filtering
 * - Loading states handled by loading.tsx
 * 
 * Requirements: 1.4, 4.2, 4.9, 4.10, 9.1, 12.7
 */

import { Suspense } from 'react';
import { getCachedBlogPosts } from '@/lib/cache';
import { Metadata } from 'next';
import { BlogListingClient } from '@/components/blog-listing-client';

// ISR: Revalidate every hour (3600 seconds)
// Requirement: 12.7 - Implement incremental static regeneration for blog posts
export const revalidate = 3600;

/**
 * Generate metadata for the blog listing page
 * Requirements: 6.1, 6.3
 */
export const metadata: Metadata = {
  title: 'Blog | Colour Clouds Digital',
  description: 'Read our latest articles on app development, digital content creation, and technology insights.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Colour Clouds Digital',
    description: 'Read our latest articles on app development, digital content creation, and technology insights.',
    type: 'website',
    url: '/blog',
  },
};

/**
 * Loading Skeleton Component
 * Displayed while blog posts are being fetched
 * Requirement: 9.1 - Display loading indicator during data fetching
 */
function BlogListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="w-full h-48 bg-gray-300" />
          <div className="p-6">
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-20 bg-gray-300 rounded-full" />
              <div className="h-6 w-16 bg-gray-300 rounded-full" />
            </div>
            <div className="h-8 bg-gray-300 rounded mb-2" />
            <div className="h-4 bg-gray-300 rounded mb-2" />
            <div className="h-4 bg-gray-300 rounded mb-4 w-3/4" />
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-gray-300 rounded" />
              <div className="h-4 w-20 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Blog Posts Grid Component
 * Fetches and displays blog posts with search and filter functionality
 */
async function BlogPostsGrid() {
  // Fetch cached blog posts from Google Sheets
  // Requirement: 4.2 - Display all published blog posts
  const posts = await getCachedBlogPosts();

  // Filter to only show published posts
  const publishedPosts = posts.filter((post) => post.status === 'published');

  if (publishedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No blog posts available yet. Check back soon!</p>
      </div>
    );
  }

  // Extract unique categories and tags from published posts
  const categories = Array.from(new Set(publishedPosts.map((post) => post.category)));
  const allTags = publishedPosts.flatMap((post) => post.tags);
  const tags = Array.from(new Set(allTags));

  return (
    <BlogListingClient 
      posts={publishedPosts} 
      categories={categories} 
      tags={tags} 
    />
  );
}

/**
 * Blog Listing Page Component
 * 
 * Main page component that displays the blog listing with server-side rendering
 * and ISR for optimal performance.
 * 
 * Requirements:
 * - 1.4: Provide blog listing page at "/blog"
 * - 4.2: Display all published blog posts
 * - 9.1: Display loading indicator during data fetching
 * - 12.7: Implement ISR for blog posts
 */
export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cc-green to-cc-blue text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Insights, tutorials, and stories from the Colour Clouds Digital team
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 max-w-7xl py-12">
        <Suspense fallback={<BlogListingSkeleton />}>
          <BlogPostsGrid />
        </Suspense>
      </section>
    </main>
  );
}
