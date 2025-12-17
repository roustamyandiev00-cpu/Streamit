/**
 * Simulcast Manager - Handles multi-platform streaming
 * Forwards RTMP stream to multiple platforms simultaneously using FFmpeg
 */

import { spawn } from 'child_process';
import { logger } from './logger';
import { getPlatformConfig, PLATFORM_RTMP_CONFIGS } from './streamingPresets';

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

// Active simulcast processes per stream
const activeSimulcasts = new Map();

/**
 * Start simulcasting to multiple platforms
 * @param {string} streamKey - Source stream key
 * @param {Array<object>} platforms - Array of platform configs
 * @returns {Promise<object>} Simulcast manager instance
 */
export async function startSimulcast(streamKey, platforms) {
  if (!streamKey || !platforms || platforms.length === 0) {
    throw new Error('Stream key and platforms are required');
  }

  const sourceUrl = `rtmp://localhost:1935/live/${streamKey}`;
  const processes = [];

  // Stop existing simulcast for this stream if any
  await stopSimulcast(streamKey);

  logger.info(`[Simulcast] Starting simulcast for ${streamKey} to ${platforms.length} platforms`);

  for (const platformConfig of platforms) {
    try {
      const process = await startPlatformStream(sourceUrl, platformConfig);
      processes.push({
        platform: platformConfig.platform,
        platformId: platformConfig.platformId,
        process,
        status: 'CONNECTING',
        error: null
      });
    } catch (error) {
      logger.error(`[Simulcast] Failed to start stream to ${platformConfig.platform}`, error);
      processes.push({
        platform: platformConfig.platform,
        platformId: platformConfig.platformId,
        process: null,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  const simulcastInstance = {
    streamKey,
    platforms: processes,
    startTime: new Date(),
    updateStatus: (platformId, status, error = null) => {
      const platform = processes.find(p => p.platformId === platformId);
      if (platform) {
        platform.status = status;
        platform.error = error;
        platform.lastUpdate = new Date();
      }
    },
    stop: async () => {
      await stopSimulcast(streamKey);
    }
  };

  activeSimulcasts.set(streamKey, simulcastInstance);

  return simulcastInstance;
}

/**
 * Start FFmpeg process for a single platform
 * @param {string} sourceUrl - Source RTMP URL
 * @param {object} platformConfig - Platform configuration
 * @returns {Promise<object>} FFmpeg process info
 */
async function startPlatformStream(sourceUrl, platformConfig) {
  const {
    platform,
    rtmpUrl,
    streamKey,
    protocol = 'RTMP',
    bitrate,
    resolution
  } = platformConfig;

  // Get platform-specific settings
  const platformSettings = getPlatformConfig(platform.toUpperCase()) || PLATFORM_RTMP_CONFIGS.YOUTUBE;
  
  // Determine output URL
  const outputUrl = protocol === 'RTMPS' 
    ? `${rtmpUrl}/${streamKey}`
    : `${rtmpUrl}/${streamKey}`;

  // Build FFmpeg arguments
  const ffmpegArgs = [
    '-i', sourceUrl,
    
    // Video encoding
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-b:v', `${bitrate || platformSettings.recommendedBitrate}k`,
    '-maxrate', `${bitrate || platformSettings.recommendedBitrate}k`,
    '-bufsize', `${(bitrate || platformSettings.recommendedBitrate) * 2}k`,
    '-g', `${platformSettings.keyframeInterval * 30}`, // Keyframe interval
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level', '4.0',
    
    // Resolution scaling if needed
    ...(resolution 
      ? ['-vf', `scale=${resolution.split('x')[0]}:${resolution.split('x')[1]}:force_original_aspect_ratio=decrease,pad=${resolution.split('x')[0]}:${resolution.split('x')[1]}:color=black`]
      : []
    ),
    
    // Audio encoding
    '-c:a', 'aac',
    '-b:a', `${platformSettings.audioBitrate}k`,
    '-ar', platformSettings.audioSampleRate.toString(),
    '-ac', '2',
    
    // Output format
    '-f', 'flv',
    
    // Output URL
    outputUrl
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let isRunning = true;
    let errorOutput = '';

    ffmpeg.stdout.on('data', (data) => {
      // FFmpeg typically writes to stderr, but check stdout too
      const message = data.toString();
      if (message.includes('error') || message.includes('Error')) {
        logger.error(`[Simulcast-${platform}] ${message}`);
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;
      
      // Check for connection success
      if (message.includes('Streaming') || message.includes('frame=')) {
        logger.info(`[Simulcast-${platform}] Stream connected successfully`);
      }
      
      // Check for errors
      if (message.includes('error') || message.includes('Error') || message.includes('Connection refused')) {
        logger.error(`[Simulcast-${platform}] ${message}`);
      }
    });

    ffmpeg.on('error', (error) => {
      logger.error(`[Simulcast-${platform}] FFmpeg error:`, error);
      isRunning = false;
      reject(error);
    });

    ffmpeg.on('exit', (code, signal) => {
      isRunning = false;
      if (code !== null && code !== 0) {
        logger.warn(`[Simulcast-${platform}] FFmpeg exited with code ${code}`);
        reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
      } else if (signal) {
        logger.info(`[Simulcast-${platform}] FFmpeg killed with signal ${signal}`);
      }
    });

    // Wait a bit to see if process starts successfully
    setTimeout(() => {
      if (isRunning && !ffmpeg.killed) {
        resolve({
          process: ffmpeg,
          platform,
          outputUrl,
          isRunning: () => isRunning,
          stop: () => {
            if (isRunning) {
              ffmpeg.kill('SIGTERM');
              setTimeout(() => {
                if (!ffmpeg.killed) {
                  ffmpeg.kill('SIGKILL');
                }
              }, 5000);
            }
          }
        });
      } else {
        reject(new Error('FFmpeg process failed to start'));
      }
    }, 2000);
  });
}

/**
 * Stop simulcasting for a stream
 * @param {string} streamKey - Stream key
 */
export async function stopSimulcast(streamKey) {
  const simulcast = activeSimulcasts.get(streamKey);
  if (!simulcast) {
    return;
  }

  logger.info(`[Simulcast] Stopping simulcast for ${streamKey}`);

  // Stop all platform processes
  for (const platform of simulcast.platforms) {
    if (platform.process && platform.process.stop) {
      try {
        platform.process.stop();
        platform.status = 'STOPPED';
      } catch (error) {
        logger.error(`[Simulcast] Error stopping ${platform.platform}`, error);
      }
    }
  }

  activeSimulcasts.delete(streamKey);
}

/**
 * Get simulcast status for a stream
 * @param {string} streamKey - Stream key
 * @returns {object|null} Simulcast status
 */
export function getSimulcastStatus(streamKey) {
  const simulcast = activeSimulcasts.get(streamKey);
  if (!simulcast) {
    return null;
  }

  return {
    streamKey,
    startTime: simulcast.startTime,
    platforms: simulcast.platforms.map(p => ({
      platform: p.platform,
      platformId: p.platformId,
      status: p.status,
      error: p.error,
      lastUpdate: p.lastUpdate
    }))
  };
}

/**
 * Update platform status
 * @param {string} streamKey - Stream key
 * @param {string} platformId - Platform ID
 * @param {string} status - New status
 * @param {string} error - Error message if any
 */
export function updatePlatformStatus(streamKey, platformId, status, error = null) {
  const simulcast = activeSimulcasts.get(streamKey);
  if (simulcast && simulcast.updateStatus) {
    simulcast.updateStatus(platformId, status, error);
  }
}

/**
 * Get all active simulcasts
 * @returns {Array} List of active simulcasts
 */
export function getAllActiveSimulcasts() {
  return Array.from(activeSimulcasts.values()).map(simulcast => ({
    streamKey: simulcast.streamKey,
    startTime: simulcast.startTime,
    platformCount: simulcast.platforms.length,
    platforms: simulcast.platforms.map(p => ({
      platform: p.platform,
      status: p.status
    }))
  }));
}

/**
 * Check if simulcast is active for a stream
 * @param {string} streamKey - Stream key
 * @returns {boolean}
 */
export function isSimulcasting(streamKey) {
  return activeSimulcasts.has(streamKey);
}

