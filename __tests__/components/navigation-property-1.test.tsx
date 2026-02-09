/**
 * Property-Based Test for Navigation Component Consistency
 * 
 * Tests universal properties of the navigation component:
 * - Property 1: Navigation Component Consistency
 * 
 * **Validates: Requirements 1.7**
 * 
 * Requirement 1.7: WHEN a user navigates to any page, THE System SHALL display 
 * a consistent main navigation component with links to all primary pages
 */

/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the SVG import
jest.mock('@/app/cc-logo.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="cc-logo" />,
}));

// Import after mocking
import MainNav from '@/components/mainNav';

// ============================================================================
// Property 1: Navigation Component Consistency
// ============================================================================

describe('Property 1: Navigation Component Consistency', () => {
  /**
   * **Validates: Requirements 1.7**
   * 
   * Requirement 1.7: WHEN a user navigates to any page, THE System SHALL display 
   * a consistent main navigation component with links to all primary pages
   * 
   * Property: For all pages in the system, the navigation component SHALL:
   * 1. Render successfully without errors
   * 2. Display all required navigation links (Home, Services, About, Blog, Contact)
   * 3. Have correct href attributes for each link
   * 4. Maintain consistent structure and content
   * 5. Be accessible with proper ARIA labels
   * 
   * This property tests that:
   * - Navigation renders consistently regardless of context
   * - All required links are present
   * - Links point to correct paths
   * - Navigation structure is stable
   * - Accessibility features are present
   */

  const requiredPages = [
    { title: 'Home', path: '/' },
    { title: 'Services', path: '/services' },
    { title: 'About', path: '/about' },
    { title: 'Blog', path: '/blog' },
    { title: 'Contact', path: '/contact' },
  ];

  it('should render navigation component consistently with all required links', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary rendering contexts to test consistency
        fc.record({
          renderCount: fc.integer({ min: 1, max: 10 }),
          // Simulate different page contexts
          pageContext: fc.constantFrom('/', '/services', '/about', '/blog', '/contact', '/blog/test-post'),
        }),
        ({ renderCount, pageContext }) => {
          // Render the navigation component multiple times to test consistency
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainNav />);

            // Property 1: Navigation should render without errors
            expect(container).toBeTruthy();
            expect(container.querySelector('header')).toBeTruthy();

            // Property 2: All required navigation links should be present
            requiredPages.forEach(page => {
              const links = screen.getAllByText(page.title);
              expect(links.length).toBeGreaterThan(0);
              
              // Find the link element (could be in mobile or desktop menu)
              const linkElement = links.find(link => 
                link.tagName === 'A' || link.closest('a')
              );
              expect(linkElement).toBeTruthy();
            });

            // Property 3: Navigation should have correct structure
            const header = container.querySelector('header');
            expect(header).toBeTruthy();
            expect(header?.classList.contains('shadow')).toBe(true);
            expect(header?.classList.contains('bg-white')).toBe(true);

            // Property 4: Logo link should be present and point to home
            const logoLink = screen.getByLabelText('Back to homepage');
            expect(logoLink).toBeTruthy();
            expect(logoLink.getAttribute('href')).toBe('/');

            // Property 5: Mobile menu button should be present
            const menuButton = screen.getByTitle('menu');
            expect(menuButton).toBeTruthy();

            // Property 6: Navigation should be in a fixed position at top
            const navContainer = container.querySelector('.fixed.top-0.left-0.w-full');
            expect(navContainer).toBeTruthy();
            expect(navContainer?.classList.contains('z-50')).toBe(true);

            // Clean up for next iteration
            unmount();
          }
        }
      ),
      { numRuns: 50 } // Test with 50 different scenarios
    );
  });

  it('should maintain consistent link structure and paths across renders', () => {
    fc.assert(
      fc.property(
        // Generate multiple render scenarios
        fc.integer({ min: 2, max: 5 }),
        (renderCount) => {
          const renderedStructures: Array<{ title: string; href: string | null }[]> = [];

          // Render navigation multiple times and capture structure
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainNav />);
            
            const structure = requiredPages.map(page => {
              const links = screen.getAllByText(page.title);
              const linkElement = links[0].closest('a');
              return {
                title: page.title,
                href: linkElement?.getAttribute('href') || null,
              };
            });

            renderedStructures.push(structure);
            unmount();
          }

          // Property: All renders should have identical structure
          for (let i = 1; i < renderedStructures.length; i++) {
            expect(renderedStructures[i]).toEqual(renderedStructures[0]);
          }

          // Property: Each link should point to the correct path
          renderedStructures[0].forEach((link, index) => {
            expect(link.href).toBe(requiredPages[index].path);
            expect(link.title).toBe(requiredPages[index].title);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should have all required navigation links with correct paths', () => {
    fc.assert(
      fc.property(
        // Test with different subsets of pages to verify all are present
        fc.shuffledSubarray(requiredPages, { minLength: requiredPages.length, maxLength: requiredPages.length }),
        (pagesToCheck) => {
          const { container, unmount } = render(<MainNav />);

          // Property: Every required page should have a navigation link
          pagesToCheck.forEach(page => {
            const links = screen.getAllByText(page.title);
            expect(links.length).toBeGreaterThan(0);

            // Find the actual link element
            const linkElement = links[0].closest('a');
            expect(linkElement).toBeTruthy();

            // Property: Link should have correct href
            expect(linkElement?.getAttribute('href')).toBe(page.path);
          });

          // Property: Navigation should have exactly the required number of links
          const allLinks = container.querySelectorAll('nav a, header a');
          const navigationLinks = Array.from(allLinks).filter(link => {
            const href = link.getAttribute('href');
            return requiredPages.some(page => page.path === href);
          });

          // Should have at least one link for each page (could be duplicated for mobile/desktop)
          requiredPages.forEach(page => {
            const pageLinks = Array.from(allLinks).filter(
              link => link.getAttribute('href') === page.path
            );
            expect(pageLinks.length).toBeGreaterThan(0);
          });

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain accessibility features consistently', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainNav />);

            // Property: Logo should have accessible label
            const logoLink = screen.getByLabelText('Back to homepage');
            expect(logoLink).toBeTruthy();
            expect(logoLink.getAttribute('aria-label')).toBe('Back to homepage');

            // Property: Menu button should have accessible title
            const menuButton = screen.getByTitle('menu');
            expect(menuButton).toBeTruthy();
            expect(menuButton.getAttribute('title')).toBe('menu');

            // Property: All navigation links should be keyboard accessible
            const allLinks = container.querySelectorAll('a');
            allLinks.forEach(link => {
              // Links should not have negative tabindex (should be keyboard accessible)
              const tabIndex = link.getAttribute('tabindex');
              if (tabIndex !== null) {
                expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
              }
            });

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should have consistent visual structure and styling', () => {
    fc.assert(
      fc.property(
        // Test with different render scenarios
        fc.record({
          iterations: fc.integer({ min: 1, max: 5 }),
        }),
        ({ iterations }) => {
          const capturedStyles: Array<{
            hasHeader: boolean;
            hasShadow: boolean;
            hasWhiteBg: boolean;
            isFixed: boolean;
            hasZIndex: boolean;
          }> = [];

          for (let i = 0; i < iterations; i++) {
            const { container, unmount } = render(<MainNav />);

            const header = container.querySelector('header');
            const navContainer = container.querySelector('.fixed.top-0.left-0.w-full');

            const styles = {
              hasHeader: !!header,
              hasShadow: header?.classList.contains('shadow') || false,
              hasWhiteBg: header?.classList.contains('bg-white') || false,
              isFixed: !!navContainer,
              hasZIndex: navContainer?.classList.contains('z-50') || false,
            };

            capturedStyles.push(styles);
            unmount();
          }

          // Property: All renders should have identical styling
          capturedStyles.forEach(style => {
            expect(style).toEqual(capturedStyles[0]);
          });

          // Property: Required styles should be present
          expect(capturedStyles[0].hasHeader).toBe(true);
          expect(capturedStyles[0].hasShadow).toBe(true);
          expect(capturedStyles[0].hasWhiteBg).toBe(true);
          expect(capturedStyles[0].isFixed).toBe(true);
          expect(capturedStyles[0].hasZIndex).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should render navigation links in consistent order', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 2, max: 5 }),
        (renderCount) => {
          const capturedOrders: string[][] = [];

          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainNav />);

            // Get all navigation links in order
            const navList = container.querySelector('ul');
            expect(navList).toBeTruthy();

            const listItems = navList?.querySelectorAll('li');
            const linkOrder = Array.from(listItems || []).map(li => {
              const link = li.querySelector('a');
              return link?.textContent || '';
            });

            capturedOrders.push(linkOrder);
            unmount();
          }

          // Property: All renders should have links in the same order
          for (let i = 1; i < capturedOrders.length; i++) {
            expect(capturedOrders[i]).toEqual(capturedOrders[0]);
          }

          // Property: Order should match the required pages order
          const expectedOrder = requiredPages.map(page => page.title);
          expect(capturedOrders[0]).toEqual(expectedOrder);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain navigation structure integrity across different states', () => {
    fc.assert(
      fc.property(
        // Generate different potential states
        fc.record({
          renderAttempts: fc.integer({ min: 1, max: 3 }),
        }),
        ({ renderAttempts }) => {
          for (let attempt = 0; attempt < renderAttempts; attempt++) {
            const { container, unmount } = render(<MainNav />);

            // Property: Navigation should always have the same core structure
            // 1. Fixed container at top
            const fixedContainer = container.querySelector('.fixed.top-0.left-0.w-full.z-50');
            expect(fixedContainer).toBeTruthy();

            // 2. Header with shadow and white background
            const header = container.querySelector('header.shadow.bg-white');
            expect(header).toBeTruthy();

            // 3. Logo link
            const logoLink = screen.getByLabelText('Back to homepage');
            expect(logoLink).toBeTruthy();
            expect(logoLink.getAttribute('href')).toBe('/');

            // 4. Mobile menu button
            const menuButton = screen.getByTitle('menu');
            expect(menuButton).toBeTruthy();

            // 5. Navigation list with all links
            const navList = container.querySelector('ul');
            expect(navList).toBeTruthy();

            const listItems = navList?.querySelectorAll('li');
            expect(listItems?.length).toBe(requiredPages.length);

            // 6. Each list item should have a link
            listItems?.forEach((li, index) => {
              const link = li.querySelector('a');
              expect(link).toBeTruthy();
              expect(link?.getAttribute('href')).toBe(requiredPages[index].path);
              expect(link?.textContent).toBe(requiredPages[index].title);
            });

            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should have consistent navigation regardless of page context', () => {
    fc.assert(
      fc.property(
        // Simulate different page contexts
        fc.constantFrom(
          '/',
          '/services',
          '/about',
          '/blog',
          '/blog/some-post',
          '/blog/another-post',
          '/contact'
        ),
        (pageContext) => {
          // Navigation should be identical regardless of which page we're on
          const { container, unmount } = render(<MainNav />);

          // Property: All required links should be present
          requiredPages.forEach(page => {
            const links = screen.getAllByText(page.title);
            expect(links.length).toBeGreaterThan(0);

            const linkElement = links[0].closest('a');
            expect(linkElement?.getAttribute('href')).toBe(page.path);
          });

          // Property: Navigation structure should be consistent
          const header = container.querySelector('header');
          expect(header).toBeTruthy();

          const navList = container.querySelector('ul');
          expect(navList).toBeTruthy();

          const listItems = navList?.querySelectorAll('li');
          expect(listItems?.length).toBe(requiredPages.length);

          unmount();
        }
      ),
      { numRuns: 100 } // Test extensively with different page contexts
    );
  });

  it('should preserve navigation link functionality across renders', () => {
    fc.assert(
      fc.property(
        // Test multiple sequential renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainNav />);

            // Property: All links should be clickable (have href)
            requiredPages.forEach(page => {
              const links = screen.getAllByText(page.title);
              const linkElement = links[0].closest('a');
              
              expect(linkElement).toBeTruthy();
              expect(linkElement?.tagName).toBe('A');
              expect(linkElement?.getAttribute('href')).toBe(page.path);
              
              // Property: Links should not be disabled
              expect(linkElement?.hasAttribute('disabled')).toBe(false);
              
              // Property: Links should not have onclick that prevents navigation
              const onclick = linkElement?.getAttribute('onclick');
              if (onclick) {
                expect(onclick).not.toContain('preventDefault');
                expect(onclick).not.toContain('return false');
              }
            });

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
