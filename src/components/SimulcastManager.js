'use client';

import { useState, useEffect } from 'react';
import { 
  Radio, CheckCircle2, XCircle, Loader2, 
  Play, Square, AlertCircle, RefreshCw,
  Youtube, Twitch, Facebook, Linkedin
} from 'lucide-react';

const PLATFORM_ICONS = {
  youtube: Youtube,
  twitch: Twitch,
  facebook: Facebook,
  linkedin: Linkedin
};

const PLATFORM_COLORS = {
  youtube: '#FF0000',
  twitch: '#9146FF',
  facebook: '#1877F2',
  linkedin: '#0a66c2'
};

export default function SimulcastManager({ streamId, rtmpKey, onStatusChange }) {
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [simulcastStatus, setSimulcastStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (streamId) {
      loadPlatforms();
      loadSimulcastStatus();
    }
  }, [streamId]);

  // Poll for status updates when simulcast is active
  useEffect(() => {
    if (polling && streamId) {
      const interval = setInterval(() => {
        loadSimulcastStatus();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [polling, streamId]);

  const loadPlatforms = async () => {
    try {
      const res = await fetch('/api/platforms');
      if (res.ok) {
        const data = await res.json();
        // Filter only active platforms
        const activePlatforms = data.filter(p => p.isActive);
        setPlatforms(activePlatforms);
      }
    } catch (error) {
      console.error('Failed to load platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSimulcastStatus = async () => {
    if (!streamId) return;

    try {
      const res = await fetch(`/api/streams/${streamId}/simulcast`);
      if (res.ok) {
        const data = await res.json();
        setSimulcastStatus(data);
        setPolling(data.isActive);
        
        if (onStatusChange) {
          onStatusChange(data);
        }
      }
    } catch (error) {
      console.error('Failed to load simulcast status:', error);
    }
  };

  const startSimulcast = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setStarting(true);
    try {
      const res = await fetch(`/api/streams/${streamId}/simulcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformIds: selectedPlatforms
        })
      });

      if (res.ok) {
        await loadSimulcastStatus();
        setPolling(true);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to start simulcast');
      }
    } catch (error) {
      console.error('Failed to start simulcast:', error);
      alert('Failed to start simulcast');
    } finally {
      setStarting(false);
    }
  };

  const stopSimulcast = async () => {
    if (!confirm('Stop simulcasting to all platforms?')) return;

    try {
      const res = await fetch(`/api/streams/${streamId}/simulcast`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSimulcastStatus(null);
        setPolling(false);
        if (onStatusChange) {
          onStatusChange(null);
        }
      } else {
        alert('Failed to stop simulcast');
      }
    } catch (error) {
      console.error('Failed to stop simulcast:', error);
      alert('Failed to stop simulcast');
    }
  };

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'LIVE':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'CONNECTING':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'FAILED':
        return <XCircle size={16} className="text-red-500" />;
      case 'STOPPED':
        return <Square size={16} className="text-gray-500" />;
      default:
        return <Radio size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE':
        return '#00cc88';
      case 'CONNECTING':
        return '#5c4dff';
      case 'FAILED':
        return '#ff4444';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const isSimulcasting = simulcastStatus?.isActive;

  return (
    <div className="simulcast-manager">
      <div className="simulcast-header">
        <h3 className="text-lg font-semibold">Simulcast</h3>
        {isSimulcasting && (
          <button
            onClick={stopSimulcast}
            className="stop-btn"
          >
            <Square size={16} />
            Stop
          </button>
        )}
      </div>

      {!isSimulcasting ? (
        <div className="simulcast-setup">
          <p className="text-sm text-gray-400 mb-4">
            Select platforms to stream to simultaneously
          </p>

          <div className="platforms-list">
            {platforms.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={24} className="text-gray-500" />
                <p className="text-sm text-gray-400">
                  No active platform connections. Connect platforms first.
                </p>
              </div>
            ) : (
              platforms.map((platform) => {
                const Icon = PLATFORM_ICONS[platform.platform.toLowerCase()] || Radio;
                const color = PLATFORM_COLORS[platform.platform.toLowerCase()] || '#666';
                const isSelected = selectedPlatforms.includes(platform.id);

                return (
                  <label
                    key={platform.id}
                    className={`platform-item ${isSelected ? 'selected' : ''}`}
                    style={{ borderColor: isSelected ? color : '#333' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePlatform(platform.id)}
                      className="platform-checkbox"
                    />
                    <div
                      className="platform-icon"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="platform-info">
                      <span className="platform-name">{platform.platform}</span>
                      <span className="platform-status">
                        {platform.isActive ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <button
            onClick={startSimulcast}
            disabled={selectedPlatforms.length === 0 || starting || !rtmpKey}
            className="start-btn"
          >
            {starting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Starting...
              </>
            ) : (
              <>
                <Play size={16} />
                Start Simulcast
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="simulcast-status">
          <div className="status-header">
            <div className="status-indicator live">
              <div className="status-dot"></div>
              <span>Simulcasting Active</span>
            </div>
            <button
              onClick={loadSimulcastStatus}
              className="refresh-btn"
              title="Refresh status"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="platforms-status">
            {simulcastStatus?.platforms?.map((platform) => {
              const Icon = PLATFORM_ICONS[platform.platform?.toLowerCase()] || Radio;
              const color = PLATFORM_COLORS[platform.platform?.toLowerCase()] || '#666';

              return (
                <div
                  key={platform.platformId || platform.id}
                  className="platform-status-item"
                  style={{ borderLeftColor: getStatusColor(platform.status) }}
                >
                  <div className="platform-status-header">
                    <div className="platform-status-icon" style={{ color }}>
                      <Icon size={18} />
                    </div>
                    <div className="platform-status-info">
                      <span className="platform-name">{platform.platform}</span>
                      <span className="platform-viewers">
                        {platform.viewerCount || 0} viewers
                      </span>
                    </div>
                    <div className="platform-status-badge">
                      {getStatusIcon(platform.status)}
                      <span style={{ color: getStatusColor(platform.status) }}>
                        {platform.status}
                      </span>
                    </div>
                  </div>
                  {platform.errorMessage && (
                    <div className="platform-error">
                      <AlertCircle size={14} />
                      <span>{platform.errorMessage}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .simulcast-manager {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
        }

        .simulcast-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .simulcast-header h3 {
          color: white;
          margin: 0;
        }

        .stop-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ff4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stop-btn:hover {
          background: #ff3333;
        }

        .simulcast-setup {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .platforms-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          gap: 0.5rem;
        }

        .platform-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 2px solid #333;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255, 255, 255, 0.01);
        }

        .platform-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: #444;
        }

        .platform-item.selected {
          background: rgba(92, 77, 255, 0.1);
        }

        .platform-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #5c4dff;
          cursor: pointer;
        }

        .platform-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .platform-name {
          font-weight: 600;
          color: white;
          font-size: 0.9rem;
        }

        .platform-status {
          font-size: 0.75rem;
          color: #a1a1aa;
        }

        .start-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #5c4dff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .start-btn:hover:not(:disabled) {
          background: #4c3dff;
          transform: translateY(-1px);
        }

        .start-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .simulcast-status {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-indicator.live {
          background: rgba(0, 204, 136, 0.1);
          border: 1px solid #00cc88;
          color: #00cc88;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #00cc88;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .refresh-btn {
          background: transparent;
          border: 1px solid #333;
          color: #a1a1aa;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          border-color: #5c4dff;
          color: white;
        }

        .platforms-status {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .platform-status-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-left: 3px solid;
          border-radius: 6px;
          padding: 0.75rem;
        }

        .platform-status-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .platform-status-icon {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
        }

        .platform-status-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .platform-status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .platform-viewers {
          font-size: 0.75rem;
          color: #a1a1aa;
        }

        .platform-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 68, 68, 0.1);
          border-radius: 4px;
          font-size: 0.75rem;
          color: #ff8888;
        }
      `}</style>
    </div>
  );
}

