'use client';

import { useState, useEffect } from 'react';
import {
  Grid, Gamepad2, Mic, Presentation,
  Loader2, Check, Eye, X
} from 'lucide-react';

const CATEGORY_ICONS = {
  gaming: Gamepad2,
  podcast: Mic,
  webinar: Presentation,
  custom: Grid
};

const CATEGORY_COLORS = {
  gaming: '#9146FF',
  podcast: '#5c4dff',
  webinar: '#1877F2',
  custom: '#666'
};

export default function TemplateSelector({ streamId, onTemplateApplied, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/templates?public=true');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId) => {
    if (!streamId) {
      alert('No stream selected');
      return;
    }

    setApplying(true);
    try {
      const res = await fetch(`/api/templates/${templateId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId })
      });

      if (res.ok) {
        if (onTemplateApplied) {
          onTemplateApplied(templateId);
        }
        if (onClose) {
          onClose();
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to apply template');
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template');
    } finally {
      setApplying(false);
    }
  };

  const categories = ['all', 'gaming', 'podcast', 'webinar', 'custom'];
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (previewMode && selectedTemplate) {
    return (
      <div className="template-preview">
        <div className="preview-header">
          <h3>{selectedTemplate.name}</h3>
          <button onClick={() => setPreviewMode(false)} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-info">
            <p className="preview-description">{selectedTemplate.description}</p>
            <div className="preview-details">
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedTemplate.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Scenes:</span>
                <span className="detail-value">
                  {selectedTemplate.config?.scenes?.length || 0}
                </span>
              </div>
              {selectedTemplate.config?.platforms && (
                <div className="detail-item">
                  <span className="detail-label">Platforms:</span>
                  <span className="detail-value">
                    {selectedTemplate.config.platforms.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          {selectedTemplate.config?.scenes && (
            <div className="preview-scenes">
              <h4>Scenes</h4>
              {selectedTemplate.config.scenes.map((scene, index) => (
                <div key={index} className="scene-preview">
                  <span className="scene-name">{scene.name}</span>
                  <span className="scene-sources">
                    {scene.sources?.length || 0} sources
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="preview-actions">
          <button
            onClick={() => setPreviewMode(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={() => applyTemplate(selectedTemplate.id)}
            disabled={applying}
            className="apply-btn"
          >
            {applying ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Applying...
              </>
            ) : (
              <>
                <Check size={16} />
                Apply Template
              </>
            )}
          </button>
        </div>
        <style jsx>{`
          .template-preview {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1.5rem;
            max-width: 600px;
            margin: 0 auto;
          }

          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .preview-header h3 {
            color: white;
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }

          .close-btn {
            background: transparent;
            border: none;
            color: #a1a1aa;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
          }

          .preview-content {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .preview-description {
            color: #a1a1aa;
            margin-bottom: 1rem;
          }

          .preview-details {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 6px;
          }

          .detail-label {
            color: #a1a1aa;
            font-size: 0.85rem;
          }

          .detail-value {
            color: white;
            font-weight: 600;
            font-size: 0.85rem;
          }

          .preview-scenes h4 {
            color: white;
            font-size: 1rem;
            margin-bottom: 0.75rem;
          }

          .scene-preview {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 6px;
            margin-bottom: 0.5rem;
          }

          .scene-name {
            color: white;
            font-weight: 600;
          }

          .scene-sources {
            color: #a1a1aa;
            font-size: 0.85rem;
          }

          .preview-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            justify-content: flex-end;
          }

          .cancel-btn, .apply-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .cancel-btn {
            background: rgba(255, 255, 255, 0.05);
            color: #a1a1aa;
          }

          .cancel-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .apply-btn {
            background: #5c4dff;
            color: white;
          }

          .apply-btn:hover:not(:disabled) {
            background: #4c3dff;
            transform: translateY(-1px);
          }

          .apply-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="template-selector">
      <div className="selector-header">
        <h2>Select Template</h2>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="category-filters">
        {categories.map(category => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              style={{
                borderColor: selectedCategory === category
                  ? (CATEGORY_COLORS[category] || '#5c4dff')
                  : '#333'
              }}
            >
              {category !== 'all' && Icon && (
                <Icon size={16} />
              )}
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p>Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <Grid size={48} className="text-gray-500" />
          <p>No templates found</p>
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map(template => {
            const Icon = CATEGORY_ICONS[template.category] || Grid;
            const color = CATEGORY_COLORS[template.category] || '#666';

            return (
              <div
                key={template.id}
                className="template-card"
                style={{ borderColor: template.isSystem ? color : '#333' }}
              >
                {template.thumbnailUrl ? (
                  <div className="template-thumbnail">
                    <img src={template.thumbnailUrl} alt={template.name} />
                  </div>
                ) : (
                  <div
                    className="template-icon"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <Icon size={32} />
                  </div>
                )}
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description || 'No description'}</p>
                  {template.isSystem && (
                    <span className="system-badge">System</span>
                  )}
                </div>
                <div className="template-actions">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewMode(true);
                    }}
                    className="preview-btn"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={() => applyTemplate(template.id)}
                    disabled={applying}
                    className="apply-btn"
                  >
                    {applying ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Check size={16} />
                    )}
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .template-selector {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          max-height: 80vh;
          overflow-y: auto;
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .selector-header h2 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .category-filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 2px solid;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          color: #a1a1aa;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .category-btn.active {
          background: rgba(92, 77, 255, 0.1);
          color: white;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
          color: #a1a1aa;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .template-card {
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.2s;
        }

        .template-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .template-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
        }

        .template-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .template-icon {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .template-info {
          flex: 1;
        }

        .template-info h3 {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .template-info p {
          color: #a1a1aa;
          font-size: 0.85rem;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .system-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: rgba(92, 77, 255, 0.2);
          color: #5c4dff;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .template-actions {
          display: flex;
          gap: 0.5rem;
        }

        .preview-btn, .apply-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.85rem;
        }

        .preview-btn {
          background: rgba(255, 255, 255, 0.05);
          color: #a1a1aa;
        }

        .preview-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .apply-btn {
          background: #5c4dff;
          color: white;
        }

        .apply-btn:hover:not(:disabled) {
          background: #4c3dff;
        }

        .apply-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

