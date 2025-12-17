/**
 * Streaming Presets geïnspireerd op OBS Studio
 * Deze presets kunnen worden gebruikt voor RTMP streaming configuraties
 */

// Video encoding presets (gebaseerd op x264/x265)
export const ENCODING_PRESETS = {
  ultra_fast: {
    name: 'Ultra Fast',
    preset: 'ultrafast',
    crf: 23,
    profile: 'high',
    level: '4.2',
    cpuUsage: 'low',
    quality: 'medium',
    description: 'Laagste CPU gebruik, lagere kwaliteit - ideaal voor zwakke hardware'
  },
  veryfast: {
    name: 'Very Fast',
    preset: 'veryfast',
    crf: 23,
    profile: 'high',
    level: '4.2',
    cpuUsage: 'low-medium',
    quality: 'good',
    description: 'Goede balans tussen CPU en kwaliteit - aanbevolen voor de meeste gebruikers'
  },
  faster: {
    name: 'Faster',
    preset: 'faster',
    crf: 23,
    profile: 'high',
    level: '4.2',
    cpuUsage: 'medium',
    quality: 'very-good',
    description: 'Betere kwaliteit, meer CPU gebruik'
  },
  fast: {
    name: 'Fast',
    preset: 'fast',
    crf: 23,
    profile: 'high',
    level: '4.2',
    cpuUsage: 'medium-high',
    quality: 'high',
    description: 'Hoge kwaliteit streaming'
  },
  medium: {
    name: 'Medium',
    preset: 'medium',
    crf: 23,
    profile: 'high',
    level: '4.2',
    cpuUsage: 'high',
    quality: 'very-high',
    description: 'Zeer hoge kwaliteit, veel CPU gebruik'
  },
  slow: {
    name: 'Slow',
    preset: 'slow',
    crf: 23,
    profile: 'high',
    level: '4.2',
    cpuUsage: 'very-high',
    quality: 'maximum',
    description: 'Beste kwaliteit, zeer veel CPU gebruik - alleen voor krachtige systemen'
  }
};

// Stream quality presets (resolutie + bitrate)
export const QUALITY_PRESETS = {
  '1080p60': {
    name: '1080p @ 60fps',
    resolution: { width: 1920, height: 1080 },
    fps: 60,
    bitrate: 6000, // kbps
    encoder: 'x264',
    description: 'Hoogste kwaliteit - vereist sterke upload snelheid (6+ Mbps)',
    recommended: false
  },
  '1080p30': {
    name: '1080p @ 30fps',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    bitrate: 4500, // kbps
    encoder: 'x264',
    description: 'Hoge kwaliteit - vereist goede upload snelheid (4.5+ Mbps)',
    recommended: true
  },
  '720p60': {
    name: '720p @ 60fps',
    resolution: { width: 1280, height: 720 },
    fps: 60,
    bitrate: 4500, // kbps
    encoder: 'x264',
    description: 'Goede kwaliteit met 60fps - vereist goede upload snelheid (4.5+ Mbps)',
    recommended: true
  },
  '720p30': {
    name: '720p @ 30fps',
    resolution: { width: 1280, height: 720 },
    fps: 30,
    bitrate: 3000, // kbps
    encoder: 'x264',
    description: 'Goede kwaliteit - vereist gemiddelde upload snelheid (3+ Mbps)',
    recommended: true
  },
  '480p30': {
    name: '480p @ 30fps',
    resolution: { width: 854, height: 480 },
    fps: 30,
    bitrate: 2000, // kbps
    encoder: 'x264',
    description: 'Basis kwaliteit - vereist lage upload snelheid (2+ Mbps)',
    recommended: false
  },
  '360p30': {
    name: '360p @ 30fps',
    resolution: { width: 640, height: 360 },
    fps: 30,
    bitrate: 1000, // kbps
    encoder: 'x264',
    description: 'Lage kwaliteit - voor zeer trage verbindingen (1+ Mbps)',
    recommended: false
  }
};

// Platform-specifieke RTMP configuraties (gebaseerd op OBS Studio)
export const PLATFORM_RTMP_CONFIGS = {
  YOUTUBE: {
    name: 'YouTube Live',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    recommendedBitrate: 4500,
    maxBitrate: 51000,
    recommendedResolution: '1920x1080',
    keyframeInterval: 2, // seconds
    encoder: 'x264',
    audioBitrate: 128,
    audioSampleRate: 48000,
    audioChannels: 2
  },
  TWITCH: {
    name: 'Twitch',
    rtmpUrl: 'rtmp://live.twitch.tv/app/',
    recommendedBitrate: 6000,
    maxBitrate: 6000, // Twitch limit
    recommendedResolution: '1920x1080',
    keyframeInterval: 2,
    encoder: 'x264',
    audioBitrate: 160,
    audioSampleRate: 48000,
    audioChannels: 2
  },
  FACEBOOK: {
    name: 'Facebook Live',
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp',
    recommendedBitrate: 4000,
    maxBitrate: 4000,
    recommendedResolution: '1920x1080',
    keyframeInterval: 2,
    encoder: 'x264',
    audioBitrate: 128,
    audioSampleRate: 48000,
    audioChannels: 2
  },
  LINKEDIN: {
    name: 'LinkedIn Live',
    rtmpUrl: 'rtmp://1-publish.linkedin.com/live',
    recommendedBitrate: 4000,
    maxBitrate: 4000,
    recommendedResolution: '1920x1080',
    keyframeInterval: 2,
    encoder: 'x264',
    audioBitrate: 128,
    audioSampleRate: 48000,
    audioChannels: 2
  }
};

// Audio settings presets
export const AUDIO_PRESETS = {
  standard: {
    name: 'Standard',
    bitrate: 128,
    sampleRate: 48000,
    channels: 'stereo',
    description: 'Standaard audio kwaliteit'
  },
  high: {
    name: 'High Quality',
    bitrate: 160,
    sampleRate: 48000,
    channels: 'stereo',
    description: 'Hoge audio kwaliteit'
  },
  low: {
    name: 'Low Bandwidth',
    bitrate: 96,
    sampleRate: 44100,
    channels: 'mono',
    description: 'Lage bandbreedte - voor trage verbindingen'
  }
};

// Helper functies
export function getRecommendedPreset(uploadSpeedMbps) {
  // Upload speed in Mbps
  if (uploadSpeedMbps >= 6) {
    return QUALITY_PRESETS['1080p30'];
  } else if (uploadSpeedMbps >= 4.5) {
    return QUALITY_PRESETS['720p60'];
  } else if (uploadSpeedMbps >= 3) {
    return QUALITY_PRESETS['720p30'];
  } else if (uploadSpeedMbps >= 2) {
    return QUALITY_PRESETS['480p30'];
  } else {
    return QUALITY_PRESETS['360p30'];
  }
}

export function getPlatformConfig(platformType) {
  return PLATFORM_RTMP_CONFIGS[platformType] || PLATFORM_RTMP_CONFIGS.YOUTUBE;
}

export function validateStreamSettings(settings, platformType) {
  const platformConfig = getPlatformConfig(platformType);
  const errors = [];

  // Check bitrate
  if (settings.bitrate > platformConfig.maxBitrate) {
    errors.push(`Bitrate too high. Maximum for ${platformConfig.name}: ${platformConfig.maxBitrate} kbps`);
  }

  // Check resolution
  const _resolution = `${settings.resolution.width}x${settings.resolution.height}`;
  if (settings.resolution.width > 1920 || settings.resolution.height > 1080) {
    errors.push('Resolution too high. Maximum: 1920x1080');
  }

  // Check FPS
  if (settings.fps > 60) {
    errors.push('FPS too high. Maximum: 60fps');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate RTMP stream URL
export function generateRTMPUrl(platformType, streamKey) {
  const config = getPlatformConfig(platformType);
  return `${config.rtmpUrl}/${streamKey}`;
}

// Protocol-specific configurations
export const PROTOCOL_CONFIGS = {
  RTMP: {
    name: 'RTMP',
    defaultPort: 1935,
    secure: false,
    description: 'Standard RTMP protocol - most widely supported',
    urlTemplate: 'rtmp://{server}/live',
    supportedPlatforms: ['YOUTUBE', 'TWITCH', 'LINKEDIN']
  },
  RTMPS: {
    name: 'RTMPS',
    defaultPort: 443,
    secure: true,
    description: 'Secure RTMP over TLS - encrypted streaming',
    urlTemplate: 'rtmps://{server}/live',
    supportedPlatforms: ['YOUTUBE', 'FACEBOOK', 'LINKEDIN']
  },
  SRT: {
    name: 'SRT',
    defaultPort: 9000,
    secure: true,
    description: 'Secure Reliable Transport - low latency, error correction',
    urlTemplate: 'srt://{server}:9000',
    supportedPlatforms: ['YOUTUBE', 'TWITCH']
  },
  WHIP: {
    name: 'WHIP',
    defaultPort: 8080,
    secure: true,
    description: 'WebRTC-HTTP Ingestion Protocol - ultra low latency',
    urlTemplate: 'https://{server}/whip',
    supportedPlatforms: ['YOUTUBE'],
    beta: true
  }
};

// Get protocol configuration
export function getProtocolConfig(protocol) {
  return PROTOCOL_CONFIGS[protocol] || PROTOCOL_CONFIGS.RTMP;
}

// Generate stream URL based on protocol
export function generateStreamUrl(protocol, server, streamKey) {
  const protocolConfig = getProtocolConfig(protocol);
  const url = protocolConfig.urlTemplate
    .replace('{server}', server || 'localhost')
    .replace('{port}', protocolConfig.defaultPort);
  
  // For RTMP/RTMPS, append stream key to path
  if (protocol === 'RTMP' || protocol === 'RTMPS') {
    return `${url}/${streamKey}`;
  }
  
  // For SRT and WHIP, stream key might be in query or path
  return `${url}?streamKey=${streamKey}`;
}

// Get recommended protocol for platform
export function getRecommendedProtocol(platformType) {
  const platform = getPlatformConfig(platformType);
  
  // Facebook requires RTMPS
  if (platformType === 'FACEBOOK') {
    return 'RTMPS';
  }
  
  // Default to RTMP for most platforms
  return 'RTMP';
}

