import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { connectPlatformSchema, isValidStreamKey, platformTypes } from './platform';

describe('connectPlatformSchema', () => {
  // Unit tests
  describe('unit tests', () => {
    it('accepts valid platform connection', () => {
      const input = { platform: 'youtube', streamKey: 'abcd1234567890' };
      expect(connectPlatformSchema.safeParse(input).success).toBe(true);
    });

    it('rejects invalid platform type', () => {
      const input = { platform: 'invalid', streamKey: 'abcd1234567890' };
      const result = connectPlatformSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects stream key shorter than 10 characters', () => {
      const input = { platform: 'twitch', streamKey: 'short' };
      const result = connectPlatformSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects stream key longer than 200 characters', () => {
      const input = { platform: 'facebook', streamKey: 'a'.repeat(201) };
      const result = connectPlatformSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects stream key with invalid characters', () => {
      const input = { platform: 'linkedin', streamKey: 'invalid key with spaces!' };
      const result = connectPlatformSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('accepts stream key with hyphens and underscores', () => {
      const input = { platform: 'youtube', streamKey: 'valid-key_123' };
      expect(connectPlatformSchema.safeParse(input).success).toBe(true);
    });
  });

  // Property-based tests
  describe('property tests', () => {
    /**
     * **Feature: platform-improvements, Property 2: StreamKey Format Validation**
     * **Validates: Requirements 2.4**
     * 
     * For any string input as platform streamKey, the validation schema SHALL accept
     * the input if and only if it matches the expected format (10-200 chars, alphanumeric with - and _).
     */
    it('accepts valid stream keys and rejects invalid ones', () => {
      // Generator for valid stream key characters
      const validCharArb = fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split('')
      );

      fc.assert(
        fc.property(
          fc.array(validCharArb, { minLength: 0, maxLength: 250 }).map((chars) => chars.join('')),
          (streamKey) => {
            const isValidLength = streamKey.length >= 10 && streamKey.length <= 200;
            const result = isValidStreamKey(streamKey);
            return result === isValidLength;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: platform-improvements, Property 2: StreamKey Format Validation**
     * **Validates: Requirements 2.4**
     * 
     * Stream keys with invalid characters should always be rejected.
     */
    it('rejects stream keys with invalid characters', () => {
      const invalidChars = ' !@#$%^&*()+=[]{}|;:\'",.<>?/\\`~';

      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 200 }),
          (streamKey) => {
            const hasInvalidChar = streamKey.split('').some((c) => invalidChars.includes(c));
            if (hasInvalidChar) {
              return !isValidStreamKey(streamKey);
            }
            return true; // Skip if no invalid chars
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * All supported platforms should be accepted
     */
    it('accepts all supported platform types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...platformTypes),
          fc.string({ minLength: 10, maxLength: 50 }).filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
          (platform, streamKey) => {
            const input = { platform, streamKey };
            return connectPlatformSchema.safeParse(input).success;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
