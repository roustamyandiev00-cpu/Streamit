'use client';

import React, { useRef, useEffect } from 'react';

export default function StageRenderer({ 
  scene, 
  camStream, 
  screenStream, 
  micOn, 
  audioLevel 
}) {
  const containerRef = useRef(null);

  // Helper to get stream by source type/id
  // In a real app, sources would map to specific device IDs. 
  // Here we map 'camera' types to camStream and 'screen' to screenStream for simplicity.
  const getStreamForSource = (source) => {
    if (source.type === 'camera') return camStream;
    if (source.type === 'screen') return screenStream;
    return null;
  };

  return (
    <div 
      className="stage-renderer" 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#000',
        overflow: 'hidden'
      }}
    >
      {/* If no scene, show placeholder */}
      {!scene && (
        <div className="no-scene">
          No Scene Selected
        </div>
      )}

      {/* Render Sources */}
      {scene?.sources.map((source) => {
        if (!source.visible) return null;

        // Calculate position percentages relative to 1920x1080 canvas
        const left = (source.x / 1920) * 100;
        const top = (source.y / 1080) * 100;
        const width = (source.width / 1920) * 100;
        const height = (source.height / 1080) * 100;

        return (
          <div
            key={source.id}
            className={`source-container source-${source.type}`}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              zIndex: source.zIndex || 1,
              opacity: source.opacity,
              transform: `rotate(${source.rotation || 0}deg)`
            }}
          >
            {/* Video Sources */}
            {(source.type === 'camera' || source.type === 'screen') && (
              <VideoElement 
                stream={getStreamForSource(source)} 
                muted={true} // Always mute stage videos to prevent echo;
                className={source.type === 'camera' ? 'mirror-cam' : ''}
              />
            )}

            {/* Text Sources */}
            {source.type === 'text' && (
              <div className="text-source" style={{ 
                color: source.color || 'white',
                fontSize: `${source.fontSize || 48}px`,
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
                {source.content || source.name}
              </div>
            )}

            {/* Image Sources */}
            {source.type === 'image' && (
              <img 
                src={source.url || '/placeholder-image.png'} 
                alt={source.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        );
      })}

      {/* Audio Visualizer Overlay (Global) */}
      {micOn && (
        <div className="stage-audio-level">
          <div 
            className="level-bar" 
            style={{ height: `${Math.max(5, audioLevel)}%` }}
          />
        </div>
      )}

      <style jsx>{`
        .mirror-cam {
          transform: scaleX(-1);
        }
        .source-container {
          overflow: hidden;
          /* Border for debugging/selection could go here */
        }
        .no-scene {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }
        .stage-audio-level {
          position: absolute;
          bottom: 20px;
          left: 20px;
          width: 8px;
          height: 60px;
          background: rgba(0,0,0,0.5);
          border-radius: 4px;
          overflow: hidden;
          z-index: 100;
        }
        .level-bar {
          background: #00ff88;
          width: 100%;
          position: absolute;
          bottom: 0;
          transition: height 0.1s;
        }
      `}</style>
    </div>
  );
}

// Separate component to handle video ref lifecycle
function VideoElement({ stream, muted, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: '#222', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#555'
      }}>
        No Signal
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
