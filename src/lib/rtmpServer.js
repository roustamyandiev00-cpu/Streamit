/**
 * RTMP Server voor livestreaming (OBS-achtige functionaliteit)
 * Gebruikt node-media-server voor RTMP stream ontvangst en forwarding
 */

// Simple inline logger to avoid module resolution issues
const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err || ''),
  debug: (msg, data) => process.env.NODE_ENV === 'development' && console.debug(`[DEBUG] ${msg}`, data || '')
};

let NodeMediaServer = null;
let nms = null;

// Lazy load node-media-server (optioneel package)
function getNodeMediaServer() {
  if (!NodeMediaServer) {
    try {
      NodeMediaServer = require('node-media-server');
    } catch (error) {
      logger.warn('node-media-server niet geïnstalleerd. Gebruik: npm install node-media-server');
      return null;
    }
  }
  return NodeMediaServer;
}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  relay: {
    ffmpeg: process.env.FFMPEG_PATH || '/usr/local/bin/ffmpeg', // Path to FFmpeg binary
    tasks: []
  }
};

/**
 * Start de RTMP server
 */
function startRTMPServer() {
  const NodeMediaServer = getNodeMediaServer();
  if (!NodeMediaServer) {
    console.warn('RTMP Server kan niet worden gestart - node-media-server niet geïnstalleerd');
    return null;
  }

  if (nms) {
    logger.info('RTMP Server draait al');
    return nms;
  }

  nms = new NodeMediaServer(config);

  // Pre-connect event
  nms.on('preConnect', (id, args) => {
    logger.info('[RTMP] Pre-connect', { id, args });
    // Hier kun je authenticatie toevoegen
  });

  // Post-connect event
  nms.on('postConnect', (id, _args) => {
    logger.info('[RTMP] Post-connect', { id });
  });

  // Pre-publish event - hier valideren we de stream key
  nms.on('prePublish', (id, StreamPath, _args) => {
    logger.info('[RTMP] Pre-publish', { id, path: StreamPath });
    
    // Extract stream key from path: rtmp://server/live/STREAM_KEY
    const _streamKey = StreamPath.split('/').pop();
    
    // TODO: Valideer stream key tegen database
    // TODO: Update stream status in database
    
    return true; // Allow publish (voorlopig altijd toestaan)
  });

  // Post-publish event - Stream is live, start HLS conversion
  nms.on('postPublish', async (id, StreamPath, _args) => {
    logger.info('[RTMP] Post-publish', { id, path: StreamPath });
    const streamKey = StreamPath.split('/').pop();
    
    // Start HLS conversion
    try {
      const { convertRTMPToHLS } = require('./hlsConverter');
      const { registerStreamConversion } = require('./streamDiscovery');
      
      const conversion = await convertRTMPToHLS(streamKey);
      registerStreamConversion(streamKey, conversion);
      
      logger.info(`[RTMP] Started HLS conversion for stream: ${streamKey}`);
    } catch (error) {
      logger.error('[RTMP] Failed to start HLS conversion', error);
    }
    
    // TODO: Notify via Socket.io dat stream live is
    // TODO: Start forwarding naar platforms
  });

  // Pre-play event
  nms.on('prePlay', (id, StreamPath, _args) => {
    logger.info('[RTMP] Pre-play', { id, path: StreamPath });
    return true;
  });

  // Post-play event
  nms.on('postPlay', (id, StreamPath, _args) => {
    logger.info('[RTMP] Post-play', { id, path: StreamPath });
  });

  // Done publish event - stream gestopt
  nms.on('donePublish', (id, StreamPath, _args) => {
    logger.info('[RTMP] Done publish', { id, path: StreamPath });
    const streamKey = StreamPath.split('/').pop();
    
    // Stop HLS conversion
    try {
      const { unregisterStreamConversion } = require('./streamDiscovery');
      unregisterStreamConversion(streamKey);
      logger.info(`[RTMP] Stopped HLS conversion for stream: ${streamKey}`);
    } catch (error) {
      logger.error('[RTMP] Failed to stop HLS conversion', error);
    }
    
    // TODO: Update stream status in database
    // TODO: Stop forwarding naar platforms
    // TODO: Notify via Socket.io dat stream gestopt is
  });

  nms.run();
  logger.info('✅ RTMP Server gestart op poort 1935');
  logger.info('   Stream URL: rtmp://localhost:1935/live/YOUR_STREAM_KEY');
  
  return nms;
}

/**
 * Stop de RTMP server
 */
function stopRTMPServer() {
  if (nms) {
    nms.stop();
    nms = null;
    logger.info('RTMP Server gestopt');
  }
}

/**
 * Get RTMP stream URL voor een stream key
 */
function getRTMPStreamUrl(streamKey) {
  return `rtmp://localhost:1935/live/${streamKey}`;
}

module.exports = {
  startRTMPServer,
  stopRTMPServer,
  getRTMPStreamUrl,
  isAvailable: () => getNodeMediaServer() !== null
};

