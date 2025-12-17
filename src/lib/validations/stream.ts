import { z } from 'zod';

/**
 * Schema for creating a new stream
 * Title must be between 1 and 100 characters
 */
export const createStreamSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  type: z.enum(['RTMP', 'STUDIO']),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

/**
 * Schema for updating an existing stream
 * All fields are optional
 */
export const updateStreamSchema = createStreamSchema.partial();

/**
 * TypeScript types inferred from schemas
 */
export type CreateStreamInput = z.infer<typeof createStreamSchema>;
export type UpdateStreamInput = z.infer<typeof updateStreamSchema>;
