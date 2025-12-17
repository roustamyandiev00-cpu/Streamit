'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

/**
 * Advanced Video Player Component using Video.js
 * Supports HLS, DASH, and standard video formats
 */
export default function VideoPlayer({ 
  src, 
  poster,
  autoplay = false,
  controls = true,
  fluid = true,
  aspectRatio = '16:9',
  onReady,
  onPlay,
  onPause,
  onEnded,
  className = ''
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current;

      const player = videojs(videoElement, {
        controls,
        autoplay,
        fluid,
        aspectRatio,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        plugins: {
          // Add plugins here if needed
        },
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
      });

      playerRef.current = player;

      // Event handlers
      if (onReady) {
        player.ready(() => {
          onReady(player);
        });
      }

      if (onPlay) {
        player.on('play', () => {
          onPlay();
        });
      }

      if (onPause) {
        player.on('pause', () => {
          onPause();
        });
      }

      if (onEnded) {
        player.on('ended', () => {
          onEnded();
        });
      }
    }

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  // Update source when it changes
  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.src({
        src,
        type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
      });
    }
  }, [src]);

  return (
    <div className={`video-player-wrapper ${className}`}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          poster={poster}
          playsInline
        />
      </div>
      <style jsx>{`
        .video-player-wrapper {
          width: 100%;
          position: relative;
        }

        .video-player-wrapper :global(.video-js) {
          width: 100%;
          height: 100%;
        }

        .video-player-wrapper :global(.vjs-big-play-button) {
          background-color: rgba(92, 77, 255, 0.8);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          border: none;
          transition: all 0.3s;
        }

        .video-player-wrapper :global(.vjs-big-play-button:hover) {
          background-color: rgba(92, 77, 255, 1);
          transform: scale(1.1);
        }

        .video-player-wrapper :global(.vjs-control-bar) {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        }

        .video-player-wrapper :global(.vjs-play-progress) {
          background-color: #5c4dff;
        }

        .video-player-wrapper :global(.vjs-volume-level) {
          background-color: #5c4dff;
        }
      `}</style>
    </div>
  );
}

