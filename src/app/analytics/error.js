'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsError({ error, reset }) {
  useEffect(() => {
    console.error('Analytics page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full text-center">
        <div className="flex justify-center mb-4 text-destructive">
          <AlertCircle size={48} />
        </div>
        
        <h2 className="text-xl font-bold text-card-foreground mb-2">Analytics Error</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'Failed to load analytics data.'}
        </p>

        <div className="flex gap-3 justify-center">
          <button 
            onClick={reset}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          
          <Link 
            href="/"
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors border border-border"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
