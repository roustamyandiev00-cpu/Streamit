import { z } from 'zod';

/**
 * Supported streaming platforms
 */
export const platformTypes = ['youtube', 'twitch', 'facebook', 'linkedin'] as const;
export type PlatformType = (typeof platformTypes)[number];

/**
 * StreamKey format validation
 * Must be 10-200 characters, alphanumeric with allowed special characters (-, _)
 */
const streamKeySchema = z
  .string()
  .min(10, 'Stream key must be at least 10 characters')
  .max(200, 'Stream key must be 200 characters or less')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Stream key must contain only alphanumeric characters, hyphens, and underscores'
  );

/**
 * Schema for connecting a platform
 */
export const connectPlatformSchema = z.object({
  platform: z.enum(platformTypes),
  streamKey: streamKeySchema,
});

/**
 * Schema for updating platform connection
 */
export const updatePlatformSchema = z.object({
  streamKey: streamKeySchema.optional(),
  isConnected: z.boolean().optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type ConnectPlatformInput = z.infer<typeof connectPlatformSchema>;
export type UpdatePlatformInput = z.infer<typeof updatePlatformSchema>;

/**
 * Helper to validate stream key format
 */
export function isValidStreamKey(key: string): boolean {
  return streamKeySchema.safeParse(key).success;
}
