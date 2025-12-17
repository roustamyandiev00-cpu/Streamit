'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Volume2, VolumeX, Mic, 
  Monitor
} from 'lucide-react';

export default function AudioMixer({ streams = {}, onAudioChange, micEnabled = true }) {
  const [sources, setSources] = useState({});
  const audioContextRef = useRef(null);
  const sourceNodesRef = useRef({});
  const gainNodesRef = useRef({});
  const analyserNodesRef = useRef({});
  const animationFrameRef = useRef(null);
  const canvasRefs = useRef({});

  // Handle global mic mute
  useEffect(() => {
    const micId = 'microphone';
    const gainNode = gainNodesRef.current[micId];
    const source = sources[micId];

    if (gainNode && source) {
      // If globally disabled, mute. If enabled, respect local mute.
      const shouldBeMuted = !micEnabled || source.muted;
      gainNode.gain.value = shouldBeMuted ? 0 : source.volume / 100;
      
      // Update visual state if needed, but 'muted' in source state 
      // usually refers to the local mixer mute button. 
      // We can force the local mute state to match global if desired,
      // or just suppress the audio. Let's strictly suppress audio.
    }
  }, [micEnabled, sources.microphone?.muted, sources.microphone?.volume]);

  // Initialize Audio Context and handle streams
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Handle Microphone Stream
      if (streams.microphone && streams.microphone.getAudioTracks().length > 0) {
        setupAudioNode(ctx, streams.microphone, 'microphone', 'Microphone', <Mic size={16} />);
      } else {
        removeAudioNode('microphone');
      }

      // Handle Desktop/Screen Stream
      if (streams.screen && streams.screen.getAudioTracks().length > 0) {
        setupAudioNode(ctx, streams.screen, 'desktop', 'Desktop Audio', <Monitor size={16} />);
      } else {
        removeAudioNode('desktop');
      }
    };

    initAudio();

    return () => {
      // Cleanup is tricky with React Strict Mode, we might want to keep context alive
      // or cleanup specific nodes. For now, we clean up nodes when streams change.
    };
  }, [streams.microphone, streams.screen]);

  const setupAudioNode = (ctx, stream, id, name, icon) => {
    if (sourceNodesRef.current[id]) return; // Already setup

    // 1. Create Source
    const source = ctx.createMediaStreamSource(stream);
    sourceNodesRef.current[id] = source;

    // 2. Create Gain (Volume)
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.8; // Default 80%
    gainNodesRef.current[id] = gainNode;

    // 3. Create Analyser (Visualizer)
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserNodesRef.current[id] = analyser;

    // 4. Connect graph
    // Mic: Source -> Gain -> Analyser (Do NOT connect to destination to avoid feedback loop)
    // Desktop: Source -> Gain -> Analyser -> Destination (To hear it)
    source.connect(gainNode);
    gainNode.connect(analyser);
    
    if (id !== 'microphone') {
       // Optional: Connect to destination if you want to hear it locally
       // gainNode.connect(ctx.destination) 
    }

    // Update State
    setSources(prev => ({
      ...prev,
      [id]: {
        id,
        name,
        icon,
        volume: 80,
        muted: false,
        type: id === 'microphone' ? 'input' : 'system'
      }
    }));
  };

  const removeAudioNode = (id) => {
    if (sourceNodesRef.current[id]) {
      sourceNodesRef.current[id].disconnect();
      delete sourceNodesRef.current[id];
    }
    if (gainNodesRef.current[id]) {
      gainNodesRef.current[id].disconnect();
      delete gainNodesRef.current[id];
    }
    if (analyserNodesRef.current[id]) {
      analyserNodesRef.current[id].disconnect();
      delete analyserNodesRef.current[id];
    }
    setSources(prev => {
      const newSources = { ...prev };
      delete newSources[id];
      return newSources;
    });
  };

  // Animation Loop for Visualizers
  useEffect(() => {
    const animate = () => {
      Object.keys(analyserNodesRef.current).forEach(id => {
        drawAudioVisualization(id);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sources]); // Re-bind when sources change

  const drawAudioVisualization = (id) => {
    const canvas = canvasRefs.current[id];
    const analyser = analyserNodesRef.current[id];
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#5c4dff');
      gradient.addColorStop(1, '#00cc88');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const updateSourceVolume = (id, volume) => {
    // Update Web Audio Gain
    const gainNode = gainNodesRef.current[id];
    if (gainNode) {
      gainNode.gain.value = volume / 100;
    }

    // Update UI State
    setSources(prev => ({
      ...prev,
      [id]: { ...prev[id], volume }
    }));
    
    onAudioChange?.({ sourceId: id, volume, type: 'volume' });
  };

  const toggleSourceMute = (id) => {
    const source = sources[id];
    if (!source) return;

    const newMuted = !source.muted;
    const gainNode = gainNodesRef.current[id];
    
    if (gainNode) {
      gainNode.gain.value = newMuted ? 0 : source.volume / 100;
    }

    setSources(prev => ({
      ...prev,
      [id]: { ...prev[id], muted: newMuted }
    }));
  };

  const getVolumeColor = (volume, muted) => {
    if (muted) return '#666';
    if (volume > 80) return '#ff4444';
    if (volume > 60) return '#ffaa00';
    return '#00cc88';
  };

  return (
    <div className="audio-mixer">
      <div className="mixer-header">
        <h3>Audio Mixer</h3>
      </div>

      <div className="mixer-channels">
        {Object.values(sources).length === 0 && (
           <div style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
             No active audio sources
           </div>
        )}
        
        {Object.values(sources).map(source => (
          <div key={source.id} className="channel">
            <div className="channel-header">
              <div className="channel-info">
                {source.icon}
                <span className="channel-name">{source.name}</span>
              </div>
            </div>

            <div className="channel-visualization">
              <canvas
                ref={el => canvasRefs.current[source.id] = el}
                width={120}
                height={40}
                className="audio-canvas"
              />
            </div>

            <div className="channel-controls">
              <div className="control-buttons">
                <button
                  className={`control-btn ${source.muted ? 'active' : ''}`}
                  onClick={() => toggleSourceMute(source.id)}
                  title="Mute"
                >
                  {source.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={source.volume}
                  onChange={(e) => updateSourceVolume(source.id, parseInt(e.target.value))}
                  className="volume-slider"
                  style={{ '--volume-color': getVolumeColor(source.volume, source.muted) }}
                />
                <div className="volume-indicator">
                  <span className="volume-value">{source.volume}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .audio-mixer {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .mixer-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
        }

        .mixer-header h3 {
          margin: 0;
          color: white;
          font-size: 1.1rem;
        }

        .mixer-channels {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .channel {
          background: #2a2b33;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
        }

        .channel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .channel-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }

        .channel-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .channel-visualization {
          margin-bottom: 1rem;
          background: #000;
          border-radius: 4px;
          padding: 0.5rem;
        }

        .audio-canvas {
          width: 100%;
          height: 40px;
        }

        .channel-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .control-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .control-btn {
          flex: 1;
          background: transparent;
          border: 1px solid #444;
          color: #999;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          border-color: #5c4dff;
          color: white;
        }

        .control-btn.active {
          background: #5c4dff;
          border-color: #5c4dff;
          color: white;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volume-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .volume-slider {
          width: 100%;
          height: 4px;
          background: #333;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--volume-color, #5c4dff);
          border-radius: 50%;
          cursor: pointer;
        }

        .volume-value {
          color: #999;
          font-size: 0.8rem;
          min-width: 35px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}