/**
 * Unit Tests for Related Posts Component
 * 
 * Tests the RelatedPosts component to ensure it:
 * - Renders related posts correctly
 * - Handles empty state
 * - Displays post information properly
 * - Links to correct blog post pages
 * 
 * Requirements: 4.8
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RelatedPosts } from '@/components/related-posts';
import { BlogPost } from '@/lib/types';

/**
 * Helper function to create a mock blog post
 */
function createMockPost(
  id: string,
  slug: string,
  title: string,
  category: string,
  excerpt: string
): BlogPost {
  return {
    id,
    slug,
    title,
    author: 'Test Author',
    publishedAt: '2024-01-15T10:00:00Z',
    content: 'Test content',
    excerpt,
    featuredImage: 'https://example.com/image.jpg',
    category,
    tags: ['test'],
    status: 'published',
  };
}

describe('RelatedPosts Component', () => {
  it('should render related posts section with posts', () => {
    const posts = [
      createMockPost('1', 'post-1', 'Related Post 1', 'Technology', 'Excerpt 1'),
      createMockPost('2', 'post-2', 'Related Post 2', 'Technology', 'Excerpt 2'),
    ];

    render(<RelatedPosts posts={posts} />);

    // Check section heading
    expect(screen.getByText('Related Posts')).toBeInTheDocument();

    // Check post titles
    expect(screen.getByText('Related Post 1')).toBeInTheDocument();
    expect(screen.getByText('Related Post 2')).toBeInTheDocument();

    // Check excerpts
    expect(screen.getByText('Excerpt 1')).toBeInTheDocument();
    expect(screen.getByText('Excerpt 2')).toBeInTheDocument();

    // Check categories
    const categoryBadges = screen.getAllByText('Technology');
    expect(categoryBadges).toHaveLength(2);
  });

  it('should render nothing when posts array is empty', () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when posts is undefined', () => {
    const { container } = render(<RelatedPosts posts={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render correct links to blog post pages', () => {
    const posts = [
      createMockPost('1', 'test-post-slug', 'Test Post', 'Technology', 'Test excerpt'),
    ];

    render(<RelatedPosts posts={posts} />);

    const links = screen.getAllByRole('link');
    // Should have 2 links per post (image and title)
    expect(links.length).toBeGreaterThanOrEqual(2);
    
    // Check that links point to correct blog post
    const postLinks = links.filter(link => 
      link.getAttribute('href') === '/blog/test-post-slug'
    );
    expect(postLinks.length).toBeGreaterThan(0);
  });

  it('should display author and formatted date', () => {
    const posts = [
      createMockPost('1', 'post-1', 'Test Post', 'Technology', 'Test excerpt'),
    ];

    render(<RelatedPosts posts={posts} />);

    expect(screen.getByText('Test Author')).toBeInTheDocument();
    // Date should be formatted as "Jan 15, 2024"
    expect(screen.getByText(/Jan.*15.*2024/)).toBeInTheDocument();
  });

  it('should render multiple posts in a grid', () => {
    const posts = [
      createMockPost('1', 'post-1', 'Post 1', 'Technology', 'Excerpt 1'),
      createMockPost('2', 'post-2', 'Post 2', 'Design', 'Excerpt 2'),
      createMockPost('3', 'post-3', 'Post 3', 'Business', 'Excerpt 3'),
    ];

    render(<RelatedPosts posts={posts} />);

    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
    expect(screen.getByText('Post 3')).toBeInTheDocument();
  });

  it('should display category badge for each post', () => {
    const posts = [
      createMockPost('1', 'post-1', 'Post 1', 'Technology', 'Excerpt 1'),
      createMockPost('2', 'post-2', 'Post 2', 'Design', 'Excerpt 2'),
    ];

    render(<RelatedPosts posts={posts} />);

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });
});
