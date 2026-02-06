/**
 * Tests for next.config.js configuration
 * Validates: Requirements 6.4, 12.2
 */

describe('Next.js Configuration', () => {
  let config: any;

  beforeAll(() => {
    // Load the Next.js config
    config = require('../next.config.js');
  });

  describe('Image Configuration (Requirement 6.4, 12.2)', () => {
    it('should configure image domains for external images', () => {
      expect(config.images).toBeDefined();
      expect(config.images.remotePatterns).toBeDefined();
      expect(Array.isArray(config.images.remotePatterns)).toBe(true);
      
      // Check that required domains are configured
      const hostnames = config.images.remotePatterns.map((p: any) => p.hostname);
      expect(hostnames).toContain('images.unsplash.com');
      expect(hostnames).toContain('res.cloudinary.com');
      expect(hostnames.length).toBeGreaterThanOrEqual(4);
    });

    it('should configure modern image formats (AVIF, WebP)', () => {
      expect(config.images.formats).toBeDefined();
      expect(config.images.formats).toContain('image/avif');
      expect(config.images.formats).toContain('image/webp');
    });

    it('should configure responsive image sizes', () => {
      expect(config.images.deviceSizes).toBeDefined();
      expect(Array.isArray(config.images.deviceSizes)).toBe(true);
      expect(config.images.deviceSizes.length).toBeGreaterThan(0);
      
      expect(config.images.imageSizes).toBeDefined();
      expect(Array.isArray(config.images.imageSizes)).toBe(true);
      expect(config.images.imageSizes.length).toBeGreaterThan(0);
    });
  });

  describe('Environment Variables Configuration', () => {
    it('should configure public site URL environment variable', () => {
      expect(config.env).toBeDefined();
      expect(config.env.NEXT_PUBLIC_SITE_URL).toBeDefined();
      expect(typeof config.env.NEXT_PUBLIC_SITE_URL).toBe('string');
    });
  });

  describe('Next.js 16 Build Settings', () => {
    it('should configure Turbopack for Next.js 16', () => {
      expect(config.turbopack).toBeDefined();
      expect(config.turbopack.rules).toBeDefined();
    });

    it('should configure experimental features for optimization', () => {
      expect(config.experimental).toBeDefined();
      expect(config.experimental.optimizePackageImports).toBeDefined();
      expect(Array.isArray(config.experimental.optimizePackageImports)).toBe(true);
    });

    it('should configure compiler options', () => {
      expect(config.compiler).toBeDefined();
    });

    it('should configure security headers', () => {
      expect(config.headers).toBeDefined();
      expect(typeof config.headers).toBe('function');
    });
  });

  describe('Security Headers', () => {
    it('should return security headers for all routes', async () => {
      const headers = await config.headers();
      expect(Array.isArray(headers)).toBe(true);
      expect(headers.length).toBeGreaterThan(0);
      
      // Check for global security headers
      const globalHeaders = headers.find((h: any) => h.source === '/:path*');
      expect(globalHeaders).toBeDefined();
      expect(globalHeaders.headers).toBeDefined();
      
      // Verify key security headers are present
      const headerKeys = globalHeaders.headers.map((h: any) => h.key);
      expect(headerKeys).toContain('Strict-Transport-Security');
      expect(headerKeys).toContain('X-Content-Type-Options');
      expect(headerKeys).toContain('X-Frame-Options');
      expect(headerKeys).toContain('X-XSS-Protection');
    });

    it('should configure cache control for API routes', async () => {
      const headers = await config.headers();
      const apiHeaders = headers.find((h: any) => h.source === '/api/:path*');
      expect(apiHeaders).toBeDefined();
      expect(apiHeaders.headers).toBeDefined();
      
      const cacheControl = apiHeaders.headers.find((h: any) => h.key === 'Cache-Control');
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('no-store');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain webpack configuration for backward compatibility', () => {
      expect(config.webpack).toBeDefined();
      expect(typeof config.webpack).toBe('function');
    });
  });
});
