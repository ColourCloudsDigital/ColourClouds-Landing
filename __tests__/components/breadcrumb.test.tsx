import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb';

describe('Breadcrumb Component', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Test Post', href: '/blog/test-post' }
  ];

  it('should render all breadcrumb items', () => {
    render(<Breadcrumb items={mockItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('should render links for non-last items', () => {
    render(<Breadcrumb items={mockItems} />);
    
    const homeLink = screen.getByRole('link', { name: /Navigate to Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
    
    const blogLink = screen.getByRole('link', { name: /Navigate to Blog/i });
    expect(blogLink).toHaveAttribute('href', '/blog');
  });

  it('should render last item as plain text with aria-current', () => {
    render(<Breadcrumb items={mockItems} />);
    
    const lastItem = screen.getByText('Test Post');
    expect(lastItem.tagName).toBe('SPAN');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('should have accessible navigation label', () => {
    render(<Breadcrumb items={mockItems} />);
    
    const nav = screen.getByRole('navigation', { name: /Breadcrumb navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('should include structured data for SEO', () => {
    const { container } = render(<Breadcrumb items={mockItems} />);
    
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    
    if (script) {
      const structuredData = JSON.parse(script.textContent || '{}');
      expect(structuredData['@type']).toBe('BreadcrumbList');
      expect(structuredData.itemListElement).toHaveLength(3);
      expect(structuredData.itemListElement[0].name).toBe('Home');
      expect(structuredData.itemListElement[0].position).toBe(1);
    }
  });

  it('should apply brand colors to links', () => {
    render(<Breadcrumb items={mockItems} />);
    
    const homeLink = screen.getByRole('link', { name: /Navigate to Home/i });
    expect(homeLink).toHaveClass('text-cc-blue');
    expect(homeLink).toHaveClass('hover:text-cc-green');
  });

  it('should handle single item breadcrumb', () => {
    const singleItem: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];
    
    render(<Breadcrumb items={singleItem} />);
    
    const item = screen.getByText('Home');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('aria-current', 'page');
  });

  it('should render separators between items', () => {
    const { container } = render(<Breadcrumb items={mockItems} />);
    
    // Should have 2 separators for 3 items (between items, not before first)
    const separators = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(separators.length).toBe(2);
  });
});
