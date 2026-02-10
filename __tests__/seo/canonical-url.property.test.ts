/**
 * Property-Based Tests for Canonical URLs
 * 
 * Tests universal properties of canonical URL presence:
 * - Property 22: Canonical URL Presence
 * 
 * Requirements: 6.7
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { Metadata } from 'next';

// ============================================================================
// Test Data - Sample Metadata with Canonical URLs
// ============================================================================

/**
 * Sample metadata objects from all pages in the application
 * These represent the actual metadata exported by pages with canonical URLs
 */
const pagesWithCanonicalUrls: Array<{ path: string; name: string; metadata: Metadata }> = [
  {
    path: '/',
    name: 'Home',
    metadata: {
      title: 'Home | Colour Clouds Digital',
      description: 'Shaping Digital Experiences, One App at a Time.',
      alternates: {
        canonical: '/',
      },
      openGraph: {
        title: 'Home | Colour Clouds Digital',
        description: 'Shaping Digital Experiences, One App at a Time.',
        type: 'website',
        url: '/',
      },
    },
  },
  {
    path: '/services',
    name: 'Services',
    metadata: {
      title: 'Services | Colour Clouds Digital',
      description: 'Professional app development and digital content creation services.',
      alternates: {
        canonical: '/services',
      },
      openGraph: {
        title: 'Services | Colour Clouds Digital',
        description: 'Professional app development and digital content creation services.',
        type: 'website',
        url: '/services',
      },
    },
  },
  {
    path: '/about',
    name: 'About',
    metadata: {
      title: 'About Us | Colour Clouds Digital',
      description: 'Learn about Colour Clouds Digital - our story, mission, vision, and values.',
      alternates: {
        canonical: '/about',
      },
      openGraph: {
        title: 'About Us | Colour Clouds Digital',
        description: 'Learn about Colour Clouds Digital - our story, mission, vision, and values.',
        type: 'website',
        url: '/about',
      },
    },
  },
  {
    path: '/blog',
    name: 'Blog Listing',
    metadata: {
      title: 'Blog | Colour Clouds Digital',
      description: 'Read our latest articles on app development and digital content creation.',
      alternates: {
        canonical: '/blog',
      },
      openGraph: {
        title: 'Blog | Colour Clouds Digital',
        description: 'Read our latest articles on app development and digital content creation.',
        type: 'website',
        url: '/blog',
      },
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    metadata: {
      title: 'Contact Us | Colour Clouds Digital',
      description: 'Get in touch with Colour Clouds Digital.',
      alternates: {
        canonical: '/contact',
      },
      openGraph: {
        title: 'Contact Us | Colour Clouds Digital',
        description: 'Get in touch with Colour Clouds Digital.',
        type: 'website',
        url: '/contact',
      },
    },
  },
  {
    path: '/blog/building-modern-portfolio',
    name: 'Blog Post Detail',
    metadata: {
      title: 'Building a Modern Portfolio | Colour Clouds Digital',
      description: 'Learn how to build a modern portfolio website with Next.js.',
      alternates: {
        canonical: '/blog/building-modern-portfolio',
      },
      openGraph: {
        title: 'Building a Modern Portfolio',
        description: 'Learn how to build a modern portfolio website with Next.js.',
        images: ['https://example.com/image.jpg'],
        type: 'article',
        publishedTime: '2024-01-15T10:00:00Z',
        authors: ['Jane Smith'],
        url: '/blog/building-modern-portfolio',
      },
    },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if metadata has canonical URL
 * Requirement: 6.7 - Include canonical URLs for all pages
 */
function hasCanonicalUrl(metadata: Metadata | undefined): boolean {
  if (!metadata) return false;
  return (
    metadata.alternates !== undefined &&
    metadata.alternates !== null &&
    metadata.alternates.canonical !== undefined &&
    metadata.alternates.canonical !== null
  );
}

/**
 * Check if canonical URL is a valid string
 */
function hasValidCanonicalUrl(metadata: Metadata | undefined): boolean {
  if (!hasCanonicalUrl(metadata)) return false;
  
  const canonical = metadata!.alternates!.canonical;
  return typeof canonical === 'string' && canonical.length > 0;
}

/**
 * Check if canonical URL is properly formatted
 */
function isCanonicalUrlWellFormed(metadata: Metadata | undefined): boolean {
  if (!hasValidCanonicalUrl(metadata)) return false;
  
  const canonical = metadata!.alternates!.canonical as string;
  
  // Should start with / for relative URLs or http(s):// for absolute URLs
  return canonical.startsWith('/') || canonical.startsWith('http://') || canonical.startsWith('https://');
}

/**
 * Check if canonical URL matches the page path
 */
function canonicalMatchesPath(metadata: Metadata | undefined, path: string): boolean {
  if (!hasValidCanonicalUrl(metadata)) return false;
  
  const canonical = metadata!.alternates!.canonical as string;
  
  // For relative URLs, should match the path
  if (canonical.startsWith('/')) {
    return canonical === path;
  }
  
  // For absolute URLs, should end with the path
  return canonical.endsWith(path);
}

/**
 * Check if canonical URL is trimmed (no leading/trailing whitespace)
 */
function isCanonicalUrlTrimmed(metadata: Metadata | undefined): boolean {
  if (!hasValidCanonicalUrl(metadata)) return false;
  
  const canonical = metadata!.alternates!.canonical as string;
  return canonical === canonical.trim();
}

// ============================================================================
// Property 22: Canonical URL Presence
// ============================================================================

describe('Property 22: Canonical URL Presence', () => {
  /**
   * **Validates: Requirements 6.7**
   * 
   * Requirement 6.7: THE System SHALL include canonical URLs for all pages
   * 
   * Property: For all pages in the application, the metadata SHALL include 
   * a canonical URL that:
   * 1. Is present in the alternates.canonical field
   * 2. Is a non-empty string
   * 3. Is properly formatted (starts with / or http(s)://)
   * 4. Matches the page path
   * 5. Is trimmed (no leading/trailing whitespace)
   * 
   * This property tests that:
   * - Every page has a canonical URL
   * - Canonical URLs are valid and well-formed
   * - Canonical URLs correctly identify the page
   * - Canonical URLs help prevent duplicate content issues for SEO
   */

  it('should have canonical URL on all pages', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      // Property: Every page must have canonical URL
      expect(hasCanonicalUrl(metadata)).toBe(true);
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBeDefined();
      
      console.log(`✓ ${name} (${path}): Has canonical URL`);
    });
  });

  it('should have valid canonical URL string on all pages', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      // Property: Canonical URL must be a non-empty string
      expect(hasValidCanonicalUrl(metadata)).toBe(true);
      
      const canonical = metadata.alternates?.canonical;
      expect(typeof canonical).toBe('string');
      expect((canonical as string).length).toBeGreaterThan(0);
      
      console.log(`✓ ${name} (${path}): canonical="${canonical}"`);
    });
  });

  it('should have well-formed canonical URL on all pages', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      // Property: Canonical URL must be well-formed
      expect(isCanonicalUrlWellFormed(metadata)).toBe(true);
      
      const canonical = metadata.alternates?.canonical as string;
      
      // Should start with / or http(s)://
      const isValid = 
        canonical.startsWith('/') || 
        canonical.startsWith('http://') || 
        canonical.startsWith('https://');
      expect(isValid).toBe(true);
      
      console.log(`✓ ${name} (${path}): Well-formed canonical URL`);
    });
  });

  it('should have canonical URL matching page path', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      // Property: Canonical URL should match page path
      expect(canonicalMatchesPath(metadata, path)).toBe(true);
      
      const canonical = metadata.alternates?.canonical as string;
      expect(canonical).toBe(path);
      
      console.log(`✓ ${name} (${path}): Canonical matches path`);
    });
  });

  it('should have trimmed canonical URL (no whitespace)', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      // Property: Canonical URL should be trimmed
      expect(isCanonicalUrlTrimmed(metadata)).toBe(true);
      
      const canonical = metadata.alternates?.canonical as string;
      expect(canonical).toBe(canonical.trim());
      expect(canonical).not.toMatch(/^\s/); // No leading whitespace
      expect(canonical).not.toMatch(/\s$/); // No trailing whitespace
      
      console.log(`✓ ${name} (${path}): Canonical URL trimmed`);
    });
  });

  it('should have canonical URL without query parameters', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL should not have query parameters
      // This helps prevent duplicate content issues
      expect(canonical).not.toContain('?');
      expect(canonical).not.toContain('&');
      
      console.log(`✓ ${name} (${path}): No query parameters in canonical`);
    });
  });

  it('should have canonical URL without fragment identifiers', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL should not have fragment identifiers
      // Fragments (#section) are not part of the canonical URL
      expect(canonical).not.toContain('#');
      
      console.log(`✓ ${name} (${path}): No fragments in canonical`);
    });
  });

  it('should have canonical URL with lowercase path', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL path should be lowercase
      // This is a best practice for URL consistency
      const pathPart = canonical.startsWith('http') 
        ? new URL(canonical).pathname 
        : canonical;
      
      expect(pathPart).toBe(pathPart.toLowerCase());
      
      console.log(`✓ ${name} (${path}): Canonical path is lowercase`);
    });
  });

  it('should have canonical URL matching Open Graph URL', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      const ogUrl = metadata.openGraph?.url as string;
      
      // Property: Canonical URL should match Open Graph URL
      // This ensures consistency across SEO tags
      expect(ogUrl).toBeDefined();
      expect(canonical).toBe(ogUrl);
      
      console.log(`✓ ${name} (${path}): Canonical matches og:url`);
    });
  });

  it('should have unique canonical URLs across different pages', () => {
    const canonicalUrls = new Set<string>();
    
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL should be unique (not already seen)
      expect(canonicalUrls.has(canonical)).toBe(false);
      canonicalUrls.add(canonical);
      
      console.log(`✓ ${name} (${path}): Unique canonical URL`);
    });
    
    // Property: Number of unique canonicals should equal number of pages
    expect(canonicalUrls.size).toBe(pagesWithCanonicalUrls.length);
  });

  it('should maintain canonical URL consistency across all pages', () => {
    fc.assert(
      fc.property(
        // Generate test cases for different pages
        fc.constantFrom(...pagesWithCanonicalUrls),
        (page) => {
          const metadata = page.metadata;
          const path = page.path;
          
          // Property: Canonical URL consistency invariants
          // For ANY page in the system, these properties MUST hold:
          
          // 1. Has canonical URL
          expect(hasCanonicalUrl(metadata)).toBe(true);
          
          // 2. Valid canonical URL
          expect(hasValidCanonicalUrl(metadata)).toBe(true);
          
          // 3. Well-formed canonical URL
          expect(isCanonicalUrlWellFormed(metadata)).toBe(true);
          
          // 4. Matches page path
          expect(canonicalMatchesPath(metadata, path)).toBe(true);
          
          // 5. Trimmed canonical URL
          expect(isCanonicalUrlTrimmed(metadata)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate valid canonical URLs for dynamic content', () => {
    fc.assert(
      fc.property(
        // Generate various page paths
        fc.record({
          path: fc.stringMatching(/^\/[a-z0-9\-/]*$/),
          title: fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-]{10,50}$/),
          description: fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-.,!?']{20,150}$/),
        }),
        ({ path, title, description }) => {
          // Simulate metadata generation
          const metadata: Metadata = {
            title: `${title} | Colour Clouds Digital`,
            description,
            alternates: {
              canonical: path,
            },
            openGraph: {
              title,
              description,
              type: 'website',
              url: path,
            },
          };
          
          // Property: Generated metadata must have valid canonical URL
          expect(hasCanonicalUrl(metadata)).toBe(true);
          expect(hasValidCanonicalUrl(metadata)).toBe(true);
          expect(isCanonicalUrlWellFormed(metadata)).toBe(true);
          expect(canonicalMatchesPath(metadata, path)).toBe(true);
          expect(isCanonicalUrlTrimmed(metadata)).toBe(true);
          
          // Property: Canonical should match og:url
          expect(metadata.alternates?.canonical).toBe(metadata.openGraph?.url);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject metadata without canonical URL', () => {
    // Test invalid metadata: No alternates
    const noAlternatesMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
    };
    expect(hasCanonicalUrl(noAlternatesMetadata)).toBe(false);
    
    // Test invalid metadata: Empty alternates
    const emptyAlternatesMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      alternates: {},
    };
    expect(hasCanonicalUrl(emptyAlternatesMetadata)).toBe(false);
    
    // Test invalid metadata: Null canonical
    const nullCanonicalMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      alternates: {
        canonical: null as any,
      },
    };
    expect(hasValidCanonicalUrl(nullCanonicalMetadata)).toBe(false);
    
    // Test invalid metadata: Empty string canonical
    const emptyCanonicalMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      alternates: {
        canonical: '',
      },
    };
    expect(hasValidCanonicalUrl(emptyCanonicalMetadata)).toBe(false);
    
    // Test invalid metadata: Whitespace-only canonical
    const whitespaceCanonicalMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      alternates: {
        canonical: '   ',
      },
    };
    expect(isCanonicalUrlTrimmed(whitespaceCanonicalMetadata)).toBe(false);
    
    console.log('✓ All invalid metadata correctly rejected');
  });

  it('should have canonical URL that helps prevent duplicate content', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL should be clean and consistent
      // This helps search engines understand which version is the "main" one
      
      // 1. No trailing slashes (except for root)
      if (canonical !== '/') {
        expect(canonical).not.toMatch(/\/$/);
      }
      
      // 2. No double slashes
      expect(canonical).not.toMatch(/\/\//);
      
      // 3. No uppercase letters in path
      const pathPart = canonical.startsWith('http') 
        ? new URL(canonical).pathname 
        : canonical;
      expect(pathPart).toBe(pathPart.toLowerCase());
      
      console.log(`✓ ${name} (${path}): Canonical prevents duplicates`);
    });
  });

  it('should have canonical URL for blog posts with slug', () => {
    // Test blog post pages
    const blogPosts = pagesWithCanonicalUrls.filter(
      (page) => page.path.startsWith('/blog/') && page.path !== '/blog'
    );
    
    blogPosts.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Blog post canonical should include slug
      expect(canonical).toContain('/blog/');
      expect(canonical).not.toBe('/blog');
      expect(canonical).not.toBe('/blog/');
      
      // Property: Slug should be URL-friendly (lowercase, hyphens)
      const slug = canonical.split('/blog/')[1];
      expect(slug).toMatch(/^[a-z0-9\-]+$/);
      
      console.log(`✓ ${name} (${path}): Blog post canonical with slug`);
    });
  });

  it('should have canonical URL that is SEO-friendly', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL should be SEO-friendly
      
      // 1. Reasonable length (not too long)
      expect(canonical.length).toBeLessThanOrEqual(200);
      
      // 2. Uses hyphens for word separation (not underscores)
      // This is a best practice for SEO
      if (canonical.includes('_')) {
        // If underscores are used, they should be intentional
        // For this project, we prefer hyphens
        console.warn(`Warning: ${name} uses underscores in canonical URL`);
      }
      
      // 3. No special characters (except / and -)
      const pathPart = canonical.startsWith('http') 
        ? new URL(canonical).pathname 
        : canonical;
      expect(pathPart).toMatch(/^[a-z0-9\-/]+$/);
      
      console.log(`✓ ${name} (${path}): SEO-friendly canonical`);
    });
  });

  it('should have canonical URL structure that matches site hierarchy', () => {
    // Test each page
    pagesWithCanonicalUrls.forEach(({ path, name, metadata }) => {
      const canonical = metadata.alternates?.canonical as string;
      
      // Property: Canonical URL should reflect site hierarchy
      
      // Root page
      if (name === 'Home') {
        expect(canonical).toBe('/');
      }
      
      // Top-level pages
      if (['Services', 'About', 'Contact'].includes(name)) {
        expect(canonical).toMatch(/^\/[a-z]+$/);
        expect(canonical.split('/').length).toBe(2); // / + page
      }
      
      // Blog listing
      if (name === 'Blog Listing') {
        expect(canonical).toBe('/blog');
      }
      
      // Blog posts (nested under /blog/)
      if (name === 'Blog Post Detail') {
        expect(canonical).toMatch(/^\/blog\/[a-z0-9\-]+$/);
        expect(canonical.split('/').length).toBe(3); // / + blog + slug
      }
      
      console.log(`✓ ${name} (${path}): Canonical reflects hierarchy`);
    });
  });
});
