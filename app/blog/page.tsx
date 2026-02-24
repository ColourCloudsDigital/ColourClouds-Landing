/**
 * Modern Blog Listing Page
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
 * - Modern card design with hover effects
 * - Loading states handled by loading.tsx
 * 
 * Requirements: 1.4, 4.2, 4.9, 4.10, 9.1, 12.7
 */

import { Suspense } from 'react';
import { getCachedBlogPosts } from '@/lib/cache';
import { Metadata } from 'next';
import { BlogListingClient } from '@/components/blog-listing-client';
import { Breadcrumb } from '@/components/breadcrumb';
import { BookOpen, TrendingUp, Sparkles } from 'lucide-react';

// ISR: Revalidate every hour (3600 seconds)
// Requirement: 12.7 - Implement incremental static regeneration for blog posts
export const revalidate = 3600;

/**
 * Generate metadata for the blog listing page
 * Requirements: 6.1, 6.3
 */
export const metadata: Metadata = {
  title: 'Blog | Colour Clouds Digital',
  description: 'Read our latest articles on app development, digital content creation, and technology insights. Stay updated with industry trends and best practices.',
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
 * Modern Loading Skeleton Component
 * Displayed while blog posts are being fetched
 * Requirement: 9.1 - Display loading indicator during data fetching
 */
function BlogListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 animate-shimmer" />
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 rounded animate-pulse" />
              <div className="h-7 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
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
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-lg text-gray-600">
          We're working on some amazing content. Check back soon!
        </p>
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
    <main className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-[#03050c] border-b border-gray-200 dark:border-transparent">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
            ]}
          />
        </div>
      </div>

      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-cc-green/10 via-cc-blue/10 to-background py-20 md:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cc-green/10 rounded-full text-cc-green font-semibold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Insights & Stories</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Explore Our <span className="text-cc-green">Blog</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Insights, tutorials, and stories from the Colour Clouds Digital team. 
              Stay updated with the latest in app development and digital content creation.
            </p>

          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 max-w-7xl py-16 md:py-20">
        <Suspense fallback={<BlogListingSkeleton />}>
          <BlogPostsGrid />
        </Suspense>
      </section>
    </main>
  );
}
