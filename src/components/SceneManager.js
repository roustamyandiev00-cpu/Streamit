'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Plus, Play, Trash2, Copy, Eye, EyeOff,
  Monitor, Camera, Image, Type, X
} from 'lucide-react';

export default function SceneManager({ onSceneChange, currentScene, scenes, onScenesUpdate }) {
  const [selectedScene, setSelectedScene] = useState(currentScene || (scenes?.[0]?.id || 'scene1'));
  const [selectedSource, setSelectedSource] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (scenes && scenes.length > 0 && !scenes.find(s => s.id === selectedScene)) {
      setSelectedScene(scenes[0].id);
    }
  }, [scenes, selectedScene]);

  useEffect(() => {
    if (currentScene) {
      setSelectedScene(currentScene);
    }
  }, [currentScene]);

  useEffect(() => {
    drawScenePreview();
  }, [scenes, selectedScene, selectedSource]);

  const drawScenePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !scenes) return;

    const ctx = canvas.getContext('2d');
    const scene = scenes.find(s => s.id === selectedScene);
    if (!scene) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 17) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw sources
    scene.sources.forEach((source) => {
      if (!source.visible) return;

      const scaleX = canvas.width / 1920;
      const scaleY = canvas.height / 1080;
      
      const x = source.x * scaleX;
      const y = source.y * scaleY;
      const width = source.width * scaleX;
      const height = source.height * scaleY;

      ctx.save();
      ctx.globalAlpha = source.opacity || 1;

      // Draw source rectangle with better colors
      switch (source.type) {
        case 'camera':
          ctx.fillStyle = '#5c4dff';
          break;
        case 'screen':
          ctx.fillStyle = '#00cc88';
          break;
        case 'image':
          ctx.fillStyle = '#ffaa00';
          break;
        case 'text':
          ctx.fillStyle = '#ff4444';
          break;
        default:
          ctx.fillStyle = '#666';
      }

      ctx.fillRect(x, y, width, height);

      // Draw source label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(source.name, x + width/2, y + height/2);

      // Draw selection border (dashed)
      if (selectedSource === source.id) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  };

  const addScene = () => {
    const newScene = {
      id: `scene${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      sources: []
    };
    onScenesUpdate([...scenes, newScene]);
    setSelectedScene(newScene.id);
  };

  const duplicateScene = (sceneId) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const newScene = {
      ...scene,
      id: `scene${Date.now()}`,
      name: `${scene.name} Copy`,
      sources: scene.sources.map(source => ({
        ...source,
        id: `${source.id}_copy_${Date.now()}`
      }))
    };
    onScenesUpdate([...scenes, newScene]);
  };

  const deleteScene = (sceneId) => {
    if (scenes.length <= 1) return;
    onScenesUpdate(scenes.filter(s => s.id !== sceneId));
    if (selectedScene === sceneId) {
      setSelectedScene(scenes[0].id);
    }
  };

  const addSource = (type) => {
    const scene = scenes.find(s => s.id === selectedScene);
    if (!scene) return;

    const newSource = {
      id: `source${Date.now()}`,
      type,
      name: getSourceName(type),
      x: type === 'screen' ? 0 : 100,
      y: type === 'screen' ? 0 : 100,
      width: getDefaultWidth(type),
      height: getDefaultHeight(type),
      visible: true,
      opacity: 1,
      zIndex: scene.sources.length + 1
    };

    const updatedScenes = scenes.map(s => 
      s.id === selectedScene 
        ? { ...s, sources: [...s.sources, newSource] }
        : s
    );
    onScenesUpdate(updatedScenes);
    setSelectedSource(newSource.id);
    setShowSourceModal(false);
  };

  const getSourceName = (type) => {
    switch (type) {
      case 'camera': return 'Camera';
      case 'screen': return 'Desktop';
      case 'image': return 'Image';
      case 'text': return 'Text';
      default: return 'Source';
    }
  };

  const getDefaultWidth = (type) => {
    switch (type) {
      case 'camera': return 400;
      case 'screen': return 1920;
      case 'image': return 400;
      case 'text': return 300;
      default: return 400;
    }
  };

  const getDefaultHeight = (type) => {
    switch (type) {
      case 'camera': return 300;
      case 'screen': return 1080;
      case 'image': return 300;
      case 'text': return 100;
      default: return 300;
    }
  };

  const updateSource = (sourceId, updates) => {
    const updatedScenes = scenes.map(scene => 
      scene.id === selectedScene
        ? {
            ...scene,
            sources: scene.sources.map(source =>
              source.id === sourceId ? { ...source, ...updates } : source
            )
          }
        : scene
    );
    onScenesUpdate(updatedScenes);
  };

  const deleteSource = (sourceId) => {
    const updatedScenes = scenes.map(scene => 
      scene.id === selectedScene
        ? {
            ...scene,
            sources: scene.sources.filter(source => source.id !== sourceId)
          }
        : scene
    );
    onScenesUpdate(updatedScenes);
    setSelectedSource(null);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (1920 / canvas.width);
    const y = (e.clientY - rect.top) * (1080 / canvas.height);

    const scene = scenes.find(s => s.id === selectedScene);
    if (!scene) return;

    // Find clicked source (check from top to bottom)
    for (let i = scene.sources.length - 1; i >= 0; i--) {
      const source = scene.sources[i];
      if (x >= source.x && x <= source.x + source.width &&
          y >= source.y && y <= source.y + source.height) {
        setSelectedSource(source.id);
        return;
      }
    }

    setSelectedSource(null);
  };

  const switchToScene = (sceneId) => {
    setSelectedScene(sceneId);
    onSceneChange?.(sceneId);
  };

  const currentSceneData = scenes.find(s => s.id === selectedScene);
  const selectedSourceData = currentSceneData?.sources.find(s => s.id === selectedSource);

  return (
    <div className="scene-manager">
      {/* Scenes List - Left Side */}
      <div className="scenes-panel">
        <div className="scenes-header">
          <h3>Scenes</h3>
          <button className="add-scene-btn" onClick={addScene} title="Add Scene">
            <Plus size={18} />
          </button>
        </div>

        <div className="scenes-list">
          {scenes.map(scene => {
            const sourceCount = scene.sources.length;
            return (
              <div 
                key={scene.id}
                className={`scene-card ${selectedScene === scene.id ? 'selected' : ''} ${currentScene === scene.id ? 'live' : ''}`}
                onClick={() => setSelectedScene(scene.id)}
              >
                <div className="scene-thumbnail">
                  {sourceCount > 0 ? (
                    <div className="source-badge">{sourceCount}</div>
                  ) : (
                    <div className="empty-label">Empty</div>
                  )}
                </div>
                <div className="scene-details">
                  <div className="scene-title">{scene.name}</div>
                  <div className="scene-sources">
                    {scene.sources.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="source-indicator"></div>
                    ))}
                    {scene.sources.length > 3 && (
                      <span className="more-indicator">+{scene.sources.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="scene-actions">
                  <button 
                    className="scene-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      switchToScene(scene.id);
                    }}
                    title="Go Live"
                  >
                    <Play size={14} />
                  </button>
                  <button 
                    className="scene-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateScene(scene.id);
                    }}
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene Editor - Right Side */}
      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-title">
            <h4>Scene Editor</h4>
            <span className="scene-name">{currentSceneData?.name || 'No Scene'}</span>
          </div>
          <div className="editor-actions">
            <button 
              className="editor-btn"
              onClick={() => setShowSourceModal(true)}
              title="Add Source"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            onClick={handleCanvasClick}
            className="scene-canvas"
          />
        </div>

        {/* Source Properties */}
        {selectedSourceData && (
          <div className="source-properties">
            <div className="properties-header">
              <h5>{selectedSourceData.name}</h5>
              <button 
                className="delete-source-btn" 
                onClick={() => deleteSource(selectedSource)}
                title="Delete Source"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="properties-form">
              <div className="form-group">
                <label>X Position</label>
                <input
                  type="number"
                  value={selectedSourceData.x}
                  onChange={(e) => updateSource(selectedSource, { x: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Y Position</label>
                <input
                  type="number"
                  value={selectedSourceData.y}
                  onChange={(e) => updateSource(selectedSource, { y: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedSourceData && (
          <div className="no-source-selected">
            <p>Click on a source in the preview to edit</p>
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      {showSourceModal && (
        <div className="modal-overlay" onClick={() => setShowSourceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Source</h3>
              <button className="close-modal-btn" onClick={() => setShowSourceModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="source-types-grid">
              <button 
                className="source-type-card"
                onClick={() => addSource('screen')}
              >
                <div className="source-icon screen">
                  <Monitor size={28} />
                </div>
                <span>Screen</span>
              </button>
              
              <button 
                className="source-type-card"
                onClick={() => addSource('camera')}
              >
                <div className="source-icon camera">
                  <Camera size={28} />
                </div>
                <span>Camera</span>
              </button>
              
              <button 
                className="source-type-card"
                onClick={() => addSource('image')}
              >
                <div className="source-icon image">
                  <Image size={28} />
                </div>
                <span>Image</span>
              </button>
              
              <button 
                className="source-type-card"
                onClick={() => addSource('text')}
              >
                <div className="source-icon text">
                  <Type size={28} />
                </div>
                <span>Text</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scene-manager {
          display: flex;
          gap: 1rem;
          height: 100%;
          min-height: 500px;
        }

        /* Scenes Panel - Left */
        .scenes-panel {
          width: 200px;
          background: #1a1a1f;
          border-radius: 8px;
          border: 1px solid #2d2e36;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .scenes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #2d2e36;
        }

        .scenes-header h3 {
          margin: 0;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .add-scene-btn {
          background: #5c4dff;
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .add-scene-btn:hover {
          background: #4a3dd9;
          transform: scale(1.05);
        }

        .scenes-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .scene-card {
          background: #2a2b33;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
          overflow: hidden;
        }

        .scene-card:hover {
          background: #33343d;
        }

        .scene-card.selected {
          border-color: #5c4dff;
          background: #33343d;
        }

        .scene-card.live {
          border-color: #ff4444;
        }

        .scene-thumbnail {
          width: 100%;
          height: 60px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .source-badge {
          background: #5c4dff;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .empty-label {
          color: #666;
          font-size: 0.75rem;
        }

        .scene-details {
          padding: 0.5rem;
        }

        .scene-title {
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .scene-sources {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .source-indicator {
          width: 4px;
          height: 4px;
          background: #666;
          border-radius: 50%;
        }

        .more-indicator {
          color: #666;
          font-size: 0.7rem;
        }

        .scene-actions {
          display: flex;
          gap: 0.25rem;
          padding: 0 0.5rem 0.5rem;
        }

        .scene-action-btn {
          background: transparent;
          border: 1px solid #444;
          color: #999;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .scene-action-btn:hover {
          border-color: #5c4dff;
          color: white;
          background: rgba(92, 77, 255, 0.1);
        }

        /* Editor Panel - Right */
        .editor-panel {
          flex: 1;
          background: #1a1a1f;
          border-radius: 8px;
          border: 1px solid #2d2e36;
          display: flex;
          flex-direction: column;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #2d2e36;
        }

        .editor-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .editor-title h4 {
          margin: 0;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .editor-title .scene-name {
          color: #999;
          font-size: 0.75rem;
        }

        .editor-actions {
          display: flex;
          gap: 0.5rem;
        }

        .editor-btn {
          background: transparent;
          border: 1px solid #444;
          color: #999;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .editor-btn:hover {
          border-color: #5c4dff;
          color: white;
          background: rgba(92, 77, 255, 0.1);
        }

        .canvas-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 1rem;
          min-height: 200px;
        }

        .scene-canvas {
          border: 1px solid #333;
          cursor: crosshair;
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 4px;
        }

        .source-properties {
          border-top: 1px solid #2d2e36;
          padding: 1rem;
          background: #1a1a1f;
        }

        .properties-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .properties-header h5 {
          margin: 0;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .delete-source-btn {
          background: transparent;
          border: 1px solid #ff4444;
          color: #ff4444;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .delete-source-btn:hover {
          background: rgba(255, 68, 68, 0.1);
        }

        .properties-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .form-group label {
          color: #999;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .form-group input {
          background: #000;
          border: 1px solid #444;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #5c4dff;
        }

        .no-source-selected {
          border-top: 1px solid #2d2e36;
          padding: 1rem;
          text-align: center;
        }

        .no-source-selected p {
          color: #666;
          font-size: 0.8rem;
          margin: 0;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #1a1a1f;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
          width: 400px;
          max-width: 90vw;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1rem;
          font-weight: 600;
        }

        .close-modal-btn {
          background: transparent;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-modal-btn:hover {
          background: #2a2b33;
          color: white;
        }

        .source-types-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .source-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: #2a2b33;
          border: 1px solid #333;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .source-type-card:hover {
          border-color: #5c4dff;
          background: #33343d;
          transform: translateY(-2px);
        }

        .source-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .source-icon.screen {
          background: rgba(0, 204, 136, 0.15);
          color: #00cc88;
        }

        .source-icon.camera {
          background: rgba(92, 77, 255, 0.15);
          color: #5c4dff;
        }

        .source-icon.image {
          background: rgba(255, 170, 0, 0.15);
          color: #ffaa00;
        }

        .source-icon.text {
          background: rgba(255, 68, 68, 0.15);
          color: #ff4444;
        }

        .source-type-card span {
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
