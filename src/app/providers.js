'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { identifyUser } from '../lib/analytics';
import { useSession } from 'next-auth/react';

function AnalyticsProvider({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Initialize analytics when user is logged in
    if (session?.user) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session]);

  return <>{children}</>;
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </SessionProvider>
  );
}