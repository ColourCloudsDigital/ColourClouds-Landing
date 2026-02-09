/**
 * Unit Tests for Blog Listing Client Component
 * 
 * Tests the blog listing client component functionality including:
 * - Rendering blog posts
 * - Search filtering
 * - Category filtering
 * - Tag filtering
 * - Combined filtering
 * - Empty state handling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BlogListingClient } from '@/components/blog-listing-client';
import { BlogPost } from '@/lib/types';

// Mock the child components
jest.mock('@/components/blog-card', () => ({
  BlogCard: ({ post }: { post: BlogPost }) => (
    <div data-testid={`blog-card-${post.id}`}>{post.title}</div>
  ),
}));

jest.mock('@/components/blog-search', () => ({
  BlogSearch: ({ onSearchChange }: { onSearchChange: (term: string) => void }) => (
    <input
      data-testid="blog-search"
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search"
    />
  ),
}));

jest.mock('@/components/blog-filter', () => ({
  BlogFilter: ({
    onFilterChange,
  }: {
    onFilterChange: (filters: { category: string | null; tags: string[] }) => void;
  }) => (
    <div data-testid="blog-filter">
      <button onClick={() => onFilterChange({ category: 'Development', tags: [] })}>
        Filter Development
      </button>
      <button onClick={() => onFilterChange({ category: null, tags: ['nextjs'] })}>
        Filter nextjs
      </button>
    </div>
  ),
}));

describe('BlogListingClient Component', () => {
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      slug: 'post-1',
      title: 'Next.js Tutorial',
      author: 'John Doe',
      publishedAt: '2024-01-01',
      content: 'Learn Next.js basics',
      excerpt: 'A comprehensive guide to Next.js',
      featuredImage: 'https://example.com/image1.jpg',
      category: 'Development',
      tags: ['nextjs', 'react'],
      status: 'published',
    },
    {
      id: '2',
      slug: 'post-2',
      title: 'Design Principles',
      author: 'Jane Smith',
      publishedAt: '2024-01-02',
      content: 'Learn design basics',
      excerpt: 'Essential design principles',
      featuredImage: 'https://example.com/image2.jpg',
      category: 'Design',
      tags: ['ui', 'ux'],
      status: 'published',
    },
    {
      id: '3',
      slug: 'post-3',
      title: 'React Hooks Guide',
      author: 'John Doe',
      publishedAt: '2024-01-03',
      content: 'Master React hooks',
      excerpt: 'Deep dive into React hooks',
      featuredImage: 'https://example.com/image3.jpg',
      category: 'Development',
      tags: ['react', 'hooks'],
      status: 'published',
    },
  ];

  const mockCategories = ['Development', 'Design'];
  const mockTags = ['nextjs', 'react', 'ui', 'ux', 'hooks'];

  it('should render all blog posts initially', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('blog-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('blog-card-3')).toBeInTheDocument();
  });

  it('should filter posts by search term', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const searchInput = screen.getByTestId('blog-search');
    fireEvent.change(searchInput, { target: { value: 'Design' } });

    // Only the Design post should be visible
    expect(screen.queryByTestId('blog-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('blog-card-2')).toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-3')).not.toBeInTheDocument();
  });

  it('should filter posts by category', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const filterButton = screen.getByText('Filter Development');
    fireEvent.click(filterButton);

    // Only Development posts should be visible
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('blog-card-3')).toBeInTheDocument();
  });

  it('should filter posts by tag', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const filterButton = screen.getByText('Filter nextjs');
    fireEvent.click(filterButton);

    // Only posts with nextjs tag should be visible
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-3')).not.toBeInTheDocument();
  });

  it('should show results count when filters are active', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const searchInput = screen.getByTestId('blog-search');
    fireEvent.change(searchInput, { target: { value: 'guide' } });

    // Should show results count (matches "comprehensive guide" and "Hooks Guide")
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText(/of/)).toBeInTheDocument();
    // Check for the actual count shown
    const countText = screen.getByText(/Showing/).textContent;
    expect(countText).toContain('2'); // 2 posts match "guide"
    expect(countText).toContain('3'); // out of 3 total
  });

  it('should show empty state when no posts match filters', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const searchInput = screen.getByTestId('blog-search');
    fireEvent.change(searchInput, { target: { value: 'NonExistentTerm' } });

    expect(screen.getByText(/No blog posts match your search or filters/)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search term/)).toBeInTheDocument();
  });

  it('should search across title, excerpt, content, and author', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const searchInput = screen.getByTestId('blog-search');

    // Search by author
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('blog-card-3')).toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-2')).not.toBeInTheDocument();

    // Search by excerpt
    fireEvent.change(searchInput, { target: { value: 'comprehensive' } });
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('blog-card-3')).not.toBeInTheDocument();
  });

  it('should handle empty posts array', () => {
    render(
      <BlogListingClient
        posts={[]}
        categories={[]}
        tags={[]}
      />
    );

    expect(screen.getByText(/No blog posts match your search or filters/)).toBeInTheDocument();
  });

  it('should be case-insensitive when searching', () => {
    render(
      <BlogListingClient
        posts={mockPosts}
        categories={mockCategories}
        tags={mockTags}
      />
    );

    const searchInput = screen.getByTestId('blog-search');

    // Search with lowercase
    fireEvent.change(searchInput, { target: { value: 'next.js' } });
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();

    // Search with uppercase
    fireEvent.change(searchInput, { target: { value: 'NEXT.JS' } });
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();

    // Search with mixed case
    fireEvent.change(searchInput, { target: { value: 'NeXt.Js' } });
    expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
  });
});
