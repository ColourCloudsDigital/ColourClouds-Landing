/**
 * Blog Search Component
 * 
 * Client-side search component for filtering blog posts by search term.
 * Searches across title, excerpt, content, and author fields.
 * 
 * Features:
 * - Real-time search input
 * - Client-side filtering
 * - Case-insensitive search
 * - Searches in title, excerpt, content, and author
 * - Accessible form with proper labels
 * - Clear button to reset search
 * - Responsive design
 * 
 * Requirements: 4.9
 */

'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface BlogSearchProps {
  /** Callback function called when search term changes */
  onSearchChange: (searchTerm: string) => void;
  /** Initial search term (optional) */
  initialValue?: string;
  /** Placeholder text for the search input */
  placeholder?: string;
}

/**
 * Blog Search Component
 * 
 * Provides a search input for filtering blog posts. The component is controlled
 * and calls the onSearchChange callback whenever the search term changes.
 * 
 * @param onSearchChange - Callback function to handle search term changes
 * @param initialValue - Initial value for the search input
 * @param placeholder - Placeholder text for the input field
 */
export function BlogSearch({
  onSearchChange,
  initialValue = '',
  placeholder = 'Search blog posts...',
}: BlogSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  /**
   * Handle search input change
   * Updates local state and calls the parent callback
   */
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      onSearchChange(value);
    },
    [onSearchChange]
  );

  /**
   * Clear the search input
   * Resets the search term to empty string
   */
  const handleClear = useCallback(() => {
    setSearchTerm('');
    onSearchChange('');
  }, [onSearchChange]);

  /**
   * Handle form submission
   * Prevents default form submission behavior
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto mb-8"
      role="search"
      aria-label="Search blog posts"
    >
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>

        {/* Search Input */}
        <input
          type="search"
          id="blog-search"
          name="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-cc-green focus:border-cc-green 
                     text-gray-900 placeholder-gray-500
                     transition-colors duration-200
                     hover:border-gray-400"
          aria-label="Search blog posts by title, content, or author"
          autoComplete="off"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center 
                       text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Screen reader helper text */}
      <div className="sr-only" role="status" aria-live="polite">
        {searchTerm
          ? `Searching for: ${searchTerm}`
          : 'Enter a search term to filter blog posts'}
      </div>
    </form>
  );
}
