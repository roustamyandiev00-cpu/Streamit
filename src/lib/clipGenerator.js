/**
 * AI Clip Generator - Genereert automatisch clips van streams
 * Detecteert highlights, genereert captions en exporteert in verschillende formaten
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const CLIPS_OUTPUT_DIR = process.env.CLIPS_OUTPUT_DIR || './media/clips';
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

/**
 * Detecteert highlights in een video/stream
 * Simuleert AI analyse - kan later worden vervangen door echte AI
 * @param {string} videoPath - Pad naar de video file
 * @param {object} options - Analyse opties
 * @returns {Promise<Array>} Array van highlight momenten
 */
async function detectHighlights(videoPath, options = {}) {
  const {
    minDuration = 15, // Minimum clip lengte in seconden
    maxDuration = 60, // Maximum clip lengte in seconden
    count = 5, // Aantal clips om te genereren
    language = 'en'
  } = options;

  // Simuleer AI analyse - in productie zou dit echte AI gebruiken
  // Analyseert: viewer spikes, chat activiteit, audio energie, visuele veranderingen
  const highlights = [];
  
  // Voor nu: genereer willekeurige highlights als demo
  // In productie: gebruik FFmpeg om audio/video te analyseren
  const videoDuration = await getVideoDuration(videoPath);
  
  if (!videoDuration || videoDuration < minDuration) {
    return [];
  }

  // Genereer highlights verspreid over de video
  const segmentSize = Math.max(minDuration, Math.floor(videoDuration / (count + 1)));
  
  for (let i = 0; i < count && i * segmentSize < videoDuration; i++) {
    const startTime = i * segmentSize + Math.random() * 10;
    const clipDuration = Math.min(
      maxDuration,
      Math.max(minDuration, segmentSize - 5)
    );
    const endTime = Math.min(startTime + clipDuration, videoDuration);
    
    // Simuleer highlight score (0-1)
    const score = 0.6 + Math.random() * 0.4;
    
    // Simuleer highlight type
    const types = ['peak_viewers', 'chat_spike', 'emotion', 'action', 'key_moment'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    highlights.push({
      startTime: Math.floor(startTime),
      endTime: Math.floor(endTime),
      duration: Math.floor(endTime - startTime),
      score,
      type,
      title: `Highlight ${i + 1}`,
      description: `Auto-detected ${type} moment`
    });
  }

  // Sorteer op score (beste eerst)
  return highlights.sort((a, b) => b.score - a.score);
}

/**
 * Haalt video duur op
 */
async function getVideoDuration(videoPath) {
  return new Promise((resolve) => {
    const ffprobe = spawn(FFMPEG_PATH.replace('ffmpeg', 'ffprobe'), [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ]);

    let duration = null;
    ffprobe.stdout.on('data', (data) => {
      duration = parseFloat(data.toString().trim());
    });

    ffprobe.on('close', () => {
      resolve(duration || 0);
    });

    ffprobe.on('error', () => {
      resolve(0);
    });
  });
}

/**
 * Genereert een clip van een video
 * @param {string} sourcePath - Pad naar bron video
 * @param {object} clipConfig - Clip configuratie
 * @returns {Promise<object>} Clip metadata
 */
async function generateClip(sourcePath, clipConfig) {
  const {
    startTime,
    endTime,
    aspectRatio = '9:16',
    resolution,
    outputPath,
    addCaptions = true,
    captionText
  } = clipConfig;

  const duration = endTime - startTime;
  const clipId = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const outputDir = path.join(CLIPS_OUTPUT_DIR, clipId);
  
  await fs.mkdir(outputDir, { recursive: true });

  // Bepaal resolutie op basis van aspect ratio
  let finalResolution = resolution;
  if (!finalResolution) {
    switch (aspectRatio) {
      case '9:16': // Vertical (TikTok, Reels, Shorts)
        finalResolution = '1080x1920';
        break;
      case '16:9': // Horizontal (YouTube)
        finalResolution = '1920x1080';
        break;
      case '1:1': // Square (Instagram)
        finalResolution = '1080x1080';
        break;
      default:
        finalResolution = '1080x1920';
    }
  }

  const [width, height] = finalResolution.split('x').map(Number);
  const outputFile = path.join(outputDir, 'clip.mp4');

  // FFmpeg arguments voor clip generatie
  const ffmpegArgs = [
    '-i', sourcePath,
    '-ss', startTime.toString(),
    '-t', duration.toString(),
    
    // Video encoding
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    
    // Crop/scale naar aspect ratio
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
    
    // Audio
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    
    // Output
    '-y', // Overwrite output file
    outputFile
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs);

    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve({
          clipId,
          outputPath: outputFile,
          outputDir,
          duration: Math.floor(duration),
          resolution: finalResolution,
          aspectRatio,
          status: 'completed'
        });
      } else {
        reject(new Error(`FFmpeg failed with code ${code}: ${errorOutput}`));
      }
    });

    ffmpeg.on('error', (error) => {
      reject(new Error(`FFmpeg error: ${error.message}`));
    });
  });
}

/**
 * Genereert captions/subtitles voor een clip
 * @param {string} videoPath - Pad naar video
 * @param {string} language - Taal code
 * @returns {Promise<string>} Caption tekst
 */
async function generateCaptions(videoPath, language = 'en') {
  // Simuleer caption generatie
  // In productie: gebruik speech-to-text API (Google, AWS, etc.)
  
  // Voor nu: return placeholder
  return `Auto-generated captions for ${path.basename(videoPath)}`;
}

/**
 * Genereert thumbnail voor een clip
 * @param {string} videoPath - Pad naar video
 * @param {string} outputPath - Output pad voor thumbnail
 * @param {number} timestamp - Timestamp in seconden (default: 1)
 */
async function generateThumbnail(videoPath, outputPath, timestamp = 1) {
  const ffmpegArgs = [
    '-i', videoPath,
    '-ss', timestamp.toString(),
    '-vframes', '1',
    '-vf', 'scale=640:-1',
    '-y',
    outputPath
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`Thumbnail generation failed with code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

/**
 * Exporteert clip naar verschillende formaten
 * @param {string} sourcePath - Pad naar bron clip
 * @param {Array<string>} formats - Format array (['mp4', 'webm'])
 * @returns {Promise<object>} URLs voor geëxporteerde formaten
 */
async function exportFormats(sourcePath, formats = ['mp4']) {
  const exports = {};
  const baseName = path.basename(sourcePath, path.extname(sourcePath));
  const outputDir = path.dirname(sourcePath);

  for (const format of formats) {
    const outputPath = path.join(outputDir, `${baseName}.${format}`);
    
    const ffmpegArgs = [
      '-i', sourcePath,
      '-c:v', format === 'webm' ? 'libvpx-vp9' : 'libx264',
      '-c:a', format === 'webm' ? 'libopus' : 'aac',
      '-y',
      outputPath
    ];

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs);
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Export to ${format} failed`));
      });
      ffmpeg.on('error', reject);
    });

    exports[format] = outputPath;
  }

  return exports;
}

export {
  detectHighlights,
  generateClip,
  generateCaptions,
  generateThumbnail,
  exportFormats,
  getVideoDuration,
  CLIPS_OUTPUT_DIR
};

