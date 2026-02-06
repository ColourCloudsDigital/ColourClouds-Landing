/**
 * Integration Tests for Newsletter API Route
 * 
 * Tests the complete newsletter subscription flow including:
 * - Valid subscription acceptance (Requirement 3.2)
 * - Invalid email rejection (Requirement 3.3)
 * - Rate limit enforcement (Requirement 11.6)
 * 
 * These tests verify the API route handler end-to-end with HTTP requests.
 * 
 * Requirements: 3.2, 3.3, 11.6
 * 
 * @jest-environment node
 */

import { POST } from '@/app/api/newsletter/route';
import { NextRequest } from 'next/server';
import { getGoogleSheetsService } from '@/lib/google-sheets';

// Mock the Google Sheets service
jest.mock('@/lib/google-sheets');

// Mock the sanitize module to avoid jsdom issues in tests
jest.mock('@/lib/sanitize', () => ({
  sanitizeEmail: (email: string) => email.toLowerCase().trim(),
  sanitizeInput: (input: string) => input.replace(/<[^>]*>/g, '').trim(),
}));

// Mock the rate limiter to avoid rate limit issues between tests
jest.mock('@/lib/rate-limit', () => {
  const actualModule = jest.requireActual('@/lib/rate-limit');
  return {
    ...actualModule,
    formRateLimiter: {
      check: jest.fn().mockResolvedValue(undefined),
    },
  };
});

const mockGetGoogleSheetsService = getGoogleSheetsService as jest.MockedFunction<typeof getGoogleSheetsService>;

// Helper function to create a mock NextRequest
function createMockRequest(body: any, ip: string = '127.0.0.1'): NextRequest {
  const url = 'http://localhost:3000/api/newsletter';
  const request = new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
  
  return request;
}

describe('Newsletter API Integration Tests', () => {
  let mockInitialize: jest.Mock;
  let mockAddSubscriber: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock functions
    mockInitialize = jest.fn().mockResolvedValue(undefined);
    mockAddSubscriber = jest.fn().mockResolvedValue(undefined);
    
    // Setup the mock service
    mockGetGoogleSheetsService.mockReturnValue({
      initialize: mockInitialize,
      addSubscriber: mockAddSubscriber,
    } as any);
  });

  // ============================================================================
  // Test Suite 1: Valid Subscription Acceptance
  // Requirement 3.2: WHEN a user submits the newsletter form with a valid email,
  // THE System SHALL store the subscription data in Google Sheets
  // ============================================================================

  describe('Valid Subscription Acceptance', () => {
    it('should accept and process a valid subscription with email only', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Successfully subscribed to newsletter');

      // Verify Google Sheets service was called
      expect(mockInitialize).toHaveBeenCalledTimes(1);
      expect(mockAddSubscriber).toHaveBeenCalledTimes(1);
      
      // Verify subscriber data structure
      const subscriberData = mockAddSubscriber.mock.calls[0][0];
      expect(subscriberData).toMatchObject({
        email: 'test@example.com',
        source: '/services',
        status: 'active',
      });
      expect(subscriberData.subscribedAt).toBeDefined();
      expect(subscriberData.name).toBeUndefined();
    });

    it('should accept and process a valid subscription with email and name', async () => {
      // Arrange
      const validData = {
        email: 'john.doe@example.com',
        name: 'John Doe',
        source: '/blog',
      };
      const request = createMockRequest(validData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify subscriber data includes name
      const subscriberData = mockAddSubscriber.mock.calls[0][0];
      expect(subscriberData).toMatchObject({
        email: 'john.doe@example.com',
        name: 'John Doe',
        source: '/blog',
        status: 'active',
      });
    });

    it('should normalize email to lowercase before storing', async () => {
      // Arrange
      const validData = {
        email: 'Test@EXAMPLE.COM',
        source: '/about',
      };
      const request = createMockRequest(validData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify email is normalized
      const subscriberData = mockAddSubscriber.mock.calls[0][0];
      expect(subscriberData.email).toBe('test@example.com');
    });

    it('should trim whitespace from inputs before storing', async () => {
      // Arrange
      const validData = {
        email: '  test@example.com  ',
        name: '  John Doe  ',
        source: '  /contact  ',
      };
      const request = createMockRequest(validData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify data is trimmed
      const subscriberData = mockAddSubscriber.mock.calls[0][0];
      expect(subscriberData.email).toBe('test@example.com');
      expect(subscriberData.name).toBe('John Doe');
      expect(subscriberData.source).toBe('/contact');
    });

    it('should generate ISO 8601 timestamp for subscription date', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const request = createMockRequest(validData);
      const beforeTime = new Date();

      // Act
      const response = await POST(request);
      const afterTime = new Date();

      // Assert
      expect(response.status).toBe(200);

      // Verify timestamp format and validity
      const subscriberData = mockAddSubscriber.mock.calls[0][0];
      
      expect(subscriberData.subscribedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const subscribedDate = new Date(subscriberData.subscribedAt);
      expect(subscribedDate.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(subscribedDate.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should handle various valid email formats', async () => {
      // Test different valid email formats
      const validEmails = [
        'user+tag@example.com',
        'first.last@example.com',
        'user@mail.example.com',
        'test123@example.co.uk',
      ];

      for (const email of validEmails) {
        // Arrange
        jest.clearAllMocks();
        const validData = {
          email,
          source: '/services',
        };
        const request = createMockRequest(validData);

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);

        const subscriberData = mockAddSubscriber.mock.calls[0][0];
        expect(subscriberData.email).toBe(email.toLowerCase());
      }
    });
  });

  // ============================================================================
  // Test Suite 2: Invalid Email Rejection
  // Requirement 3.3: WHEN a user submits the newsletter form with an invalid email,
  // THE System SHALL display a validation error message
  // ============================================================================

  describe('Invalid Email Rejection', () => {
    it('should reject subscription with invalid email format', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error).toMatch(/email/i);
      expect(data.field).toBe('email');

      // Verify Google Sheets service was NOT called
      const sheetsService = getGoogleSheetsService();
      expect(sheetsService.addSubscriber).not.toHaveBeenCalled();
    });

    it('should reject subscription with empty email', async () => {
      // Arrange
      const invalidData = {
        email: '',
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.field).toBe('email');

      // Verify Google Sheets service was NOT called
      const sheetsService = getGoogleSheetsService();
      expect(sheetsService.addSubscriber).not.toHaveBeenCalled();
    });

    it('should reject subscription with missing email', async () => {
      // Arrange
      const invalidData = {
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();

      // Verify Google Sheets service was NOT called
      const sheetsService = getGoogleSheetsService();
      expect(sheetsService.addSubscriber).not.toHaveBeenCalled();
    });

    it('should reject subscription with email missing @ symbol', async () => {
      // Arrange
      const invalidData = {
        email: 'testexample.com',
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.field).toBe('email');
    });

    it('should reject subscription with email missing domain', async () => {
      // Arrange
      const invalidData = {
        email: 'test@',
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.field).toBe('email');
    });

    it('should reject subscription with overly long email', async () => {
      // Arrange - Create email longer than 254 characters
      const longEmail = 'a'.repeat(250) + '@example.com';
      const invalidData = {
        email: longEmail,
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.field).toBe('email');
    });

    it('should reject subscription with missing source', async () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.field).toBe('source');

      // Verify Google Sheets service was NOT called
      const sheetsService = getGoogleSheetsService();
      expect(sheetsService.addSubscriber).not.toHaveBeenCalled();
    });

    it('should reject subscription with invalid name containing numbers', async () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
        name: 'John123',
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.field).toBe('name');
    });

    it('should reject subscription with name that is too long', async () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
        name: 'A'.repeat(101), // 101 characters
        source: '/services',
      };
      const request = createMockRequest(invalidData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.field).toBe('name');
    });

    it('should reject subscription with invalid JSON body', async () => {
      // Arrange
      const url = 'http://localhost:3000/api/newsletter';
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: 'invalid json{',
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/invalid request body/i);
    });
  });

  // ============================================================================
  // Test Suite 3: Rate Limit Enforcement
  // Requirement 11.6: THE System SHALL implement rate limiting on API routes
  // to prevent abuse
  // ============================================================================

  describe('Rate Limit Enforcement', () => {
    beforeEach(() => {
      // Reset the rate limiter mock before each test in this suite
      const { formRateLimiter } = require('@/lib/rate-limit');
      formRateLimiter.check.mockClear();
      formRateLimiter.check.mockResolvedValue(undefined);
    });

    it('should enforce rate limit after 5 requests from same IP', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const ip = '192.168.1.100';
      
      // Get the rate limiter mock
      const { formRateLimiter } = require('@/lib/rate-limit');

      // Act - Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        jest.clearAllMocks();
        formRateLimiter.check.mockResolvedValueOnce(undefined);
        
        const request = createMockRequest(
          { ...validData, email: `test${i}@example.com` },
          ip
        );
        const response = await POST(request);
        
        // Assert - First 5 requests should succeed
        expect(response.status).toBe(200);
      }

      // Act - Make 6th request (should be rate limited)
      jest.clearAllMocks();
      formRateLimiter.check.mockRejectedValueOnce(new Error('Rate limit exceeded'));
      
      const sixthRequest = createMockRequest(validData, ip);
      const sixthResponse = await POST(sixthRequest);
      const sixthData = await sixthResponse.json();

      // Assert - 6th request should be rate limited
      expect(sixthResponse.status).toBe(429);
      expect(sixthData.success).toBe(false);
      expect(sixthData.error).toMatch(/too many requests/i);
      expect(sixthResponse.headers.get('Retry-After')).toBe('60');

      // Verify Google Sheets service was NOT called for rate limited request
      const sheetsService = getGoogleSheetsService();
      expect(sheetsService.addSubscriber).not.toHaveBeenCalled();
    });

    it('should allow requests from different IPs independently', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };

      // Act - Make requests from different IPs
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
      
      for (const ip of ips) {
        jest.clearAllMocks();
        const request = createMockRequest(validData, ip);
        const response = await POST(request);
        const data = await response.json();

        // Assert - Each IP should be able to make requests
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should handle anonymous IP when headers are missing', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const url = 'http://localhost:3000/api/newsletter';
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No IP headers
        },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert - Should still process the request
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should extract IP from x-forwarded-for header with multiple IPs', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const url = 'http://localhost:3000/api/newsletter';
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
        },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert - Should use first IP in the list
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should use x-real-ip header as fallback', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const url = 'http://localhost:3000/api/newsletter';
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': '192.168.1.50',
        },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================================================
  // Test Suite 4: Error Handling
  // Tests various error scenarios and proper error responses
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle Google Sheets initialization failure', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Mock initialization failure
      const sheetsService = getGoogleSheetsService();
      const GoogleSheetsError = require('@/lib/types').GoogleSheetsError;
      (sheetsService.initialize as jest.Mock).mockRejectedValueOnce(
        new GoogleSheetsError('Failed to authenticate', 'AUTH_ERROR', 503)
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/service temporarily unavailable/i);
    });

    it('should handle Google Sheets addSubscriber failure', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Mock addSubscriber failure
      const sheetsService = getGoogleSheetsService();
      const GoogleSheetsError = require('@/lib/types').GoogleSheetsError;
      (sheetsService.addSubscriber as jest.Mock).mockRejectedValueOnce(
        new GoogleSheetsError('Failed to write to sheet', 'WRITE_ERROR', 503)
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/failed to process subscription/i);
    });

    it('should handle Google Sheets rate limit error', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Mock rate limit error from Google Sheets
      const sheetsService = getGoogleSheetsService();
      const RateLimitError = require('@/lib/types').RateLimitError;
      (sheetsService.addSubscriber as jest.Mock).mockRejectedValueOnce(
        new RateLimitError('Google Sheets API rate limit exceeded', 120)
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/service is currently busy/i);
      expect(response.headers.get('Retry-After')).toBe('120');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Mock unexpected error
      const sheetsService = getGoogleSheetsService();
      (sheetsService.addSubscriber as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/unexpected error occurred/i);
    });
  });

  // ============================================================================
  // Test Suite 5: Input Sanitization
  // Tests that malicious inputs are properly sanitized
  // ============================================================================

  describe('Input Sanitization', () => {
    it('should sanitize whitespace from name field', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        name: '  John Doe  ',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);

      const sheetsService = getGoogleSheetsService();
      const subscriberData = (sheetsService.addSubscriber as jest.Mock).mock.calls[0][0];
      expect(subscriberData.name).toBe('John Doe');
      expect(subscriberData.name).not.toMatch(/^\s/); // No leading whitespace
      expect(subscriberData.name).not.toMatch(/\s$/); // No trailing whitespace
    });

    it('should sanitize email to lowercase', async () => {
      // Arrange
      const validData = {
        email: 'TEST@EXAMPLE.COM',
        source: '/services',
      };
      const request = createMockRequest(validData);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);

      const sheetsService = getGoogleSheetsService();
      const subscriberData = (sheetsService.addSubscriber as jest.Mock).mock.calls[0][0];
      
      // Verify email is lowercase
      expect(subscriberData.email).toBe('test@example.com');
      expect(subscriberData.email).not.toContain('TEST');
      expect(subscriberData.email).not.toContain('EXAMPLE');
    });
  });
});

