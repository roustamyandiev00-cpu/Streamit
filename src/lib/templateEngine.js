/**
 * Template Engine - Handles template parsing, validation, and application
 */

import { logger } from './logger';

/**
 * Validate template configuration
 * @param {object} config - Template configuration object
 * @returns {object} Validation result
 */
export function validateTemplateConfig(config) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!config.scenes || !Array.isArray(config.scenes) || config.scenes.length === 0) {
    errors.push('Template must have at least one scene');
  }

  if (!config.category) {
    errors.push('Template must have a category');
  }

  // Validate scenes
  if (config.scenes) {
    config.scenes.forEach((scene, index) => {
      if (!scene.id) {
        errors.push(`Scene ${index} must have an id`);
      }
      if (!scene.name) {
        errors.push(`Scene ${index} must have a name`);
      }
      if (!scene.sources || !Array.isArray(scene.sources)) {
        warnings.push(`Scene ${index} has no sources`);
      }
    });
  }

  // Validate audio settings if present
  if (config.audio) {
    if (config.audio.bitrate && (config.audio.bitrate < 64 || config.audio.bitrate > 320)) {
      warnings.push('Audio bitrate should be between 64 and 320 kbps');
    }
  }

  // Validate video settings if present
  if (config.video) {
    if (config.video.resolution) {
      const resolution = config.video.resolution.split('x');
      if (resolution.length !== 2) {
        errors.push('Video resolution must be in format "WIDTHxHEIGHT"');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Parse template configuration from JSON string
 * @param {string} configString - JSON string
 * @returns {object} Parsed configuration
 */
export function parseTemplateConfig(configString) {
  try {
    const config = typeof configString === 'string' 
      ? JSON.parse(configString) 
      : configString;
    
    const validation = validateTemplateConfig(config);
    
    if (!validation.valid) {
      throw new Error(`Invalid template config: ${validation.errors.join(', ')}`);
    }

    return {
      config,
      validation
    };
  } catch (error) {
    logger.error('Error parsing template config', error);
    throw new Error(`Failed to parse template: ${error.message}`);
  }
}

/**
 * Apply template to stream settings
 * @param {object} templateConfig - Template configuration
 * @param {object} currentSettings - Current stream settings (optional)
 * @returns {object} Applied settings
 */
export function applyTemplate(templateConfig, currentSettings = {}) {
  const { config, validation } = parseTemplateConfig(
    typeof templateConfig === 'string' ? templateConfig : JSON.stringify(templateConfig)
  );

  if (!validation.valid) {
    throw new Error(`Cannot apply invalid template: ${validation.errors.join(', ')}`);
  }

  // Merge template with current settings (template takes precedence)
  const appliedSettings = {
    // Scenes
    scenes: config.scenes || currentSettings.scenes || [],
    
    // Audio settings
    audio: {
      ...currentSettings.audio,
      ...config.audio
    },
    
    // Video settings
    video: {
      ...currentSettings.video,
      ...config.video
    },
    
    // Overlay settings
    overlays: config.overlays || currentSettings.overlays || [],
    
    // Branding
    branding: {
      ...currentSettings.branding,
      ...config.branding
    },
    
    // Platform configurations
    platforms: config.platforms || currentSettings.platforms || [],
    
    // Studio settings
    studio: {
      ...currentSettings.studio,
      ...config.studio
    }
  };

  return appliedSettings;
}

/**
 * Create template from current stream settings
 * @param {object} streamSettings - Current stream settings
 * @param {object} metadata - Template metadata
 * @returns {object} Template configuration
 */
export function createTemplateFromSettings(streamSettings, metadata = {}) {
  const templateConfig = {
    version: '1.0',
    category: metadata.category || 'custom',
    name: metadata.name || 'Custom Template',
    description: metadata.description || '',
    
    // Scenes
    scenes: streamSettings.scenes || [],
    
    // Audio
    audio: streamSettings.audio || {},
    
    // Video
    video: streamSettings.video || {},
    
    // Overlays
    overlays: streamSettings.overlays || [],
    
    // Branding
    branding: streamSettings.branding || {},
    
    // Platforms
    platforms: streamSettings.platforms || [],
    
    // Studio settings
    studio: streamSettings.studio || {}
  };

  // Validate the created template
  const validation = validateTemplateConfig(templateConfig);
  
  if (!validation.valid) {
    logger.warn('Created template has validation errors', validation.errors);
  }

  return {
    config: templateConfig,
    validation
  };
}

/**
 * Get default template for category
 * @param {string} category - Template category
 * @returns {object|null} Default template config
 */
export function getDefaultTemplate(category) {
  const defaults = {
    gaming: {
      version: '1.0',
      category: 'gaming',
      name: 'Gaming Stream',
      description: 'Optimized for game streaming with webcam PiP',
      scenes: [
        {
          id: 'game',
          name: 'Game Scene',
          sources: [
            {
              id: 'game_capture',
              type: 'screen',
              name: 'Game Capture',
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              visible: true,
              zIndex: 1
            },
            {
              id: 'webcam',
              type: 'camera',
              name: 'Webcam',
              x: 1600,
              y: 800,
              width: 300,
              height: 200,
              visible: true,
              zIndex: 2
            }
          ]
        }
      ],
      audio: {
        bitrate: 160,
        sampleRate: 48000,
        channels: 'stereo',
        noiseGate: true,
        compression: true
      },
      video: {
        resolution: '1920x1080',
        fps: 60,
        bitrate: 6000
      },
      overlays: [
        {
          type: 'alert',
          position: 'top-right',
          enabled: true
        }
      ],
      branding: {
        brandColor: '#9146FF', // Twitch purple
        showOverlay: true
      },
      platforms: ['twitch', 'youtube']
    },
    
    podcast: {
      version: '1.0',
      category: 'podcast',
      name: 'Podcast Template',
      description: 'Professional podcast setup with multi-guest layout',
      scenes: [
        {
          id: 'podcast',
          name: 'Podcast Scene',
          sources: [
            {
              id: 'host',
              type: 'camera',
              name: 'Host',
              x: 0,
              y: 0,
              width: 960,
              height: 1080,
              visible: true,
              zIndex: 1
            },
            {
              id: 'guest1',
              type: 'camera',
              name: 'Guest 1',
              x: 960,
              y: 0,
              width: 960,
              height: 540,
              visible: true,
              zIndex: 1
            },
            {
              id: 'guest2',
              type: 'camera',
              name: 'Guest 2',
              x: 960,
              y: 540,
              width: 960,
              height: 540,
              visible: true,
              zIndex: 1
            }
          ]
        }
      ],
      audio: {
        bitrate: 128,
        sampleRate: 48000,
        channels: 'stereo',
        voiceIsolation: true,
        autoGain: true
      },
      video: {
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4000
      },
      branding: {
        brandColor: '#5c4dff',
        showOverlay: false,
        showLowerThird: true
      },
      platforms: ['youtube', 'linkedin']
    },
    
    webinar: {
      version: '1.0',
      category: 'webinar',
      name: 'Webinar Template',
      description: 'Professional webinar with screen share and presenter',
      scenes: [
        {
          id: 'webinar',
          name: 'Webinar Scene',
          sources: [
            {
              id: 'screen',
              type: 'screen',
              name: 'Screen Share',
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              visible: true,
              zIndex: 1
            },
            {
              id: 'presenter',
              type: 'camera',
              name: 'Presenter',
              x: 1600,
              y: 800,
              width: 300,
              height: 200,
              visible: true,
              zIndex: 2
            }
          ]
        }
      ],
      audio: {
        bitrate: 128,
        sampleRate: 48000,
        channels: 'stereo',
        clearVoice: true
      },
      video: {
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4500
      },
      overlays: [
        {
          type: 'lowerThird',
          position: 'bottom-left',
          enabled: true
        },
        {
          type: 'logo',
          position: 'top-left',
          enabled: true
        }
      ],
      branding: {
        brandColor: '#1877F2', // Facebook blue
        showOverlay: true,
        showLowerThird: true
      },
      platforms: ['youtube', 'linkedin', 'facebook']
    }
  };

  return defaults[category] || null;
}

/**
 * Merge multiple templates (for template composition)
 * @param {Array<object>} templates - Array of template configs
 * @returns {object} Merged template
 */
export function mergeTemplates(templates) {
  if (!templates || templates.length === 0) {
    throw new Error('At least one template is required');
  }

  const merged = {
    version: '1.0',
    category: templates[0].category || 'custom',
    scenes: [],
    audio: {},
    video: {},
    overlays: [],
    branding: {},
    platforms: []
  };

  templates.forEach(template => {
    if (template.scenes) {
      merged.scenes.push(...template.scenes);
    }
    if (template.audio) {
      merged.audio = { ...merged.audio, ...template.audio };
    }
    if (template.video) {
      merged.video = { ...merged.video, ...template.video };
    }
    if (template.overlays) {
      merged.overlays.push(...template.overlays);
    }
    if (template.branding) {
      merged.branding = { ...merged.branding, ...template.branding };
    }
    if (template.platforms) {
      merged.platforms = [...new Set([...merged.platforms, ...template.platforms])];
    }
  });

  return merged;
}

