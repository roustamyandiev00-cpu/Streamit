'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Type, Image, Square, Circle, Move, 
  RotateCw, Palette, Trash2, Copy, 
  Download, Eye, EyeOff 
} from 'lucide-react';

export default function OverlayEditor({ onSave, initialOverlays = [] }) {
  const canvasRef = useRef(null);
  const [overlays, setOverlays] = useState(initialOverlays);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [tool, setTool] = useState('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    drawCanvas();
  }, [overlays, selectedOverlay]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw preview background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw overlays
    overlays.forEach((overlay, index) => {
      if (!overlay.visible) return;

      ctx.save();
      
      // Apply transformations
      ctx.translate(overlay.x + overlay.width / 2, overlay.y + overlay.height / 2);
      ctx.rotate((overlay.rotation || 0) * Math.PI / 180);
      ctx.translate(-overlay.width / 2, -overlay.height / 2);

      switch (overlay.type) {
        case 'text':
          drawTextOverlay(ctx, overlay);
          break;
        case 'rectangle':
          drawRectangleOverlay(ctx, overlay);
          break;
        case 'circle':
          drawCircleOverlay(ctx, overlay);
          break;
        case 'image':
          drawImageOverlay(ctx, overlay);
          break;
      }

      ctx.restore();

      // Draw selection border
      if (selectedOverlay === index) {
        ctx.strokeStyle = '#5c4dff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(overlay.x - 2, overlay.y - 2, overlay.width + 4, overlay.height + 4);
        ctx.setLineDash([]);
      }
    });
  };

  const drawTextOverlay = (ctx, overlay) => {
    ctx.font = `${overlay.fontSize || 24}px ${overlay.fontFamily || 'Arial'}`;
    ctx.fillStyle = overlay.color || '#ffffff';
    ctx.textAlign = overlay.textAlign || 'left';
    
    if (overlay.backgroundColor) {
      ctx.fillStyle = overlay.backgroundColor;
      ctx.fillRect(0, 0, overlay.width, overlay.height);
    }
    
    ctx.fillStyle = overlay.color || '#ffffff';
    ctx.fillText(overlay.text || 'Sample Text', 10, overlay.fontSize || 24);
  };

  const drawRectangleOverlay = (ctx, overlay) => {
    if (overlay.backgroundColor) {
      ctx.fillStyle = overlay.backgroundColor;
      ctx.fillRect(0, 0, overlay.width, overlay.height);
    }
    
    if (overlay.borderColor) {
      ctx.strokeStyle = overlay.borderColor;
      ctx.lineWidth = overlay.borderWidth || 2;
      ctx.strokeRect(0, 0, overlay.width, overlay.height);
    }
  };

  const drawCircleOverlay = (ctx, overlay) => {
    const radius = Math.min(overlay.width, overlay.height) / 2;
    const centerX = overlay.width / 2;
    const centerY = overlay.height / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    if (overlay.backgroundColor) {
      ctx.fillStyle = overlay.backgroundColor;
      ctx.fill();
    }
    
    if (overlay.borderColor) {
      ctx.strokeStyle = overlay.borderColor;
      ctx.lineWidth = overlay.borderWidth || 2;
      ctx.stroke();
    }
  };

  const drawImageOverlay = (ctx, overlay) => {
    if (overlay.imageData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, overlay.width, overlay.height);
      };
      img.src = overlay.imageData;
    }
  };

  const addOverlay = (type) => {
    const newOverlay = {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      visible: true,
      rotation: 0,
      ...getDefaultProps(type)
    };

    setOverlays([...overlays, newOverlay]);
    setSelectedOverlay(overlays.length);
  };

  const getDefaultProps = (type) => {
    switch (type) {
      case 'text':
        return {
          text: 'New Text',
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#ffffff',
          textAlign: 'left'
        };
      case 'rectangle':
        return {
          backgroundColor: '#5c4dff',
          borderColor: '#ffffff',
          borderWidth: 2
        };
      case 'circle':
        return {
          backgroundColor: '#00cc88',
          borderColor: '#ffffff',
          borderWidth: 2
        };
      case 'image':
        return {
          imageData: null
        };
      default:
        return {};
    }
  };

  const updateOverlay = (index, updates) => {
    const newOverlays = [...overlays];
    newOverlays[index] = { ...newOverlays[index], ...updates };
    setOverlays(newOverlays);
  };

  const deleteOverlay = (index) => {
    const newOverlays = overlays.filter((_, i) => i !== index);
    setOverlays(newOverlays);
    setSelectedOverlay(null);
  };

  const duplicateOverlay = (index) => {
    const overlay = { ...overlays[index] };
    overlay.id = Date.now();
    overlay.x += 20;
    overlay.y += 20;
    setOverlays([...overlays, overlay]);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked overlay
    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i];
      if (x >= overlay.x && x <= overlay.x + overlay.width &&
          y >= overlay.y && y <= overlay.y + overlay.height) {
        setSelectedOverlay(i);
        return;
      }
    }

    setSelectedOverlay(null);
  };

  const exportOverlays = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'stream-overlay.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="overlay-editor">
      <div className="editor-toolbar">
        <div className="tool-group">
          <button 
            className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
            onClick={() => setTool('select')}
          >
            <Move size={16} />
          </button>
          <button 
            className="tool-btn"
            onClick={() => addOverlay('text')}
          >
            <Type size={16} />
          </button>
          <button 
            className="tool-btn"
            onClick={() => addOverlay('rectangle')}
          >
            <Square size={16} />
          </button>
          <button 
            className="tool-btn"
            onClick={() => addOverlay('circle')}
          >
            <Circle size={16} />
          </button>
          <button 
            className="tool-btn"
            onClick={() => addOverlay('image')}
          >
            <Image size={16} />
          </button>
        </div>

        <div className="tool-group">
          {selectedOverlay !== null && (
            <>
              <button 
                className="tool-btn"
                onClick={() => duplicateOverlay(selectedOverlay)}
              >
                <Copy size={16} />
              </button>
              <button 
                className="tool-btn delete"
                onClick={() => deleteOverlay(selectedOverlay)}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

        <div className="tool-group">
          <button 
            className="tool-btn"
            onClick={exportOverlays}
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            onClick={handleCanvasClick}
            className="overlay-canvas"
          />
        </div>

        <div className="properties-panel">
          <h3>Layers</h3>
          <div className="layers-list">
            {overlays.map((overlay, index) => (
              <div 
                key={overlay.id}
                className={`layer-item ${selectedOverlay === index ? 'selected' : ''}`}
                onClick={() => setSelectedOverlay(index)}
              >
                <button
                  className="visibility-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOverlay(index, { visible: !overlay.visible });
                  }}
                >
                  {overlay.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <span className="layer-name">
                  {overlay.type} {index + 1}
                </span>
              </div>
            ))}
          </div>

          {selectedOverlay !== null && (
            <div className="properties-form">
              <h4>Properties</h4>
              {renderProperties(overlays[selectedOverlay], selectedOverlay)}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .overlay-editor {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          overflow: hidden;
          max-height: 400px;
        }

        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #2a2b33;
          border-bottom: 1px solid #333;
        }

        .tool-group {
          display: flex;
          gap: 0.5rem;
        }

        .tool-btn {
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid #444;
          color: #999;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .tool-btn:hover {
          border-color: #5c4dff;
          color: white;
        }

        .tool-btn.active {
          background: #5c4dff;
          border-color: #5c4dff;
          color: white;
        }

        .tool-btn.delete:hover {
          border-color: #ff4444;
          color: #ff4444;
        }

        .editor-content {
          display: flex;
          height: 500px;
        }

        .canvas-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 2rem;
        }

        .overlay-canvas {
          border: 1px solid #333;
          cursor: crosshair;
        }

        .properties-panel {
          width: 300px;
          background: #2a2b33;
          border-left: 1px solid #333;
          padding: 1rem;
          overflow-y: auto;
        }

        .properties-panel h3,
        .properties-panel h4 {
          margin: 0 0 1rem 0;
          color: white;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .layers-list {
          margin-bottom: 2rem;
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #333;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .layer-item:hover {
          background: #444;
        }

        .layer-item.selected {
          background: #5c4dff;
        }

        .visibility-btn {
          background: transparent;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 2px;
        }

        .visibility-btn:hover {
          color: white;
        }

        .layer-name {
          flex: 1;
          font-size: 0.9rem;
          color: white;
        }

        .properties-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.8rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          background: #000;
          border: 1px solid #444;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .form-input:focus {
          outline: none;
          border-color: #5c4dff;
        }

        .color-input {
          width: 100%;
          height: 36px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );

  function renderProperties(overlay, index) {
    return (
      <div className="properties-form">
        <div className="form-group">
          <label>Position X</label>
          <input
            type="number"
            className="form-input"
            value={overlay.x}
            onChange={(e) => updateOverlay(index, { x: parseInt(e.target.value) })}
          />
        </div>
        
        <div className="form-group">
          <label>Position Y</label>
          <input
            type="number"
            className="form-input"
            value={overlay.y}
            onChange={(e) => updateOverlay(index, { y: parseInt(e.target.value) })}
          />
        </div>

        <div className="form-group">
          <label>Width</label>
          <input
            type="number"
            className="form-input"
            value={overlay.width}
            onChange={(e) => updateOverlay(index, { width: parseInt(e.target.value) })}
          />
        </div>

        <div className="form-group">
          <label>Height</label>
          <input
            type="number"
            className="form-input"
            value={overlay.height}
            onChange={(e) => updateOverlay(index, { height: parseInt(e.target.value) })}
          />
        </div>

        {overlay.type === 'text' && (
          <>
            <div className="form-group">
              <label>Text</label>
              <input
                type="text"
                className="form-input"
                value={overlay.text}
                onChange={(e) => updateOverlay(index, { text: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Font Size</label>
              <input
                type="number"
                className="form-input"
                value={overlay.fontSize}
                onChange={(e) => updateOverlay(index, { fontSize: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                className="color-input"
                value={overlay.color}
                onChange={(e) => updateOverlay(index, { color: e.target.value })}
              />
            </div>
          </>
        )}

        {(overlay.type === 'rectangle' || overlay.type === 'circle') && (
          <>
            <div className="form-group">
              <label>Background Color</label>
              <input
                type="color"
                className="color-input"
                value={overlay.backgroundColor}
                onChange={(e) => updateOverlay(index, { backgroundColor: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Border Color</label>
              <input
                type="color"
                className="color-input"
                value={overlay.borderColor}
                onChange={(e) => updateOverlay(index, { borderColor: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    );
  }
}