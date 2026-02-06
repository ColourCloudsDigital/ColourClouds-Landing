/**
 * Property-Based Tests for Cache Layer
 * 
 * Tests caching functionality for blog posts to ensure proper cache serving
 * before expiration and minimize Google Sheets API calls.
 * 
 * Requirements: 2.6, 4.11, 12.1, 12.4, 12.5
 */

import * as fc from 'fast-check';
import { getCachedBlogPosts, getCachedBlogPostBySlug, CACHE_REVALIDATE } from '../cache';
import { getGoogleSheetsService, resetGoogleSheetsService } from '../google-sheets';
import { google } from 'googleapis';
import { BlogPost } from '../types';

// Mock the googleapis module
jest.mock('googleapis');

// Mock Next.js cache functions with actual caching behavior
const cacheStore = new Map<string, { data: any; timestamp: number }>();

jest.mock('next/cache', () => ({
  unstable_cache: (fn: Function, keys: string[], options: any) => {
    // Return a function that implements actual caching behavior
    return async (...args: any[]) => {
      const cacheKey = keys.join(':');
      const now = Date.now();
      const cached = cacheStore.get(cacheKey);
      
      // Check if we have cached data and it's not expired
      if (cached && options.revalidate) {
        const age = (now - cached.timestamp) / 1000; // age in seconds
        if (age < options.revalidate) {
          // Return cached data
          return cached.data;
        }
      }
      
      // No cache or expired, call the function
      const result = await fn(...args);
      
      // Store in cache
      cacheStore.set(cacheKey, {
        data: result,
        timestamp: now,
      });
      
      return result;
    };
  },
  revalidateTag: jest.fn((tag: string) => {
    // Clear all cache entries when a tag is revalidated
    cacheStore.clear();
  }),
}));

// Mock console methods to avoid cluttering test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

// Helper to generate valid ISO date strings
const validDateArbitrary = () => fc.integer({ 
  min: new Date('2000-01-01').getTime(), 
  max: new Date('2030-12-31').getTime() 
}).map(ts => new Date(ts).toISOString());

describe('Cache Layer Tests', () => {
  let mockSheets: any;

  beforeEach(() => {
    // Reset the singleton instance before each test
    resetGoogleSheetsService();
    
    // Clear the cache store
    cacheStore.clear();
    
    // Clear all mocks
    jest.clearAllMocks();

    // Set up environment variables
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----\n';
    process.env.GOOGLE_SHEET_ID = 'test-sheet-id-123';

    // Create mock sheets API
    mockSheets = {
      spreadsheets: {
        get: jest.fn().mockResolvedValue({ data: { spreadsheetId: 'test-sheet-id-123' } }),
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    };

    // Mock google.sheets to return our mock
    (google.sheets as jest.Mock).mockReturnValue(mockSheets);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GOOGLE_SHEET_ID;
  });

  afterAll(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  /**
   * Property 31: Cache Serving Before Expiration
   * **Validates: Requirements 12.5**
   * 
   * Property: When blog post data is cached, the system SHALL serve cached data
   * until cache expiration without making additional API calls to Google Sheets.
   * 
   * This property verifies that:
   * 1. The first call to fetch blog posts makes an API call to Google Sheets
   * 2. Subsequent calls within the cache TTL serve cached data without additional API calls
   * 3. The cached data is identical to the original fetched data
   * 4. The cache TTL is properly configured (1 hour = 3600 seconds)
   */
  describe('Property 31: Cache Serving Before Expiration', () => {
    it('should serve cached blog posts without additional API calls before expiration', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary blog post data
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 10 }),
              slug: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
              title: fc.string({ minLength: 1, maxLength: 100 }),
              author: fc.string({ minLength: 1, maxLength: 50 }),
              publishedAt: validDateArbitrary(),
              content: fc.string({ minLength: 10, maxLength: 500 }),
              excerpt: fc.string({ minLength: 10, maxLength: 200 }),
              featuredImage: fc.webUrl(),
              category: fc.constantFrom('Tech', 'Design', 'Business', 'Development'),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
              status: fc.constant('published' as const),
              readTime: fc.integer({ min: 1, max: 30 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (generatedPosts) => {
            // Arrange - Convert generated posts to the format returned by Google Sheets
            const mockBlogData = generatedPosts.map(post => [
              post.id,
              post.slug,
              post.title,
              post.author,
              post.publishedAt,
              post.content,
              post.excerpt,
              post.featuredImage,
              post.category,
              post.tags.join(','),
              post.status,
              post.readTime.toString(),
            ]);

            // Mock the Google Sheets API to return our generated data
            mockSheets.spreadsheets.values.get.mockResolvedValue({
              data: { values: mockBlogData },
            });

            // Initialize the service
            const service = getGoogleSheetsService();
            await service.initialize();

            // Don't clear mocks - we need to track all calls
            // Just note the initial call count after initialization
            const initCallCount = mockSheets.spreadsheets.values.get.mock.calls.length;

            // Act - First call: should fetch from API
            const firstFetch = await getCachedBlogPosts();
            const firstCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Act - Second call: should serve from cache (no additional API call)
            const secondFetch = await getCachedBlogPosts();
            const secondCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Act - Third call: should still serve from cache
            const thirdFetch = await getCachedBlogPosts();
            const thirdCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Property assertions:
            // 1. First call should make exactly one API call
            expect(firstCallCount).toBe(1);

            // 2. Second call should NOT make additional API calls (cache hit)
            expect(secondCallCount).toBe(1); // Still 1, not 2

            // 3. Third call should NOT make additional API calls (cache hit)
            expect(thirdCallCount).toBe(1); // Still 1, not 3

            // 4. All fetches should return the same data (cache consistency)
            expect(firstFetch).toEqual(secondFetch);
            expect(secondFetch).toEqual(thirdFetch);

            // 5. The returned data should match the generated posts
            expect(firstFetch).toHaveLength(generatedPosts.length);
            
            // Verify each post matches the generated data
            firstFetch.forEach((post, index) => {
              const generated = generatedPosts[index];
              expect(post.id).toBe(generated.id);
              expect(post.slug).toBe(generated.slug);
              expect(post.title).toBe(generated.title);
              expect(post.author).toBe(generated.author);
              expect(post.status).toBe('published');
            });

            // Reset for next iteration
            resetGoogleSheetsService();
            cacheStore.clear(); // Explicitly clear cache for next iteration
          }
        ),
        { 
          numRuns: 100, // Run 100 iterations with different blog post data
          endOnFailure: true,
        }
      );
    });

    it('should serve cached individual blog posts without additional API calls', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a single blog post
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            slug: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            author: fc.string({ minLength: 1, maxLength: 50 }),
            publishedAt: validDateArbitrary(),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            excerpt: fc.string({ minLength: 10, maxLength: 200 }),
            featuredImage: fc.webUrl(),
            category: fc.constantFrom('Tech', 'Design', 'Business', 'Development'),
            tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
            status: fc.constant('published' as const),
            readTime: fc.integer({ min: 1, max: 30 }),
          }),
          async (generatedPost) => {
            // Arrange - Convert generated post to the format returned by Google Sheets
            const mockBlogData = [[
              generatedPost.id,
              generatedPost.slug,
              generatedPost.title,
              generatedPost.author,
              generatedPost.publishedAt,
              generatedPost.content,
              generatedPost.excerpt,
              generatedPost.featuredImage,
              generatedPost.category,
              generatedPost.tags.join(','),
              generatedPost.status,
              generatedPost.readTime.toString(),
            ]];

            // Mock the Google Sheets API to return our generated data
            mockSheets.spreadsheets.values.get.mockResolvedValue({
              data: { values: mockBlogData },
            });

            // Initialize the service
            const service = getGoogleSheetsService();
            await service.initialize();
            
            // Note the initial call count after initialization
            const initCallCount = mockSheets.spreadsheets.values.get.mock.calls.length;

            // Act - First call: should fetch from API
            const firstFetch = await getCachedBlogPostBySlug(generatedPost.slug);
            const firstCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Act - Second call: should serve from cache
            const secondFetch = await getCachedBlogPostBySlug(generatedPost.slug);
            const secondCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Property assertions:
            // 1. First call should make exactly one API call
            expect(firstCallCount).toBe(1);

            // 2. Second call should NOT make additional API calls (cache hit)
            expect(secondCallCount).toBe(1); // Still 1, not 2

            // 3. Both fetches should return the same data
            expect(firstFetch).toEqual(secondFetch);

            // 4. The returned data should match the generated post
            expect(firstFetch).not.toBeNull();
            if (firstFetch) {
              expect(firstFetch.slug).toBe(generatedPost.slug);
              expect(firstFetch.title).toBe(generatedPost.title);
              expect(firstFetch.author).toBe(generatedPost.author);
              expect(firstFetch.status).toBe('published');
            }

            // Reset for next iteration
            resetGoogleSheetsService();
            cacheStore.clear(); // Explicitly clear cache for next iteration
          }
        ),
        { 
          numRuns: 100, // Run 100 iterations with different blog posts
          endOnFailure: true,
        }
      );
    });

    it('should verify cache TTL is configured correctly', () => {
      // Property: Cache TTL should be 3600 seconds (1 hour) for blog posts
      // This is a configuration test to ensure the cache duration meets requirements
      
      // Assert
      expect(CACHE_REVALIDATE.BLOG).toBe(3600);
      
      // Verify it's exactly 1 hour in seconds
      const oneHourInSeconds = 60 * 60;
      expect(CACHE_REVALIDATE.BLOG).toBe(oneHourInSeconds);
    });

    it('should maintain cache consistency across multiple concurrent requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate blog post data
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 10 }),
              slug: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
              title: fc.string({ minLength: 1, maxLength: 100 }),
              author: fc.string({ minLength: 1, maxLength: 50 }),
              publishedAt: validDateArbitrary(),
              content: fc.string({ minLength: 10, maxLength: 500 }),
              excerpt: fc.string({ minLength: 10, maxLength: 200 }),
              featuredImage: fc.webUrl(),
              category: fc.constantFrom('Tech', 'Design', 'Business', 'Development'),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
              status: fc.constant('published' as const),
              readTime: fc.integer({ min: 1, max: 30 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.integer({ min: 2, max: 10 }), // Number of concurrent requests
          async (generatedPosts, concurrentRequests) => {
            // Arrange
            const mockBlogData = generatedPosts.map(post => [
              post.id,
              post.slug,
              post.title,
              post.author,
              post.publishedAt,
              post.content,
              post.excerpt,
              post.featuredImage,
              post.category,
              post.tags.join(','),
              post.status,
              post.readTime.toString(),
            ]);

            mockSheets.spreadsheets.values.get.mockResolvedValue({
              data: { values: mockBlogData },
            });

            const service = getGoogleSheetsService();
            await service.initialize();
            
            // Note the initial call count after initialization
            const initCallCount = mockSheets.spreadsheets.values.get.mock.calls.length;

            // Act - Make an initial request to populate the cache
            await getCachedBlogPosts();
            const firstCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Act - Make multiple concurrent requests (should all hit cache)
            const requests = Array(concurrentRequests).fill(null).map(() => getCachedBlogPosts());
            const results = await Promise.all(requests);
            const totalCallCount = mockSheets.spreadsheets.values.get.mock.calls.length - initCallCount;

            // Property assertions:
            // 1. First call should make exactly one API call
            expect(firstCallCount).toBe(1);

            // 2. Subsequent concurrent requests should NOT make additional API calls (all cache hits)
            expect(totalCallCount).toBe(1); // Still 1, not 1 + concurrentRequests

            // 3. All concurrent requests should return identical data
            const firstResult = results[0];
            results.forEach(result => {
              expect(result).toEqual(firstResult);
            });

            // 4. All results should have the correct number of posts
            results.forEach(result => {
              expect(result).toHaveLength(generatedPosts.length);
            });

            // Reset for next iteration
            resetGoogleSheetsService();
            cacheStore.clear(); // Explicitly clear cache for next iteration
          }
        ),
        { 
          numRuns: 50, // Run 50 iterations with different scenarios
          endOnFailure: true,
        }
      );
    });
  });
});

