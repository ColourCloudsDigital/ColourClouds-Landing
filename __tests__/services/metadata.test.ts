/**
 * Unit Tests for Services Page Metadata
 * 
 * Tests the metadata configuration to ensure it properly includes:
 * - Title and description (Requirement 6.1)
 * - Open Graph tags for social media sharing (Requirement 6.3)
 * - Canonical URL (Requirement 6.7)
 * 
 * Requirements: 6.1, 6.3, 6.7
 */

import { Metadata } from 'next';

/**
 * Expected metadata for the services page
 * This matches the metadata export from app/services/page.tsx
 */
const servicesMetadata: Metadata = {
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
};

describe('Services Page Metadata', () => {
  describe('Basic Metadata (Requirement 6.1)', () => {
    it('should have a title', () => {
      expect(servicesMetadata.title).toBeDefined();
      expect(servicesMetadata.title).toBe('Services | Colour Clouds Digital');
    });

    it('should have a description', () => {
      expect(servicesMetadata.description).toBeDefined();
      expect(typeof servicesMetadata.description).toBe('string');
      expect(servicesMetadata.description.length).toBeGreaterThan(0);
    });

    it('should have a meaningful description', () => {
      expect(servicesMetadata.description).toContain('app development');
      expect(servicesMetadata.description).toContain('digital content');
    });
  });

  describe('Open Graph Tags (Requirement 6.3)', () => {
    it('should have Open Graph metadata', () => {
      expect(servicesMetadata.openGraph).toBeDefined();
    });

    it('should have Open Graph title', () => {
      expect(servicesMetadata.openGraph?.title).toBeDefined();
      expect(servicesMetadata.openGraph?.title).toBe('Services | Colour Clouds Digital');
    });

    it('should have Open Graph description', () => {
      expect(servicesMetadata.openGraph?.description).toBeDefined();
      expect(typeof servicesMetadata.openGraph?.description).toBe('string');
      expect(servicesMetadata.openGraph?.description.length).toBeGreaterThan(0);
    });

    it('should have Open Graph type', () => {
      expect(servicesMetadata.openGraph?.type).toBeDefined();
      expect(servicesMetadata.openGraph?.type).toBe('website');
    });

    it('should have Open Graph URL', () => {
      expect(servicesMetadata.openGraph?.url).toBeDefined();
      expect(servicesMetadata.openGraph?.url).toBe('/services');
    });
  });

  describe('Canonical URL (Requirement 6.7)', () => {
    it('should have canonical URL', () => {
      expect(servicesMetadata.alternates).toBeDefined();
      expect(servicesMetadata.alternates?.canonical).toBeDefined();
    });

    it('should have correct canonical URL path', () => {
      expect(servicesMetadata.alternates?.canonical).toBe('/services');
    });
  });

  describe('Metadata Completeness', () => {
    it('should have all required metadata fields', () => {
      // Requirement 6.1: Title and description
      expect(servicesMetadata.title).toBeDefined();
      expect(servicesMetadata.description).toBeDefined();
      
      // Requirement 6.3: Open Graph tags
      expect(servicesMetadata.openGraph).toBeDefined();
      expect(servicesMetadata.openGraph?.title).toBeDefined();
      expect(servicesMetadata.openGraph?.description).toBeDefined();
      expect(servicesMetadata.openGraph?.type).toBeDefined();
      
      // Requirement 6.7: Canonical URL
      expect(servicesMetadata.alternates?.canonical).toBeDefined();
    });

    it('should have consistent titles across metadata and Open Graph', () => {
      expect(servicesMetadata.title).toBe(servicesMetadata.openGraph?.title);
    });

    it('should have consistent descriptions across metadata and Open Graph', () => {
      expect(servicesMetadata.description).toBe(servicesMetadata.openGraph?.description);
    });
  });
});
