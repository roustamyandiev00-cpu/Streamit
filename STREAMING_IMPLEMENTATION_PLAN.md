# Streaming Implementatie Plan - OBS-achtige Functionaliteit

## 🔍 Huidige Status Analyse

### ✅ Wat er al is:
1. **Recording Functionaliteit** ✅
   - MediaRecorder API implementatie
   - Video/audio recording naar bestand
   - Advanced recording controls met filters

2. **Scene Management** ✅
   - Scene switching
   - Source management (camera, screen, images, text)
   - Drag & drop canvas editor

3. **Streaming Presets** ✅
   - OBS-achtige encoding presets
   - Platform-specifieke RTMP configuraties
   - Quality presets (720p, 1080p, etc.)

4. **Real-time Communicatie** ✅
   - Socket.io voor chat en viewer count
   - WebRTC voor camera/screen capture

5. **Studio Interface** ✅
   - Complete studio UI met controls
   - Audio mixer
   - Overlay editor

### ❌ Wat ontbreekt:
1. **Echte Livestreaming** ❌
   - "GO LIVE" doet alleen state updates, geen echte streaming
   - Geen RTMP server
   - Geen WebRTC naar RTMP conversie

2. **RTMP Server** ❌
   - Geen node-media-server of vergelijkbaar
   - Kan geen RTMP streams ontvangen

3. **Platform Integratie** ❌
   - Stream keys worden opgeslagen maar niet gebruikt
   - Geen daadwerkelijke push naar YouTube/Twitch/Facebook

4. **Media Processing** ❌
   - Geen FFmpeg integratie voor transcoding
   - Geen HLS/DASH output voor viewers

---

## 🎯 Implementatie Plan

### Fase 1: RTMP Server Setup (Node Media Server)

**Wat nodig is:**
- `node-media-server` package installeren
- RTMP server starten op poort 1935
- Stream key authenticatie
- Stream forwarding naar externe platforms

**Stappen:**
1. Install `node-media-server`
2. Maak RTMP server configuratie
3. Integreer met bestaande Socket.io server
4. Test met OBS Studio als client

### Fase 2: WebRTC naar RTMP Conversie

**Wat nodig is:**
- MediaRecorder met RTMP output (niet mogelijk in browser)
- **Alternatief**: WebRTC → WebSocket → Server → RTMP
- **Alternatief 2**: MediaRecorder → WebSocket → FFmpeg → RTMP

**Aanbevolen Architectuur:**
```
Browser (WebRTC) 
  ↓ MediaRecorder → WebSocket
Server (Node.js)
  ↓ FFmpeg proces
RTMP Server (Node Media Server)
  ↓ Forward
YouTube/Twitch/Facebook
```

### Fase 3: Livestream Functionaliteit

**Wat nodig is:**
- "GO LIVE" button start echte streaming
- Stream key generatie en validatie
- Real-time stream status monitoring
- Automatisch stoppen bij disconnect

### Fase 4: Platform Integratie

**Wat nodig is:**
- YouTube Live API integratie
- Twitch API integratie
- Facebook Live API integratie
- Stream key management UI

---

## 🛠️ Technische Implementatie

### Stap 1: Dependencies Toevoegen

```bash
npm install node-media-server
npm install @ffmpeg/ffmpeg @ffmpeg/util
# OF
npm install fluent-ffmpeg
```

### Stap 2: RTMP Server Setup

Maak `src/lib/rtmpServer.js`:

```javascript
const NodeMediaServer = require('node-media-server');

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
    allow_origin: '*'
  },
  relay: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: []
  }
};

let nms = null;

function startRTMPServer() {
  if (nms) return nms;
  
  nms = new NodeMediaServer(config);
  
  nms.on('preConnect', (id, args) => {
    console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  });

  nms.on('postConnect', (id, args) => {
    console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
  });

  nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    
    // Validate stream key
    const streamKey = StreamPath.split('/').pop();
    // TODO: Validate against database
    
    return true; // Allow publish
  });

  nms.on('postPublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  });

  nms.on('prePlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    return true;
  });

  nms.on('postPlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  });

  nms.on('doneConnect', (id, args) => {
    console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
  });

  nms.on('donePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // TODO: Update stream status in database
  });

  nms.run();
  console.log('RTMP Server running on port 1935');
  
  return nms;
}

module.exports = { startRTMPServer };
```

### Stap 3: WebRTC naar RTMP Converter

Maak `src/lib/streamConverter.js`:

```javascript
// Browser-side: Send WebRTC stream via WebSocket
export function startStreaming(mediaStream, streamKey, quality) {
  const mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: quality.bitrate * 1000
  });

  // Create WebSocket connection to server
  const ws = new WebSocket(`ws://localhost:3001/stream/${streamKey}`);
  
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      ws.send(event.data);
    }
  };

  mediaRecorder.start(100); // Send chunks every 100ms
  
  return {
    stop: () => {
      mediaRecorder.stop();
      ws.close();
    }
  };
}
```

### Stap 4: Server-side WebSocket Handler

Update `src/lib/socket.js`:

```javascript
// Add WebSocket handler for streaming
io.on('connection', (socket) => {
  // ... existing code ...
  
  // Handle incoming stream data
  socket.on('stream-data', async (data) => {
    const { streamKey, chunk } = data;
    
    // Forward to RTMP server via FFmpeg
    // TODO: Implement FFmpeg transcoding
  });
});
```

### Stap 5: FFmpeg Transcoding

Maak `src/lib/ffmpegTranscoder.js`:

```javascript
const { spawn } = require('child_process');
const { getPlatformConfig } = require('./streamingPresets');

function startTranscoding(streamKey, platformType, quality) {
  const config = getPlatformConfig(platformType);
  
  const ffmpeg = spawn('ffmpeg', [
    '-i', `rtmp://localhost:1935/live/${streamKey}`, // Input from our RTMP server
    '-c:v', 'libx264',
    '-preset', quality.preset,
    '-b:v', `${quality.bitrate}k`,
    '-maxrate', `${quality.bitrate}k`,
    '-bufsize', `${quality.bitrate * 2}k`,
    '-g', `${quality.fps * 2}`, // Keyframe interval
    '-c:a', 'aac',
    '-b:a', `${config.audioBitrate}k`,
    '-ar', config.audioSampleRate,
    '-f', 'flv',
    `${config.rtmpUrl}/${streamKey}` // Output to platform
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.log(`FFmpeg: ${data}`);
  });

  return ffmpeg;
}
```

---

## 📝 TODO Checklist

- [ ] **Stap 1**: Install `node-media-server`
- [ ] **Stap 2**: Setup RTMP server in `server.js`
- [ ] **Stap 3**: Implementeer WebRTC → WebSocket → RTMP pipeline
- [ ] **Stap 4**: Update "GO LIVE" button om echte streaming te starten
- [ ] **Stap 5**: Test met OBS Studio als referentie
- [ ] **Stap 6**: Implementeer platform forwarding (YouTube, Twitch, etc.)
- [ ] **Stap 7**: Stream status monitoring en error handling
- [ ] **Stap 8**: Stream quality selector integratie
- [ ] **Stap 9**: Recording tijdens livestream
- [ ] **Stap 10**: Analytics tracking tijdens live stream

---

## 🚨 Belangrijke Opmerkingen

1. **Browser Beperkingen**: Browsers kunnen niet direct RTMP streamen. We moeten een server-side oplossing gebruiken.

2. **FFmpeg Vereist**: Voor transcoding is FFmpeg nodig op de server.

3. **WebSocket Bandwidth**: Real-time video via WebSocket kan veel bandbreedte gebruiken.

4. **Alternatief**: Overweeg MediaRecorder → Blob uploads → Server-side processing voor betere prestaties.

5. **OBS Studio Compatibiliteit**: Door RTMP server te gebruiken, kan OBS Studio ook naar onze server streamen.

---

**Volgende Stap**: Start met Stap 1 - RTMP Server Setup

