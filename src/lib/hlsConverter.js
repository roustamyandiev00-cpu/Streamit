/**
 * HLS Converter - Converteert RTMP streams naar HLS voor browser playback
 * Geïnspireerd op rtmp-live repository architectuur
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || './media/hls';
const SEGMENT_DURATION = 2; // seconds;
const PLAYLIST_SIZE = 3; // number of segments to keep;

/**
 * Start HLS conversie voor een RTMP stream
 * @param {string} streamKey - De stream key
 * @param {object} quality - Quality settings (bitrate, resolution, fps)
 * @returns {Promise<object>} FFmpeg process en cleanup functie
 */
async function convertRTMPToHLS(streamKey, quality = {}) {
  const outputPath = path.join(HLS_OUTPUT_DIR, streamKey);
  
  // Ensure output directory exists
  try {
    await fs.mkdir(outputPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create HLS output directory: ${error.message}`);
    throw error;
  }

  const hlsManifest = path.join(outputPath, 'index.m3u8');
  const rtmpInput = `rtmp://localhost:1935/live/${streamKey}`;

  // FFmpeg arguments voor RTMP naar HLS conversie
  const ffmpegArgs = [
    '-i', rtmpInput, // Input from RTMP server
    
    // Video encoding
    '-c:v', 'libx264',
    '-preset', quality.preset || 'veryfast',
    '-b:v', `${quality.bitrate || 2500}k`,
    '-maxrate', `${quality.bitrate || 2500}k`,
    '-bufsize', `${(quality.bitrate || 2500) * 2}k`,
    '-g', `${(quality.fps || 30) * 2}`, // Keyframe interval
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'baseline',
    '-level', '3.0',
    
    // Resolution scaling (if needed)
    ...(quality.resolution 
      ? ['-vf', `scale=${quality.resolution.width}:${quality.resolution.height}`]
      : []
    ),
    
    // Audio encoding
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-ac', '2',
    
    // HLS output options
    '-f', 'hls',
    '-hls_time', SEGMENT_DURATION.toString(),
    '-hls_list_size', PLAYLIST_SIZE.toString(),
    '-hls_flags', 'delete_segments', // Delete old segments
    '-hls_segment_filename', path.join(outputPath, 'segment_%03d.ts'),
    
    hlsManifest
  ];

  console.log(`[HLS] Starting conversion for stream: ${streamKey}`);
  console.log(`[HLS] Output: ${hlsManifest}`);

  // Use FFmpeg from PATH or check common locations
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const ffmpeg = spawn(ffmpegPath, ffmpegArgs, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let isRunning = true;

  // Log FFmpeg output
  ffmpeg.stdout.on('data', (data) => {
    console.log(`[HLS-${streamKey}] ${data}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    const message = data.toString();
    // FFmpeg writes to stderr, filter out verbose logs
    if (message.includes('error') || message.includes('Error')) {
      console.error(`[HLS-${streamKey}] ERROR: ${message}`);
    }
  });

  ffmpeg.on('error', (error) => {
    console.error(`[HLS-${streamKey}] FFmpeg error:`, error);
    isRunning = false;
  });

  ffmpeg.on('exit', (code, signal) => {
    isRunning = false;
    if (code !== null && code !== 0) {
      console.log(`[HLS-${streamKey}] FFmpeg exited with code ${code}`);
    } else if (signal) {
      console.log(`[HLS-${streamKey}] FFmpeg killed with signal ${signal}`);
    } else {
      console.log(`[HLS-${streamKey}] FFmpeg process ended`);
    }
  });

  // Cleanup functie
  const cleanup = async () => {
    if (isRunning) {
      console.log(`[HLS-${streamKey}] Stopping FFmpeg process...`);
      ffmpeg.kill('SIGTERM');
      
      // Wait a bit then force kill if needed
      setTimeout(() => {
        if (!ffmpeg.killed) {
          ffmpeg.kill('SIGKILL');
        }
      }, 5000);
    }

    // Cleanup HLS files after a delay
    setTimeout(async () => {
      try {
        await fs.rm(outputPath, { recursive: true, force: true });
        console.log(`[HLS-${streamKey}] Cleaned up HLS files`);
      } catch (error) {
        console.error(`[HLS-${streamKey}] Failed to cleanup files:`, error);
      }
    }, 10000); // Wait 10 seconds before cleanup
  };

  return {
    process: ffmpeg,
    cleanup,
    outputPath,
    manifestUrl: `/hls/${streamKey}/index.m3u8`,
    isRunning: () => isRunning
  };
}

/**
 * Check of FFmpeg beschikbaar is
 */
async function checkFFmpegAvailable() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    ffmpeg.on('error', () => resolve(false));
    ffmpeg.on('exit', (code) => resolve(code === 0));
    ffmpeg.on('close', (code) => resolve(code === 0));
  });
}

/**
 * Get HLS manifest URL voor een stream
 */
function getHLSManifestUrl(streamKey) {
  return `/hls/${streamKey}/index.m3u8`;
}

/**
 * Get HLS playback URL (voor gebruik in video players)
 */
function getHLSPlaybackUrl(streamKey, baseUrl = 'http://localhost:3001') {
  return `${baseUrl}/hls/${streamKey}/index.m3u8`;
}

module.exports = {
  convertRTMPToHLS,
  checkFFmpegAvailable,
  getHLSManifestUrl,
  getHLSPlaybackUrl,
  HLS_OUTPUT_DIR
};

