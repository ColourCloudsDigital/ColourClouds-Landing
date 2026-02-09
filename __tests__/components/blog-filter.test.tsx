/**
 * Unit Tests for Blog Filter Component
 * 
 * Tests the blog filter component functionality including:
 * - Rendering with categories and tags
 * - Category selection
 * - Tag selection/deselection
 * - Clear filters functionality
 * - Mobile toggle functionality
 * - Accessibility features
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BlogFilter, FilterState } from '@/components/blog-filter';

describe('BlogFilter Component', () => {
  const mockCategories = ['Development', 'Design', 'Marketing'];
  const mockTags = ['nextjs', 'react', 'typescript', 'tailwind'];
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('should render all categories', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check for "All" button
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();

    // Check for each category
    mockCategories.forEach((category) => {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument();
    });
  });

  it('should render all tags', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check for each tag
    mockTags.forEach((tag) => {
      expect(screen.getByRole('button', { name: tag })).toBeInTheDocument();
    });
  });

  it('should show "No tags available" when tags array is empty', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={[]}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('should call onFilterChange when category is selected', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const categoryButton = screen.getByRole('button', { name: 'Development' });
    fireEvent.click(categoryButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: 'Development',
      tags: [],
    });
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
  });

  it('should call onFilterChange when "All" category is selected', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        initialFilters={{ category: 'Development', tags: [] }}
      />
    );

    const allButton = screen.getByRole('button', { name: 'All' });
    fireEvent.click(allButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: null,
      tags: [],
    });
  });

  it('should call onFilterChange when tag is selected', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const tagButton = screen.getByRole('button', { name: 'nextjs' });
    fireEvent.click(tagButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: null,
      tags: ['nextjs'],
    });
  });

  it('should allow multiple tag selection', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Select first tag
    const tag1Button = screen.getByRole('button', { name: 'nextjs' });
    fireEvent.click(tag1Button);

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      category: null,
      tags: ['nextjs'],
    });

    // Select second tag
    const tag2Button = screen.getByRole('button', { name: 'react' });
    fireEvent.click(tag2Button);

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      category: null,
      tags: ['nextjs', 'react'],
    });
  });

  it('should deselect tag when clicked again', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        initialFilters={{ category: null, tags: ['nextjs', 'react'] }}
      />
    );

    // Click to deselect
    const tagButton = screen.getByRole('button', { name: 'nextjs' });
    fireEvent.click(tagButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: null,
      tags: ['react'],
    });
  });

  it('should show clear filters button when filters are active', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        initialFilters={{ category: 'Development', tags: [] }}
      />
    );

    expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        initialFilters={{ category: 'Development', tags: ['nextjs', 'react'] }}
      />
    );

    const clearButton = screen.getByLabelText('Clear all filters');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: null,
      tags: [],
    });
  });

  it('should apply initial filters', () => {
    const initialFilters: FilterState = {
      category: 'Development',
      tags: ['nextjs'],
    };

    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        initialFilters={initialFilters}
      />
    );

    // Category button should be active
    const categoryButton = screen.getByRole('button', { name: 'Development' });
    expect(categoryButton).toHaveAttribute('aria-pressed', 'true');

    // Tag button should be active
    const tagButton = screen.getByRole('button', { name: 'nextjs' });
    expect(tagButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show active filter count badge on mobile toggle', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        initialFilters={{ category: 'Development', tags: ['nextjs', 'react'] }}
      />
    );

    // Should show count of 3 (1 category + 2 tags)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should toggle filter panel on mobile', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /Filters/i });
    const filterPanel = screen.getByRole('region', { name: 'Blog post filters' });

    // Initially hidden on mobile (has 'hidden' class)
    expect(filterPanel).toHaveClass('hidden');

    // Click to expand
    fireEvent.click(toggleButton);

    // Should now be visible (no 'hidden' class, has 'block' class)
    expect(filterPanel).toHaveClass('block');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    fireEvent.click(toggleButton);

    // Should be hidden again
    expect(filterPanel).toHaveClass('hidden');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check for region role
    const filterPanel = screen.getByRole('region', { name: 'Blog post filters' });
    expect(filterPanel).toBeInTheDocument();

    // Check for aria-pressed on buttons
    const allButton = screen.getByRole('button', { name: 'All' });
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should handle category and tag filters together', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Select category
    const categoryButton = screen.getByRole('button', { name: 'Development' });
    fireEvent.click(categoryButton);

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      category: 'Development',
      tags: [],
    });

    // Select tag
    const tagButton = screen.getByRole('button', { name: 'nextjs' });
    fireEvent.click(tagButton);

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      category: 'Development',
      tags: ['nextjs'],
    });
  });

  it('should update aria-pressed when category is selected', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const allButton = screen.getByRole('button', { name: 'All' });
    const devButton = screen.getByRole('button', { name: 'Development' });

    // Initially, "All" should be pressed
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
    expect(devButton).toHaveAttribute('aria-pressed', 'false');

    // Click Development
    fireEvent.click(devButton);

    // Now Development should be pressed
    expect(allButton).toHaveAttribute('aria-pressed', 'false');
    expect(devButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should update aria-pressed when tag is toggled', () => {
    render(
      <BlogFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const tagButton = screen.getByRole('button', { name: 'nextjs' });

    // Initially not pressed
    expect(tagButton).toHaveAttribute('aria-pressed', 'false');

    // Click to select
    fireEvent.click(tagButton);

    // Now pressed
    expect(tagButton).toHaveAttribute('aria-pressed', 'true');

    // Click to deselect
    fireEvent.click(tagButton);

    // Not pressed again
    expect(tagButton).toHaveAttribute('aria-pressed', 'false');
  });
});
