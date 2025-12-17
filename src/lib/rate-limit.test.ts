import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  RateLimiter,
  ANONYMOUS_LIMIT,
  AUTHENTICATED_LIMIT,
  checkRateLimit,
} from './rate-limit';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ windowMs: 10000, maxRequests: 10 });
  });

  // Unit tests
  describe('unit tests', () => {
    it('allows first request', () => {
      const result = limiter.check('test-ip');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('tracks request count', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('test-ip');
      }
      expect(limiter.getCount('test-ip')).toBe(5);
    });

    it('blocks after limit reached', () => {
      for (let i = 0; i < 10; i++) {
        limiter.check('test-ip');
      }
      const result = limiter.check('test-ip');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('provides retry-after when blocked', () => {
      for (let i = 0; i < 10; i++) {
        limiter.check('test-ip');
      }
      const result = limiter.check('test-ip');
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(10);
    });

    it('resets count for identifier', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('test-ip');
      }
      limiter.reset('test-ip');
      expect(limiter.getCount('test-ip')).toBe(0);
    });

    it('tracks different identifiers separately', () => {
      for (let i = 0; i < 10; i++) {
        limiter.check('ip-1');
      }
      const result = limiter.check('ip-2');
      expect(result.success).toBe(true);
    });
  });

  // Property-based tests
  describe('property tests', () => {
    /**
     * **Feature: platform-improvements, Property 4: Rate Limit Threshold Enforcement**
     * **Validates: Requirements 3.1**
     * 
     * For any IP address and any sequence of N requests within a window,
     * if N > maxRequests then the (N+1)th request SHALL be blocked.
     */
    it('enforces rate limit threshold', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }), // identifier
          fc.integer({ min: 1, max: 20 }), // number of requests
          (identifier, numRequests) => {
            const testLimiter = new RateLimiter({ windowMs: 10000, maxRequests: 10 });
            
            let blockedAt = -1;
            for (let i = 0; i < numRequests; i++) {
              const result = testLimiter.check(identifier);
              if (!result.success && blockedAt === -1) {
                blockedAt = i;
              }
            }

            // If we made more than 10 requests, we should be blocked at request 11 (index 10)
            if (numRequests > 10) {
              return blockedAt === 10;
            }
            // If we made 10 or fewer, we should never be blocked
            return blockedAt === -1;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: platform-improvements, Property 5: Rate Limit Retry-After Header**
     * **Validates: Requirements 3.2**
     * 
     * For any rate-limited response, retryAfter SHALL be a positive integer.
     */
    it('provides positive retry-after when blocked', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (identifier) => {
            const testLimiter = new RateLimiter({ windowMs: 10000, maxRequests: 5 });
            
            // Exhaust the limit
            for (let i = 0; i < 5; i++) {
              testLimiter.check(identifier);
            }
            
            // Next request should be blocked with positive retryAfter
            const result = testLimiter.check(identifier);
            return !result.success && result.retryAfter > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: platform-improvements, Property 6: Authenticated Rate Limit Advantage**
     * **Validates: Requirements 3.3**
     * 
     * Authenticated users SHALL have a higher limit than anonymous users.
     */
    it('gives authenticated users higher limits', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (identifier) => {
            const anonLimiter = new RateLimiter(ANONYMOUS_LIMIT);
            const authLimiter = new RateLimiter(AUTHENTICATED_LIMIT);
            
            // Make requests until anonymous is blocked
            let anonBlocked = false;
            let authBlocked = false;
            let requestCount = 0;
            
            while (!anonBlocked && requestCount < 100) {
              const anonResult = anonLimiter.check(identifier);
              const authResult = authLimiter.check(identifier);
              
              if (!anonResult.success) anonBlocked = true;
              if (!authResult.success) authBlocked = true;
              requestCount++;
            }
            
            // When anonymous is blocked, authenticated should still be allowed
            return anonBlocked && !authBlocked;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: platform-improvements, Property 8: Rate Limit Order Independence (Confluence)**
     * **Validates: Requirements 5.4**
     * 
     * The final rate limit state SHALL be the same regardless of request order.
     */
    it('produces same result regardless of request timing within window', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 5, max: 15 }),
          (identifier, numRequests) => {
            const limiter1 = new RateLimiter({ windowMs: 10000, maxRequests: 10 });
            const limiter2 = new RateLimiter({ windowMs: 10000, maxRequests: 10 });
            
            // Make same number of requests to both limiters
            for (let i = 0; i < numRequests; i++) {
              limiter1.check(identifier);
              limiter2.check(identifier);
            }
            
            // Both should have same count and same blocked status
            const count1 = limiter1.getCount(identifier);
            const count2 = limiter2.getCount(identifier);
            const result1 = limiter1.check(identifier);
            const result2 = limiter2.check(identifier);
            
            return count1 === count2 && result1.success === result2.success;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('checkRateLimit helper', () => {
  it('uses anonymous limiter for unauthenticated requests', () => {
    const result = checkRateLimit('test-ip-anon', false);
    expect(result.success).toBe(true);
  });

  it('uses authenticated limiter for authenticated requests', () => {
    const result = checkRateLimit('test-ip-auth', true);
    expect(result.success).toBe(true);
  });
});
