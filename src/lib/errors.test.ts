import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import { ValidationError, ValidationErrorDetail } from './errors';

describe('ValidationError', () => {
  // Unit tests
  describe('unit tests', () => {
    it('creates error with details', () => {
      const errors: ValidationErrorDetail[] = [
        { path: ['title'], message: 'Title is required' },
      ];
      const error = new ValidationError(errors);
      
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });

    it('creates error with custom message', () => {
      const error = new ValidationError([], 'Custom error message');
      expect(error.message).toBe('Custom error message');
    });

    it('serializes to JSON correctly', () => {
      const errors: ValidationErrorDetail[] = [
        { path: ['field1'], message: 'Error 1' },
        { path: ['nested', 'field2'], message: 'Error 2' },
      ];
      const error = new ValidationError(errors, 'Test error');
      
      expect(error.toJSON()).toEqual({
        error: 'Test error',
        details: errors,
      });
    });

    it('creates from Zod error', () => {
      const schema = z.object({
        title: z.string().min(1),
        count: z.number().positive(),
      });
      
      const result = schema.safeParse({ title: '', count: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = ValidationError.fromZodError(result.error);
        expect(error.errors.length).toBeGreaterThan(0);
        expect(error.errors.some(e => e.path.includes('title'))).toBe(true);
      }
    });

    it('parses from JSON correctly', () => {
      const json = {
        error: 'Test error',
        details: [{ path: ['field'], message: 'Error message' }],
      };
      
      const error = ValidationError.fromJSON(json);
      expect(error.message).toBe('Test error');
      expect(error.errors).toEqual(json.details);
    });

    it('compares equality correctly', () => {
      const errors: ValidationErrorDetail[] = [
        { path: ['field'], message: 'Error' },
      ];
      const error1 = new ValidationError(errors, 'Test');
      const error2 = new ValidationError(errors, 'Test');
      const error3 = new ValidationError(errors, 'Different');
      
      expect(error1.equals(error2)).toBe(true);
      expect(error1.equals(error3)).toBe(false);
    });
  });

  // Property-based tests
  describe('property tests', () => {
    // Arbitrary for generating validation error details
    const errorDetailArb = fc.record({
      path: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
      message: fc.string({ minLength: 1, maxLength: 100 }),
    });

    /**
     * **Feature: platform-improvements, Property 3: Validation Error Round-Trip**
     * **Validates: Requirements 2.5, 2.6**
     * 
     * For any validation error object, serializing to JSON and parsing back
     * SHALL produce an equivalent error object.
     */
    it('round-trips through JSON serialization', () => {
      fc.assert(
        fc.property(
          fc.array(errorDetailArb, { minLength: 1, maxLength: 5 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (errors, message) => {
            const original = new ValidationError(errors, message);
            const json = original.toJSON();
            const parsed = ValidationError.fromJSON(json);
            
            return original.equals(parsed);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: platform-improvements, Property 3: Validation Error Round-Trip**
     * **Validates: Requirements 2.5, 2.6**
     * 
     * JSON serialization should be stable (serialize twice = same result).
     */
    it('produces stable JSON serialization', () => {
      fc.assert(
        fc.property(
          fc.array(errorDetailArb, { minLength: 0, maxLength: 5 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (errors, message) => {
            const error = new ValidationError(errors, message);
            const json1 = JSON.stringify(error.toJSON());
            const json2 = JSON.stringify(error.toJSON());
            
            return json1 === json2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
