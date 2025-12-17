import { PrismaClient } from '@prisma/client';

/**
 * Global type declaration for Prisma client singleton
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton
 * Prevents multiple instances during development hot reloading
 */
export const prisma: PrismaClient = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
