/**
 * Related Posts Component
 * 
 * Displays a grid of related blog posts based on category and tags.
 * Shows up to 3 related posts with a compact card layout.
 * 
 * Features:
 * - Compact card design optimized for related content
 * - Featured image with Next.js Image optimization
 * - Category badge
 * - Responsive grid layout
 * - Hover effects
 * - Empty state handling
 * 
 * Requirements: 4.8
 */

import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/types';

interface RelatedPostsProps {
  posts: BlogPost[];
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Related Posts Component
 * 
 * Displays a section of related blog posts with:
 * - Section heading
 * - Grid of related post cards
 * - Empty state if no related posts
 * 
 * Requirements: 4.8 - Display related posts on blog post detail pages based on category or tags
 * 
 * @param posts - Array of related blog posts to display
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  // Don't render anything if there are no related posts
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      {/* Section Heading */}
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Related Posts
      </h2>

      {/* Related Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Featured Image */}
            <Link href={`/blog/${post.slug}`}>
              <div className="relative w-full h-40 bg-gray-200">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>

            {/* Content */}
            <div className="p-4">
              {/* Category Badge */}
              <div className="mb-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-cc-green rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-cc-green transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>

              {/* Excerpt */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{post.author}</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
