/**
 * Blog Filter Component
 * 
 * Client-side filter component for filtering blog posts by category and tags.
 * Works with the blog listing page to provide interactive filtering.
 * 
 * Features:
 * - Filter by category (single selection)
 * - Filter by tags (multiple selection)
 * - Clear all filters button
 * - Accessible form with proper labels
 * - Responsive design
 * - Visual feedback for active filters
 * 
 * Requirements: 4.10
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Filter, X } from 'lucide-react';

interface BlogFilterProps {
  /** Array of available categories */
  categories: string[];
  /** Array of available tags */
  tags: string[];
  /** Callback function called when filters change */
  onFilterChange: (filters: FilterState) => void;
  /** Initial filter state (optional) */
  initialFilters?: FilterState;
}

export interface FilterState {
  /** Selected category (null means all categories) */
  category: string | null;
  /** Array of selected tags */
  tags: string[];
}

/**
 * Blog Filter Component
 * 
 * Provides category and tag filtering for blog posts. The component is controlled
 * and calls the onFilterChange callback whenever filters are updated.
 * 
 * @param categories - Array of available categories
 * @param tags - Array of available tags
 * @param onFilterChange - Callback function to handle filter changes
 * @param initialFilters - Initial filter state
 */
export function BlogFilter({
  categories,
  tags,
  onFilterChange,
  initialFilters = { category: null, tags: [] },
}: BlogFilterProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Handle category selection
   * Updates the category filter and calls the parent callback
   */
  const handleCategoryChange = useCallback(
    (category: string | null) => {
      const newFilters = { ...filters, category };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  /**
   * Handle tag selection/deselection
   * Toggles a tag in the selected tags array
   */
  const handleTagToggle = useCallback(
    (tag: string) => {
      const newTags = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag];
      
      const newFilters = { ...filters, tags: newTags };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  /**
   * Clear all filters
   * Resets category and tags to initial state
   */
  const handleClearFilters = useCallback(() => {
    const newFilters = { category: null, tags: [] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [onFilterChange]);

  /**
   * Toggle filter panel expansion on mobile
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return filters.category !== null || filters.tags.length > 0;
  }, [filters]);

  /**
   * Count of active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    count += filters.tags.length;
    return count;
  }, [filters]);

  return (
    <div className="w-full mb-8">
      {/* Filter Header - Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          <span className="flex items-center gap-2 font-medium text-gray-900">
            <Filter className="h-5 w-5" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-cc-green rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <span className="text-sm text-gray-500">
            {isExpanded ? 'Hide' : 'Show'}
          </span>
        </button>
      </div>

      {/* Filter Panel */}
      <div
        id="filter-panel"
        className={`bg-white border border-gray-200 rounded-lg p-6 ${
          isExpanded ? 'block' : 'hidden'
        } lg:block`}
        role="region"
        aria-label="Blog post filters"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Category Filter */}
          <div className="flex-1">
            <label
              htmlFor="category-filter"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {/* All Categories Button */}
              <button
                type="button"
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filters.category === null
                    ? 'bg-cc-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={filters.category === null}
              >
                All
              </button>
              
              {/* Category Buttons */}
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    filters.category === category
                      ? 'bg-cc-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={filters.category === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags available</p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      filters.tags.includes(tag)
                        ? 'bg-cc-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={filters.tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                aria-label="Clear all filters"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Summary - Screen Reader */}
        <div className="sr-only" role="status" aria-live="polite">
          {hasActiveFilters ? (
            <>
              Active filters:
              {filters.category && ` Category: ${filters.category}.`}
              {filters.tags.length > 0 && ` Tags: ${filters.tags.join(', ')}.`}
            </>
          ) : (
            'No filters active. Showing all blog posts.'
          )}
        </div>
      </div>
    </div>
  );
}
