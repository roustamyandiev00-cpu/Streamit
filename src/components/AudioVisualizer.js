'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

export default function AudioVisualizer({
  stream,
  type = 'microphone', // 'microphone' or 'system'
  enabled = true,
  volume = 100,
  onVolumeChange,
  showControls = true
}) {
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!stream || !enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
      setPeakLevel(0);
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.8;
    source.connect(analyzer);
    
    analyzerRef.current = analyzer;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      if (!analyzer) return;

      analyzer.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for more accurate level detection
      let sum = 0;
      let peak = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        sum += value * value;
        peak = Math.max(peak, value);
      }
      
      const rms = Math.sqrt(sum / bufferLength);
      const level = Math.min(rms * 100 * 3, 100); // Amplify for better visibility;
      const peakValue = Math.min(peak * 100 * 2, 100);
      
      setAudioLevel(level);
      setPeakLevel(peakValue);

      // Draw waveform if canvas is available
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw frequency bars
        const barWidth = width / bufferLength * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          
          // Color gradient based on frequency
          const hue = (i / bufferLength) * 120; // Green to red;
          ctx.fillStyle = `hsl(${120 - hue}, 70%, 50%)`;
          
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }

      animationRef.current = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream, enabled]);

  const getVolumeColor = (level) => {
    if (level < 30) return '#00ff88'; // Green
    if (level < 70) return '#ffaa00'; // Orange
    return '#ff4444'; // Red;
  };

  const getLevelBars = (level) => {
    const bars = [];
    const numBars = 20;
    const barLevel = level / 5; // Each bar represents 5%
        
    for (let i = 0; i < numBars; i++) {
          const isActive = i < barLevel;
          const intensity = Math.max(0, Math.min(1, (barLevel - i)));
          
          let color = '#333';
          if (isActive) {
            if (i < 12) color = '#00ff88'; // Green
            else if (i < 16) color = '#ffaa00'; // Orange
            else color = '#ff4444'; // Red
          }
          
          bars.push(
            <div
              key={i}
              className="level-bar"
              style={{
                backgroundColor: color,
                opacity: isActive ? intensity : 0.3,
                height: `${Math.min(100, 20 + (i * 4))}%`
              }}
            />
          );
        }    
    return bars;
  };

  return (
    <div className="audio-visualizer">
      {showControls && (
        <div className="audio-controls">
          <div className="audio-info">
            <div className="audio-icon">
              {type === 'microphone' ? (
                enabled && !isMuted ? <Mic size={16} /> : <MicOff size={16} />
              ) : (
                enabled && !isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />
              )}
            </div>
            <span className="audio-label">
              {type === 'microphone' ? 'Microphone' : 'System Audio'}
            </span>
          </div>
          
          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseInt(e.target.value);
                setIsMuted(newVolume === 0);
                if (onVolumeChange) onVolumeChange(newVolume);
              }}
              className="volume-slider"
            />
            <span className="volume-value">{isMuted ? 0 : volume}%</span>
          </div>
        </div>
      )}

      <div className="visualizer-container">
        {/* Level Meter */}
        <div className="level-meter">
          <div className="level-bars">
            {getLevelBars(audioLevel)}
          </div>
          <div className="peak-indicator" style={{
            bottom: `${peakLevel}%`,
            backgroundColor: getVolumeColor(peakLevel),
            opacity: peakLevel > 5 ? 1 : 0
          }} />
        </div>

        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={200}
          height={60}
          className="waveform-canvas"
        />

        {/* Numeric Display */}
        <div className="level-display">
          <div className="level-number" style={{ color: getVolumeColor(audioLevel) }}>
            {Math.round(audioLevel)}
          </div>
          <div className="level-unit">dB</div>
        </div>
      </div>

      {/* Peak Warning */}
      {peakLevel > 90 && (
        <div className="peak-warning">
          PEAK!
        </div>
      )}

      <style jsx>{`
        .audio-visualizer {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .audio-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .audio-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .audio-icon {
          color: ${enabled && !isMuted ? '#00ff88' : '#666'};
        }

        .audio-label {
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volume-slider {
          width: 100px;
          accent-color: #5c4dff;
        }

        .volume-value {
          color: #5c4dff;
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 35px;
          text-align: right;
        }

        .visualizer-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          height: 60px;
        }

        .level-meter {
          position: relative;
          width: 30px;
          height: 100%;
          background: #111;
          border-radius: 4px;
          overflow: hidden;
        }

        .level-bars {
          display: flex;
          flex-direction: column-reverse;
          height: 100%;
          gap: 1px;
          padding: 2px;
        }

        .level-bar {
          flex: 1;
          border-radius: 1px;
          transition: all 0.1s ease;
        }

        .peak-indicator {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          transition: all 0.1s ease;
        }

        .waveform-canvas {
          flex: 1;
          background: #000;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .level-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
        }

        .level-number {
          font-size: 1.2rem;
          font-weight: bold;
          font-family: monospace;
          line-height: 1;
        }

        .level-unit {
          color: #666;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .peak-warning {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #ff4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
          animation: blink 0.5s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}