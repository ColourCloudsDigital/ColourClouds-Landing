/**
 * Blog Card Component
 * 
 * Reusable component to display a blog post preview with title, excerpt, author,
 * date, featured image, category, tags, and link to detail page.
 * 
 * Features:
 * - Featured image with Next.js Image optimization
 * - Category badge with brand green color
 * - Tag badges with brand blue color
 * - Hover effects for better UX
 * - Responsive design
 * - Read time display (optional)
 * - Link to blog post detail page
 * 
 * Requirements: 4.5
 */

import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/types';

interface BlogCardProps {
  post: BlogPost;
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Blog Card Component
 * 
 * Displays a preview of a blog post with:
 * - Title
 * - Excerpt
 * - Author
 * - Published date
 * - Featured image
 * - Category
 * - Tags
 * - Link to detail page
 * 
 * @param post - The blog post data to display
 */
export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Featured Image */}
      <Link href={`/blog/${post.slug}`}>
        <div className="relative w-full h-48 bg-gray-200">
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
      <div className="p-6">
        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-cc-green rounded-full">
            {post.category}
          </span>
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-xs font-semibold text-cc-blue border border-cc-blue rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-cc-green transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="font-medium">{post.author}</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          {post.readTime && (
            <span>{post.readTime} min read</span>
          )}
        </div>

        {/* Read More Link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-block mt-4 text-cc-blue font-semibold hover:text-cc-green transition-colors"
        >
          Read More →
        </Link>
      </div>
    </article>
  );
}
