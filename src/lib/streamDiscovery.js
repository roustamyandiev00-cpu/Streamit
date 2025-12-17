/**
 * Stream Discovery Service
 * Monitort HLS manifesten en rapporteert stream status
 * Geïnspireerd op rtmp-live repository Discovery service
 */

const fs = require('fs').promises;
const path = require('path');
const { HLS_OUTPUT_DIR } = require('./hlsConverter');

// Store active streams and their FFmpeg processes
const activeStreams = new Map(); // streamKey -> { ffmpegProcess, lastSeen, status }

/**
 * Check if a stream is active by checking if HLS manifest exists and is recent
 */
async function isStreamActive(streamKey) {
  const manifestPath = path.join(HLS_OUTPUT_DIR, streamKey, 'index.m3u8');
  
  try {
    const stats = await fs.stat(manifestPath);
    const now = Date.now();
    const lastModified = stats.mtimeMs;
    const age = now - lastModified;
    
    // Stream is active if manifest was modified in last 10 seconds
    return age < 10000;
  } catch (error) {
    return false;
  }
}

/**
 * Get all active streams
 */
async function getActiveStreams() {
  try {
    const entries = await fs.readdir(HLS_OUTPUT_DIR, { withFileTypes: true });
    const active = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const streamKey = entry.name;
        const isActive = await isStreamActive(streamKey);
        
        if (isActive) {
          active.push({
            streamKey,
            manifestUrl: `/hls/${streamKey}/index.m3u8`,
            lastSeen: new Date()
          });
        }
      }
    }

    return active;
  } catch (error) {
    // Directory doesn't exist yet
    if (error.code === 'ENOENT') {
      await fs.mkdir(HLS_OUTPUT_DIR, { recursive: true });
      return [];
    }
    throw error;
  }
}

/**
 * Register an active stream conversion
 */
function registerStreamConversion(streamKey, conversion) {
  activeStreams.set(streamKey, {
    conversion,
    status: 'LIVE',
    startedAt: new Date(),
    lastSeen: new Date()
  });
}

/**
 * Unregister a stream conversion
 */
function unregisterStreamConversion(streamKey) {
  const stream = activeStreams.get(streamKey);
  if (stream && stream.conversion && stream.conversion.cleanup) {
    stream.conversion.cleanup();
  }
  activeStreams.delete(streamKey);
}

/**
 * Get stream info
 */
function getStreamInfo(streamKey) {
  return activeStreams.get(streamKey) || null;
}

/**
 * Update stream last seen timestamp
 */
function updateStreamLastSeen(streamKey) {
  const stream = activeStreams.get(streamKey);
  if (stream) {
    stream.lastSeen = new Date();
  }
}

/**
 * Monitor streams and cleanup inactive ones
 */
async function startStreamMonitoring(cleanupInterval = 30000) {
  setInterval(async () => {
    for (const [streamKey, streamInfo] of activeStreams.entries()) {
      const isActive = await isStreamActive(streamKey);
      
      if (!isActive) {
        const timeSinceLastSeen = Date.now() - streamInfo.lastSeen.getTime();
        
        // If stream inactive for more than 30 seconds, cleanup
        if (timeSinceLastSeen > 30000) {
          // eslint-disable-next-line no-console
          console.log(`[Discovery] Stream ${streamKey} appears inactive, cleaning up...`);
          unregisterStreamConversion(streamKey);
        }
      } else {
        updateStreamLastSeen(streamKey);
      }
    }
  }, cleanupInterval);

  // eslint-disable-next-line no-console
  console.log('[Discovery] Stream monitoring started');
}

/**
 * Get stream playback information (similar to rtmp-live API)
 */
async function getStreamPlaybackInfo(streamKey) {
  const isActive = await isStreamActive(streamKey);
  const streamInfo = getStreamInfo(streamKey);

  if (!isActive && !streamInfo) {
    return null;
  }

  return {
    streamKey,
    name: streamKey,
    manifest: 'index.m3u8',
    manifestUrl: `/hls/${streamKey}/index.m3u8`,
    host: 'localhost',
    port: 3001,
    status: isActive ? 'LIVE' : 'ENDED',
    startedAt: streamInfo?.startedAt || null
  };
}

module.exports = {
  isStreamActive,
  getActiveStreams,
  registerStreamConversion,
  unregisterStreamConversion,
  getStreamInfo,
  getStreamPlaybackInfo,
  startStreamMonitoring
};

