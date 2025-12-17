'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Square, Settings, Camera,
  Mic, Volume2, Sliders, RotateCw, Maximize2,
  Download, Upload, Zap, Eye, EyeOff
} from 'lucide-react';

export default function RecordingControls({
  camStream,
  screenStream,
  isRecording,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  devices,
  selectedCam,
  selectedMic,
  onDeviceChange,
  demoMode = false
}) {
  const [recordingSettings, setRecordingSettings] = useState({
    format: 'webm',
    quality: 'high',
    fps: 30,
    bitrate: 2500,
    includeAudio: true,
    includeSystemAudio: true,
    resolution: '1920x1080'
  });

  const [audioSettings, setAudioSettings] = useState({
    micVolume: 80,
    systemVolume: 60,
    micGain: 0,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true
  });

  const [videoSettings, setVideoSettings] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    exposure: 0,
    whiteBalance: 'auto'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingSize, setRecordingSize] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        // Simulate file size growth
        setRecordingSize(prev => prev + Math.random() * 50 + 20);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const audioContextRef = useRef(null);
  const audioDestinationRef = useRef(null);

  const handleStartRecording = async () => {
    if (demoMode) {
      onStartRecording();
      setRecordingTime(0);
      setRecordingSize(0);
      return;
    }

    try {
      // Combine streams if available
      let combinedStream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const dest = audioContext.createMediaStreamDestination();
      audioDestinationRef.current = dest;

      // 1. Setup Audio Processing
      if (camStream && recordingSettings.includeAudio) {
        const micSource = audioContext.createMediaStreamSource(camStream);
        const micGain = audioContext.createGain();
        // Calculate gain: Volume (0-1) * Gain (dB conversion not exact here but close enough for UI)
        // A simple linear multiplier for volume, and additional gain factor
        const volumeMultiplier = audioSettings.micVolume / 100;
        const gainMultiplier = Math.pow(10, audioSettings.micGain / 20); // dB to linear;
        micGain.gain.value = volumeMultiplier * gainMultiplier;
        
        // Connect Mic
        micSource.connect(micGain);
        micGain.connect(dest);
      }

      if (screenStream && recordingSettings.includeSystemAudio) {
        const sysSource = audioContext.createMediaStreamSource(screenStream);
        const sysGain = audioContext.createGain();
        sysGain.gain.value = audioSettings.systemVolume / 100;
        
        // Connect System Audio
        sysSource.connect(sysGain);
        sysGain.connect(dest);
      }
      
      if (camStream && screenStream) {
        // Create canvas to combine both streams
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1920;
        canvas.height = 1080;
        
        const camVideo = document.createElement('video');
        const screenVideo = document.createElement('video');
        
        camVideo.srcObject = camStream;
        screenVideo.srcObject = screenStream;
        camVideo.muted = true; // Prevent feedback in DOM
        screenVideo.muted = true;
        
        await camVideo.play();
        await screenVideo.play();
        
        const drawFrame = () => {
          // Apply Video Filters
          const filterString = `;
            brightness(${100 + videoSettings.brightness}%) 
            contrast(${100 + videoSettings.contrast}%) 
            saturate(${100 + videoSettings.saturation}%) 
            hue-rotate(${videoSettings.hue}deg)
          `;
          ctx.filter = filterString;

          // Draw screen share as background
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
          
          // Draw camera as PiP in corner
          // Reset filter for PiP if we wanted it different, but applying globally for now is consistent
          // or we can apply different filters to different layers if we wanted. 
          // For now, global filter.
          
          const pipWidth = canvas.width * 0.25;
          const pipHeight = canvas.height * 0.25;
          const pipX = canvas.width - pipWidth - 20;
          const pipY = 20;
          
          ctx.drawImage(camVideo, pipX, pipY, pipWidth, pipHeight);
          
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            requestAnimationFrame(drawFrame);
          }
        };
        
        drawFrame();
        combinedStream = canvas.captureStream(recordingSettings.fps);
        
        // Add processed audio tracks
        dest.stream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
        });

      } else if (screenStream) {
        // Apply filters to single stream via canvas as well
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         canvas.width = 1920;
         canvas.height = 1080;
         const video = document.createElement('video');
         video.srcObject = screenStream;
         video.muted = true;
         await video.play();

         const drawFrame = () => {
            ctx.filter = `brightness(${100 + videoSettings.brightness}%) contrast(${100 + videoSettings.contrast}%) saturate(${100 + videoSettings.saturation}%)`;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              requestAnimationFrame(drawFrame);
            }
         };
         drawFrame();
         combinedStream = canvas.captureStream(recordingSettings.fps);
         dest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      } else if (camStream) {
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         canvas.width = 1920;
         canvas.height = 1080;
         const video = document.createElement('video');
         video.srcObject = camStream;
         video.muted = true;
         await video.play();

         const drawFrame = () => {
            ctx.filter = `brightness(${100 + videoSettings.brightness}%) contrast(${100 + videoSettings.contrast}%) saturate(${100 + videoSettings.saturation}%)`;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              requestAnimationFrame(drawFrame);
            }
         };
         drawFrame();
         combinedStream = canvas.captureStream(recordingSettings.fps);
         dest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      } else {
        throw new Error('No stream available for recording');
      }

      // Configure MediaRecorder
      const options = {
        mimeType: `video/${recordingSettings.format}`,
        videoBitsPerSecond: recordingSettings.bitrate * 1000,
        audioBitsPerSecond: 128000
      };

      chunksRef.current = [];
      const recorder = new MediaRecorder(combinedStream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          setRecordingSize(prev => prev + event.data.size);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: `video/${recordingSettings.format}` 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${recordingSettings.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Cleanup Audio Context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
      };
      
      recorder.start(1000); // Collect data every second
      mediaRecorderRef.current = recorder;
      
      onStartRecording();
      setRecordingTime(0);
      setRecordingSize(0);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording: ' + error.message);
    }
  };

  const handleStopRecording = () => {
    if (demoMode) {
      onStopRecording();
      setIsPaused(false);
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onStopRecording();
      setIsPaused(false);
    }
  };

  const handlePauseRecording = () => {
    if (demoMode) {
      setIsPaused(!isPaused);
      onPauseRecording();
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
      onPauseRecording();
    }
  };

  return (
    <div className="recording-controls">
      {/* Main Recording Controls */}
      <div className="recording-main">
        <div className="recording-status">
          {isRecording && (
            <div className={`recording-indicator ${isPaused ? 'paused' : ''}`}>
              <div className="rec-dot"></div>
              <span className="rec-text">
                {isPaused ? 'PAUSED' : 'REC'} {formatTime(recordingTime)}
              </span>
              <span className="rec-size">{formatSize(recordingSize)}</span>
            </div>
          )}
        </div>

        <div className="recording-buttons">
          {!isRecording ? (
            <button 
              className="record-btn start"
              onClick={handleStartRecording}
              disabled={!camStream && !screenStream && !demoMode}
            >
              <div className="record-icon"></div>
              Start Recording
            </button>
          ) : (
            <div className="recording-active-controls">
              <button 
                className="record-btn pause"
                onClick={handlePauseRecording}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button 
                className="record-btn stop"
                onClick={handleStopRecording}
              >
                <Square size={16} />
                Stop
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="settings-toggle">
        <button 
          className={`toggle-btn ${showAdvanced ? 'active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings size={16} />
          Advanced Settings
        </button>
      </div>

      {/* Advanced Settings Panel */}
      {showAdvanced && (
        <div className="advanced-settings">
          {/* Recording Settings */}
          <div className="settings-section">
            <h4><Download size={16} /> Recording Settings</h4>
            
            <div className="setting-row">
              <label>Format</label>
              <select 
                value={recordingSettings.format}
                onChange={(e) => setRecordingSettings(prev => ({
                  ...prev, format: e.target.value
                }))}
              >
                <option value="webm">WebM (Recommended)</option>
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
              </select>
            </div>

            <div className="setting-row">
              <label>Quality</label>
              <select 
                value={recordingSettings.quality}
                onChange={(e) => setRecordingSettings(prev => ({
                  ...prev, quality: e.target.value
                }))}
              >
                <option value="high">High (1080p)</option>
                <option value="medium">Medium (720p)</option>
                <option value="low">Low (480p)</option>
                <option value="ultra">Ultra (4K)</option>
              </select>
            </div>

            <div className="setting-row">
              <label>Frame Rate</label>
              <select 
                value={recordingSettings.fps}
                onChange={(e) => setRecordingSettings(prev => ({
                  ...prev, fps: parseInt(e.target.value)
                }))}
              >
                <option value="24">24 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
                <option value="120">120 FPS</option>
              </select>
            </div>

            <div className="setting-row">
              <label>Bitrate (kbps)</label>
              <input 
                type="range"
                min="500"
                max="10000"
                step="100"
                value={recordingSettings.bitrate}
                onChange={(e) => setRecordingSettings(prev => ({
                  ...prev, bitrate: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{recordingSettings.bitrate}</span>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="settings-section">
            <h4><Volume2 size={16} /> Audio Settings</h4>
            
            <div className="setting-row">
              <label>Microphone Volume</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={audioSettings.micVolume}
                onChange={(e) => setAudioSettings(prev => ({
                  ...prev, micVolume: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{audioSettings.micVolume}%</span>
            </div>

            <div className="setting-row">
              <label>System Audio</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={audioSettings.systemVolume}
                onChange={(e) => setAudioSettings(prev => ({
                  ...prev, systemVolume: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{audioSettings.systemVolume}%</span>
            </div>

            <div className="setting-row">
              <label>Microphone Gain</label>
              <input 
                type="range"
                min="-20"
                max="20"
                value={audioSettings.micGain}
                onChange={(e) => setAudioSettings(prev => ({
                  ...prev, micGain: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{audioSettings.micGain}dB</span>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={audioSettings.noiseReduction}
                  onChange={(e) => setAudioSettings(prev => ({
                    ...prev, noiseReduction: e.target.checked
                  }))}
                />
                Noise Reduction
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={audioSettings.echoCancellation}
                  onChange={(e) => setAudioSettings(prev => ({
                    ...prev, echoCancellation: e.target.checked
                  }))}
                />
                Echo Cancellation
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={audioSettings.autoGainControl}
                  onChange={(e) => setAudioSettings(prev => ({
                    ...prev, autoGainControl: e.target.checked
                  }))}
                />
                Auto Gain Control
              </label>
            </div>
          </div>

          {/* Video Settings */}
          <div className="settings-section">
            <h4><Camera size={16} /> Video Settings</h4>
            
            <div className="setting-row">
              <label>Brightness</label>
              <input 
                type="range"
                min="-100"
                max="100"
                value={videoSettings.brightness}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev, brightness: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{videoSettings.brightness}</span>
            </div>

            <div className="setting-row">
              <label>Contrast</label>
              <input 
                type="range"
                min="-100"
                max="100"
                value={videoSettings.contrast}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev, contrast: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{videoSettings.contrast}</span>
            </div>

            <div className="setting-row">
              <label>Saturation</label>
              <input 
                type="range"
                min="-100"
                max="100"
                value={videoSettings.saturation}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev, saturation: parseInt(e.target.value)
                }))}
              />
              <span className="range-value">{videoSettings.saturation}</span>
            </div>

            <div className="setting-row">
              <label>White Balance</label>
              <select 
                value={videoSettings.whiteBalance}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev, whiteBalance: e.target.value
                }))}
              >
                <option value="auto">Auto</option>
                <option value="daylight">Daylight</option>
                <option value="fluorescent">Fluorescent</option>
                <option value="incandescent">Incandescent</option>
                <option value="cloudy">Cloudy</option>
              </select>
            </div>
          </div>

          {/* Device Settings */}
          <div className="settings-section">
            <h4><Sliders size={16} /> Device Settings</h4>
            
            <div className="setting-row">
              <label>Camera</label>
              <select 
                value={selectedCam}
                onChange={(e) => onDeviceChange('camera', e.target.value)}
              >
                {devices.video.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>Microphone</label>
              <select 
                value={selectedMic}
                onChange={(e) => onDeviceChange('microphone', e.target.value)}
              >
                {devices.audio.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .recording-controls {
          background: #1a1a1f;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 1rem;
        }

        .recording-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .recording-status {
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .recording-indicator.paused {
          background: rgba(255, 165, 0, 0.1);
          border-color: #ffa500;
        }

        .rec-dot {
          width: 8px;
          height: 8px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .recording-indicator.paused .rec-dot {
          background: #ffa500;
        }

        .rec-text {
          color: #ff4444;
          font-weight: 600;
        }

        .recording-indicator.paused .rec-text {
          color: #ffa500;
        }

        .rec-size {
          color: #999;
          font-size: 0.8rem;
        }

        .recording-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .recording-active-controls {
          display: flex;
          gap: 0.5rem;
        }

        .record-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .record-btn.start {
          background: #ff4444;
          color: white;
        }

        .record-btn.start:hover {
          background: #ff3333;
          box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
        }

        .record-btn.start:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .record-btn.pause {
          background: #ffa500;
          color: white;
        }

        .record-btn.pause:hover {
          background: #ff9500;
        }

        .record-btn.stop {
          background: #666;
          color: white;
        }

        .record-btn.stop:hover {
          background: #555;
        }

        .record-icon {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        }

        .settings-toggle {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid #333;
          color: #999;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .toggle-btn:hover,
        .toggle-btn.active {
          border-color: #5c4dff;
          color: #5c4dff;
        }

        .advanced-settings {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .settings-section {
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .settings-section h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .setting-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .setting-row label {
          min-width: 120px;
          color: #ccc;
          font-size: 0.85rem;
        }

        .setting-row select,
        .setting-row input[type="range"] {
          flex: 1;
        }

        .setting-row select {
          background: #000;
          border: 1px solid #333;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .setting-row select:focus {
          outline: none;
          border-color: #5c4dff;
        }

        .setting-row input[type="range"] {
          accent-color: #5c4dff;
        }

        .range-value {
          min-width: 50px;
          text-align: right;
          color: #5c4dff;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ccc;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: #5c4dff;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}