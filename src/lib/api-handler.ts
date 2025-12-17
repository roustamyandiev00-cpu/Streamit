import { NextResponse } from 'next/server';
import { ValidationError, RateLimitError } from './errors';
import { logger } from './logger';

/**
 * API Handler type
 */
type ApiHandler<T = unknown> = (req: Request) => Promise<NextResponse<T>>;

/**
 * Wrap an API handler with error handling
 * Automatically handles ValidationError and RateLimitError
 */
export function withErrorHandler<T>(handler: ApiHandler<T>): ApiHandler {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      // Handle validation errors
      if (error instanceof ValidationError) {
        return NextResponse.json(error.toJSON(), { status: 400 });
      }

      // Handle rate limit errors
      if (error instanceof RateLimitError) {
        return NextResponse.json(error.toJSON(), {
          status: 429,
          headers: error.getHeaders(),
        });
      }

      // Log unexpected errors
      logger.error('Unhandled API error', error as Error);

      // Return generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Parse and validate request body with a Zod schema
 */
export async function parseBody<T>(
  req: Request,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { issues: Array<{ path: (string | number)[]; message: string }> } } }
): Promise<T> {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error!.issues.map((issue) => ({
      path: issue.path.map(String),
      message: issue.message,
    }));
    throw new ValidationError(errors);
  }

  return result.data as T;
}
