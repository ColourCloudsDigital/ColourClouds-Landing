/**
 * Modern Blog Card Component
 * 
 * Reusable component to display a blog post preview with title, excerpt, author,
 * date, featured image, category, tags, and link to detail page.
 * 
 * Features:
 * - Featured image with Next.js Image optimization and hover zoom effect
 * - Category badge with brand green color
 * - Tag badges with brand blue color
 * - Smooth hover effects and animations
 * - Responsive design with modern styling
 * - Read time display (optional)
 * - Link to blog post detail page
 * - Card lift effect on hover
 * 
 * Requirements: 4.5
 */

import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/types';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

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
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Modern Blog Card Component
 * 
 * Displays a preview of a blog post with:
 * - Title
 * - Excerpt
 * - Author
 * - Published date
 * - Featured image with zoom effect
 * - Category
 * - Tags
 * - Link to detail page
 * - Modern hover animations
 * 
 * @param post - The blog post data to display
 */
export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-500 hover:border-cc-green/30 hover:-translate-y-1 ">
      {/* Featured Image with Zoom Effect */}
      <Link href={`/blog/${post.slug}`} className="block relative w-full h-56 bg-gray-200 overflow-hidden">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge on Image */}
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1.5 text-xs font-semibold text-white bg-cc-green rounded-lg shadow-lg backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1 text-xs font-medium text-cc-blue bg-cc-blue/10 rounded-full hover:bg-cc-blue/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-cc-green transition-colors duration-200 line-clamp-2 leading-tight dark:text-gray-50">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-300 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          {post.readTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min</span>
            </div>
          )}
        </div>

        {/* Read More Link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-cc-blue font-semibold hover:text-cc-green transition-colors duration-200 group"
        >
          <span>Read Article</span>
          <ArrowRight className="w-4 h-4 arrow-animate" />
        </Link>
      </div>
    </article>
  );
}
