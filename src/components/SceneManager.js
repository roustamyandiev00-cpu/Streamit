'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Play, Trash2, Copy, Monitor, Camera, 
  Image, Type, X, Move, Eye, EyeOff, Layers
} from 'lucide-react';

export default function SceneManager({ onSceneChange, currentScene, scenes, onScenesUpdate }) {
  const [selectedScene, setSelectedScene] = useState(currentScene || scenes?.[0]?.id);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [draggedSource, setDraggedSource] = useState(null);

  useEffect(() => {
    if (currentScene) setSelectedScene(currentScene);
  }, [currentScene]);

  const currentSceneData = scenes?.find(s => s.id === selectedScene);

  const addScene = () => {
    const newScene = {
      id: `scene${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      sources: []
    };
    onScenesUpdate([...scenes, newScene]);
    setSelectedScene(newScene.id);
  };

  const deleteScene = (sceneId) => {
    if (scenes.length <= 1) return;
    onScenesUpdate(scenes.filter(s => s.id !== sceneId));
    if (selectedScene === sceneId) setSelectedScene(scenes[0].id);
  };

  const switchToScene = (sceneId) => {
    setSelectedScene(sceneId);
    onSceneChange?.(sceneId);
  };

  const addSource = (type) => {
    if (!currentSceneData) return;
    const newSource = {
      id: `source${Date.now()}`,
      type,
      name: type === 'camera' ? 'Webcam' : type === 'screen' ? 'Screen' : type.charAt(0).toUpperCase() + type.slice(1),
      x: type === 'screen' ? 0 : 100,
      y: type === 'screen' ? 0 : 100,
      width: type === 'screen' ? 1920 : 400,
      height: type === 'screen' ? 1080 : 300,
      visible: true,
      opacity: 1
    };
    const updated = scenes.map(s => s.id === selectedScene ? { ...s, sources: [...s.sources, newSource] } : s);
    onScenesUpdate(updated);
    setSelectedSource(newSource.id);
    setShowAddSource(false);
  };


  const toggleSourceVisibility = (sourceId) => {
    const updated = scenes.map(s => s.id === selectedScene ? {
      ...s,
      sources: s.sources.map(src => src.id === sourceId ? { ...src, visible: !src.visible } : src)
    } : s);
    onScenesUpdate(updated);
  };

  const deleteSource = (sourceId) => {
    const updated = scenes.map(s => s.id === selectedScene ? {
      ...s,
      sources: s.sources.filter(src => src.id !== sourceId)
    } : s);
    onScenesUpdate(updated);
    setSelectedSource(null);
  };

  const getSourceIcon = (type) => {
    switch(type) {
      case 'camera': return <Camera size={16} />;
      case 'screen': return <Monitor size={16} />;
      case 'image': return <Image size={16} />;
      case 'text': return <Type size={16} />;
      default: return <Layers size={16} />;
    }
  };

  const getSourceColor = (type) => {
    switch(type) {
      case 'camera': return '#5c4dff';
      case 'screen': return '#00cc88';
      case 'image': return '#ffaa00';
      case 'text': return '#ff6b6b';
      default: return '#666';
    }
  };

  return (
    <div className="scene-mgr">
      {/* Scene Switcher - Horizontal tabs at top */}
      <div className="scene-tabs">
        {scenes?.map((scene, idx) => (
          <button
            key={scene.id}
            className={`scene-tab ${selectedScene === scene.id ? 'active' : ''} ${currentScene === scene.id ? 'live' : ''}`}
            onClick={() => switchToScene(scene.id)}
          >
            <span className="tab-num">{idx + 1}</span>
            <span className="tab-name">{scene.name}</span>
            {currentScene === scene.id && <span className="live-dot" />}
          </button>
        ))}
        <button className="add-scene-tab" onClick={addScene}>
          <Plus size={16} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="scene-content">
        {/* Sources List */}
        <div className="sources-section">
          <div className="section-header">
            <Layers size={16} />
            <span>Sources</span>
            <button className="add-btn" onClick={() => setShowAddSource(true)}>
              <Plus size={14} />
              Add
            </button>
          </div>
          
          <div className="sources-list">
            {currentSceneData?.sources.length === 0 && (
              <div className="empty-sources">
                <p>No sources yet</p>
                <button onClick={() => setShowAddSource(true)}>
                  <Plus size={14} /> Add your first source
                </button>
              </div>
            )}
            
            {currentSceneData?.sources.map((source, idx) => (
              <div 
                key={source.id}
                className={`source-item ${selectedSource === source.id ? 'selected' : ''} ${!source.visible ? 'hidden' : ''}`}
                onClick={() => setSelectedSource(source.id)}
              >
                <div className="source-icon" style={{ background: `${getSourceColor(source.type)}20`, color: getSourceColor(source.type) }}>
                  {getSourceIcon(source.type)}
                </div>
                <div className="source-info">
                  <span className="source-name">{source.name}</span>
                  <span className="source-type">{source.type}</span>
                </div>
                <div className="source-actions">
                  <button 
                    className={`action-btn ${!source.visible ? 'off' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleSourceVisibility(source.id); }}
                    title={source.visible ? 'Hide' : 'Show'}
                  >
                    {source.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={(e) => { e.stopPropagation(); deleteSource(source.id); }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="preview-section">
          <div className="preview-header">
            <span>Preview</span>
            <span className="scene-label">{currentSceneData?.name}</span>
          </div>
          <div className="preview-canvas">
            {currentSceneData?.sources.filter(s => s.visible).map(source => (
              <div
                key={source.id}
                className={`preview-source ${selectedSource === source.id ? 'selected' : ''}`}
                style={{
                  left: `${(source.x / 1920) * 100}%`,
                  top: `${(source.y / 1080) * 100}%`,
                  width: `${(source.width / 1920) * 100}%`,
                  height: `${(source.height / 1080) * 100}%`,
                  background: getSourceColor(source.type),
                  opacity: source.opacity
                }}
                onClick={() => setSelectedSource(source.id)}
              >
                <span>{source.name}</span>
              </div>
            ))}
            {(!currentSceneData?.sources || currentSceneData.sources.length === 0) && (
              <div className="empty-preview">
                <Monitor size={32} />
                <p>Add sources to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Add Source Modal */}
      {showAddSource && (
        <div className="modal-overlay" onClick={() => setShowAddSource(false)}>
          <div className="add-source-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Source</h3>
              <button onClick={() => setShowAddSource(false)}><X size={20} /></button>
            </div>
            <div className="source-options">
              <button className="source-option" onClick={() => addSource('screen')}>
                <div className="option-icon screen"><Monitor size={24} /></div>
                <div className="option-info">
                  <strong>Screen Share</strong>
                  <span>Share your entire screen or window</span>
                </div>
              </button>
              <button className="source-option" onClick={() => addSource('camera')}>
                <div className="option-icon camera"><Camera size={24} /></div>
                <div className="option-info">
                  <strong>Webcam</strong>
                  <span>Add your camera feed</span>
                </div>
              </button>
              <button className="source-option" onClick={() => addSource('image')}>
                <div className="option-icon image"><Image size={24} /></div>
                <div className="option-info">
                  <strong>Image</strong>
                  <span>Add logo or background image</span>
                </div>
              </button>
              <button className="source-option" onClick={() => addSource('text')}>
                <div className="option-icon text"><Type size={24} /></div>
                <div className="option-info">
                  <strong>Text</strong>
                  <span>Add text overlay or title</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scene-mgr {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 0.75rem;
        }

        /* Scene Tabs */
        .scene-tabs {
          display: flex;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #2d2e36;
          overflow-x: auto;
        }

        .scene-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #2a2b33;
          border: 2px solid transparent;
          border-radius: 8px;
          color: #999;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .scene-tab:hover {
          background: #33343d;
          color: white;
        }

        .scene-tab.active {
          background: #33343d;
          border-color: #5c4dff;
          color: white;
        }

        .scene-tab.live {
          border-color: #ff4444;
        }

        .tab-num {
          width: 20px;
          height: 20px;
          background: #5c4dff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .tab-name {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .add-scene-tab {
          padding: 0.5rem;
          background: transparent;
          border: 1px dashed #444;
          border-radius: 8px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-scene-tab:hover {
          border-color: #5c4dff;
          color: #5c4dff;
        }

        /* Main Content */
        .scene-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1rem;
          flex: 1;
          min-height: 0;
        }

        /* Sources Section */
        .sources-section {
          display: flex;
          flex-direction: column;
          background: #1a1a1f;
          border-radius: 8px;
          border: 1px solid #2d2e36;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #222;
          border-bottom: 1px solid #2d2e36;
          color: #999;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .section-header .add-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.35rem 0.75rem;
          background: #5c4dff;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .section-header .add-btn:hover {
          background: #4a3dd9;
        }

        .sources-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .empty-sources {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #666;
          text-align: center;
        }

        .empty-sources p {
          margin: 0 0 1rem 0;
          font-size: 0.85rem;
        }

        .empty-sources button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #5c4dff;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .source-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #2a2b33;
          border: 2px solid transparent;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .source-item:hover {
          background: #33343d;
        }

        .source-item.selected {
          border-color: #5c4dff;
          background: #33343d;
        }

        .source-item.hidden {
          opacity: 0.5;
        }

        .source-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .source-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .source-name {
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .source-type {
          color: #666;
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .source-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          background: transparent;
          border: 1px solid #444;
          border-radius: 6px;
          color: #999;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #5c4dff;
          color: white;
        }

        .action-btn.off {
          color: #ff6b6b;
          border-color: #ff6b6b33;
        }

        .action-btn.delete:hover {
          border-color: #ff4444;
          color: #ff4444;
          background: #ff444420;
        }


        /* Preview Section */
        .preview-section {
          display: flex;
          flex-direction: column;
          background: #1a1a1f;
          border-radius: 8px;
          border: 1px solid #2d2e36;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #222;
          border-bottom: 1px solid #2d2e36;
          color: #999;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .scene-label {
          color: #5c4dff;
          font-weight: 500;
        }

        .preview-canvas {
          flex: 1;
          position: relative;
          background: #000;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .preview-source {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .preview-source:hover {
          border-color: rgba(255,255,255,0.3);
        }

        .preview-source.selected {
          border-color: white;
          box-shadow: 0 0 0 2px rgba(92, 77, 255, 0.5);
        }

        .preview-source span {
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .empty-preview {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #444;
          gap: 0.5rem;
        }

        .empty-preview p {
          margin: 0;
          font-size: 0.8rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .add-source-modal {
          background: #1a1a1f;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          width: 420px;
          max-width: 90vw;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #2d2e36;
        }

        .modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1rem;
        }

        .modal-header button {
          background: transparent;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          border-radius: 4px;
        }

        .modal-header button:hover {
          background: #2a2b33;
          color: white;
        }

        .source-options {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .source-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #2a2b33;
          border: 1px solid #333;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .source-option:hover {
          border-color: #5c4dff;
          background: #33343d;
          transform: translateX(4px);
        }

        .option-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .option-icon.screen { background: #00cc8820; color: #00cc88; }
        .option-icon.camera { background: #5c4dff20; color: #5c4dff; }
        .option-icon.image { background: #ffaa0020; color: #ffaa00; }
        .option-icon.text { background: #ff6b6b20; color: #ff6b6b; }

        .option-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .option-info strong {
          color: white;
          font-size: 0.9rem;
        }

        .option-info span {
          color: #666;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
