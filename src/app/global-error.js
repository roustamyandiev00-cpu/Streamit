'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e0e12',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#999', marginBottom: '2rem' }}>
              {error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: '#5c4dff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}