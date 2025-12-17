'use client';

import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Settings,
  X, MessageSquare, Palette, Music,
  Sliders, MonitorUp, Grid, Layers,
  Play, Pause, Square, RotateCw,
  Users, Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStreamStore } from '../../store/useStreamStore';
import { useSocket } from '../../hooks/useSocket';
import { useHotkeys, defaultStudioHotkeys } from '../../hooks/useHotkeys';
import AudioMixer from '../../components/AudioMixer';
import OverlayEditor from '../../components/OverlayEditor';
import SceneManager from '../../components/SceneManager';
import StreamQualitySelector from '../../components/StreamQualitySelector';
import RecordingControls from '../../components/RecordingControls';
import StageRenderer from '../../components/StageRenderer';
import SimulcastManager from '../../components/SimulcastManager';
import TemplateSelector from '../../components/TemplateSelector';
import TemplateEditor from '../../components/TemplateEditor';

function StudioPageContent() {
  const searchParams = useSearchParams();
  const streamId = searchParams.get('streamId');

  const camVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Zustand store
  const {
    currentStream,
    setCurrentStream,
    studioSettings,
    updateStudioSettings,
    chatMessages,
    addChatMessage,
    clearChat,
    isLive,
    isRecording,
    viewerCount,
    streamDuration,
    setLiveState,
    setRecordingState,
    setViewerCount,
    setStreamDuration,
    resetStudio
  } = useStreamStore();

  // Local state
  const [camStream, setCamStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedCam, setSelectedCam] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentScene, setCurrentScene] = useState('scene1');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [scenes, setScenes] = useState([
    {
      id: 'scene1',
      name: 'Main Scene',
      sources: [
        {
          id: 'camera1',
          type: 'camera',
          name: 'Webcam',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          visible: true,
          zIndex: 1,
          opacity: 1
        }
      ]
    },
    {
      id: 'scene2',
      name: 'Screen Share',
      sources: [
        {
          id: 'screen1',
          type: 'screen',
          name: 'Desktop',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          visible: true,
          zIndex: 1,
          opacity: 1
        },
        {
          id: 'camera2',
          type: 'camera',
          name: 'Webcam PIP',
          x: 1520,
          y: 880,
          width: 400,
          height: 200,
          visible: true,
          zIndex: 2,
          opacity: 1
        }
      ]
    }
  ]);
  const [showHotkeys, setShowHotkeys] = useState(false);

  // Destructure studio settings
  const {
    micOn,
    camOn,
    layout,
    brandColor,
    showOverlay,
    showLowerThird,
    userName,
    userTitle,
    logoPosition,
    streamQuality: storeStreamQuality
  } = studioSettings;

  const [streamQuality, setStreamQuality] = useState(storeStreamQuality || null);

  // Socket.io integration
  const handleNewMessage = useCallback((message) => {
    addChatMessage(message);
  }, [addChatMessage]);

  const handleViewerCount = useCallback((count) => {
    setViewerCount(count);
  }, [setViewerCount]);

  const handleStatusUpdate = useCallback((status) => {
    setLiveState(status.isLive);
    setRecordingState(status.isRecording);
  }, [setLiveState, setRecordingState]);

  const { sendMessage, updateStreamStatus } = useSocket(
    streamId,
    handleNewMessage,
    handleViewerCount,
    handleStatusUpdate
  );

  const loadStreamData = useCallback(async () => {
    if (!streamId) return;
    try {
      const response = await fetch(`/api/streams/${streamId}`);
      if (response.ok) {
        const stream = await response.json();
        setCurrentStream(stream);

        // Load existing chat messages
        clearChat();
        stream.chatMessages?.forEach(msg => {
          addChatMessage({
            user: msg.username,
            text: msg.message,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: msg.color
          });
        });
      }
    } catch (error) {
      console.error('Failed to load stream:', error);
    }
  }, [streamId, setCurrentStream, clearChat, addChatMessage]);

  const startCamera = useCallback(async (camId, micId) => {
    try {
      if (camStream) camStream.getTracks().forEach(t => t.stop());

      // Try with both video and audio first
      let constraints = {
        video: camId ? { deviceId: { exact: camId } } : true,
        audio: micId ? { deviceId: { exact: micId } } : true
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // If both fail, try video only
        console.warn("Failed to get audio+video, trying video only:", error);
        try {
          constraints = { video: camId ? { deviceId: { exact: camId } } : true };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (videoError) {
          console.error("Failed to get video access:", videoError);
          throw videoError;
        }
      }

      setCamStream(stream);
      if (camVideoRef.current) {
        camVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.error("Camera error", e);
      // Update UI to show camera is off if access fails
      updateStudioSettings({ camOn: false });
      throw e;
    }
  }, [camStream, updateStudioSettings]);

  const setupInputs = useCallback(async () => {
    try {
      // Check if we're in demo mode
      if (demoMode) {
        // Demo mode - set fake devices
        setDevices({
          audio: [{ deviceId: 'demo-mic', label: 'Demo Microphone' }],
          video: [{ deviceId: 'demo-cam', label: 'Demo Camera' }]
        });
        setSelectedMic('demo-mic');
        setSelectedCam('demo-cam');
        return;
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("Media devices not available");
        setDevices({ audio: [], video: [] });
        return;
      }

      // Set a timeout for device enumeration to prevent hanging
      const devicePromise = navigator.mediaDevices.enumerateDevices();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Device enumeration timeout')), 2000)
      );

      const devs = await Promise.race([devicePromise, timeoutPromise]);
      const audioDevs = devs.filter(d => d.kind === 'audioinput');
      const videoDevs = devs.filter(d => d.kind === 'videoinput');

      setDevices({ audio: audioDevs, video: videoDevs });

      if (audioDevs.length > 0) setSelectedMic(audioDevs[0].deviceId);
      if (videoDevs.length > 0) setSelectedCam(videoDevs[0].deviceId);

      // Never auto-start camera to prevent blocking
      console.log("Devices enumerated successfully:", { audio: audioDevs.length, video: videoDevs.length });
    } catch (err) {
      console.warn("Error setting up devices, using fallback:", err);
      // Set fallback devices
      setDevices({
        audio: [{ deviceId: 'default', label: 'Default Microphone' }],
        video: [{ deviceId: 'default', label: 'Default Camera' }]
      });
      setSelectedMic('default');
      setSelectedCam('default');
    }
  }, [demoMode]);

  const stopTracks = useCallback(() => {
    if (camStream) camStream.getTracks().forEach(track => track.stop());
    if (screenStream) screenStream.getTracks().forEach(track => track.stop());
  }, [camStream, screenStream]);

  // Load stream data
  useEffect(() => {
    const initializeStudio = async () => {
      try {
        // Force stop loading after 1 second to prevent blocking
        const loadingTimeout = setTimeout(() => {
          setLoading(false);
        }, 1000);

        if (streamId) {
          await loadStreamData();
        }

        // Setup inputs in background without blocking
        setupInputs().catch(error => {
          console.warn("Device setup failed, continuing without devices:", error);
        });

        // Clear timeout if we finish early
        clearTimeout(loadingTimeout);
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize studio:", error);
        setLoading(false);
      }
    };

    initializeStudio();

    return () => {
      stopTracks();
      resetStudio();
    };
  }, [streamId, loadStreamData, setupInputs, stopTracks, resetStudio]);

  // Handle demo mode changes
  useEffect(() => {
    if (demoMode) {
      setupInputs();
    }
  }, [demoMode, setupInputs]);

  const saveChatMessage = useCallback(async (message) => {
    if (!streamId) return;

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          message: message.text,
          username: message.user,
          color: message.color
        })
      });
    } catch (error) {
      console.error('Failed to save chat message:', error);
    }
  }, [streamId]);

  // Chat and audio simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Audio level simulation
      setAudioLevel(prev => {
        const target = micOn ? Math.random() * 80 : 0;
        return prev + (target - prev) * 0.2;
      });

      // Fake chat messages when live
      if (Math.random() > 0.92 && isLive && streamId) {
        const users = ['Alex', 'Sarah', 'Mike', 'Viewer123', 'Guest', 'StreamFan'];
        const texts = [
          'Great stream! 🔥',
          'Love the setup!',
          'Can you show that again?',
          'Amazing quality!',
          'Hello from Germany! 🇩🇪',
          'First time here, loving it!',
          'The audio is perfect 👌',
          'What camera are you using?'
        ];
        const newUser = users[Math.floor(Math.random() * users.length)];
        const newText = texts[Math.floor(Math.random() * texts.length)];

        const message = {
          user: newUser,
          text: newText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };

        addChatMessage(message);
        saveChatMessage(message);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLive, streamId, micOn, addChatMessage, saveChatMessage]);

  const updateStreamInDB = useCallback(async (updates) => {
    if (!streamId) return;

    try {
      await fetch(`/api/streams/${streamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update stream:', error);
    }
  }, [streamId]);

  // Media Logic

  const toggleScreenShare = async () => {
    if (screenStream) {
      if (!demoMode) {
        screenStream.getTracks().forEach(t => t.stop());
      }
      setScreenStream(null);
    } else {
      if (demoMode) {
        // Demo mode - simulate screen share
        setScreenStream({ fake: true });
        updateStudioSettings({ layout: 'pip' });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
        setScreenStream(stream);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        updateStudioSettings({ layout: 'pip' });

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
        };
      } catch (e) {
        console.error("Screen share cancelled", e);
      }
    }
  };

  const startRecording = () => {
    if (demoMode) {
      // Demo mode - simulate recording
      setRecordingState(true);
      updateStreamInDB({ isRecording: true });
      updateStreamStatus(isLive, true);
      return;
    }

    if (camStream) {
      chunksRef.current = [];
      const recorder = new MediaRecorder(camStream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingState(true);
      updateStreamInDB({ isRecording: true });
      updateStreamStatus(isLive, true);
    }
  };

  const stopRecording = () => {
    if (demoMode) {
      // Demo mode - simulate stopping recording
      setRecordingState(false);
      updateStreamInDB({ isRecording: false });
      updateStreamStatus(isLive, false);
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState(false);
      updateStreamInDB({ isRecording: false });
      updateStreamStatus(isLive, false);
    }
  };

  const toggleLive = () => {
    const newLiveState = !isLive;
    setLiveState(newLiveState);

    if (newLiveState) {
      setViewerCount(Math.floor(Math.random() * 50) + 1);
      updateStreamInDB({
        isLive: true,
        status: 'LIVE',
        startedAt: new Date().toISOString()
      });
    } else {
      setViewerCount(0);
      updateStreamInDB({
        isLive: false,
        status: 'ENDED',
        endedAt: new Date().toISOString()
      });
    }

    updateStreamStatus(newLiveState, isRecording);
  };

  const cycleCamera = useCallback(async () => {
    if (devices.video.length < 2) {
      // If only 1 camera, maybe just re-trigger it or do nothing
      return;
    }

    const currentIndex = devices.video.findIndex(d => d.deviceId === selectedCam);
    const nextIndex = (currentIndex + 1) % devices.video.length;
    const nextCamId = devices.video[nextIndex].deviceId;

    setSelectedCam(nextCamId);

    // Only restart if camera is currently on
    if (camOn) {
      try {
        await startCamera(nextCamId, selectedMic);
      } catch (e) {
        console.error("Failed to switch camera", e);
      }
    }
  }, [devices.video, selectedCam, selectedMic, camOn, startCamera]);

  // Timer
  useEffect(() => {
    let int;
    if (isLive || isRecording) {
      int = setInterval(() => setStreamDuration(prev => prev + 1), 1000);
    } else {
      setStreamDuration(0);
    }
    return () => clearInterval(int);
  }, [isLive, isRecording, setStreamDuration]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const sendChatMessage = useCallback((message) => {
    if (message.trim() && streamId) {
      const chatMessage = {
        user: 'You',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: '#5c4dff'
      };
      addChatMessage(chatMessage);
      sendMessage(message, 'You', '#5c4dff');
      saveChatMessage(chatMessage);
    }
  }, [streamId, addChatMessage, sendMessage, saveChatMessage]);

  const handleAudioChange = (data) => {
    console.log('Audio change:', data);
    // Handle audio mixer changes
  };

  const handleOverlaySave = (overlays) => {
    console.log('Overlays saved:', overlays);
    // Save overlay configuration
  };

  const handleSceneChange = (sceneId) => {
    setCurrentScene(sceneId);
    console.log('Scene changed to:', sceneId);
  };

  // Sidebar resize handlers
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newWidth = containerWidth - e.clientX;
    
    // Limit sidebar width between 280px and 600px
    if (newWidth >= 280 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Setup hotkeys
  const studioHotkeys = [
    {
      key: 'space',
      action: () => {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    },
    {
      key: 'ctrl+shift+r',
      action: () => {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    },
    {
      key: 'ctrl+shift+s',
      action: () => toggleLive()
    },
    {
      key: 'ctrl+m',
      action: () => updateStudioSettings({ micOn: !micOn })
    },
    {
      key: 'ctrl+shift+m',
      action: () => updateStudioSettings({ camOn: !camOn })
    },
    {
      key: 'ctrl+d',
      action: () => toggleScreenShare()
    },
    {
      key: 'f11',
      action: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
    },
    {
      key: 'ctrl+1',
      action: () => handleSceneChange('scene1')
    },
    {
      key: 'ctrl+2',
      action: () => handleSceneChange('scene2')
    },
    {
      key: 'ctrl+3',
      action: () => handleSceneChange('scene3')
    },
    {
      key: 'ctrl+shift+c',
      action: () => setActiveTab('chat')
    },
    {
      key: 'ctrl+shift+a',
      action: () => setActiveTab('audio')
    },
    {
      key: 'ctrl+shift+o',
      action: () => setActiveTab('overlays')
    },
    {
      key: 'escape',
      action: () => {
        if (showHotkeys) setShowHotkeys(false);
      }
    },
    {
      key: 'ctrl+shift+h',
      action: () => setShowHotkeys(!showHotkeys)
    }
  ];

  useHotkeys(studioHotkeys, [
    isRecording, micOn, camOn, showHotkeys, 
    startRecording, stopRecording, toggleLive, 
    updateStudioSettings, toggleScreenShare, 
    handleSceneChange, setActiveTab, setShowHotkeys
  ]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#09090b',
        color: 'white',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #5c4dff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading studio...</p>
        <small style={{ color: '#666', textAlign: 'center', maxWidth: '300px' }}>
          Setting up your streaming environment. Camera and microphone access will be requested when you enable them.
        </small>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={() => setLoading(false)}
            style={{
              padding: '0.5rem 1rem',
              background: '#5c4dff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Skip Setup & Continue
          </button>
          <button
            onClick={() => {
              setDemoMode(true);
              setLoading(false);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: '#999',
              border: '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Demo Mode
          </button>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="studio-layout" style={{ '--accent': brandColor }}>
      {/* Header */}
      <header className="studio-header">
        <div className="header-left">
          <Link href="/" className="back-btn" onClick={stopTracks}>
            <X size={20} />
          </Link>
          <div className="brand-logo">
            {currentStream?.title || 'STREAMIT STUDIO'}
            {demoMode && (
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.7rem',
                color: '#ffaa00',
                background: 'rgba(255, 170, 0, 0.1)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                DEMO
              </span>
            )}
          </div>
        </div>

        <div className="header-center">
          <div className={`status-pill ${isLive ? 'live' : ''}`}>
            <span className="dot"></span>
            {isLive ? formatTime(streamDuration) : 'OFFLINE'}
          </div>
          {isLive && (
            <div className="viewer-count">
              <Users size={14} />
              <span>{viewerCount} viewers</span>
            </div>
          )}
        </div>

        <div className="header-right">
          <button
            className={`action-btn record ${isRecording ? 'recording' : ''}`}
            onClick={() => isRecording ? stopRecording() : startRecording()}
          >
            <div className="record-dot"></div>
            {isRecording ? 'STOP REC' : 'RECORD'}
          </button>
          <button
            className={`action-btn go-live ${isLive ? 'live' : ''}`}
            onClick={toggleLive}
          >
            {isLive ? 'END STREAM' : 'GO LIVE'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="studio-body">
        {/* Main Stage */}
        <main className="studio-stage">
          <div className="stage-canvas" style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '1280px', aspectRatio: '16/9' }}>
            <StageRenderer 
              scene={scenes.find(s => s.id === currentScene)}
              camStream={camStream}
              screenStream={screenStream}
              micOn={micOn}
              audioLevel={audioLevel}
            />
            
            {/* Overlays (Keep existing overlay logic on top of stage) */}
            {showOverlay && isLive && (
              <div className={`overlay-layer pos-${logoPosition}`} style={{ pointerEvents: 'none' }}>
                <div className="brand-badge">LIVE</div>
                {showLowerThird && (
                  <div className="lower-third">
                    <div className="lt-name">{userName}</div>
                    <div className="lt-title">{userTitle}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside 
          ref={sidebarRef}
          className={`right-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
        >
          {/* Resize Handle */}
          {sidebarOpen && (
            <div 
              className="sidebar-resize-handle"
              onMouseDown={handleResizeStart}
            />
          )}
          {/* Sidebar Tabs */}
          <div className="sidebar-tabs-header">
            <button
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
              title="Chat"
            >
              <MessageSquare size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'scenes' ? 'active' : ''}`}
              onClick={() => setActiveTab('scenes')}
              title="Scenes"
            >
              <Layers size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveTab('audio')}
              title="Audio Mixer"
            >
              <Volume2 size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'overlays' ? 'active' : ''}`}
              onClick={() => setActiveTab('overlays')}
              title="Overlays"
            >
              <Palette size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'recording' ? 'active' : ''}`}
              onClick={() => setActiveTab('recording')}
              title="Recording"
            >
              <Square size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'simulcast' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulcast')}
              title="Simulcast"
            >
              <MonitorUp size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
              title="Templates"
            >
              <Grid size={18} />
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="sidebar-scrollable">
            {activeTab === 'chat' && (
              <div className="tab-content chat-pane">
                <div className="pane-header">
                  Live Chat
                  {isLive && (
                    <span className="live-indicator">
                      <span className="live-dot"></span>
                      LIVE
                    </span>
                  )}
                </div>
                <div className="chat-list">
                  {chatMessages.length === 0 ? (
                    <div className="empty-chat">
                      <MessageSquare size={32} style={{ opacity: 0.3 }} />
                      <p>No messages yet</p>
                      <small>Chat will appear here when you go live</small>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className="chat-bubble">
                        <span className="user" style={{ color: msg.color }}>
                          {msg.user}
                        </span>
                        <span className="text">{msg.text}</span>
                        <span className="time">{msg.time}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-input-box">
                  <input
                    type="text"
                    placeholder={isLive ? "Say something..." : "Go live to chat"}
                    disabled={!isLive}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        sendChatMessage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'scenes' && (
              <div className="tab-content">
                <div className="pane-header">Sources & Scenes</div>
                <SceneManager
                  scenes={scenes}
                  onScenesUpdate={setScenes}
                  onSceneChange={handleSceneChange}
                  currentScene={currentScene}
                />
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="tab-content">
                <div className="pane-header">Audio Mixer</div>
                <AudioMixer 
                  streams={{ 
                    microphone: camStream, 
                    screen: screenStream 
                  }} 
                  onAudioChange={handleAudioChange}
                  micEnabled={micOn}
                />
              </div>
            )}

            {activeTab === 'overlays' && (
              <div className="tab-content">
                <div className="pane-header">Overlay Editor</div>
                <OverlayEditor onSave={handleOverlaySave} />
              </div>
            )}

            {activeTab === 'recording' && (
              <div className="tab-content">
                <div className="pane-header">Recording Controls</div>
                <RecordingControls
                  camStream={camStream}
                  screenStream={screenStream}
                  isRecording={isRecording}
                  onStartRecording={() => startRecording()}
                  onStopRecording={() => stopRecording()}
                  onPauseRecording={() => console.log('Pause recording')}
                  devices={devices}
                  selectedCam={selectedCam}
                  selectedMic={selectedMic}
                  onDeviceChange={(type, deviceId) => {
                    if (type === 'camera') {
                      setSelectedCam(deviceId);
                      if (camOn) startCamera(deviceId, selectedMic);
                    } else if (type === 'microphone') {
                      setSelectedMic(deviceId);
                      if (camOn) startCamera(selectedCam, deviceId);
                    }
                  }}
                  demoMode={demoMode}
                />
              </div>
            )}

            {activeTab === 'simulcast' && (
              <div className="tab-content">
                <div className="pane-header">Simulcast</div>
                {streamId && currentStream?.rtmpKey ? (
                  <SimulcastManager
                    streamId={streamId}
                    rtmpKey={currentStream.rtmpKey}
                    onStatusChange={(status) => {
                      console.log('Simulcast status:', status);
                    }}
                  />
                ) : (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    <p>Stream must be created and have an RTMP key to use simulcast</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="tab-content">
                <div className="pane-header">
                  Templates
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button
                      onClick={() => setShowTemplateSelector(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#5c4dff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Browse
                    </button>
                    <button
                      onClick={() => setShowTemplateEditor(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Save Current
                    </button>
                  </div>
                </div>
                <div style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>
                  <p>Use templates to quickly set up your stream with pre-configured scenes, audio, and platform settings.</p>
                  <p style={{ marginTop: '0.5rem' }}>Browse templates or save your current setup as a template.</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <div className="pane-header">Device Settings</div>

                <div className="settings-section">
                  <h4>Camera</h4>
                  <select
                    className="device-select"
                    value={selectedCam}
                    onChange={e => startCamera(e.target.value, selectedMic)}
                  >
                    {devices.video.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${d.deviceId.slice(0, 4)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-section">
                  <h4>Microphone</h4>
                  <select
                    className="device-select"
                    value={selectedMic}
                    onChange={e => startCamera(selectedCam, e.target.value)}
                  >
                    {devices.audio.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microphone ${d.deviceId.slice(0, 4)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-section">
                  <h4>Stream Settings</h4>
                  <div className="setting-item">
                    <label>Stream Title</label>
                    <input
                      type="text"
                      className="setting-input"
                      value={userTitle}
                      onChange={e => updateStudioSettings({ userTitle: e.target.value })}
                      placeholder="Enter stream title"
                    />
                  </div>

                  <div className="setting-item">
                    <label>Streamer Name</label>
                    <input
                      type="text"
                      className="setting-input"
                      value={userName}
                      onChange={e => updateStudioSettings({ userName: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="setting-item">
                    <label>Brand Color</label>
                    <input
                      type="color"
                      className="color-input"
                      value={brandColor}
                      onChange={e => updateStudioSettings({ brandColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="settings-section quality-section">
                  <h4>Stream Quality</h4>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Configureer de resolutie, FPS en bitrate voor je stream
                  </p>
                  <StreamQualitySelector
                    platformType="YOUTUBE"
                    currentSettings={streamQuality}
                    onSettingsChange={(settings) => {
                      setStreamQuality(settings);
                      updateStudioSettings({ streamQuality: settings });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Dock */}
      <footer className="studio-dock">
        <div className="dock-group">
          <button
            className={`dock-btn ${!micOn ? 'off' : ''}`}
            onClick={async () => {
              const newMicState = !micOn;
              if (demoMode) {
                // Demo mode - just toggle state
                updateStudioSettings({ micOn: newMicState });
              } else if (newMicState && !camStream) {
                // User wants to turn mic on but no stream exists - request access
                try {
                  await startCamera(selectedCam, selectedMic);
                  updateStudioSettings({ micOn: true });
                } catch (error) {
                  console.error("Failed to start microphone:", error);
                  updateStudioSettings({ micOn: false });
                }
              } else {
                updateStudioSettings({ micOn: newMicState });
              }
            }}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            className={`dock-btn ${!camOn ? 'off' : ''}`}
            onClick={async () => {
              const newCamState = !camOn;
              if (demoMode) {
                // Demo mode - just toggle state
                updateStudioSettings({ camOn: newCamState });
              } else if (newCamState && !camStream) {
                // User wants to turn camera on - request access
                try {
                  await startCamera(selectedCam, selectedMic);
                  updateStudioSettings({ camOn: true });
                } catch (error) {
                  console.error("Failed to start camera:", error);
                  // Keep camera off if access fails
                  updateStudioSettings({ camOn: false });
                }
              } else {
                // Just toggle the state
                updateStudioSettings({ camOn: newCamState });
              }
            }}
            title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {camOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {devices.video.length > 1 && (
            <button
              className="dock-btn"
              onClick={cycleCamera}
              title="Switch Camera"
            >
              <RotateCw size={20} />
            </button>
          )}
        </div>

        <div className="dock-separator"></div>

        <div className="dock-group">
          <button
            className={`dock-btn ${screenStream ? 'active' : ''}`}
            onClick={toggleScreenShare}
            title={screenStream ? 'Stop Screen Share' : 'Start Screen Share'}
          >
            <MonitorUp size={20} />
          </button>
          <div className="layout-popup">
            <button
              className={`mini-btn ${layout === 'grid' ? 'active' : ''}`}
              onClick={() => updateStudioSettings({ layout: 'grid' })}
              title="Grid Layout"
            >
              <Grid size={14} />
            </button>
            <button
              className={`mini-btn ${layout === 'pip' ? 'active' : ''}`}
              onClick={() => updateStudioSettings({ layout: 'pip' })}
              title="Picture in Picture"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>

        <div className="dock-separator"></div>

        <div className="dock-group">
          <button
            className={`dock-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            <Sliders size={20} />
          </button>
          <button
            className="dock-btn"
            onClick={() => setShowHotkeys(true)}
            title="Keyboard Shortcuts (Ctrl+Shift+H)"
          >
            ⌨️
          </button>
        </div>
      </footer>

      {/* Hotkeys Help Overlay */}
      {showTemplateSelector && (
        <div className="hotkeys-overlay" onClick={() => setShowTemplateSelector(false)}>
          <div className="hotkeys-modal" onClick={(e) => e.stopPropagation()}>
            <TemplateSelector
              streamId={streamId}
              onTemplateApplied={(templateId) => {
                console.log('Template applied:', templateId);
                setShowTemplateSelector(false);
                // Reload stream data to get updated settings
                if (streamId) loadStreamData();
              }}
              onClose={() => setShowTemplateSelector(false)}
            />
          </div>
        </div>
      )}

      {showTemplateEditor && (
        <div className="hotkeys-overlay" onClick={() => setShowTemplateEditor(false)}>
          <div className="hotkeys-modal" onClick={(e) => e.stopPropagation()}>
            <TemplateEditor
              streamSettings={{
                scenes,
                audio: { bitrate: 128, sampleRate: 48000 },
                video: { resolution: '1920x1080', fps: 30 },
                branding: { brandColor, showOverlay, userName, userTitle }
              }}
              onSave={(template) => {
                console.log('Template saved:', template);
                setShowTemplateEditor(false);
              }}
              onCancel={() => setShowTemplateEditor(false)}
            />
          </div>
        </div>
      )}

      {showHotkeys && (
        <div className="hotkeys-overlay" onClick={() => setShowHotkeys(false)}>
          <div className="hotkeys-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hotkeys-header">
              <h3>Keyboard Shortcuts</h3>
              <button className="close-btn" onClick={() => setShowHotkeys(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="hotkeys-content">
              {Object.entries(
                defaultStudioHotkeys.reduce((acc, hotkey) => {
                  if (!acc[hotkey.category]) acc[hotkey.category] = [];
                  acc[hotkey.category].push(hotkey);
                  return acc;
                }, {})
              ).map(([category, hotkeys]) => (
                <div key={category} className="hotkey-category">
                  <h4>{category}</h4>
                  <div className="hotkey-list">
                    {hotkeys.map((hotkey, index) => (
                      <div key={index} className="hotkey-item">
                        <kbd className="hotkey-key">{hotkey.key}</kbd>
                        <span className="hotkey-desc">{hotkey.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="hotkeys-footer">
              <p>Press <kbd>Ctrl+Shift+H</kbd> to toggle this help</p>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .studio-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #09090b;
          color: white;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .studio-header {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: rgba(20, 20, 23, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 50;
        }

        .header-left, .header-right { 
          display: flex; 
          align-items: center; 
          gap: 1rem; 
          flex: 1; 
        }

        .header-center { 
          flex: 1; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          gap: 1rem; 
        }

        .header-right { justify-content: flex-end; }
        
        .brand-logo { 
          font-weight: 800; 
          letter-spacing: -0.5px; 
          font-size: 1rem; 
          color: #fff; 
        }

        .back-btn { 
          color: #888; 
          transition: color 0.2s; 
          text-decoration: none;
        }

        .back-btn:hover { color: #fff; }

        .viewer-count {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .status-pill {
          background: #1a1a1f;
          padding: 6px 12px;
          border-radius: 20px;
          font-family: monospace;
          font-size: 0.85rem;
          color: #666;
          display: flex; 
          align-items: center; 
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .status-pill.live { 
          border-color: #ff4444; 
          color: #fff; 
          background: rgba(255, 68, 68, 0.1); 
        }

        .status-pill .dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background: #666; 
        }

        .status-pill.live .dot { 
          background: #ff4444; 
          box-shadow: 0 0 8px #ff4444;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .action-btn {
          border: none; 
          outline: none; 
          padding: 0.5rem 1rem;
          border-radius: 6px; 
          font-weight: 600; 
          font-size: 0.85rem;
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 6px;
          transition: all 0.2s;
        }

        .action-btn.record { 
          background: rgba(255,255,255,0.05); 
          color: #fff; 
          border: 1px solid rgba(255,255,255,0.1); 
        }

        .action-btn.record:hover { 
          background: rgba(255,255,255,0.1); 
        }

        .action-btn.record.recording { 
          background: rgba(255, 68, 68, 0.2); 
          border-color: #ff4444; 
          color: #ff4444; 
        }

        .record-dot { 
          width: 8px; 
          height: 8px; 
          background: #ff4444; 
          border-radius: 50%; 
        }

        .recording .record-dot {
          animation: pulse 1.5s infinite;
        }

        .action-btn.go-live { 
          background: var(--accent); 
          color: white; 
        }

        .action-btn.go-live:hover { 
          opacity: 0.9; 
          box-shadow: 0 0 15px var(--accent); 
        }

        .action-btn.go-live.live { 
          background: #ff4444; 
        }

        .studio-body {
          flex: 1;
          display: flex;
          height: calc(100vh - 140px);
          overflow: hidden;
        }

        .studio-stage {
          flex: 1;
          background: radial-gradient(circle at center, #1b1b20 0%, #09090b 100%);
          display: flex; 
          align-items: center; 
          justify-content: center;
          padding: 2rem;
        }
        
        .stage-canvas {
          width: 100%; 
          height: 100%; 
          max-width: 1200px;
          position: relative;
          display: flex; 
          gap: 1rem; 
        }

        .video-box {
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .layout-single .cam { width: 100%; height: 100%; }
        
        .layout-grid { align-items: center; }
        .layout-grid .video-box { flex: 1; aspect-ratio: 16/9; }

        .layout-pip .screen { width: 100%; height: 100%; }
        .layout-pip .cam.pip-style {
          position: absolute; 
          bottom: 20px; 
          right: 20px;
          width: 250px; 
          height: 140px;
          z-index: 10;
          border: 2px solid var(--accent);
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }

        video { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          background: #222; 
        }

        .cam-feed { transform: scaleX(-1); }

        .box-label {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .overlay-layer {
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0;
          pointer-events: none; 
          padding: 20px;
          display: flex; 
          flex-direction: column;
        }

        .pos-top-left { justify-content: flex-start; align-items: flex-start; }
        .pos-top-right { justify-content: flex-start; align-items: flex-end; }
        .pos-bottom-left { justify-content: flex-end; align-items: flex-start; }
        .pos-bottom-right { justify-content: flex-end; align-items: flex-end; }

        .brand-badge {
          background: var(--accent); 
          color: white;
          padding: 4px 10px; 
          border-radius: 4px; 
          font-weight: 800; 
          font-size: 0.75rem;
          margin-bottom: 8px; 
          text-transform: uppercase;
          animation: pulse 2s infinite;
        }

        .lower-third {
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          padding: 10px 16px;
          border-left: 4px solid var(--accent);
          border-radius: 0 6px 6px 0;
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn { 
          from { transform: translateX(-20px); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }

        .lt-name { 
          font-weight: 800; 
          font-size: 1rem; 
          color: #fff; 
        }

        .lt-title { 
          font-weight: 400; 
          font-size: 0.8rem; 
          color: #bbb; 
          margin-top: 2px; 
        }

        .no-cam-placeholder {
          position: absolute; 
          inset: 0; 
          background: #111;
          display: flex; 
          align-items: center; 
          justify-content: center;
        }

        .avatar-letter {
          width: 80px; 
          height: 80px; 
          background: var(--accent);
          color: white; 
          font-size: 2rem; 
          font-weight: bold;
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
        }

        .audio-visualizer-mini {
          position: absolute; 
          bottom: 10px; 
          left: 10px; 
          width: 6px; 
          height: 30px;
          background: rgba(0,0,0,0.5); 
          border-radius: 3px; 
          overflow: hidden;
        }

        .audio-visualizer-mini .bar {
          width: 100%; 
          border-radius: 3px;
          position: absolute; 
          bottom: 0; 
          transition: height 0.1s linear;
        }

        .right-sidebar {
          position: relative;
          min-width: 280px;
          max-width: 600px;
          background: #121215;
          border-left: 1px solid rgba(255,255,255,0.08);
          display: flex; 
          flex-direction: column;
          transition: width 0.3s ease;
        }

        .right-sidebar.closed { 
          width: 0 !important;
          min-width: 0;
          overflow: hidden;
          border: none; 
        }

        .sidebar-resize-handle {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: transparent;
          cursor: ew-resize;
          z-index: 100;
          transition: background 0.2s;
        }

        .sidebar-resize-handle:hover {
          background: rgba(92, 77, 255, 0.5);
        }

        .sidebar-resize-handle:active {
          background: #5c4dff;
        }

        .sidebar-tabs-header {
          height: 50px;
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .tab-btn {
          flex: 1; 
          background: transparent; 
          border: none; 
          color: #666;
          cursor: pointer; 
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-btn:hover { 
          color: #fff; 
          background: rgba(255,255,255,0.03); 
        }

        .tab-btn.active { 
          color: var(--accent); 
          border-bottom-color: var(--accent); 
        }

        .sidebar-scrollable {
          flex: 1; 
          overflow-y: auto;
        }

        .tab-content { 
          padding: 1.5rem; 
        }

        .pane-header { 
          font-size: 0.85rem; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          color: #666; 
          margin-bottom: 1.5rem; 
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #ff4444;
          font-size: 0.7rem;
        }

        .live-dot {
          width: 4px;
          height: 4px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .chat-pane { 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          padding: 0; 
        }

        .chat-list { 
          flex: 1; 
          padding: 1rem; 
          overflow-y: auto; 
          display: flex; 
          flex-direction: column; 
          gap: 0.8rem;
          max-height: 400px;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #666;
          text-align: center;
        }

        .empty-chat p {
          margin: 0.5rem 0 0.25rem 0;
          font-weight: 600;
        }

        .empty-chat small {
          font-size: 0.8rem;
        }

        .chat-bubble { 
          font-size: 0.9rem; 
          line-height: 1.4;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          border-left: 3px solid transparent;
        }

        .chat-bubble:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .chat-bubble .user { 
          font-weight: 700; 
          margin-right: 6px; 
        }

        .chat-bubble .text { 
          color: #ddd; 
        }

        .chat-bubble .time {
          font-size: 0.7rem;
          color: #666;
          margin-left: 0.5rem;
        }

        .chat-input-box { 
          padding: 1rem; 
          border-top: 1px solid rgba(255,255,255,0.08); 
        }

        .chat-input-box input { 
          width: 100%; 
          background: #222; 
          border: 1px solid #333;
          padding: 10px; 
          border-radius: 20px; 
          color: white; 
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input-box input:focus {
          border-color: var(--accent);
        }

        .chat-input-box input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .settings-section {
          margin-bottom: 2rem;
        }

        .settings-section h4 {
          margin: 0 0 1rem 0;
          color: white;
          font-size: 0.9rem;
        }

        .quality-section {
          overflow: visible;
        }

        .quality-section :global(.quality-selector) {
          margin-top: 1rem;
        }

        .device-select {
          width: 100%; 
          background: #000; 
          border: 1px solid #333; 
          padding: 10px; 
          color: white; 
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .device-select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .setting-item {
          margin-bottom: 1rem;
        }

        .setting-item label {
          display: block;
          color: #999;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .setting-input {
          width: 100%;
          background: #000;
          border: 1px solid #333;
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .setting-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .color-input {
          width: 100%;
          height: 40px;
          background: #000;
          border: 1px solid #333;
          border-radius: 6px;
          cursor: pointer;
        }

        .studio-dock {
          height: 80px; 
          width: 100%;
          background: #18181b;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 2rem; 
          z-index: 100;
        }

        .dock-group { 
          display: flex; 
          gap: 1rem; 
          align-items: center; 
        }

        .dock-separator { 
          width: 1px; 
          height: 40px; 
          background: rgba(255,255,255,0.1); 
        }
        
        .dock-btn {
          width: 50px; 
          height: 50px; 
          border-radius: 14px;
          background: #27272a; 
          border: none; 
          color: #eee;
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer; 
          transition: all 0.2s;
        }

        .dock-btn:hover { 
          background: #3f3f46; 
          transform: translateY(-2px); 
        }

        .dock-btn.active { 
          background: var(--accent); 
          color: white; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.5); 
        }

        .dock-btn.off { 
          background: #fee2e2; 
          color: #ef4444; 
        }

        .layout-popup { 
          display: flex; 
          gap: 4px; 
          margin-left: 8px; 
        }

        .mini-btn { 
          width: 30px; 
          height: 30px; 
          border-radius: 6px; 
          background: transparent; 
          border: 1px solid #333; 
          color: #888; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.2s;
        }

        .mini-btn:hover {
          border-color: var(--accent);
          color: white;
        }

        .mini-btn.active { 
          background: #333; 
          color: white; 
          border-color: #555; 
        }

        /* Hotkeys Overlay */
        .hotkeys-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .hotkeys-modal {
          background: #1a1a1f;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .hotkeys-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hotkeys-header h3 {
          margin: 0;
          color: white;
          font-size: 1.2rem;
        }

        .hotkeys-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .hotkey-category h4 {
          margin: 0 0 1rem 0;
          color: #5c4dff;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hotkey-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .hotkey-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
        }

        .hotkey-key {
          background: #333;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.8rem;
          border: 1px solid #555;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hotkey-desc {
          color: #ccc;
          font-size: 0.9rem;
          flex: 1;
          margin-left: 1rem;
        }

        .hotkeys-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .hotkeys-footer p {
          margin: 0;
          color: #666;
          font-size: 0.8rem;
        }

        .hotkeys-footer kbd {
          background: #333;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.8rem;
          border: 1px solid #555;
        }
      `}</style>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#09090b',
        color: 'white',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #5c4dff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading studio...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <StudioPageContent />
    </Suspense>
  );
}