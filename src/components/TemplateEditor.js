'use client';

import { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { createTemplateFromSettings } from '../lib/templateEngine';

export default function TemplateEditor({ 
  streamSettings, 
  onSave, 
  onCancel 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Template name is required');
      return;
    }

    setSaving(true);
    try {
      // Create template from current settings
      const template = createTemplateFromSettings(streamSettings, {
        name,
        description,
        category
      });

      // Save to API
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          config: template.config,
          isPublic
        })
      });

      if (res.ok) {
        const saved = await res.json();
        if (onSave) {
          onSave(saved);
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="template-editor">
      <div className="editor-header">
        <h3>Save as Template</h3>
        {onCancel && (
          <button onClick={onCancel} className="close-btn">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Template Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Gaming Setup"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this template..."
            rows={3}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            <option value="custom">Custom</option>
            <option value="gaming">Gaming</option>
            <option value="podcast">Podcast</option>
            <option value="webinar">Webinar</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="form-checkbox"
            />
            <span>Make this template public</span>
          </label>
        </div>
      </div>

      <div className="editor-actions">
        {onCancel && (
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="save-btn"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Template
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .template-editor {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          min-width: 400px;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .editor-header h3 {
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

        .editor-form {
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
          color: #a1a1aa;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .checkbox-label {
          flex-direction: row;
          align-items: center;
          cursor: pointer;
        }

        .form-input, .form-textarea, .form-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.75rem;
          color: white;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #5c4dff;
          background: rgba(255, 255, 255, 0.08);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .form-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #5c4dff;
          cursor: pointer;
        }

        .editor-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          justify-content: flex-end;
        }

        .cancel-btn, .save-btn {
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

        .save-btn {
          background: #5c4dff;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #4c3dff;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

