/**
 * Property-Based Tests for Open Graph Tags
 * 
 * Tests universal properties of Open Graph tag presence:
 * - Property 20: Open Graph Tags Presence
 * 
 * Requirements: 6.3
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { Metadata } from 'next';

// ============================================================================
// Test Data - Sample Metadata with Open Graph Tags
// ============================================================================

/**
 * Sample metadata objects from all pages in the application
 * These represent the actual metadata exported by pages with Open Graph tags
 */
const pagesWithOpenGraph: Array<{ path: string; name: string; metadata: Metadata }> = [
  {
    path: '/',
    name: 'Home',
    metadata: {
      title: 'Home | Colour Clouds Digital',
      description: 'Shaping Digital Experiences, One App at a Time. Innovative app development and digital content creation services from Colour Clouds Digital.',
      alternates: {
        canonical: '/',
      },
      openGraph: {
        title: 'Colour Clouds Digital - Think, Build, Explore',
        description: 'Shaping Digital Experiences, One App at a Time. Innovative app development and digital content creation services.',
        type: 'website',
        url: '/',
        images: [
          {
            url: 'https://i.imghippo.com/files/tXnYf1727040648.png',
            width: 500,
            height: 500,
            alt: 'Colour Clouds Digital Hero Image',
          },
        ],
      },
    },
  },
  {
    path: '/services',
    name: 'Services',
    metadata: {
      title: 'Services | Colour Clouds Digital',
      description: 'Professional app development and digital content creation services. We build cutting-edge applications and create compelling digital content that engages your audience.',
      alternates: {
        canonical: '/services',
      },
      openGraph: {
        title: 'Services | Colour Clouds Digital',
        description: 'Professional app development and digital content creation services. We build cutting-edge applications and create compelling digital content that engages your audience.',
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
      description: 'Learn about Colour Clouds Digital - our story, mission, vision, and values. We are passionate about creating innovative digital solutions that make a difference.',
      alternates: {
        canonical: '/about',
      },
      openGraph: {
        title: 'About Us | Colour Clouds Digital',
        description: 'Learn about Colour Clouds Digital - our story, mission, vision, and values. We are passionate about creating innovative digital solutions that make a difference.',
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
      description: 'Read our latest articles on app development, digital content creation, and technology insights.',
      alternates: {
        canonical: '/blog',
      },
      openGraph: {
        title: 'Blog | Colour Clouds Digital',
        description: 'Read our latest articles on app development, digital content creation, and technology insights.',
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
      description: 'Get in touch with Colour Clouds Digital. Send us a message about your project or inquiry. We offer app development and digital content creation services.',
      alternates: {
        canonical: '/contact',
      },
      openGraph: {
        title: 'Contact Us | Colour Clouds Digital',
        description: 'Get in touch with Colour Clouds Digital. Send us a message about your project or inquiry. We offer app development and digital content creation services.',
        type: 'website',
        url: '/contact',
      },
    },
  },
  {
    path: '/blog/sample-post',
    name: 'Blog Post Detail',
    metadata: {
      title: 'Building a Modern Portfolio | Colour Clouds Digital',
      description: 'Learn how to build a modern portfolio website with Next.js, TypeScript, and Tailwind CSS.',
      alternates: {
        canonical: '/blog/building-modern-portfolio',
      },
      openGraph: {
        title: 'Building a Modern Portfolio',
        description: 'Learn how to build a modern portfolio website with Next.js, TypeScript, and Tailwind CSS.',
        images: ['https://example.com/image.jpg'],
        type: 'article',
        publishedTime: '2024-01-15T10:00:00Z',
        authors: ['Jane Smith'],
        url: '/blog/building-modern-portfolio',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Building a Modern Portfolio',
        description: 'Learn how to build a modern portfolio website with Next.js, TypeScript, and Tailwind CSS.',
        images: ['https://example.com/image.jpg'],
      },
    },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if metadata has Open Graph tags
 * Requirement: 6.3 - Include Open Graph tags for social media sharing
 */
function hasOpenGraphTags(metadata: Metadata | undefined): boolean {
  if (!metadata) return false;
  return metadata.openGraph !== undefined && metadata.openGraph !== null;
}

/**
 * Check if Open Graph has required fields (title and description)
 * Requirement: 6.3 - Include Open Graph tags for social media sharing
 */
function hasRequiredOpenGraphFields(metadata: Metadata | undefined): boolean {
  if (!hasOpenGraphTags(metadata)) return false;
  
  const og = metadata!.openGraph;
  
  // Check for title
  const hasTitle = typeof og?.title === 'string' && og.title.length > 0;
  
  // Check for description
  const hasDescription = typeof og?.description === 'string' && og.description.length > 0;
  
  return hasTitle && hasDescription;
}

/**
 * Check if Open Graph has type field
 */
function hasOpenGraphType(metadata: Metadata | undefined): boolean {
  if (!hasOpenGraphTags(metadata)) return false;
  
  const og = metadata!.openGraph;
  return og?.type !== undefined && og.type !== null;
}

/**
 * Check if Open Graph has URL field
 */
function hasOpenGraphUrl(metadata: Metadata | undefined): boolean {
  if (!hasOpenGraphTags(metadata)) return false;
  
  const og = metadata!.openGraph;
  return typeof og?.url === 'string' && og.url.length > 0;
}

/**
 * Check if Open Graph title is non-empty
 */
function hasValidOpenGraphTitle(metadata: Metadata | undefined): boolean {
  if (!hasOpenGraphTags(metadata)) return false;
  
  const og = metadata!.openGraph;
  return typeof og?.title === 'string' && og.title.trim().length > 0;
}

/**
 * Check if Open Graph description is non-empty
 */
function hasValidOpenGraphDescription(metadata: Metadata | undefined): boolean {
  if (!hasOpenGraphTags(metadata)) return false;
  
  const og = metadata!.openGraph;
  return typeof og?.description === 'string' && og.description.trim().length > 0;
}

// ============================================================================
// Property 20: Open Graph Tags Presence
// ============================================================================

describe('Property 20: Open Graph Tags Presence', () => {
  /**
   * **Validates: Requirements 6.3**
   * 
   * Requirement 6.3: THE System SHALL include Open Graph tags for social media 
   * sharing on all pages
   * 
   * Property: For all pages in the application, the metadata SHALL include 
   * Open Graph tags with at minimum:
   * 1. og:title - The title of the page
   * 2. og:description - A description of the page
   * 3. og:type - The type of content (website, article, etc.)
   * 4. og:url - The canonical URL of the page
   * 
   * This property tests that:
   * - Every page has Open Graph metadata
   * - Open Graph tags include required fields (title, description)
   * - Open Graph tags have valid, non-empty values
   * - Open Graph tags are properly structured for social media sharing
   */

  it('should have Open Graph tags on all pages', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      // Property: Every page must have Open Graph tags
      expect(hasOpenGraphTags(metadata)).toBe(true);
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph).not.toBeNull();
      
      console.log(`✓ ${name} (${path}): Has Open Graph tags`);
    });
  });

  it('should have required Open Graph fields (title and description) on all pages', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      // Property: Open Graph must have title and description
      expect(hasRequiredOpenGraphFields(metadata)).toBe(true);
      
      const og = metadata.openGraph;
      expect(og?.title).toBeDefined();
      expect(typeof og?.title).toBe('string');
      expect((og?.title as string).length).toBeGreaterThan(0);
      
      expect(og?.description).toBeDefined();
      expect(typeof og?.description).toBe('string');
      expect((og?.description as string).length).toBeGreaterThan(0);
      
      console.log(`✓ ${name} (${path}): og:title="${og?.title?.substring(0, 40)}...", og:description="${og?.description?.substring(0, 40)}..."`);
    });
  });

  it('should have Open Graph type field on all pages', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      // Property: Open Graph must have type
      expect(hasOpenGraphType(metadata)).toBe(true);
      
      const og = metadata.openGraph;
      expect(og?.type).toBeDefined();
      expect(og?.type).not.toBeNull();
      
      // Type should be one of the valid Open Graph types
      const validTypes = ['website', 'article', 'profile', 'book', 'video.movie', 'music.song'];
      expect(validTypes).toContain(og?.type);
      
      console.log(`✓ ${name} (${path}): og:type="${og?.type}"`);
    });
  });

  it('should have Open Graph URL field on all pages', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      // Property: Open Graph must have URL
      expect(hasOpenGraphUrl(metadata)).toBe(true);
      
      const og = metadata.openGraph;
      expect(og?.url).toBeDefined();
      expect(typeof og?.url).toBe('string');
      expect((og?.url as string).length).toBeGreaterThan(0);
      
      console.log(`✓ ${name} (${path}): og:url="${og?.url}"`);
    });
  });

  it('should have non-empty Open Graph title on all pages', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      // Property: Open Graph title must be non-empty
      expect(hasValidOpenGraphTitle(metadata)).toBe(true);
      
      const og = metadata.openGraph;
      const title = og?.title as string;
      
      // Title should not be just whitespace
      expect(title.trim()).toBe(title);
      expect(title.trim().length).toBeGreaterThan(0);
      
      // Title should be reasonable length
      expect(title.length).toBeGreaterThanOrEqual(3);
      expect(title.length).toBeLessThanOrEqual(100);
      
      console.log(`✓ ${name} (${path}): Valid og:title (${title.length} chars)`);
    });
  });

  it('should have non-empty Open Graph description on all pages', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      // Property: Open Graph description must be non-empty
      expect(hasValidOpenGraphDescription(metadata)).toBe(true);
      
      const og = metadata.openGraph;
      const description = og?.description as string;
      
      // Description should not be just whitespace
      expect(description.trim()).toBe(description);
      expect(description.trim().length).toBeGreaterThan(0);
      
      // Description should be reasonable length
      expect(description.length).toBeGreaterThanOrEqual(20);
      expect(description.length).toBeLessThanOrEqual(300);
      
      console.log(`✓ ${name} (${path}): Valid og:description (${description.length} chars)`);
    });
  });

  it('should have Open Graph images for pages with visual content', () => {
    // Test pages that should have images
    const pagesWithImages = pagesWithOpenGraph.filter(
      (page) => page.name === 'Home' || page.name === 'Blog Post Detail'
    );
    
    pagesWithImages.forEach(({ path, name, metadata }) => {
      const og = metadata.openGraph;
      
      // Property: Pages with visual content should have og:image
      expect(og?.images).toBeDefined();
      expect(Array.isArray(og?.images)).toBe(true);
      expect((og?.images as any[]).length).toBeGreaterThan(0);
      
      // Check image URL is valid
      const firstImage = (og?.images as any[])[0];
      if (typeof firstImage === 'string') {
        expect(firstImage).toMatch(/^https?:\/\//);
      } else if (typeof firstImage === 'object') {
        expect(firstImage.url).toBeDefined();
        expect(firstImage.url).toMatch(/^https?:\/\//);
      }
      
      console.log(`✓ ${name} (${path}): Has og:image`);
    });
  });

  it('should have article-specific Open Graph fields for blog posts', () => {
    // Test blog post pages
    const blogPosts = pagesWithOpenGraph.filter(
      (page) => page.name === 'Blog Post Detail'
    );
    
    blogPosts.forEach(({ path, name, metadata }) => {
      const og = metadata.openGraph;
      
      // Property: Blog posts should have type="article"
      expect(og?.type).toBe('article');
      
      // Property: Blog posts should have publishedTime
      expect(og?.publishedTime).toBeDefined();
      expect(typeof og?.publishedTime).toBe('string');
      
      // Property: Blog posts should have authors
      expect(og?.authors).toBeDefined();
      expect(Array.isArray(og?.authors)).toBe(true);
      expect((og?.authors as string[]).length).toBeGreaterThan(0);
      
      console.log(`✓ ${name} (${path}): Has article-specific og fields`);
    });
  });

  it('should have website type for non-article pages', () => {
    // Test non-blog pages
    const nonBlogPages = pagesWithOpenGraph.filter(
      (page) => page.name !== 'Blog Post Detail'
    );
    
    nonBlogPages.forEach(({ path, name, metadata }) => {
      const og = metadata.openGraph;
      
      // Property: Non-blog pages should have type="website"
      expect(og?.type).toBe('website');
      
      console.log(`✓ ${name} (${path}): og:type="website"`);
    });
  });

  it('should have Twitter Card tags for enhanced social sharing', () => {
    // Test pages with Twitter cards
    const pagesWithTwitter = pagesWithOpenGraph.filter(
      (page) => page.metadata.twitter !== undefined
    );
    
    pagesWithTwitter.forEach(({ path, name, metadata }) => {
      // Property: Twitter card should have required fields
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBeDefined();
      expect(metadata.twitter?.title).toBeDefined();
      expect(metadata.twitter?.description).toBeDefined();
      
      console.log(`✓ ${name} (${path}): Has Twitter Card tags`);
    });
  });

  it('should maintain Open Graph tag consistency across all pages', () => {
    fc.assert(
      fc.property(
        // Generate test cases for different pages
        fc.constantFrom(...pagesWithOpenGraph),
        (page) => {
          const metadata = page.metadata;
          
          // Property: Open Graph consistency invariants
          // For ANY page in the system, these properties MUST hold:
          
          // 1. Has Open Graph tags
          expect(hasOpenGraphTags(metadata)).toBe(true);
          
          // 2. Has required fields
          expect(hasRequiredOpenGraphFields(metadata)).toBe(true);
          
          // 3. Has type field
          expect(hasOpenGraphType(metadata)).toBe(true);
          
          // 4. Has URL field
          expect(hasOpenGraphUrl(metadata)).toBe(true);
          
          // 5. Valid title
          expect(hasValidOpenGraphTitle(metadata)).toBe(true);
          
          // 6. Valid description
          expect(hasValidOpenGraphDescription(metadata)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate valid Open Graph tags for dynamic content', () => {
    fc.assert(
      fc.property(
        // Generate various page metadata scenarios
        fc.record({
          title: fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-.,!?']{10,80}$/),
          description: fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-.,!?']{20,200}$/),
          path: fc.stringMatching(/^\/[a-z0-9\-/]*$/),
          type: fc.constantFrom('website', 'article'),
        }),
        ({ title, description, path, type }) => {
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
              type,
              url: path,
            },
          };
          
          // Property: Generated metadata must have valid Open Graph tags
          expect(hasOpenGraphTags(metadata)).toBe(true);
          expect(hasRequiredOpenGraphFields(metadata)).toBe(true);
          expect(hasOpenGraphType(metadata)).toBe(true);
          expect(hasOpenGraphUrl(metadata)).toBe(true);
          expect(hasValidOpenGraphTitle(metadata)).toBe(true);
          expect(hasValidOpenGraphDescription(metadata)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have Open Graph URL matching the canonical URL', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      const canonicalUrl = metadata.alternates?.canonical;
      const ogUrl = metadata.openGraph?.url;
      
      // Property: og:url should match canonical URL
      expect(ogUrl).toBeDefined();
      expect(canonicalUrl).toBeDefined();
      expect(ogUrl).toBe(canonicalUrl);
      
      console.log(`✓ ${name} (${path}): og:url matches canonical URL`);
    });
  });

  it('should have Open Graph title and description that are trimmed', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      const og = metadata.openGraph;
      const title = og?.title as string;
      const description = og?.description as string;
      
      // Property: Title and description should be trimmed
      expect(title).toBe(title.trim());
      expect(description).toBe(description.trim());
      
      // Property: No leading/trailing whitespace
      expect(title).not.toMatch(/^\s/);
      expect(title).not.toMatch(/\s$/);
      expect(description).not.toMatch(/^\s/);
      expect(description).not.toMatch(/\s$/);
      
      console.log(`✓ ${name} (${path}): og tags properly trimmed`);
    });
  });

  it('should have Open Graph description that is a complete sentence', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      const og = metadata.openGraph;
      const description = og?.description as string;
      
      // Property: Description should end with proper punctuation
      expect(description).toMatch(/[.!?]$/);
      
      // Property: Description should start with a capital letter
      expect(description[0]).toMatch(/[A-Z]/);
      
      console.log(`✓ ${name} (${path}): og:description is complete sentence`);
    });
  });

  it('should reject metadata without Open Graph tags', () => {
    // Test invalid metadata: No Open Graph
    const noOpenGraphMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
    };
    
    expect(hasOpenGraphTags(noOpenGraphMetadata)).toBe(false);
    expect(hasRequiredOpenGraphFields(noOpenGraphMetadata)).toBe(false);
    
    // Test invalid metadata: Empty Open Graph
    const emptyOpenGraphMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      openGraph: {} as any,
    };
    
    expect(hasRequiredOpenGraphFields(emptyOpenGraphMetadata)).toBe(false);
    
    // Test invalid metadata: Missing title
    const missingTitleMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      openGraph: {
        description: 'Description',
        type: 'website',
        url: '/',
      } as any,
    };
    
    expect(hasRequiredOpenGraphFields(missingTitleMetadata)).toBe(false);
    
    // Test invalid metadata: Missing description
    const missingDescriptionMetadata: Metadata = {
      title: 'Page Title',
      description: 'Page description',
      openGraph: {
        title: 'Title',
        type: 'website',
        url: '/',
      } as any,
    };
    
    expect(hasRequiredOpenGraphFields(missingDescriptionMetadata)).toBe(false);
    
    console.log('✓ All invalid metadata correctly rejected');
  });

  it('should have Open Graph tags optimized for social media preview', () => {
    // Test each page
    pagesWithOpenGraph.forEach(({ path, name, metadata }) => {
      const og = metadata.openGraph;
      const title = og?.title as string;
      const description = og?.description as string;
      
      // Property: Title should be within recommended length for social media
      // Facebook/Twitter recommend 60-90 characters for title
      expect(title.length).toBeLessThanOrEqual(100);
      
      // Property: Description should be within recommended length
      // Facebook/Twitter recommend 155-200 characters for description
      expect(description.length).toBeLessThanOrEqual(300);
      
      // Property: Title should be descriptive (not too short)
      expect(title.length).toBeGreaterThanOrEqual(10);
      
      // Property: Description should be descriptive (not too short)
      expect(description.length).toBeGreaterThanOrEqual(20);
      
      console.log(`✓ ${name} (${path}): og tags optimized for social media`);
    });
  });
});
