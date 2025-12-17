'use client';

import { useState } from 'react';
import { Settings, Zap, Monitor, Wifi, CheckCircle } from 'lucide-react';
import { QUALITY_PRESETS, getRecommendedPreset, validateStreamSettings } from '../lib/streamingPresets';

export default function StreamQualitySelector({ 
  platformType = 'YOUTUBE',
  currentSettings = null,
  onSettingsChange 
}) {
  const [selectedPreset, setSelectedPreset] = useState(
    currentSettings?.preset || '720p30'
  );
  const [customSettings, setCustomSettings] = useState(
    currentSettings || QUALITY_PRESETS['720p30']
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState(5); // Mbps

  const handlePresetChange = (presetKey) => {
    const preset = QUALITY_PRESETS[presetKey];
    setSelectedPreset(presetKey);
    setCustomSettings(preset);
    onSettingsChange?.(preset);
  };

  const handleCustomChange = (field, value) => {
    const updated = {
      ...customSettings,
      [field]: field === 'resolution' 
        ? { ...customSettings.resolution, ...value }
        : value
    };
    setCustomSettings(updated);
    
    // Validate settings
    const validation = validateStreamSettings(updated, platformType);
    if (validation.valid) {
      onSettingsChange?.(updated);
    }
  };

  const recommendedPreset = getRecommendedPreset(uploadSpeed);

  return (
    <div className="quality-selector">
      <div className="selector-header">
        <div className="header-info">
          <Settings size={20} />
          <div>
            <h3>Stream Quality Settings</h3>
            <p>Configureer de kwaliteit van je stream</p>
          </div>
        </div>
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Zap size={16} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Upload Speed Test */}
      <div className="upload-speed-section">
        <label>
          <Wifi size={16} />
          Upload Speed (Mbps)
        </label>
        <div className="speed-input-group">
          <input
            type="number"
            min="1"
            max="100"
            value={uploadSpeed}
            onChange={(e) => setUploadSpeed(parseFloat(e.target.value))}
            className="speed-input"
          />
          <span className="speed-unit">Mbps</span>
        </div>
        {recommendedPreset && (
          <div className="recommendation">
            <CheckCircle size={14} />
            <span>Recommended: {recommendedPreset.name}</span>
          </div>
        )}
      </div>

      {/* Quality Presets */}
      <div className="presets-grid">
        {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
          <div
            key={key}
            className={`preset-card ${selectedPreset === key ? 'selected' : ''} ${preset.recommended ? 'recommended' : ''}`}
            onClick={() => handlePresetChange(key)}
          >
            <div className="preset-header">
              <Monitor size={18} />
              <h4>{preset.name}</h4>
              {preset.recommended && (
                <span className="recommended-badge">Recommended</span>
              )}
            </div>
            <div className="preset-details">
              <div className="detail-item">
                <span className="label">Resolution:</span>
                <span className="value">{preset.resolution.width}x{preset.resolution.height}</span>
              </div>
              <div className="detail-item">
                <span className="label">FPS:</span>
                <span className="value">{preset.fps}</span>
              </div>
              <div className="detail-item">
                <span className="label">Bitrate:</span>
                <span className="value">{preset.bitrate} kbps</span>
              </div>
            </div>
            <p className="preset-description">{preset.description}</p>
          </div>
        ))}
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="advanced-settings">
          <h4>Custom Settings</h4>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Resolution Width</label>
              <input
                type="number"
                value={customSettings.resolution.width}
                onChange={(e) => handleCustomChange('resolution', { width: parseInt(e.target.value) })}
                min="320"
                max="1920"
                step="8"
              />
            </div>
            <div className="setting-group">
              <label>Resolution Height</label>
              <input
                type="number"
                value={customSettings.resolution.height}
                onChange={(e) => handleCustomChange('resolution', { height: parseInt(e.target.value) })}
                min="180"
                max="1080"
                step="8"
              />
            </div>
            <div className="setting-group">
              <label>FPS</label>
              <input
                type="number"
                value={customSettings.fps}
                onChange={(e) => handleCustomChange('fps', parseInt(e.target.value))}
                min="15"
                max="60"
                step="1"
              />
            </div>
            <div className="setting-group">
              <label>Bitrate (kbps)</label>
              <input
                type="number"
                value={customSettings.bitrate}
                onChange={(e) => handleCustomChange('bitrate', parseInt(e.target.value))}
                min="500"
                max="10000"
                step="100"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .quality-selector {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-info h3 {
          margin: 0 0 0.25rem 0;
          color: white;
          font-size: 1.1rem;
        }

        .header-info p {
          margin: 0;
          color: #999;
          font-size: 0.9rem;
        }

        .advanced-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #444;
          color: #999;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .advanced-toggle:hover {
          border-color: #5c4dff;
          color: white;
        }

        .upload-speed-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #2a2b33;
          border-radius: 8px;
        }

        .upload-speed-section label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .speed-input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .speed-input {
          flex: 1;
          background: #000;
          border: 1px solid #444;
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 1rem;
        }

        .speed-input:focus {
          outline: none;
          border-color: #5c4dff;
        }

        .speed-unit {
          color: #999;
          font-size: 0.9rem;
        }

        .recommendation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          color: #00cc88;
          font-size: 0.9rem;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .preset-card {
          background: #2a2b33;
          border: 2px solid #333;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-card:hover {
          border-color: #5c4dff;
          background: #33343d;
        }

        .preset-card.selected {
          border-color: #5c4dff;
          background: rgba(92, 77, 255, 0.1);
        }

        .preset-card.recommended {
          border-color: #00cc88;
        }

        .preset-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .preset-header h4 {
          margin: 0;
          color: white;
          font-size: 1rem;
          flex: 1;
        }

        .recommended-badge {
          background: #00cc88;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .preset-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .detail-item .label {
          color: #999;
        }

        .detail-item .value {
          color: white;
          font-weight: 600;
        }

        .preset-description {
          margin: 0;
          color: #999;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .advanced-settings {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #333;
        }

        .advanced-settings h4 {
          margin: 0 0 1rem 0;
          color: white;
          font-size: 1rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .setting-group label {
          color: #999;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .setting-group input {
          background: #000;
          border: 1px solid #444;
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .setting-group input:focus {
          outline: none;
          border-color: #5c4dff;
        }
      `}</style>
    </div>
  );
}

