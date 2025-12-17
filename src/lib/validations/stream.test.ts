import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createStreamSchema, updateStreamSchema } from './stream';

describe('createStreamSchema', () => {
  // Unit tests
  describe('unit tests', () => {
    it('accepts valid stream input', () => {
      const input = { title: 'My Stream', type: 'RTMP' as const };
      expect(createStreamSchema.safeParse(input).success).toBe(true);
    });

    it('rejects empty title', () => {
      const input = { title: '', type: 'RTMP' as const };
      const result = createStreamSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects title over 100 characters', () => {
      const input = { title: 'a'.repeat(101), type: 'RTMP' as const };
      const result = createStreamSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('accepts title with exactly 100 characters', () => {
      const input = { title: 'a'.repeat(100), type: 'STUDIO' as const };
      expect(createStreamSchema.safeParse(input).success).toBe(true);
    });

    it('accepts title with exactly 1 character', () => {
      const input = { title: 'a', type: 'RTMP' as const };
      expect(createStreamSchema.safeParse(input).success).toBe(true);
    });

    it('rejects invalid type', () => {
      const input = { title: 'My Stream', type: 'INVALID' };
      const result = createStreamSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  // Property-based tests
  describe('property tests', () => {
    /**
     * **Feature: platform-improvements, Property 1: Title Length Validation**
     * **Validates: Requirements 2.2**
     * 
     * For any string input as stream title, the validation schema SHALL accept
     * the input if and only if the string length is between 1 and 100 characters.
     */
    it('accepts valid titles (1-100 chars) and rejects invalid ones', () => {
      fc.assert(
        fc.property(fc.string(), (title) => {
          const input = { title, type: 'RTMP' as const };
          const result = createStreamSchema.safeParse(input);
          const isValidLength = title.length >= 1 && title.length <= 100;
          return result.success === isValidLength;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: platform-improvements, Property 7: Validation Schema Consistency**
     * **Validates: Requirements 5.3**
     * 
     * For any input value, the validation schema SHALL produce a deterministic result.
     */
    it('produces consistent results for the same input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 150 }),
          fc.constantFrom('RTMP', 'STUDIO', 'INVALID'),
          (title, type) => {
            const input = { title, type };
            const result1 = createStreamSchema.safeParse(input);
            const result2 = createStreamSchema.safeParse(input);
            const result3 = createStreamSchema.safeParse(input);
            return result1.success === result2.success && result2.success === result3.success;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('updateStreamSchema', () => {
  it('accepts partial updates', () => {
    const input = { title: 'Updated Title' };
    expect(updateStreamSchema.safeParse(input).success).toBe(true);
  });

  it('accepts empty object', () => {
    const input = {};
    expect(updateStreamSchema.safeParse(input).success).toBe(true);
  });
});
