import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple demo authentication - accepts any email with password 'demo123'
        if (credentials?.password === 'demo123' && credentials?.email) {
          const email = credentials.email;
          return {
            id: 'demo-user-' + email.split('@')[0],
            email: email,
            name: email.split('@')[0],
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;

        // Check for subscription
        // Note: We import prisma dynamically to avoid circular deps if any, 
        // but usually fine at top level. We'll use the global one we just made.
        // However, since this file is used in NextAuth config, we need to be careful.
        // For performance, we might want to only check on initial signin or periodically.
        // For now, check every time to be safe.
        try {
          // We need to use the imported prisma from lib
          const { prisma } = await import('./prisma');
          const subscription = await prisma.subscription.findUnique({
            where: { userId: user.id },
            select: { status: true, currentPeriodEnd: true }
          });

          const isValid = subscription &&
            subscription.currentPeriodEnd.getTime() > Date.now() &&
            (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING');

          token.isPro = !!isValid;
        } catch (e) {
          console.error("Failed to check subscription in JWT", e);
          token.isPro = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).image = token.image as string | null;

        // Add subscription status
        (session.user as any).isPro = token.isPro as boolean || false;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key-for-development',
};

import { getServerSession } from 'next-auth/next';

/**
 * User type for authenticated sessions
 */
export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

/**
 * Get the current authenticated user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user as User || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current user ID from the session
 * Returns 'demo-user' as fallback for development
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user?.id || 'demo-user';
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized - Authentication required');
  }
  return user;
}
