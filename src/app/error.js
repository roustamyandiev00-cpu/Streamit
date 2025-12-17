'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-boundary">
      <div className="error-content">
        <div className="error-icon">
          <AlertCircle size={64} />
        </div>
        
        <h1>Er is iets misgegaan</h1>
        <p className="error-message">
          {error?.message || 'Er is een onverwachte fout opgetreden'}
        </p>

        <div className="error-actions">
          <button onClick={reset} className="retry-btn">
            <RefreshCw size={18} />
            Opnieuw proberen
          </button>
          <Link href="/" className="home-btn">
            <Home size={18} />
            Naar Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Technische details (alleen in development)</summary>
            <pre>{error?.stack || error?.toString()}</pre>
          </details>
        )}
      </div>

      <style jsx>{`
        .error-boundary {
          min-height: 100vh;
          background: linear-gradient(135deg, #0e0e12 0%, #1a1a2e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .error-content {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          max-width: 600px;
          width: 100%;
        }

        .error-icon {
          color: #ff4444;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        h1 {
          color: white;
          margin: 0 0 1rem 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .error-message {
          color: #999;
          margin: 0 0 2rem 0;
          line-height: 1.6;
          font-size: 1rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .retry-btn, .home-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
        }

        .retry-btn {
          background: #5c4dff;
          color: white;
        }

        .retry-btn:hover {
          background: #4a3dcc;
          transform: translateY(-1px);
        }

        .home-btn {
          background: transparent;
          color: #999;
          border: 1px solid #333;
        }

        .home-btn:hover {
          border-color: #5c4dff;
          color: white;
        }

        .error-details {
          margin-top: 2rem;
          text-align: left;
          background: #000;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
        }

        .error-details summary {
          color: #999;
          cursor: pointer;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .error-details summary:hover {
          color: white;
        }

        .error-details pre {
          color: #ff4444;
          font-size: 0.8rem;
          overflow-x: auto;
          margin: 0;
          padding: 1rem;
          background: #0a0a0a;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

