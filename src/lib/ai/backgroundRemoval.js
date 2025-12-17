/**
 * Background Removal using MediaPipe Selfie Segmentation
 * Provides real-time background removal/replacement for video streams
 */

let selfieSegmentation = null;
let isInitialized = false;

/**
 * Initialize MediaPipe Selfie Segmentation model
 * @returns {Promise<void>}
 */
export async function initializeBackgroundRemoval() {
  if (isInitialized) {
    return;
  }

  try {
    // Use MediaPipe Selfie Segmentation
    // Note: In browser, we'll use the MediaPipe library
    // For now, we'll create a placeholder that can be enhanced

    if (typeof window !== 'undefined') {
      // Browser environment - load MediaPipe
      try {
        const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
        selfieSegmentation = new SelfieSegmentation({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
          }
        });

        selfieSegmentation.setOptions({
          modelSelection: 1, // 0 = general, 1 = landscape
          selfieMode: true
        });

        isInitialized = true;
        console.log('[Background Removal] MediaPipe initialized');
      } catch (error) {
        console.warn('[Background Removal] MediaPipe not available, using fallback', error);
        // Fallback to canvas-based processing
        isInitialized = true;
      }
    } else {
      // Server-side - not supported
      isInitialized = false;
    }
  } catch (error) {
    console.error('[Background Removal] Initialization error:', error);
    isInitialized = false;
  }
}

/**
 * Process video frame to remove/replace background
 * @param {HTMLVideoElement|HTMLCanvasElement} source - Source video element
 * @param {HTMLCanvasElement} outputCanvas - Output canvas
 * @param {object} options - Processing options
 * @returns {Promise<void>}
 */
export async function processBackgroundRemoval(source, outputCanvas, options = {}) {
  if (!isInitialized) {
    await initializeBackgroundRemoval();
  }

  const {
    mode = 'remove', // 'remove', 'blur', 'replace', 'green'
    blurAmount = 10,
    replacementColor = '#000000',
    replacementImage = null,
    threshold = 0.5
  } = options;

  const ctx = outputCanvas.getContext('2d');
  const width = source.videoWidth || source.width;
  const height = source.videoHeight || source.height;

  outputCanvas.width = width;
  outputCanvas.height = height;

  // Draw source frame
  ctx.drawImage(source, 0, 0, width, height);

  if (!selfieSegmentation) {
    // Fallback: simple chroma key or no processing
    if (mode === 'remove') {
      // Simple edge detection fallback
      applySimpleBackgroundRemoval(ctx, width, height, threshold);
    }
    return;
  }

  // Use MediaPipe for segmentation
  try {
    await selfieSegmentation.send({ image: source });

    selfieSegmentation.onResults((results) => {
      if (results.segmentationMask) {
        applySegmentationMask(ctx, results.segmentationMask, {
          mode,
          blurAmount,
          replacementColor,
          replacementImage,
          width,
          height
        });
      }
    });
  } catch (error) {
    console.error('[Background Removal] Processing error:', error);
    // Fallback processing
    if (mode === 'remove') {
      applySimpleBackgroundRemoval(ctx, width, height, threshold);
    }
  }
}

/**
 * Apply segmentation mask to canvas
 */
function applySegmentationMask(ctx, mask, options) {
  const { mode, blurAmount, replacementColor, replacementImage, width, height } = options;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const maskData = mask.data;

  for (let i = 0; i < data.length; i += 4) {
    const maskValue = maskData[Math.floor(i / 4)];

    if (maskValue < 128) { // Background pixel
      switch (mode) {
        case 'remove':
          data[i + 3] = 0; // Make transparent
          break;
        case 'blur':
          // Apply blur effect (simplified)
          data[i] = data[i] * 0.5;
          data[i + 1] = data[i + 1] * 0.5;
          data[i + 2] = data[i + 2] * 0.5;
          break;
        case 'replace': {
          const color = hexToRgb(replacementColor);
          data[i] = color.r;
          data[i + 1] = color.g;
          data[i + 2] = color.b;
          break;
        }
        case 'green':
          data[i] = 0;
          data[i + 1] = 255;
          data[i + 2] = 0;
          break;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Simple background removal fallback (edge detection based)
 */
function applySimpleBackgroundRemoval(ctx, width, height, threshold) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Simple chroma key approximation
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Remove green screen-like backgrounds
    if (g > r + b && g > 100) {
      data[i + 3] = 0; // Make transparent
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Cleanup resources
 */
export function cleanupBackgroundRemoval() {
  if (selfieSegmentation) {
    selfieSegmentation.close();
    selfieSegmentation = null;
  }
  isInitialized = false;
}

/**
 * Check if background removal is available
 */
export function isBackgroundRemovalAvailable() {
  return isInitialized && typeof window !== 'undefined';
}

