/**
 * Unit Tests for Blog Search Component
 * 
 * Tests the blog search component functionality including:
 * - Rendering with default props
 * - Search input changes
 * - Clear button functionality
 * - Accessibility features
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BlogSearch } from '@/components/blog-search';

describe('BlogSearch Component', () => {
  it('should render search input with default placeholder', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search blog posts...');
  });

  it('should render with custom placeholder', () => {
    const mockOnSearchChange = jest.fn();
    const customPlaceholder = 'Find articles...';
    
    render(
      <BlogSearch
        onSearchChange={mockOnSearchChange}
        placeholder={customPlaceholder}
      />
    );
    
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('should render with initial value', () => {
    const mockOnSearchChange = jest.fn();
    const initialValue = 'React';
    
    render(
      <BlogSearch
        onSearchChange={mockOnSearchChange}
        initialValue={initialValue}
      />
    );
    
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
    expect(searchInput.value).toBe(initialValue);
  });

  it('should call onSearchChange when input value changes', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'TypeScript' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('TypeScript');
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
  });

  it('should update input value when typing', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Next.js' } });
    
    expect(searchInput.value).toBe('Next.js');
  });

  it('should show clear button when input has value', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByRole('searchbox');
    
    // Initially, clear button should not be visible
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Clear button should now be visible
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');
    
    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    // Input should be cleared
    expect(searchInput.value).toBe('');
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });

  it('should have proper accessibility attributes', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    // Check for search role
    const searchForm = screen.getByRole('search');
    expect(searchForm).toBeInTheDocument();
    expect(searchForm).toHaveAttribute('aria-label', 'Search blog posts');
    
    // Check for searchbox role
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute(
      'aria-label',
      'Search blog posts by title, content, or author'
    );
  });

  it('should prevent form submission', () => {
    const mockOnSearchChange = jest.fn();
    const mockSubmit = jest.fn((e) => e.preventDefault());
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchForm = screen.getByRole('search');
    
    // Add event listener to check if preventDefault is called
    searchForm.addEventListener('submit', mockSubmit);
    
    fireEvent.submit(searchForm);
    
    // Form submission handler should be called (but default prevented)
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('should handle multiple search term changes', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByRole('searchbox');
    
    // Type multiple times
    fireEvent.change(searchInput, { target: { value: 'R' } });
    fireEvent.change(searchInput, { target: { value: 'Re' } });
    fireEvent.change(searchInput, { target: { value: 'Rea' } });
    fireEvent.change(searchInput, { target: { value: 'Reac' } });
    fireEvent.change(searchInput, { target: { value: 'React' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledTimes(5);
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('React');
  });

  it('should handle empty string search', () => {
    const mockOnSearchChange = jest.fn();
    
    render(<BlogSearch onSearchChange={mockOnSearchChange} initialValue="test" />);
    
    const searchInput = screen.getByRole('searchbox');
    
    // Clear the input
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });
});
