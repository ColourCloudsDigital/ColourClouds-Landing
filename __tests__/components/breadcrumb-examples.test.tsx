/**
 * Unit tests for breadcrumb examples on specific pages
 * 
 * Tests Requirements:
 * - 10.2: Services page displays breadcrumb "Home > Services"
 * - 10.3: About page displays breadcrumb "Home > About"
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/breadcrumb';

describe('Breadcrumb Examples - Specific Pages', () => {
  /**
   * Test for Requirement 10.2
   * Services page breadcrumb example
   */
  describe('Services Page Breadcrumb', () => {
    it('should display breadcrumb navigation showing "Home > Services"', () => {
      // Arrange: Create breadcrumb items matching services page implementation
      const servicesBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
      ];

      // Act: Render the breadcrumb component
      render(<Breadcrumb items={servicesBreadcrumbItems} />);

      // Assert: Verify both breadcrumb items are displayed
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();

      // Assert: Verify Home is a link
      const homeLink = screen.getByRole('link', { name: /Navigate to Home/i });
      expect(homeLink).toHaveAttribute('href', '/');

      // Assert: Verify Services is the current page (not a link)
      const servicesItem = screen.getByText('Services');
      expect(servicesItem.tagName).toBe('SPAN');
      expect(servicesItem).toHaveAttribute('aria-current', 'page');
    });

    it('should have correct structure for services page breadcrumb', () => {
      // Arrange
      const servicesBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
      ];

      // Act
      const { container } = render(<Breadcrumb items={servicesBreadcrumbItems} />);

      // Assert: Verify navigation element exists
      const nav = screen.getByRole('navigation', { name: /Breadcrumb navigation/i });
      expect(nav).toBeInTheDocument();

      // Assert: Verify ordered list structure
      const orderedList = container.querySelector('ol');
      expect(orderedList).toBeInTheDocument();

      // Assert: Verify there are exactly 2 list items
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(2);

      // Assert: Verify separator exists (1 separator for 2 items)
      const separators = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(separators.length).toBe(1);
    });
  });

  /**
   * Test for Requirement 10.3
   * About page breadcrumb example
   */
  describe('About Page Breadcrumb', () => {
    it('should display breadcrumb navigation showing "Home > About"', () => {
      // Arrange: Create breadcrumb items matching about page implementation
      const aboutBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];

      // Act: Render the breadcrumb component
      render(<Breadcrumb items={aboutBreadcrumbItems} />);

      // Assert: Verify both breadcrumb items are displayed
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();

      // Assert: Verify Home is a link
      const homeLink = screen.getByRole('link', { name: /Navigate to Home/i });
      expect(homeLink).toHaveAttribute('href', '/');

      // Assert: Verify About is the current page (not a link)
      const aboutItem = screen.getByText('About');
      expect(aboutItem.tagName).toBe('SPAN');
      expect(aboutItem).toHaveAttribute('aria-current', 'page');
    });

    it('should have correct structure for about page breadcrumb', () => {
      // Arrange
      const aboutBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];

      // Act
      const { container } = render(<Breadcrumb items={aboutBreadcrumbItems} />);

      // Assert: Verify navigation element exists
      const nav = screen.getByRole('navigation', { name: /Breadcrumb navigation/i });
      expect(nav).toBeInTheDocument();

      // Assert: Verify ordered list structure
      const orderedList = container.querySelector('ol');
      expect(orderedList).toBeInTheDocument();

      // Assert: Verify there are exactly 2 list items
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(2);

      // Assert: Verify separator exists (1 separator for 2 items)
      const separators = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(separators.length).toBe(1);
    });
  });

  /**
   * Additional test to verify both examples follow the same pattern
   */
  describe('Breadcrumb Pattern Consistency', () => {
    it('should follow the same pattern for both services and about pages', () => {
      // Arrange
      const servicesBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
      ];
      const aboutBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];

      // Act: Render both breadcrumbs
      const { container: servicesContainer } = render(
        <Breadcrumb items={servicesBreadcrumbItems} />
      );
      const { container: aboutContainer } = render(
        <Breadcrumb items={aboutBreadcrumbItems} />
      );

      // Assert: Both should have the same structure
      const servicesListItems = servicesContainer.querySelectorAll('li');
      const aboutListItems = aboutContainer.querySelectorAll('li');
      expect(servicesListItems.length).toBe(aboutListItems.length);

      // Assert: Both should have the same number of separators
      const servicesSeparators = servicesContainer.querySelectorAll('svg[aria-hidden="true"]');
      const aboutSeparators = aboutContainer.querySelectorAll('svg[aria-hidden="true"]');
      expect(servicesSeparators.length).toBe(aboutSeparators.length);

      // Assert: Both should have structured data
      const servicesScript = servicesContainer.querySelector('script[type="application/ld+json"]');
      const aboutScript = aboutContainer.querySelector('script[type="application/ld+json"]');
      expect(servicesScript).toBeInTheDocument();
      expect(aboutScript).toBeInTheDocument();
    });
  });

  /**
   * Edge case: Verify breadcrumb styling matches brand colors
   */
  describe('Brand Color Consistency', () => {
    it('should apply brand colors to breadcrumb links on services page', () => {
      // Arrange
      const servicesBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
      ];

      // Act
      render(<Breadcrumb items={servicesBreadcrumbItems} />);

      // Assert: Verify Home link has brand colors
      const homeLink = screen.getByRole('link', { name: /Navigate to Home/i });
      expect(homeLink).toHaveClass('text-cc-blue');
      expect(homeLink).toHaveClass('hover:text-cc-green');
    });

    it('should apply brand colors to breadcrumb links on about page', () => {
      // Arrange
      const aboutBreadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];

      // Act
      render(<Breadcrumb items={aboutBreadcrumbItems} />);

      // Assert: Verify Home link has brand colors
      const homeLink = screen.getByRole('link', { name: /Navigate to Home/i });
      expect(homeLink).toHaveClass('text-cc-blue');
      expect(homeLink).toHaveClass('hover:text-cc-green');
    });
  });
});
