/**
 * Unit Tests for Rate Limiting Utility
 * 
 * Tests rate limit enforcement and rate limit reset after window.
 * 
 * Requirements: 11.6
 */

import { rateLimit } from '../rate-limit';

describe('Rate Limiting', () => {
  describe('Rate Limit Enforcement (Edge Case)', () => {
    it('should allow requests up to the limit', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000, // 1 minute
        uniqueTokenPerInterval: 500,
      });
      const token = 'test-token-1';
      const limit = 5;

      // Act & Assert - First 5 requests should succeed
      for (let i = 0; i < limit; i++) {
        await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      }
    });

    it('should reject requests that exceed the limit', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000, // 1 minute
        uniqueTokenPerInterval: 500,
      });
      const token = 'test-token-2';
      const limit = 5;

      // Act - Make requests up to the limit
      for (let i = 0; i < limit; i++) {
        await limiter.check(limit, token);
      }

      // Assert - The next request should be rejected
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should enforce rate limit at exactly the boundary', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000, // 1 minute
        uniqueTokenPerInterval: 500,
      });
      const token = 'test-token-boundary';
      const limit = 3;

      // Act & Assert
      // Request 1 - should succeed
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      
      // Request 2 - should succeed
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      
      // Request 3 - should succeed (at the limit)
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      
      // Request 4 - should fail (exceeds limit)
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should track different tokens independently', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000, // 1 minute
        uniqueTokenPerInterval: 500,
      });
      const token1 = 'user-1';
      const token2 = 'user-2';
      const limit = 2;

      // Act & Assert
      // User 1 makes 2 requests (at limit)
      await expect(limiter.check(limit, token1)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token1)).resolves.toBeUndefined();
      
      // User 1's next request should fail
      await expect(limiter.check(limit, token1)).rejects.toBeUndefined();
      
      // User 2 should still be able to make requests
      await expect(limiter.check(limit, token2)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token2)).resolves.toBeUndefined();
      
      // User 2's next request should also fail
      await expect(limiter.check(limit, token2)).rejects.toBeUndefined();
    });

    it('should handle limit of 1 correctly', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000, // 1 minute
        uniqueTokenPerInterval: 500,
      });
      const token = 'single-request-token';
      const limit = 1;

      // Act & Assert
      // First request should succeed
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      
      // Second request should fail immediately
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should handle high limit values correctly', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000, // 1 minute
        uniqueTokenPerInterval: 500,
      });
      const token = 'high-limit-token';
      const limit = 100;

      // Act & Assert - Make 100 requests (all should succeed)
      for (let i = 0; i < limit; i++) {
        await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      }
      
      // The 101st request should fail
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });
  });

  describe('Rate Limit Reset After Window', () => {
    it('should reset rate limit after the time window expires', async () => {
      // Arrange
      const interval = 100; // 100ms window for faster testing
      const limiter = rateLimit({
        interval,
        uniqueTokenPerInterval: 500,
      });
      const token = 'reset-test-token';
      const limit = 2;

      // Act & Assert - Phase 1: Use up the limit
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();

      // Wait for the window to expire
      await new Promise(resolve => setTimeout(resolve, interval + 50)); // Add buffer

      // Phase 2: After reset, requests should succeed again
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      
      // And the limit should be enforced again
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should reset independently for different tokens', async () => {
      // Arrange
      const interval = 100; // 100ms window
      const limiter = rateLimit({
        interval,
        uniqueTokenPerInterval: 500,
      });
      const token1 = 'reset-user-1';
      const token2 = 'reset-user-2';
      const limit = 1;

      // Act & Assert
      // User 1 uses their limit
      await expect(limiter.check(limit, token1)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token1)).rejects.toBeUndefined();

      // Wait 50ms (half the window)
      await new Promise(resolve => setTimeout(resolve, 50));

      // User 2 uses their limit (different window start time)
      await expect(limiter.check(limit, token2)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token2)).rejects.toBeUndefined();

      // Wait another 60ms (total 110ms from user 1's first request)
      await new Promise(resolve => setTimeout(resolve, 60));

      // User 1's window should have expired
      await expect(limiter.check(limit, token1)).resolves.toBeUndefined();

      // User 2's window should NOT have expired yet
      await expect(limiter.check(limit, token2)).rejects.toBeUndefined();

      // Wait another 50ms (total 60ms from user 2's first request)
      await new Promise(resolve => setTimeout(resolve, 50));

      // Now user 2's window should have expired
      await expect(limiter.check(limit, token2)).resolves.toBeUndefined();
    });

    it('should handle multiple reset cycles correctly', async () => {
      // Arrange
      const interval = 100; // 100ms window
      const limiter = rateLimit({
        interval,
        uniqueTokenPerInterval: 500,
      });
      const token = 'multi-cycle-token';
      const limit = 2;

      // Act & Assert - Cycle 1
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, interval + 50));

      // Cycle 2
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, interval + 50));

      // Cycle 3
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should not reset before the window expires', async () => {
      // Arrange
      const interval = 200; // 200ms window
      const limiter = rateLimit({
        interval,
        uniqueTokenPerInterval: 500,
      });
      const token = 'no-early-reset-token';
      const limit = 1;

      // Act & Assert
      // Use up the limit
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();

      // Wait for less than the window duration
      await new Promise(resolve => setTimeout(resolve, 100)); // Half the window

      // Should still be rate limited
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();

      // Wait for the remaining time plus buffer
      await new Promise(resolve => setTimeout(resolve, 150));

      // Now it should be reset
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
    });

    it('should handle rapid successive resets correctly', async () => {
      // Arrange
      const interval = 50; // Very short window for rapid testing
      const limiter = rateLimit({
        interval,
        uniqueTokenPerInterval: 500,
      });
      const token = 'rapid-reset-token';
      const limit = 1;

      // Act & Assert - Perform 5 rapid cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        // Use the limit
        await expect(limiter.check(limit, token)).resolves.toBeUndefined();
        await expect(limiter.check(limit, token)).rejects.toBeUndefined();
        
        // Wait for reset
        await new Promise(resolve => setTimeout(resolve, interval + 20));
      }

      // Final verification that the limiter still works correctly
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });
  });

  describe('Pre-configured Rate Limiters', () => {
    it('should export formRateLimiter with correct configuration', async () => {
      // This test verifies that the pre-configured limiter exists and works
      const { formRateLimiter } = await import('../rate-limit');
      const token = 'form-test-token';

      // Should allow at least one request
      await expect(formRateLimiter.check(5, token)).resolves.toBeUndefined();
    });

    it('should export apiRateLimiter with correct configuration', async () => {
      // This test verifies that the pre-configured limiter exists and works
      const { apiRateLimiter } = await import('../rate-limit');
      const token = 'api-test-token';

      // Should allow at least one request
      await expect(apiRateLimiter.check(10, token)).resolves.toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty token string', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000,
        uniqueTokenPerInterval: 500,
      });
      const token = '';
      const limit = 2;

      // Act & Assert - Should still work with empty string token
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should handle very long token strings', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000,
        uniqueTokenPerInterval: 500,
      });
      const token = 'a'.repeat(1000); // Very long token
      const limit = 2;

      // Act & Assert - Should work with long tokens
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should handle special characters in tokens', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000,
        uniqueTokenPerInterval: 500,
      });
      const token = '192.168.1.1:8080/path?query=value&foo=bar';
      const limit = 2;

      // Act & Assert - Should work with special characters
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).resolves.toBeUndefined();
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });

    it('should handle zero limit gracefully', async () => {
      // Arrange
      const limiter = rateLimit({
        interval: 60000,
        uniqueTokenPerInterval: 500,
      });
      const token = 'zero-limit-token';
      const limit = 0;

      // Act & Assert - With limit 0, first request should fail
      await expect(limiter.check(limit, token)).rejects.toBeUndefined();
    });
  });
});
