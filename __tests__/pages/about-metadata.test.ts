/**
 * About Page Metadata Tests
 * 
 * Validates that the about page has proper metadata including:
 * - Title
 * - Description
 * - Canonical URL
 * - Open Graph tags
 * 
 * Requirements: 6.1, 6.3, 6.7
 */

import { metadata } from '@/app/about/page';

describe('About Page Metadata', () => {
  it('should have a title', () => {
    expect(metadata.title).toBe('About Us | Colour Clouds Digital');
  });

  it('should have a description', () => {
    expect(metadata.description).toBe(
      'Learn about Colour Clouds Digital - our story, mission, vision, and values. We are passionate about creating innovative digital solutions that make a difference.'
    );
  });

  it('should have a canonical URL', () => {
    expect(metadata.alternates?.canonical).toBe('/about');
  });

  it('should have Open Graph title', () => {
    expect(metadata.openGraph?.title).toBe('About Us | Colour Clouds Digital');
  });

  it('should have Open Graph description', () => {
    expect(metadata.openGraph?.description).toBe(
      'Learn about Colour Clouds Digital - our story, mission, vision, and values. We are passionate about creating innovative digital solutions that make a difference.'
    );
  });

  it('should have Open Graph type', () => {
    expect(metadata.openGraph?.type).toBe('website');
  });

  it('should have Open Graph URL', () => {
    expect(metadata.openGraph?.url).toBe('/about');
  });
});
