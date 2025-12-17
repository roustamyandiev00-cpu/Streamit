'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthErrorRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    const target = error ? `/auth/error?error=${encodeURIComponent(error)}` : '/auth/error';
    router.replace(target);
  }, [error, router]);

  return null;
}

export default function AuthErrorRedirect() {
  return (
    <Suspense fallback={null}>
      <AuthErrorRedirectContent />
    </Suspense>
  );
}
