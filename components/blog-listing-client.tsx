/**
 * Blog Listing Client Component
 * 
 * Client-side component that handles search and filter functionality for blog posts.
 * This component receives the posts from the server and provides interactive filtering.
 * 
 * Features:
 * - Client-side search across title, excerpt, content, and author
 * - Category filtering (single selection)
 * - Tag filtering (multiple selection)
 * - Real-time filtering without page reload
 * - Displays filtered results count
 * 
 * Requirements: 4.9, 4.10
 */

'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/types';
import { BlogCard } from '@/components/blog-card';
import { BlogSearch } from '@/components/blog-search';
import { BlogFilter, FilterState } from '@/components/blog-filter';

interface BlogListingClientProps {
  /** Array of blog posts to display */
  posts: BlogPost[];
  /** Array of available categories */
  categories: string[];
  /** Array of available tags */
  tags: string[];
}

/**
 * Filter blog posts based on search term
 * Searches across title, excerpt, content, and author fields
 */
function filterBySearch(posts: BlogPost[], searchTerm: string): BlogPost[] {
  if (!searchTerm.trim()) {
    return posts;
  }

  const lowerSearch = searchTerm.toLowerCase();
  
  return posts.filter((post) => {
    return (
      post.title.toLowerCase().includes(lowerSearch) ||
      post.excerpt.toLowerCase().includes(lowerSearch) ||
      post.content.toLowerCase().includes(lowerSearch) ||
      post.author.toLowerCase().includes(lowerSearch)
    );
  });
}

/**
 * Filter blog posts based on category and tags
 * Category filter: posts must match the selected category (if any)
 * Tag filter: posts must include ALL selected tags
 */
function filterByFilters(posts: BlogPost[], filters: FilterState): BlogPost[] {
  let filtered = posts;

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((post) => post.category === filters.category);
  }

  // Filter by tags (posts must include ALL selected tags)
  if (filters.tags.length > 0) {
    filtered = filtered.filter((post) => {
      return filters.tags.every((tag) => post.tags.includes(tag));
    });
  }

  return filtered;
}

/**
 * Blog Listing Client Component
 * 
 * Provides interactive search and filtering for blog posts.
 * All filtering happens client-side for instant feedback.
 * 
 * @param posts - Array of blog posts to display
 * @param categories - Array of available categories
 * @param tags - Array of available tags
 */
export function BlogListingClient({
  posts,
  categories,
  tags,
}: BlogListingClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    tags: [],
  });

  /**
   * Apply search and filters to posts
   * Uses useMemo to avoid recalculating on every render
   */
  const filteredPosts = useMemo(() => {
    let result = posts;
    
    // Apply search filter
    result = filterBySearch(result, searchTerm);
    
    // Apply category and tag filters
    result = filterByFilters(result, filters);
    
    return result;
  }, [posts, searchTerm, filters]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || filters.category !== null || filters.tags.length > 0;
  }, [searchTerm, filters]);

  return (
    <div>
      {/* Search Component */}
      <BlogSearch onSearchChange={setSearchTerm} />

      {/* Filter Component */}
      <BlogFilter
        categories={categories}
        tags={tags}
        onFilterChange={setFilters}
      />

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredPosts.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{posts.length}</span> posts
          </p>
        </div>
      )}

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No blog posts match your search or filters.
          </p>
          <p className="text-gray-500 mt-2">
            Try adjusting your search term or clearing some filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
