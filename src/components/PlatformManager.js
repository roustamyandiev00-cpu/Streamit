'use client';

import React, { useState, useEffect } from 'react';
import { 
  Youtube, Twitch, Facebook, Instagram, 
  Plus, Check, X, ExternalLink, RefreshCw,
  AlertCircle, Settings
} from 'lucide-react';

const PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    description: 'Stream to YouTube Live'
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: Twitch,
    color: '#9146FF',
    description: 'Stream to Twitch'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    description: 'Stream to Facebook Live'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    description: 'Stream to Instagram Live'
  }
];

export default function PlatformManager() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platforms');
      if (response.ok) {
        const data = await response.json();
        setPlatforms(data);
      }
    } catch (error) {
      console.error('Failed to load platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async (platformId) => {
    setConnecting(platformId);
    try {
      // Simulate OAuth flow - in production this would redirect to OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId, connected: true })
      });

      if (response.ok) {
        await loadPlatforms();
      }
    } catch (error) {
      console.error('Failed to connect platform:', error);
    } finally {
      setConnecting(null);
    }
  };

  const disconnectPlatform = async (platformId) => {
    try {
      const response = await fetch(`/api/platforms/${platformId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setPlatforms(prev => prev.filter(p => p.platformId !== platformId));
      }
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
    }
  };

  const isConnected = (platformId) => {
    return platforms.some(p => p.platformId === platformId && p.connected);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem',
        color: '#666'
      }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
        Loading platforms...
      </div>
    );
  }

  return (
    <div className="platform-manager">
      <div className="platforms-grid">
        {PLATFORMS.map(platform => {
          const Icon = platform.icon;
          const connected = isConnected(platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <div 
              key={platform.id} 
              className={`platform-card ${connected ? 'connected' : ''}`}
            >
              <div className="platform-header">
                <div 
                  className="platform-icon"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <Icon size={24} style={{ color: platform.color }} />
                </div>
                <div className="platform-info">
                  <h3>{platform.name}</h3>
                  <p>{platform.description}</p>
                </div>
              </div>

              <div className="platform-status">
                {connected ? (
                  <span className="status connected">
                    <Check size={14} />
                    Connected
                  </span>
                ) : (
                  <span className="status disconnected">
                    <AlertCircle size={14} />
                    Not connected
                  </span>
                )}
              </div>

              <div className="platform-actions">
                {connected ? (
                  <>
                    <button 
                      className="btn-secondary"
                      onClick={() => alert('Platform settings coming soon!')}
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => disconnectPlatform(platform.id)}
                    >
                      <X size={16} />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-connect"
                    onClick={() => connectPlatform(platform.id)}
                    disabled={isConnecting}
                    style={{ backgroundColor: platform.color }}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="platforms-info">
        <h4>Multi-Platform Streaming</h4>
        <p>Connect your accounts to stream to multiple platforms simultaneously. Your stream will be broadcast to all connected platforms in real-time.</p>
      </div>

      <style jsx>{`
        .platform-manager {
          padding: 1rem;
        }

        .platforms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .platform-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .platform-card:hover {
          border-color: #3d3e46;
        }

        .platform-card.connected {
          border-color: #00cc88;
        }

        .platform-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .platform-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .platform-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        .platform-status {
          margin-bottom: 1rem;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .status.connected {
          background: rgba(0, 204, 136, 0.1);
          color: #00cc88;
        }

        .status.disconnected {
          background: rgba(161, 161, 170, 0.1);
          color: #a1a1aa;
        }

        .platform-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-connect {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-connect:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-connect:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-secondary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #2d2e36;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #3d3e46;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 68, 68, 0.1);
          border: none;
          border-radius: 8px;
          color: #ff4444;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-danger:hover {
          background: rgba(255, 68, 68, 0.2);
        }

        .platforms-info {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .platforms-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .platforms-info p {
          margin: 0;
          font-size: 0.9rem;
          color: #a1a1aa;
          line-height: 1.5;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
