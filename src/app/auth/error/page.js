'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-header">
          <h1>Authentication Error</h1>
          <p>{getErrorMessage(error)}</p>
        </div>

        <div className="error-actions">
          <Link href="/auth/signin" className="error-btn primary">
            Try Again
          </Link>
          <Link href="/" className="error-btn secondary">
            Go Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #09090b 0%, #1f2026 100%);
          padding: 2rem;
        }

        .error-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 16px;
          padding: 3rem;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .error-header h1 {
          color: #ff4444;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
        }

        .error-header p {
          color: #999;
          margin: 0 0 2rem 0;
          line-height: 1.5;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .error-btn {
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          display: block;
        }

        .error-btn.primary {
          background: #5c4dff;
          color: white;
        }

        .error-btn.primary:hover {
          background: #4c3ddf;
          transform: translateY(-1px);
        }

        .error-btn.secondary {
          background: transparent;
          color: #999;
          border: 1px solid #333;
        }

        .error-btn.secondary:hover {
          color: white;
          border-color: #555;
        }
      `}</style>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #09090b 0%, #1f2026 100%)',
        color: 'white'
      }}>
        <p>Loading...</p>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}