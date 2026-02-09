/**
 * Blog Post Not Found Page
 * 
 * Custom 404 page for non-existent blog posts.
 * Displayed when a blog post with the requested slug doesn't exist.
 * 
 * Requirement: 4.6 - Return 404 error page for non-existent posts
 */

import Link from 'next/link';

export default function BlogPostNotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Icon */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Blog Post Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, we couldn't find the blog post you're looking for. It may have been moved or deleted.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cc-green hover:bg-cc-green/90 transition-colors"
          >
            View All Blog Posts
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
