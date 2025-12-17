/**
 * Rate Limiter Configuration
 */
export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

/**
 * Rate Limit Check Result
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter: number;    // Seconds until reset
}

/**
 * Rate limit entry stored in memory
 */
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/**
 * Default configurations
 */
export const ANONYMOUS_LIMIT: RateLimitConfig = {
  windowMs: 10000,    // 10 seconds
  maxRequests: 10,    // 10 requests per window
};

export const AUTHENTICATED_LIMIT: RateLimitConfig = {
  windowMs: 10000,    // 10 seconds
  maxRequests: 50,    // 50 requests per window (5x more)
};

/**
 * In-memory Rate Limiter using sliding window algorithm
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = ANONYMOUS_LIMIT) {
    this.config = config;
  }

  /**
   * Check if a request is allowed for the given identifier
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // If no entry or window expired, create new window
    if (!entry || now - entry.windowStart >= this.config.windowMs) {
      this.store.set(identifier, {
        count: 1,
        windowStart: now,
      });

      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetAt: new Date(now + this.config.windowMs),
        retryAfter: 0,
      };
    }

    // Window still active
    const windowEnd = entry.windowStart + this.config.windowMs;
    const retryAfter = Math.ceil((windowEnd - now) / 1000);

    if (entry.count >= this.config.maxRequests) {
      // Rate limited
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(windowEnd),
        retryAfter,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      success: true,
      remaining: this.config.maxRequests - entry.count,
      resetAt: new Date(windowEnd),
      retryAfter: 0,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current count for an identifier (for testing)
   */
  getCount(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return 0;
    
    const now = Date.now();
    if (now - entry.windowStart >= this.config.windowMs) {
      return 0; // Window expired
    }
    return entry.count;
  }
}

/**
 * Global rate limiter instances
 */
export const anonymousLimiter = new RateLimiter(ANONYMOUS_LIMIT);
export const authenticatedLimiter = new RateLimiter(AUTHENTICATED_LIMIT);

/**
 * Check rate limit based on authentication status
 */
export function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): RateLimitResult {
  const limiter = isAuthenticated ? authenticatedLimiter : anonymousLimiter;
  return limiter.check(identifier);
}
