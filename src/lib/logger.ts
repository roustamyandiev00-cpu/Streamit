/**
 * Centralized logging utility
 * Uses Sentry in production, console in development
 */

// eslint-disable-next-line
let Sentry: any = null;

// Lazy load Sentry to avoid errors if not configured
if (typeof window !== 'undefined') {
  try {
    Sentry = require('@sentry/nextjs');
  } catch {
    // Sentry not installed yet
  }
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log context type
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * Logger interface
 */
export interface Logger {
  error(message: string, error?: Error | LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

/**
 * Logger implementation
 */
export const logger: Logger = {
  /**
   * Log error messages
   */
  error: (message: string, error?: Error | LogContext): void => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    }

    if (Sentry && !isDevelopment) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { type: 'application_error' },
          extra: { message },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: error,
        });
      }
    }
  },

  /**
   * Log warning messages
   */
  warn: (message: string, data: LogContext = {}): void => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    }

    if (Sentry && !isDevelopment) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: data,
      });
    }
  },

  /**
   * Log info messages (development only)
   */
  info: (message: string, data: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data);
    }

    if (Sentry && !isDevelopment) {
      Sentry.captureMessage(message, {
        level: 'info',
        extra: data,
      });
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, data: LogContext = {}): void => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};
