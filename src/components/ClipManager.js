'use client';

import { useState, useEffect } from 'react';
import { 
  Scissors, Play, Download, Trash2, Sparkles, 
  Clock, TrendingUp, Video, Image as ImageIcon,
  Loader2, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';

export default function ClipManager({ streamId, onClose }) {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('9:16');
  const [clipCount, setClipCount] = useState(5);

  useEffect(() => {
    fetchClips();
  }, [streamId]);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const url = streamId 
        ? `/api/clips?streamId=${streamId}`
        : '/api/clips';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClips(data);
      }
    } catch (error) {
      console.error('Failed to fetch clips:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateClips = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          options: {
            count: clipCount,
            aspectRatio: selectedAspectRatio,
            addCaptions: true,
            language: 'en'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Poll voor updates
        setTimeout(() => fetchClips(), 2000);
        // Start polling voor progress
        pollForUpdates(data.clips.map(c => c.id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to generate clips');
      }
    } catch (error) {
      console.error('Failed to generate clips:', error);
      alert('Failed to generate clips');
    } finally {
      setGenerating(false);
    }
  };

  const pollForUpdates = (clipIds) => {
    const interval = setInterval(async () => {
      const res = await fetch(streamId ? `/api/clips?streamId=${streamId}` : '/api/clips');
      if (res.ok) {
        const updatedClips = await res.json();
        setClips(updatedClips);
        
        // Stop polling als alle clips klaar zijn
        const allDone = updatedClips
          .filter(c => clipIds.includes(c.id))
          .every(c => c.status === 'COMPLETED' || c.status === 'FAILED');
        
        if (allDone) {
          clearInterval(interval);
        }
      }
    }, 3000);

    // Stop na 5 minuten
    setTimeout(() => clearInterval(interval), 300000);
  };

  const deleteClip = async (clipId) => {
    if (!confirm('Are you sure you want to delete this clip?')) return;

    try {
      const res = await fetch(`/api/clips?id=${clipId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchClips();
      } else {
        alert('Failed to delete clip');
      }
    } catch (error) {
      console.error('Failed to delete clip:', error);
      alert('Failed to delete clip');
    }
  };

  const downloadClip = (clip) => {
    if (clip.videoUrl) {
      const url = `/api/clips/download?path=${encodeURIComponent(clip.videoUrl)}`;
      window.open(url, '_blank');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'FAILED':
        return <XCircle size={16} className="text-red-500" />;
      case 'PROCESSING':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAspectRatioLabel = (ratio) => {
    const labels = {
      '9:16': 'Vertical (TikTok/Reels)',
      '16:9': 'Horizontal (YouTube)',
      '1:1': 'Square (Instagram)'
    };
    return labels[ratio] || ratio;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="clip-manager">
      {/* Header */}
      <div className="clip-header">
        <div className="flex items-center gap-2">
          <Scissors size={24} className="text-primary" />
          <h2 className="text-xl font-bold">AI Clips</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        )}
      </div>

      {/* Generate Section */}
      <div className="generate-section">
        <div className="generate-controls">
          <div className="control-group">
            <label>Aspect Ratio</label>
            <select
              value={selectedAspectRatio}
              onChange={(e) => setSelectedAspectRatio(e.target.value)}
              className="select-input"
            >
              <option value="9:16">Vertical (9:16)</option>
              <option value="16:9">Horizontal (16:9)</option>
              <option value="1:1">Square (1:1)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Number of Clips</label>
            <input
              type="number"
              min="1"
              max="10"
              value={clipCount}
              onChange={(e) => setClipCount(parseInt(e.target.value))}
              className="number-input"
            />
          </div>

          <button
            onClick={generateClips}
            disabled={generating || !streamId}
            className="generate-btn"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Clips
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clips Grid */}
      <div className="clips-grid">
        {clips.length === 0 ? (
          <div className="empty-state">
            <Video size={48} className="text-gray-500" />
            <p className="text-gray-400">No clips yet. Generate your first clips!</p>
          </div>
        ) : (
          clips.map((clip) => (
            <div key={clip.id} className="clip-card">
              {/* Thumbnail */}
              <div className="clip-thumbnail">
                {clip.thumbnailUrl ? (
                  <img
                    src={`/api/clips/thumbnail?path=${encodeURIComponent(clip.thumbnailUrl)}`}
                    alt={clip.title}
                    className="thumbnail-image"
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    <Video size={32} className="text-gray-500" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="status-badge">
                  {getStatusIcon(clip.status)}
                  <span className="status-text">{clip.status}</span>
                </div>

                {/* Progress Bar */}
                {clip.status === 'PROCESSING' && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${clip.processingProgress || 0}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Clip Info */}
              <div className="clip-info">
                <h3 className="clip-title">{clip.title}</h3>
                {clip.description && (
                  <p className="clip-description">{clip.description}</p>
                )}

                <div className="clip-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{formatDuration(clip.duration)}</span>
                  </div>
                  <div className="meta-item">
                    <TrendingUp size={14} />
                    <span>{(clip.highlightScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="meta-item">
                    <span className="aspect-badge">{clip.aspectRatio}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="clip-actions">
                  {clip.status === 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => downloadClip(clip)}
                        className="action-btn download"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => window.open(`/api/clips/play?path=${encodeURIComponent(clip.videoUrl)}`, '_blank')}
                        className="action-btn play"
                        title="Play"
                      >
                        <Play size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteClip(clip.id)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={fetchClips}
                    className="action-btn refresh"
                    title="Refresh"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .clip-manager {
          background: #1a1a1f;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .clip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .generate-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .generate-controls {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.85rem;
          color: #a1a1aa;
        }

        .select-input, .number-input {
          background: #000;
          border: 1px solid #333;
          color: white;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .select-input:focus, .number-input:focus {
          outline: none;
          border-color: #5c4dff;
        }

        .number-input {
          width: 80px;
        }

        .generate-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #5c4dff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .generate-btn:hover:not(:disabled) {
          background: #4c3dff;
          transform: translateY(-1px);
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .clip-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .clip-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .clip-thumbnail {
          position: relative;
          width: 100%;
          aspect-ratio: 9/16;
          background: #000;
          overflow: hidden;
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
        }

        .status-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .status-text {
          color: white;
          text-transform: uppercase;
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: #5c4dff;
          transition: width 0.3s;
        }

        .clip-info {
          padding: 1rem;
        }

        .clip-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.5rem 0;
        }

        .clip-description {
          font-size: 0.8rem;
          color: #a1a1aa;
          margin: 0 0 0.75rem 0;
        }

        .clip-meta {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #a1a1aa;
        }

        .aspect-badge {
          background: rgba(92, 77, 255, 0.2);
          color: #5c4dff;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .clip-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
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

        .action-btn:hover {
          border-color: #5c4dff;
          color: white;
        }

        .action-btn.download:hover {
          border-color: #00cc88;
          color: #00cc88;
        }

        .action-btn.play:hover {
          border-color: #5c4dff;
          color: #5c4dff;
        }

        .action-btn.delete:hover {
          border-color: #ff4444;
          color: #ff4444;
        }

        @media (max-width: 768px) {
          .clips-grid {
            grid-template-columns: 1fr;
          }

          .generate-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

