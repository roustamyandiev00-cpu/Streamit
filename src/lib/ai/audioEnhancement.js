/**
 * Audio Enhancement - Noise reduction, auto gain, voice isolation
 * Uses Web Audio API for real-time processing
 */

let audioContext = null;
let sourceNode = null;
let gainNode = null;
let compressorNode = null;
let filterNode = null;
let analyserNode = null;

/**
 * Initialize audio enhancement
 * @param {MediaStream} audioStream - Audio stream
 * @returns {Promise<object>} Enhanced audio nodes
 */
export async function initializeAudioEnhancement(audioStream) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create source from stream
    sourceNode = audioContext.createMediaStreamSource(audioStream);
    
    // Create gain node for auto gain control
    gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    
    // Create compressor for dynamic range control
    compressorNode = audioContext.createDynamicsCompressor();
    compressorNode.threshold.value = -24;
    compressorNode.knee.value = 30;
    compressorNode.ratio.value = 12;
    compressorNode.attack.value = 0.003;
    compressorNode.release.value = 0.25;
    
    // Create high-pass filter for noise reduction
    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'highpass';
    filterNode.frequency.value = 80; // Remove low-frequency noise
    
    // Create analyser for level monitoring
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;
    
    // Connect nodes: Source -> Filter -> Compressor -> Gain -> Analyser
    sourceNode.connect(filterNode);
    filterNode.connect(compressorNode);
    compressorNode.connect(gainNode);
    gainNode.connect(analyserNode);
    
    // Create output stream
    const destination = audioContext.createMediaStreamDestination();
    analyserNode.connect(destination);
    
    console.log('[Audio Enhancement] Initialized');
    
    return {
      sourceNode,
      gainNode,
      compressorNode,
      filterNode,
      analyserNode,
      outputStream: destination.stream
    };
  } catch (error) {
    console.error('[Audio Enhancement] Initialization error:', error);
    return null;
  }
}

/**
 * Enable/configure noise reduction
 * @param {object} options - Noise reduction options
 */
export function configureNoiseReduction(options = {}) {
  if (!filterNode) return;

  const {
    enabled = true,
    cutoffFrequency = 80, // Hz
    highPassQ = 1
  } = options;

  if (enabled) {
    filterNode.type = 'highpass';
    filterNode.frequency.value = cutoffFrequency;
    filterNode.Q.value = highPassQ;
  } else {
    // Bypass filter
    filterNode.frequency.value = 20; // Very low, effectively bypass
  }
}

/**
 * Enable/configure auto gain control
 * @param {object} options - AGC options
 */
export function configureAutoGain(options = {}) {
  if (!gainNode) return;

  const {
    enabled = true,
    targetLevel = 0.7, // 0-1
    maxGain = 2.0,
    minGain = 0.5,
    attackTime = 0.01,
    releaseTime = 0.1
  } = options;

  if (!enabled) {
    gainNode.gain.value = 1.0;
    return;
  }

  // Auto gain control loop
  if (analyserNode) {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const adjustGain = () => {
      analyserNode.getByteFrequencyData(dataArray);
      
      // Calculate average level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength / 255; // Normalize to 0-1
      
      // Adjust gain to reach target level
      const currentGain = gainNode.gain.value;
      const targetGain = targetLevel / (average + 0.001); // Avoid division by zero
      const clampedGain = Math.max(minGain, Math.min(maxGain, targetGain));
      
      // Smooth gain adjustment
      const gainDiff = clampedGain - currentGain;
      const timeConstant = gainDiff > 0 ? attackTime : releaseTime;
      const newGain = currentGain + gainDiff * timeConstant * 10;
      
      gainNode.gain.value = Math.max(minGain, Math.min(maxGain, newGain));
      
      if (enabled) {
        requestAnimationFrame(adjustGain);
      }
    };
    
    adjustGain();
  }
}

/**
 * Configure voice isolation (EQ adjustments)
 * @param {object} options - Voice isolation options
 */
export function configureVoiceIsolation(options = {}) {
  if (!filterNode) return;

  const {
    enabled = true,
    boostFrequencies = [2000, 4000], // Hz - voice frequencies
    cutFrequencies = [60, 120] // Hz - low frequency noise
  } = options;

  if (enabled) {
    // High-pass filter already removes low frequencies
    filterNode.frequency.value = Math.max(...cutFrequencies);
    
    // For more advanced EQ, would need multiple filter nodes
    // This is a simplified version
  }
}

/**
 * Get current audio level
 * @returns {number} Audio level (0-1)
 */
export function getAudioLevel() {
  if (!analyserNode) return 0;

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  
  return (sum / bufferLength) / 255;
}

/**
 * Get audio frequency data for visualization
 * @returns {Uint8Array} Frequency data
 */
export function getFrequencyData() {
  if (!analyserNode) return new Uint8Array(0);

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);
  
  return dataArray;
}

/**
 * Set manual gain (override auto gain)
 * @param {number} gain - Gain value (0-2)
 */
export function setManualGain(gain) {
  if (gainNode) {
    gainNode.gain.value = Math.max(0, Math.min(2, gain));
  }
}

/**
 * Cleanup audio enhancement
 */
export function cleanupAudioEnhancement() {
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  gainNode = null;
  compressorNode = null;
  filterNode = null;
  analyserNode = null;
}

