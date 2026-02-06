/**
 * Rate Limiting Utility
 * 
 * Implements rate limiting using LRU cache to prevent API abuse.
 * Configured for different rate limits based on endpoint type:
 * - Form submissions: 5 requests per minute
 * - API endpoints: 10 requests per minute
 * 
 * Requirements: 11.6
 */

import { LRUCache } from 'lru-cache';

/**
 * Configuration options for rate limiter
 */
type RateLimitOptions = {
  /** Time window in milliseconds for rate limiting */
  interval: number;
  
  /** Maximum number of unique tokens to track */
  uniqueTokenPerInterval: number;
};

/**
 * Creates a rate limiter instance with the specified options
 * 
 * @param options - Configuration for the rate limiter
 * @returns Object with check method for validating rate limits
 * 
 * @example
 * ```typescript
 * const limiter = rateLimit({
 *   interval: 60 * 1000, // 1 minute
 *   uniqueTokenPerInterval: 500,
 * });
 * 
 * // In API route
 * const ip = request.headers.get('x-forwarded-for') || 'anonymous';
 * try {
 *   await limiter.check(5, ip); // 5 requests per minute
 * } catch {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded' },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    /**
     * Checks if the token has exceeded the rate limit
     * 
     * @param limit - Maximum number of requests allowed in the interval
     * @param token - Unique identifier for the requester (e.g., IP address)
     * @returns Promise that resolves if within limit, rejects if exceeded
     */
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

/**
 * Pre-configured rate limiter for form submissions
 * 5 requests per minute per IP address
 * 
 * Requirements: 11.6
 */
export const formRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * Pre-configured rate limiter for API endpoints
 * 10 requests per minute per IP address
 * 
 * Requirements: 11.6
 */
export const apiRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
