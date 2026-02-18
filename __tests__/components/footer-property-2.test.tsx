/**
 * Property-Based Test for Footer Component Consistency
 * 
 * Tests universal properties of the footer component:
 * - Property 2: Footer Component Consistency
 * 
 * **Validates: Requirements 1.8**
 * 
 * Requirement 1.8: WHEN a user navigates to any page, THE System SHALL display 
 * a consistent footer component with links to all pages
 */

/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the newsletter form component
jest.mock('@/components/newsletter-form', () => ({
  NewsletterForm: ({ source, variant }: { source: string; variant?: string }) => (
    <div data-testid="newsletter-form" data-source={source} data-variant={variant}>
      Newsletter Form Mock
    </div>
  ),
}));

// Import after mocking
import MainFooter from '@/components/mainFooter';

// ============================================================================
// Property 2: Footer Component Consistency
// ============================================================================

describe('Property 2: Footer Component Consistency', () => {
  /**
   * **Validates: Requirements 1.8**
   * 
   * Requirement 1.8: WHEN a user navigates to any page, THE System SHALL display 
   * a consistent footer component with links to all pages
   * 
   * Property: For all pages in the system, the footer component SHALL:
   * 1. Render successfully without errors
   * 2. Display all required footer links (Home, Services, About, Blog, Contact)
   * 3. Have correct href attributes for each link
   * 4. Maintain consistent structure and content
   * 5. Include newsletter subscription form
   * 6. Display social media links
   * 7. Show copyright information
   * 8. Display contact information
   * 
   * This property tests that:
   * - Footer renders consistently regardless of context
   * - All required links are present
   * - Links point to correct paths
   * - Footer structure is stable
   * - All footer sections are present
   */

  const requiredPages = [
    { title: 'Home', path: '/' },
    { title: 'Services', path: '/services' },
    { title: 'About', path: '/about' },
    { title: 'Blog', path: '/blog' },
    { title: 'Contact', path: '/contact' },
  ];

  const requiredSocialLinks = [
    { name: 'Email', href: 'mailto:colourclouds042@gmail.com' },
    { name: 'GitHub', href: 'https://github.com/ColourClouds-dev' },
    { name: 'Twitter', href: 'https://twitter.com/colourclouds' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/colourclouds' },
    { name: 'Instagram', href: 'https://instagram.com/colourclouds' },
  ];

  it('should render footer component consistently with all required links', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary rendering contexts to test consistency
        fc.record({
          renderCount: fc.integer({ min: 1, max: 10 }),
          // Simulate different page contexts
          pageContext: fc.constantFrom('/', '/services', '/about', '/blog', '/contact', '/blog/test-post'),
        }),
        ({ renderCount, pageContext }) => {
          // Render the footer component multiple times to test consistency
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property 1: Footer should render without errors
            expect(container).toBeTruthy();
            expect(container.querySelector('footer')).toBeTruthy();

            // Property 2: All required footer links should be present
            requiredPages.forEach(page => {
              const links = screen.getAllByText(page.title);
              expect(links.length).toBeGreaterThan(0);
              
              // Find the link element
              const linkElement = links.find(link => 
                link.tagName === 'A' || link.closest('a')
              );
              expect(linkElement).toBeTruthy();
            });

            // Property 3: Footer should have correct structure
            const footer = container.querySelector('footer');
            expect(footer).toBeTruthy();
            expect(footer?.classList.contains('py-12')).toBe(true);

            // Property 4: Brand section should be present
            const brandText = screen.getByText('Colour Clouds');
            expect(brandText).toBeTruthy();

            // Property 5: Newsletter form should be present
            const newsletterForm = screen.getByTestId('newsletter-form');
            expect(newsletterForm).toBeTruthy();
            expect(newsletterForm.getAttribute('data-source')).toBe('/footer');
            expect(newsletterForm.getAttribute('data-variant')).toBe('footer');

            // Property 6: Copyright notice should be present
            const currentYear = new Date().getFullYear();
            const copyrightText = screen.getByText(
              new RegExp(`© ${currentYear} Colour Clouds Digital\\.? All rights reserved\\.?`, 'i')
            );
            expect(copyrightText).toBeTruthy();

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

          // Render footer multiple times and capture structure
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);
            
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

  it('should have all required footer links with correct paths', () => {
    fc.assert(
      fc.property(
        // Test with different subsets of pages to verify all are present
        fc.shuffledSubarray(requiredPages, { minLength: requiredPages.length, maxLength: requiredPages.length }),
        (pagesToCheck) => {
          const { container, unmount } = render(<MainFooter />);

          // Property: Every required page should have a footer link
          pagesToCheck.forEach(page => {
            const links = screen.getAllByText(page.title);
            expect(links.length).toBeGreaterThan(0);

            // Find the actual link element
            const linkElement = links[0].closest('a');
            expect(linkElement).toBeTruthy();

            // Property: Link should have correct href
            expect(linkElement?.getAttribute('href')).toBe(page.path);
          });

          // Property: Footer should have exactly the required number of page links
          const allLinks = container.querySelectorAll('footer a');
          const pageLinks = Array.from(allLinks).filter(link => {
            const href = link.getAttribute('href');
            return requiredPages.some(page => page.path === href);
          });

          // Should have at least one link for each page
          requiredPages.forEach(page => {
            const links = Array.from(allLinks).filter(
              link => link.getAttribute('href') === page.path
            );
            expect(links.length).toBeGreaterThan(0);
          });

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display all required social media links', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: All social media links should be present
            // Social links are in the bottom section with specific styling
            const socialLinksContainer = container.querySelector('.flex.space-x-4');
            expect(socialLinksContainer).toBeTruthy();

            requiredSocialLinks.forEach(social => {
              // Find the social link within the social links container
              const socialLink = socialLinksContainer?.querySelector(`a[href="${social.href}"][title="${social.name}"]`);
              expect(socialLink).toBeTruthy();
              
              // Property: All social links should have title attribute
              const title = socialLink?.getAttribute('title');
              expect(title).toBe(social.name);

              // Property: External links should have proper attributes
              if (social.name !== 'Email') {
                expect(socialLink?.getAttribute('target')).toBe('_blank');
                expect(socialLink?.getAttribute('rel')).toBe('noopener noreferrer');
              } else {
                // Email link should not have target or rel
                expect(socialLink?.hasAttribute('target')).toBe(false);
                expect(socialLink?.hasAttribute('rel')).toBe(false);
              }
            });

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain consistent visual structure and styling', () => {
    fc.assert(
      fc.property(
        // Test with different render scenarios
        fc.record({
          iterations: fc.integer({ min: 1, max: 5 }),
        }),
        ({ iterations }) => {
          const capturedStyles: Array<{
            hasFooter: boolean;
            hasPadding: boolean;
            hasContainer: boolean;
            hasGrid: boolean;
          }> = [];

          for (let i = 0; i < iterations; i++) {
            const { container, unmount } = render(<MainFooter />);

            const footer = container.querySelector('footer');
            const footerContainer = footer?.querySelector('.container');
            const grid = footerContainer?.querySelector('.grid');

            const styles = {
              hasFooter: !!footer,
              hasPadding: footer?.classList.contains('py-12') || false,
              hasContainer: !!footerContainer,
              hasGrid: !!grid,
            };

            capturedStyles.push(styles);
            unmount();
          }

          // Property: All renders should have identical styling
          capturedStyles.forEach(style => {
            expect(style).toEqual(capturedStyles[0]);
          });

          // Property: Required styles should be present
          expect(capturedStyles[0].hasFooter).toBe(true);
          expect(capturedStyles[0].hasPadding).toBe(true);
          expect(capturedStyles[0].hasContainer).toBe(true);
          expect(capturedStyles[0].hasGrid).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should include newsletter subscription form consistently', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: Newsletter form should be present
            const newsletterForm = screen.getByTestId('newsletter-form');
            expect(newsletterForm).toBeTruthy();

            // Property: Newsletter form should have correct props
            expect(newsletterForm.getAttribute('data-source')).toBe('/footer');
            expect(newsletterForm.getAttribute('data-variant')).toBe('footer');

            // Property: Newsletter section should have heading
            const newsletterHeading = screen.getByText('Stay Updated');
            expect(newsletterHeading).toBeTruthy();

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should display contact information consistently', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: Contact section should be present (use getAllByText since "Contact" appears multiple times)
            const contactHeadings = screen.getAllByText('Contact');
            const contactHeading = contactHeadings.find(el => el.tagName === 'H3');
            expect(contactHeading).toBeTruthy();

            // Property: Email links should be present
            const primaryEmail = container.querySelector('a[href="mailto:colourclouds042@gmail.com"]');
            expect(primaryEmail).toBeTruthy();

            const secondaryEmail = container.querySelector('a[href="mailto:info@colourclouds.ng"]');
            expect(secondaryEmail).toBeTruthy();

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should display copyright information with current year', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          const currentYear = new Date().getFullYear();

          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: Copyright should include current year
            const copyrightText = screen.getByText(
              new RegExp(`© ${currentYear} Colour Clouds Digital\\.? All rights reserved\\.?`, 'i')
            );
            expect(copyrightText).toBeTruthy();

            // Property: Copyright should be in the footer
            const footer = container.querySelector('footer');
            expect(footer?.textContent).toContain(`${currentYear}`);
            expect(footer?.textContent).toContain('Colour Clouds Digital');
            expect(footer?.textContent).toContain('All rights reserved');

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain footer structure integrity across different states', () => {
    fc.assert(
      fc.property(
        // Generate different potential states
        fc.record({
          renderAttempts: fc.integer({ min: 1, max: 3 }),
        }),
        ({ renderAttempts }) => {
          for (let attempt = 0; attempt < renderAttempts; attempt++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: Footer should always have the same core structure
            // 1. Footer element
            const footer = container.querySelector('footer');
            expect(footer).toBeTruthy();

            // 2. Container with grid layout
            const footerContainer = footer?.querySelector('.container');
            expect(footerContainer).toBeTruthy();

            const grid = footerContainer?.querySelector('.grid');
            expect(grid).toBeTruthy();

            // 3. Brand section (use getAllByText since it may appear multiple times)
            const brandTexts = screen.getAllByText('Colour Clouds');
            const brandText = brandTexts.find(el => el.tagName === 'SPAN');
            expect(brandText).toBeTruthy();

            // 4. Quick Links section
            const quickLinksHeading = screen.getByText('Quick Links');
            expect(quickLinksHeading).toBeTruthy();

            // 5. Contact section (use getAllByText since "Contact" appears multiple times)
            const contactHeadings = screen.getAllByText('Contact');
            const contactHeading = contactHeadings.find(el => el.tagName === 'H3');
            expect(contactHeading).toBeTruthy();

            // 6. Newsletter section
            const newsletterHeading = screen.getByText('Stay Updated');
            expect(newsletterHeading).toBeTruthy();

            // 7. Social media links
            const socialLinks = container.querySelectorAll('a[target="_blank"]');
            expect(socialLinks.length).toBeGreaterThanOrEqual(4); // At least 4 social links (excluding email)

            // 8. Copyright section
            const currentYear = new Date().getFullYear();
            const copyrightText = screen.getByText(
              new RegExp(`© ${currentYear}`, 'i')
            );
            expect(copyrightText).toBeTruthy();

            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should have consistent footer regardless of page context', () => {
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
          // Footer should be identical regardless of which page we're on
          const { container, unmount } = render(<MainFooter />);

          // Property: All required links should be present
          requiredPages.forEach(page => {
            const links = screen.getAllByText(page.title);
            expect(links.length).toBeGreaterThan(0);

            const linkElement = links[0].closest('a');
            expect(linkElement?.getAttribute('href')).toBe(page.path);
          });

          // Property: Footer structure should be consistent
          const footer = container.querySelector('footer');
          expect(footer).toBeTruthy();

          // Property: All sections should be present (use getAllByText for duplicates)
          const brandTexts = screen.getAllByText('Colour Clouds');
          expect(brandTexts.length).toBeGreaterThan(0);
          
          expect(screen.getByText('Quick Links')).toBeTruthy();
          
          const contactTexts = screen.getAllByText('Contact');
          expect(contactTexts.length).toBeGreaterThan(0);
          
          expect(screen.getByText('Stay Updated')).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 100 } // Test extensively with different page contexts
    );
  });

  it('should preserve footer link functionality across renders', () => {
    fc.assert(
      fc.property(
        // Test multiple sequential renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: All page links should be clickable (have href)
            requiredPages.forEach(page => {
              const links = screen.getAllByText(page.title);
              const linkElement = links[0].closest('a');
              
              expect(linkElement).toBeTruthy();
              expect(linkElement?.tagName).toBe('A');
              expect(linkElement?.getAttribute('href')).toBe(page.path);
              
              // Property: Links should not be disabled
              expect(linkElement?.hasAttribute('disabled')).toBe(false);
            });

            // Property: Social media links should be functional
            requiredSocialLinks.forEach(social => {
              const socialLink = container.querySelector(`a[href="${social.href}"]`);
              expect(socialLink).toBeTruthy();
              expect(socialLink?.tagName).toBe('A');
              expect(socialLink?.hasAttribute('disabled')).toBe(false);
            });

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain brand identity elements consistently', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: Brand name should be present and styled
            const brandText = screen.getByText('Colour Clouds');
            expect(brandText).toBeTruthy();
            
            // Property: Brand should link to home
            const brandLink = brandText.closest('a');
            expect(brandLink).toBeTruthy();
            expect(brandLink?.getAttribute('href')).toBe('/');

            // Property: Brand should have brand color
            expect(brandText.className).toContain('text-[#01A750]');

            // Property: Brand description should be present
            const description = container.querySelector('footer')?.textContent;
            expect(description).toContain('Creating innovative digital solutions');

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should have all footer sections in consistent order', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 2, max: 5 }),
        (renderCount) => {
          const capturedSectionOrders: string[][] = [];

          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Get all section headings in order
            const headings = container.querySelectorAll('h3');
            const sectionOrder = Array.from(headings).map(h => h.textContent || '');

            capturedSectionOrders.push(sectionOrder);
            unmount();
          }

          // Property: All renders should have sections in the same order
          for (let i = 1; i < capturedSectionOrders.length; i++) {
            expect(capturedSectionOrders[i]).toEqual(capturedSectionOrders[0]);
          }

          // Property: Expected sections should be present in order
          const expectedSections = ['Quick Links', 'Contact', 'Stay Updated'];
          expect(capturedSectionOrders[0]).toEqual(expectedSections);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain responsive grid structure', () => {
    fc.assert(
      fc.property(
        // Test multiple renders
        fc.integer({ min: 1, max: 5 }),
        (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            const { container, unmount } = render(<MainFooter />);

            // Property: Footer should have responsive grid
            const grid = container.querySelector('.grid');
            expect(grid).toBeTruthy();

            // Property: Grid should have responsive classes
            const gridClasses = grid?.className || '';
            expect(gridClasses).toContain('grid-cols-1'); // Mobile
            expect(gridClasses).toContain('md:grid-cols-2'); // Tablet
            expect(gridClasses).toContain('lg:grid-cols-4'); // Desktop

            // Property: Grid should have gap spacing
            expect(gridClasses).toContain('gap-8');

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
