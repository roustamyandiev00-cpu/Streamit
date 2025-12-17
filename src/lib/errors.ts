import { ZodError } from 'zod';

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  path: string[];
  message: string;
}

/**
 * Serialized validation error format
 */
export interface SerializedValidationError {
  error: string;
  details: ValidationErrorDetail[];
}

/**
 * Custom error class for validation failures
 * Supports JSON serialization and round-trip parsing
 */
export class ValidationError extends Error {
  public readonly errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[], message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Serialize error to JSON format
   */
  toJSON(): SerializedValidationError {
    return {
      error: this.message,
      details: this.errors,
    };
  }

  /**
   * Create ValidationError from Zod error
   */
  static fromZodError(zodError: ZodError): ValidationError {
    const zodErrors = zodError.issues || [];
    const errors = zodErrors.map((e) => ({
      path: e.path.map(String),
      message: e.message,
    }));
    return new ValidationError(errors);
  }

  /**
   * Parse ValidationError from JSON (round-trip support)
   */
  static fromJSON(json: SerializedValidationError): ValidationError {
    return new ValidationError(json.details, json.error);
  }

  /**
   * Check if two ValidationErrors are equivalent
   */
  equals(other: ValidationError): boolean {
    if (this.message !== other.message) return false;
    if (this.errors.length !== other.errors.length) return false;

    return this.errors.every((err, i) => {
      const otherErr = other.errors[i];
      return (
        err.message === otherErr.message &&
        err.path.length === otherErr.path.length &&
        err.path.every((p, j) => p === otherErr.path[j])
      );
    });
  }
}


/**
 * Serialized rate limit error format
 */
export interface SerializedRateLimitError {
  error: string;
  retryAfter: number;
}

/**
 * Custom error class for rate limit violations
 * Includes Retry-After header support
 */
export class RateLimitError extends Error {
  public readonly retryAfter: number;
  public readonly identifier: string;

  constructor(retryAfter: number, identifier: string) {
    super('Too many requests');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.identifier = identifier;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }

  /**
   * Serialize error to JSON format
   */
  toJSON(): SerializedRateLimitError {
    return {
      error: this.message,
      retryAfter: this.retryAfter,
    };
  }

  /**
   * Get headers for HTTP response
   */
  getHeaders(): Record<string, string> {
    return {
      'Retry-After': String(this.retryAfter),
    };
  }
}
