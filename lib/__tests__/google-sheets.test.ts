/**
 * Unit Tests for Google Sheets Service
 * 
 * Tests authentication initialization, rate limit error handling,
 * and generic API error handling.
 * 
 * Requirements: 2.4, 2.5
 */

import { GoogleSheetsService, resetGoogleSheetsService } from '../google-sheets';
import { GoogleSheetsError, RateLimitError } from '../types';
import { google } from 'googleapis';
import * as fc from 'fast-check';

// Mock the googleapis module
jest.mock('googleapis');

// Mock console methods to avoid cluttering test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let mockSheets: any;
  let mockAuth: any;

  beforeEach(() => {
    // Reset the singleton instance before each test
    resetGoogleSheetsService();
    
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

    // Create a new service instance
    service = new GoogleSheetsService('test-sheet-id-123');
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

  describe('Authentication Initialization', () => {
    it('should successfully initialize with valid credentials', async () => {
      // Act
      await service.initialize();

      // Assert
      expect(google.sheets).toHaveBeenCalledWith({
        version: 'v4',
        auth: expect.any(Object),
      });
      expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id-123',
      });
    });

    it('should throw GoogleSheetsError when service account email is missing', async () => {
      // Arrange
      delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

      // Act & Assert
      await expect(service.initialize()).rejects.toThrow(GoogleSheetsError);
      await expect(service.initialize()).rejects.toThrow('Missing Google Sheets credentials');
    });

    it('should throw GoogleSheetsError when private key is missing', async () => {
      // Arrange
      delete process.env.GOOGLE_PRIVATE_KEY;

      // Act & Assert
      await expect(service.initialize()).rejects.toThrow(GoogleSheetsError);
      await expect(service.initialize()).rejects.toThrow('Missing Google Sheets credentials');
    });

    it('should throw GoogleSheetsError when spreadsheet ID is missing', async () => {
      // Arrange
      delete process.env.GOOGLE_SHEET_ID;
      service = new GoogleSheetsService(); // Create without ID

      // Act & Assert
      await expect(service.initialize()).rejects.toThrow(GoogleSheetsError);
      await expect(service.initialize()).rejects.toThrow('Missing Google Sheets ID');
    });

    it('should handle escaped newlines in private key', async () => {
      // Arrange
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nMOCK_KEY\\n-----END PRIVATE KEY-----\\n';

      // Act
      await service.initialize();

      // Assert - initialization should succeed
      expect(google.sheets).toHaveBeenCalled();
    });

    it('should throw GoogleSheetsError when spreadsheet connection fails', async () => {
      // Arrange
      mockSheets.spreadsheets.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(service.initialize()).rejects.toThrow(GoogleSheetsError);
      await expect(service.initialize()).rejects.toThrow('Failed to initialize Google Sheets service');
    });

    it('should throw error when operations are attempted before initialization', async () => {
      // Act & Assert
      await expect(service.readSheet('TestSheet', 'A1:B10')).rejects.toThrow(GoogleSheetsError);
      await expect(service.readSheet('TestSheet', 'A1:B10')).rejects.toThrow('not initialized');
    });
  });

  describe('Rate Limit Error Handling', () => {
    beforeEach(async () => {
      // Initialize the service before each test
      await service.initialize();
      // Clear mocks after initialization
      jest.clearAllMocks();
    });

    it('should retry on rate limit error and eventually succeed', async () => {
      // Arrange - First call fails with rate limit, second succeeds
      mockSheets.spreadsheets.values.get
        .mockRejectedValueOnce({
          code: 429,
          message: 'Rate limit exceeded',
        })
        .mockResolvedValueOnce({
          data: { values: [['test', 'data']] },
        });

      // Act
      const result = await service.readSheet('TestSheet', 'A1:B10');

      // Assert
      expect(result).toEqual([['test', 'data']]);
      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledTimes(2);
    });

    it('should throw RateLimitError after exhausting all retries', async () => {
      // Arrange - All calls fail with rate limit error
      mockSheets.spreadsheets.values.get.mockRejectedValue({
        code: 429,
        message: 'Rate limit exceeded',
      });

      // Act & Assert
      await expect(service.readSheet('TestSheet', 'A1:B10')).rejects.toThrow(RateLimitError);
      
      // Should have tried initial attempt + 5 retries = 6 times
      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledTimes(6);
    }, 35000); // Set timeout to 35 seconds to account for exponential backoff (1+2+4+8+16 = 31s)

    it('should respect retry-after header when present', async () => {
      // Arrange
      const rateLimitError = {
        code: 429,
        message: 'Rate limit exceeded',
        response: {
          headers: {
            'retry-after': '2', // 2 seconds
          },
        },
      };

      mockSheets.spreadsheets.values.get
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          data: { values: [['test', 'data']] },
        });

      // Act
      const startTime = Date.now();
      const result = await service.readSheet('TestSheet', 'A1:B10');
      const endTime = Date.now();

      // Assert
      expect(result).toEqual([['test', 'data']]);
      // Should have waited at least 2 seconds (2000ms)
      expect(endTime - startTime).toBeGreaterThanOrEqual(1900); // Allow small margin
    });

    it('should handle rate limit errors with quota exceeded message', async () => {
      // Arrange - Mock to fail once with quota exceeded, then succeed
      // We need to reset the mock completely for this test
      mockSheets.spreadsheets.values.append.mockReset();
      mockSheets.spreadsheets.values.append
        .mockRejectedValueOnce({
          code: 403,
          message: 'quota exceeded for quota metric', // lowercase to match the check
        })
        .mockResolvedValue({ data: {} }); // All subsequent calls succeed

      // Act
      await service.appendRow('TestSheet', ['value1', 'value2']);

      // Assert - Should have retried and succeeded
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledTimes(2);
    }, 5000); // Allow time for retry
  });

  describe('Generic API Error Handling', () => {
    beforeEach(async () => {
      // Initialize the service before each test
      await service.initialize();
    });

    it('should throw GoogleSheetsError for network errors', async () => {
      // Arrange
      mockSheets.spreadsheets.values.get.mockRejectedValue(new Error('Network connection failed'));

      // Act & Assert
      await expect(service.readSheet('TestSheet', 'A1:B10')).rejects.toThrow(GoogleSheetsError);
      await expect(service.readSheet('TestSheet', 'A1:B10')).rejects.toThrow('Failed to read from sheet');
    });

    it('should throw GoogleSheetsError for invalid sheet name', async () => {
      // Arrange
      mockSheets.spreadsheets.values.get.mockRejectedValue({
        code: 400,
        message: 'Unable to parse range: InvalidSheet!A1:B10',
      });

      // Act & Assert
      await expect(service.readSheet('InvalidSheet', 'A1:B10')).rejects.toThrow(GoogleSheetsError);
    });

    it('should throw GoogleSheetsError for permission errors', async () => {
      // Arrange
      mockSheets.spreadsheets.values.append.mockRejectedValue({
        code: 403,
        message: 'The caller does not have permission',
      });

      // Act & Assert
      await expect(service.appendRow('TestSheet', ['data'])).rejects.toThrow(GoogleSheetsError);
      await expect(service.appendRow('TestSheet', ['data'])).rejects.toThrow('Failed to append row');
    });

    it('should throw GoogleSheetsError for authentication errors', async () => {
      // Arrange
      mockSheets.spreadsheets.values.get.mockRejectedValue({
        code: 401,
        message: 'Invalid authentication credentials',
      });

      // Act & Assert
      await expect(service.readSheet('TestSheet', 'A1:B10')).rejects.toThrow(GoogleSheetsError);
    });

    it('should log errors when operations fail', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockSheets.spreadsheets.values.get.mockRejectedValue(testError);

      // Act
      try {
        await service.readSheet('TestSheet', 'A1:B10');
      } catch (error) {
        // Expected to throw
      }

      // Assert - Check that error was logged
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[GoogleSheets ERROR]'),
        expect.objectContaining({
          error: 'Test error',
        })
      );
    });

    it('should handle errors in getBlogPosts gracefully', async () => {
      // Arrange
      mockSheets.spreadsheets.values.get.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(service.getBlogPosts()).rejects.toThrow(GoogleSheetsError);
      await expect(service.getBlogPosts()).rejects.toThrow('Failed to read from sheet');
    });

    it('should handle errors in addSubscriber gracefully', async () => {
      // Arrange
      mockSheets.spreadsheets.values.append.mockRejectedValue(new Error('API Error'));

      const subscriber = {
        email: 'test@example.com',
        name: 'Test User',
        subscribedAt: new Date().toISOString(),
        source: '/services',
        status: 'active' as const,
      };

      // Act & Assert
      await expect(service.addSubscriber(subscriber)).rejects.toThrow(GoogleSheetsError);
      await expect(service.addSubscriber(subscriber)).rejects.toThrow('Failed to append row');
    });

    it('should handle errors in addContactSubmission gracefully', async () => {
      // Arrange
      mockSheets.spreadsheets.values.append.mockRejectedValue(new Error('API Error'));

      const submission = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        submittedAt: new Date().toISOString(),
        status: 'new' as const,
      };

      // Act & Assert
      await expect(service.addContactSubmission(submission)).rejects.toThrow(GoogleSheetsError);
      await expect(service.addContactSubmission(submission)).rejects.toThrow('Failed to append row');
    });
  });

  describe('Successful Operations', () => {
    beforeEach(async () => {
      // Initialize the service before each test
      await service.initialize();
    });

    it('should successfully read data from a sheet', async () => {
      // Arrange
      const mockData = [
        ['Header1', 'Header2'],
        ['Value1', 'Value2'],
      ];
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: mockData },
      });

      // Act
      const result = await service.readSheet('TestSheet', 'A1:B10');

      // Assert
      expect(result).toEqual(mockData);
      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id-123',
        range: 'TestSheet!A1:B10',
      });
    });

    it('should return empty array when sheet has no data', async () => {
      // Arrange
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: undefined },
      });

      // Act
      const result = await service.readSheet('TestSheet', 'A1:B10');

      // Assert
      expect(result).toEqual([]);
    });

    it('should successfully append a row to a sheet', async () => {
      // Arrange
      mockSheets.spreadsheets.values.append.mockResolvedValue({ data: {} });

      // Act
      await service.appendRow('TestSheet', ['value1', 'value2', 'value3']);

      // Assert
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id-123',
        range: 'TestSheet!A:A',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [['value1', 'value2', 'value3']],
        },
      });
    });
  });

  describe('Blog-Specific Methods', () => {
    beforeEach(async () => {
      // Initialize the service before each test
      await service.initialize();
      jest.clearAllMocks();
    });

    describe('getBlogPosts()', () => {
      it('should retrieve all published blog posts', async () => {
        // Arrange - Mock blog data with published posts
        const mockBlogData = [
          ['1', 'first-post', 'First Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs,react', 'published', '5'],
          ['2', 'second-post', 'Second Post', 'Jane Smith', '2024-01-16T10:00:00Z', 'Content 2', 'Excerpt 2', 'https://example.com/image2.jpg', 'Design', 'ui,ux', 'published', '7'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts).toHaveLength(2);
        expect(posts[0]).toEqual({
          id: '1',
          slug: 'first-post',
          title: 'First Post',
          author: 'John Doe',
          publishedAt: '2024-01-15T10:00:00Z',
          content: 'Content 1',
          excerpt: 'Excerpt 1',
          featuredImage: 'https://example.com/image1.jpg',
          category: 'Tech',
          tags: ['nextjs', 'react'],
          status: 'published',
          readTime: 5,
        });
        expect(posts[1].slug).toBe('second-post');
      });

      it('should filter out draft posts', async () => {
        // Arrange - Mock blog data with mixed statuses
        const mockBlogData = [
          ['1', 'published-post', 'Published Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'published', '5'],
          ['2', 'draft-post', 'Draft Post', 'Jane Smith', '2024-01-16T10:00:00Z', 'Content 2', 'Excerpt 2', 'https://example.com/image2.jpg', 'Design', 'ui', 'draft', '7'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts).toHaveLength(1);
        expect(posts[0].slug).toBe('published-post');
        expect(posts[0].status).toBe('published');
      });

      it('should filter out archived posts', async () => {
        // Arrange - Mock blog data with archived posts
        const mockBlogData = [
          ['1', 'published-post', 'Published Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'published', '5'],
          ['2', 'archived-post', 'Archived Post', 'Jane Smith', '2024-01-16T10:00:00Z', 'Content 2', 'Excerpt 2', 'https://example.com/image2.jpg', 'Design', 'ui', 'archived', '7'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts).toHaveLength(1);
        expect(posts[0].slug).toBe('published-post');
      });

      it('should return empty array when no published posts exist', async () => {
        // Arrange - Mock blog data with only draft posts
        const mockBlogData = [
          ['1', 'draft-post', 'Draft Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'draft', '5'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts).toHaveLength(0);
      });

      it('should handle empty sheet data', async () => {
        // Arrange
        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: [] },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts).toHaveLength(0);
      });

      it('should skip rows with insufficient columns', async () => {
        // Arrange - Mock blog data with incomplete rows
        const mockBlogData = [
          ['1', 'complete-post', 'Complete Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'published', '5'],
          ['2', 'incomplete'], // Only 2 columns - should be skipped
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts).toHaveLength(1);
        expect(posts[0].slug).toBe('complete-post');
      });

      it('should parse tags correctly from comma-separated string', async () => {
        // Arrange
        const mockBlogData = [
          ['1', 'post-with-tags', 'Post With Tags', 'John Doe', '2024-01-15T10:00:00Z', 'Content', 'Excerpt', 'https://example.com/image.jpg', 'Tech', 'nextjs, react, typescript', 'published', '5'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts[0].tags).toEqual(['nextjs', 'react', 'typescript']);
      });

      it('should handle empty tags field', async () => {
        // Arrange
        const mockBlogData = [
          ['1', 'post-no-tags', 'Post Without Tags', 'John Doe', '2024-01-15T10:00:00Z', 'Content', 'Excerpt', 'https://example.com/image.jpg', 'Tech', '', 'published', '5'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts[0].tags).toEqual([]);
      });

      it('should handle missing readTime field', async () => {
        // Arrange
        const mockBlogData = [
          ['1', 'post-no-readtime', 'Post Without ReadTime', 'John Doe', '2024-01-15T10:00:00Z', 'Content', 'Excerpt', 'https://example.com/image.jpg', 'Tech', 'nextjs', 'published'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const posts = await service.getBlogPosts();

        // Assert
        expect(posts[0].readTime).toBeUndefined();
      });

      it('should call readSheet with correct parameters', async () => {
        // Arrange
        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: [] },
        });

        // Act
        await service.getBlogPosts();

        // Assert
        expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
          spreadsheetId: 'test-sheet-id-123',
          range: 'Blog!A2:L1000',
        });
      });
    });

    describe('getBlogPostBySlug()', () => {
      it('should retrieve a blog post by slug', async () => {
        // Arrange
        const mockBlogData = [
          ['1', 'first-post', 'First Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'published', '5'],
          ['2', 'second-post', 'Second Post', 'Jane Smith', '2024-01-16T10:00:00Z', 'Content 2', 'Excerpt 2', 'https://example.com/image2.jpg', 'Design', 'ui', 'published', '7'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const post = await service.getBlogPostBySlug('second-post');

        // Assert
        expect(post).not.toBeNull();
        expect(post?.slug).toBe('second-post');
        expect(post?.title).toBe('Second Post');
        expect(post?.author).toBe('Jane Smith');
      });

      it('should return null when post with slug does not exist', async () => {
        // Arrange
        const mockBlogData = [
          ['1', 'first-post', 'First Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'published', '5'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const post = await service.getBlogPostBySlug('non-existent-post');

        // Assert
        expect(post).toBeNull();
      });

      it('should return null when no posts exist', async () => {
        // Arrange
        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: [] },
        });

        // Act
        const post = await service.getBlogPostBySlug('any-slug');

        // Assert
        expect(post).toBeNull();
      });

      it('should only return published posts', async () => {
        // Arrange - Mock blog data with draft post matching slug
        const mockBlogData = [
          ['1', 'draft-post', 'Draft Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content 1', 'Excerpt 1', 'https://example.com/image1.jpg', 'Tech', 'nextjs', 'draft', '5'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const post = await service.getBlogPostBySlug('draft-post');

        // Assert - Should return null because post is not published
        expect(post).toBeNull();
      });

      it('should handle case-sensitive slug matching', async () => {
        // Arrange
        const mockBlogData = [
          ['1', 'MyPost', 'My Post', 'John Doe', '2024-01-15T10:00:00Z', 'Content', 'Excerpt', 'https://example.com/image.jpg', 'Tech', 'nextjs', 'published', '5'],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: { values: mockBlogData },
        });

        // Act
        const postExact = await service.getBlogPostBySlug('MyPost');
        const postLower = await service.getBlogPostBySlug('mypost');

        // Assert
        expect(postExact).not.toBeNull();
        expect(postExact?.slug).toBe('MyPost');
        expect(postLower).toBeNull(); // Case-sensitive, so lowercase doesn't match
      });

      it('should throw GoogleSheetsError when API fails', async () => {
        // Arrange
        mockSheets.spreadsheets.values.get.mockRejectedValue(new Error('API Error'));

        // Act & Assert
        await expect(service.getBlogPostBySlug('any-slug')).rejects.toThrow(GoogleSheetsError);
        await expect(service.getBlogPostBySlug('any-slug')).rejects.toThrow('Failed to read from sheet');
      });
    });
  });

  /**
   * Property-Based Tests
   */
  describe('Property 3: API Error Handling', () => {
    /**
     * **Validates: Requirements 2.5**
     * 
     * Property: When any Google Sheets API request fails with any error,
     * the system SHALL:
     * 1. Log the error (console.error is called)
     * 2. Return a user-friendly error message (throw GoogleSheetsError)
     * 
     * This property tests that error handling is consistent across all
     * API operations regardless of the specific error type.
     */
    beforeEach(async () => {
      // Initialize the service before each test
      await service.initialize();
      // Clear mocks after initialization
      jest.clearAllMocks();
    });

    it('should log errors and throw GoogleSheetsError for any API failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary error scenarios
          fc.record({
            errorCode: fc.oneof(
              fc.constant(400), // Bad Request
              fc.constant(401), // Unauthorized
              fc.constant(403), // Forbidden
              fc.constant(404), // Not Found
              fc.constant(500), // Internal Server Error
              fc.constant(503)  // Service Unavailable
            ),
            errorMessage: fc.oneof(
              fc.constant('Network connection failed'),
              fc.constant('Invalid authentication credentials'),
              fc.constant('The caller does not have permission'),
              fc.constant('Unable to parse range'),
              fc.constant('Internal server error'),
              fc.constant('Service temporarily unavailable')
            ),
            operation: fc.constantFrom('read', 'append', 'getBlogPosts', 'addSubscriber', 'addContactSubmission')
          }),
          async ({ errorCode, errorMessage, operation }) => {
            // Arrange - Mock the API to fail with the generated error
            const apiError = {
              code: errorCode,
              message: errorMessage,
            };

            // Reset mocks for this iteration
            jest.clearAllMocks();

            // Configure mocks based on operation type
            if (operation === 'read' || operation === 'getBlogPosts') {
              mockSheets.spreadsheets.values.get.mockRejectedValue(apiError);
            } else {
              mockSheets.spreadsheets.values.append.mockRejectedValue(apiError);
            }

            // Act & Assert
            let threwError = false;
            let threwGoogleSheetsError = false;
            let errorLogged = false;

            try {
              switch (operation) {
                case 'read':
                  await service.readSheet('TestSheet', 'A1:B10');
                  break;
                case 'append':
                  await service.appendRow('TestSheet', ['data']);
                  break;
                case 'getBlogPosts':
                  await service.getBlogPosts();
                  break;
                case 'addSubscriber':
                  await service.addSubscriber({
                    email: 'test@example.com',
                    subscribedAt: new Date().toISOString(),
                    source: '/test',
                    status: 'active',
                  });
                  break;
                case 'addContactSubmission':
                  await service.addContactSubmission({
                    id: 'test-id',
                    name: 'Test',
                    email: 'test@example.com',
                    subject: 'Test',
                    message: 'Test',
                    submittedAt: new Date().toISOString(),
                    status: 'new',
                  });
                  break;
              }
            } catch (error) {
              threwError = true;
              threwGoogleSheetsError = error instanceof GoogleSheetsError;
            }

            // Check if error was logged
            errorLogged = mockConsoleError.mock.calls.some(call => 
              call[0].includes('[GoogleSheets ERROR]')
            );

            // Property assertions:
            // 1. An error must be thrown
            expect(threwError).toBe(true);
            
            // 2. The error must be a GoogleSheetsError (user-friendly)
            expect(threwGoogleSheetsError).toBe(true);
            
            // 3. The error must be logged
            expect(errorLogged).toBe(true);
          }
        ),
        { numRuns: 100 } // Run 100 iterations with different error scenarios
      );
    });

    it('should include operation context in error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate different sheet names and ranges
          fc.record({
            sheetName: fc.oneof(
              fc.constant('Blog'),
              fc.constant('Newsletter'),
              fc.constant('Contact'),
              fc.constant('TestSheet')
            ),
            range: fc.oneof(
              fc.constant('A1:B10'),
              fc.constant('A2:Z1000'),
              fc.constant('A:A')
            )
          }),
          async ({ sheetName, range }) => {
            // Arrange - Mock API to fail
            mockSheets.spreadsheets.values.get.mockRejectedValue(
              new Error('Generic API error')
            );

            // Act & Assert
            try {
              await service.readSheet(sheetName, range);
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              // Error message should include the sheet name for context
              expect(error).toBeInstanceOf(GoogleSheetsError);
              expect((error as GoogleSheetsError).message).toContain(sheetName);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
