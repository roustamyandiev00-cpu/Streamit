# RTMP Live Repository Integratie

## 📚 Analyse van rtmp-live Repository

De [rtmp-live repository](https://github.com/Roustammmmm/rtmp-live) biedt een complete streaming platform architectuur:

### Belangrijke Concepten:

1. **NGINX-RTMP Server**
   - Ontvangt RTMP streams
   - Converteert naar HLS voor playback
   - On_publish callback voor autorisatie

2. **Origin Server**
   - Ingest (ontvangt video)
   - Storage (slaat video op lokaal)
   - Packaging (maakt HLS manifesten)
   - Delivery (serveert content)

3. **Edge Server (CDN)**
   - Vraagt API welke Origin server content heeft
   - Proxies requests naar Origin
   - Service discovery via Redis

4. **Discovery Service**
   - Monitort filesystem voor HLS manifesten
   - Rapporteert actieve streams naar API
   - TTL-based cleanup

5. **HTTP API**
   - Autoriseert RTMP ingest
   - Trackt actieve streams in Redis
   - Geeft playback informatie terug

### Stack:
- **NGINX-RTMP** - RTMP server en HLS packaging
- **Go** - Discovery service en API
- **Lua** - NGINX scripting
- **Redis** - Service discovery storage

---

## 🔄 Integratie Plan voor Streamit

### Optie 1: NGINX-RTMP als RTMP Server (Aanbevolen)

**Voordelen:**
- Battle-tested (meest gebruikte RTMP server)
- HLS output out-of-the-box
- Goede performance
- Actieve community

**Nadelen:**
- Vereist NGINX installatie
- Docker nodig voor isolatie

### Optie 2: Hybrid Approach

**Huidige Setup:**
- `node-media-server` voor RTMP ontvangst ✅ (al geïmplementeerd)
- Voeg HLS packaging toe
- Implementeer Discovery service

**Aanbeveling:** Optie 2 - gebruik node-media-server maar voeg concepten toe uit rtmp-live

---

## 🎯 Implementatie Stappen

### Stap 1: HLS Output Toevoegen

NGINX-RTMP maakt automatisch HLS, maar met node-media-server moeten we dit zelf doen.

**Oplossing:** Gebruik FFmpeg om RTMP stream naar HLS te converteren

### Stap 2: Discovery Service

Implementeer een service die:
- HLS manifesten monitort
- Stream status rapporteert
- Automatisch cleanup doet

### Stap 3: Stream Status API

Maak een API endpoint die:
- Actieve streams teruggeeft
- Playback URL genereert
- Stream metadata geeft

### Stap 4: Integreer met Bestaande Database

Gebruik Prisma om stream status op te slaan in plaats van alleen Redis

---

## 📝 Concrete Implementatie

### HLS Converter Service

```javascript
// src/lib/hlsConverter.js
const { spawn } = require('child_process');

function convertRTMPToHLS(streamKey, outputDir) {
  const ffmpeg = spawn('ffmpeg', [
    '-i', `rtmp://localhost:1935/live/${streamKey}`,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-f', 'hls',
    '-hls_time', '2', // 2 second segments
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    `${outputDir}/${streamKey}/index.m3u8`
  ]);
  
  return ffmpeg;
}
```

### Discovery Service

```javascript
// src/lib/streamDiscovery.js
const chokidar = require('chokidar');
const { prisma } = require('./db');

function watchHLSManifests(hlsDir) {
  const watcher = chokidar.watch(`${hlsDir}/**/*.m3u8`, {
    persistent: true
  });

  watcher.on('add', async (path) => {
    const streamKey = extractStreamKey(path);
    await updateStreamStatus(streamKey, 'LIVE');
  });

  watcher.on('unlink', async (path) => {
    const streamKey = extractStreamKey(path);
    await updateStreamStatus(streamKey, 'ENDED');
  });
}
```

---

## 🔗 Referenties

- [rtmp-live Repository](https://github.com/Roustammmmm/rtmp-live)
- [NGINX RTMP Module](https://github.com/arut/nginx-rtmp-module)
- [HLS Streaming Guide](https://developer.apple.com/streaming/)

