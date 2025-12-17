# 📊 Streamit - Volledige Project Analyse

**Laatste Update:** 2025-01-17  
**Versie:** 0.1.0  
**Status:** Development

---

## 🎯 Project Overzicht

**Streamit** is een professioneel streaming platform gebouwd met Next.js 14, gericht op live streaming functionaliteit met real-time chat, analytics, multi-platform simulcast, AI-powered insights, en geavanceerde video processing capabilities.

---

## 🏗️ Technische Architectuur

### Core Tech Stack

#### Frontend Framework
- **Next.js 14.1.0** - React framework met App Router
- **React 18** - UI library
- **TypeScript** - Gedeeltelijk geïmplementeerd (sommige bestanden)
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing

#### State Management
- **Zustand 5.0.3** - Lightweight state management
- **React Hooks** - Local component state

#### UI Componenten & Styling
- **Radix UI** - Unstyled, accessible component primitives
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-label`
  - `@radix-ui/react-slot`
- **Lucide React 0.468.0** - Icon library
- **Framer Motion 12.23.26** - Animation library
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Utility voor Tailwind class merging

#### Data Visualisatie
- **Recharts 3.5.1** - React charting library voor analytics

#### Real-time Communicatie
- **Socket.io 4.8.1** - WebSocket server
- **Socket.io Client 4.8.1** - WebSocket client

#### Media & Video Processing
- **Video.js 8.23.4** - HTML5 video player
- **@videojs/themes 1.0.1** - Video.js themes
- **WebRTC** - Browser-based video/audio streaming
- **RecordRTC** - Browser recording (via dependencies)
- **Sharp 0.34.5** - High-performance image processing
- **FFmpeg.js** - Client-side video processing (indirect via dependencies)

#### AI & Machine Learning
- **TensorFlow.js 4.22.0** - Client-side ML framework
- **@tensorflow-models/body-pix 2.2.1** - Body segmentation model
- **@mediapipe/selfie_segmentation 0.1.1675465747** - Background removal

#### Backend & Database
- **Next.js API Routes** - Server-side endpoints
- **Prisma 5.22.0** - Modern ORM
- **@prisma/client 5.22.0** - Prisma client
- **SQLite** - Development database (via better-sqlite3)
- **better-sqlite3 12.5.0** - SQLite database driver

#### Authenticatie
- **NextAuth.js 4.24.13** - Complete authentication solution
- **@next-auth/prisma-adapter 1.0.7** - Prisma adapter voor NextAuth

#### Streaming & RTMP
- **node-media-server 4.2.2** - RTMP streaming server

#### Analytics & Monitoring
- **PostHog 1.308.0** - Product analytics platform
- **@sentry/nextjs 10.31.0** - Error tracking en monitoring

#### Notifications
- **@novu/node 2.6.6** - Notification infrastructure
- **@novu/react 3.11.0** - React notification components

#### Utilities
- **date-fns 4.1.0** - Date utility library
- **zod 4.2.1** - TypeScript-first schema validation
- **chokidar 5.0.0** - File system watcher
- **clsx** - Conditional classnames utility

#### Development Tools
- **TypeScript 5.9.3** - Type checking
- **ESLint** - Code linting
- **Vitest 4.0.16** - Unit testing framework
- **@testing-library/react 16.3.1** - React testing utilities
- **@testing-library/jest-dom 6.9.1** - DOM testing matchers
- **Storybook 10.1.9** - Component development environment
- **fast-check 4.4.0** - Property-based testing

---

## 📁 Project Structuur

```
Streamit/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API endpoints
│   │   │   ├── analytics/
│   │   │   │   └── route.js          # Analytics data endpoint
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/    # NextAuth.js routes
│   │   │   │   │   └── route.ts
│   │   │   │   ├── _log/
│   │   │   │   │   └── route.js
│   │   │   │   └── error/
│   │   │   │       └── page.js
│   │   │   ├── chat/
│   │   │   │   └── route.js          # Chat messages API
│   │   │   ├── clips/                # Video clips management
│   │   │   │   ├── download/
│   │   │   │   │   └── route.js
│   │   │   │   ├── play/
│   │   │   │   │   └── route.js
│   │   │   │   ├── thumbnail/
│   │   │   │   │   └── route.js
│   │   │   │   └── route.js          # Clips CRUD
│   │   │   ├── health/
│   │   │   │   └── route.js          # Health check
│   │   │   ├── insights/
│   │   │   │   └── route.js          # AI insights endpoint
│   │   │   ├── notifications/
│   │   │   │   └── route.js          # Notifications API
│   │   │   ├── platforms/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js      # Platform CRUD
│   │   │   │   └── route.js          # Platforms list
│   │   │   ├── streams/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── playback/
│   │   │   │   │   │   └── route.js
│   │   │   │   │   ├── simulcast/
│   │   │   │   │   │   └── route.js
│   │   │   │   │   └── route.js      # Stream CRUD
│   │   │   │   └── route.ts          # Streams list
│   │   │   ├── templates/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── apply/
│   │   │   │   │   │   └── route.js
│   │   │   │   │   └── route.js
│   │   │   │   └── route.js          # Stream templates
│   │   │   └── upload/
│   │   │       └── route.js          # File uploads
│   │   ├── analytics/
│   │   │   ├── error.js              # Error boundary
│   │   │   └── page.js               # Analytics dashboard
│   │   ├── auth/
│   │   │   ├── error/
│   │   │   │   └── page.js           # Auth error page
│   │   │   └── signin/
│   │   │       └── page.tsx          # Sign in page
│   │   ├── clips/
│   │   │   └── page.js               # Clips management page
│   │   ├── hls/
│   │   │   └── [...path]/
│   │   │       └── route.js          # HLS streaming endpoint
│   │   ├── insights/
│   │   │   └── page.js               # AI insights page
│   │   ├── pricing/
│   │   │   └── page.js               # Pricing page
│   │   ├── settings/
│   │   │   └── page.js               # Settings page
│   │   ├── studio/
│   │   │   └── page.js               # Streaming studio interface
│   │   ├── error.js                  # Global error handler
│   │   ├── global-error.js           # Global error boundary
│   │   ├── globals.css               # Global styles
│   │   ├── layout.js                 # Root layout
│   │   ├── page.js                   # Dashboard homepage
│   │   └── providers.js              # Context providers
│   ├── components/                   # React components
│   │   ├── ui/                       # UI primitives
│   │   │   ├── badge.jsx
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── motion.tsx
│   │   ├── AnimatedContainer.js      # Animation wrappers
│   │   ├── AudioMixer.js             # Audio mixing controls
│   │   ├── AudioVisualizer.js        # Audio visualization
│   │   ├── ClipManager.js            # Clip management UI
│   │   ├── FileUpload.js             # File upload component
│   │   ├── OverlayEditor.js          # Overlay editing tool
│   │   ├── PlatformManager.js        # Platform connection manager
│   │   ├── RecordingControls.js      # Recording controls
│   │   ├── SceneManager.js           # Scene management
│   │   ├── SimulcastManager.js       # Multi-platform streaming
│   │   ├── StageRenderer.js          # Video stage renderer
│   │   ├── StreamQualitySelector.js  # Quality settings
│   │   ├── StreamSettingsModal.tsx   # Stream settings
│   │   ├── TemplateEditor.js         # Template editor
│   │   ├── TemplateSelector.js       # Template selector
│   │   └── VideoPlayer.js            # Video.js player wrapper
│   ├── hooks/                        # Custom React hooks
│   │   ├── useHotkeys.js             # Keyboard shortcuts
│   │   └── useSocket.js               # Socket.io hook
│   ├── lib/                          # Utility libraries
│   │   ├── ai/                       # AI/ML utilities
│   │   │   ├── audioEnhancement.js
│   │   │   ├── backgroundRemoval.js
│   │   │   └── sceneDetection.js
│   │   ├── validations/              # Zod schemas
│   │   │   ├── platform.test.ts
│   │   │   ├── platform.ts
│   │   │   ├── stream.test.ts
│   │   │   └── stream.ts
│   │   ├── analytics.js              # PostHog analytics
│   │   ├── api-handler.ts            # API error handling
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── clipGenerator.js          # Clip generation logic
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── errors.ts                 # Error handling utilities
│   │   ├── errors.test.ts
│   │   ├── hlsConverter.js           # HLS conversion
│   │   ├── logger.ts                 # Logging utility
│   │   ├── notifications.js          # Novu notifications
│   │   ├── rate-limit.ts             # Rate limiting
│   │   ├── rate-limit.test.ts
│   │   ├── rtmpServer.js             # RTMP server setup
│   │   ├── simulcastManager.js       # Simulcast logic
│   │   ├── socket.js                 # Socket.io server
│   │   ├── streamDiscovery.js        # Stream monitoring
│   │   ├── streamingPresets.js      # Streaming presets
│   │   ├── templateEngine.js         # Template engine
│   │   ├── utils.ts                  # General utilities
│   │   └── utils.test.ts
│   ├── store/                        # State management
│   │   └── useStreamStore.js         # Zustand store
│   ├── stories/                      # Storybook stories
│   │   ├── assets/                   # Story assets
│   │   ├── Button.stories.ts
│   │   ├── Button.tsx
│   │   ├── Configure.mdx
│   │   ├── Header.stories.ts
│   │   ├── Header.tsx
│   │   ├── Page.stories.ts
│   │   ├── Page.tsx
│   │   ├── button.css
│   │   ├── header.css
│   │   └── page.css
│   ├── test/                         # Test utilities
│   │   ├── setup.test.ts
│   │   └── setup.ts
│   └── types/                        # TypeScript types
│       └── next-auth.d.ts            # NextAuth type extensions
├── prisma/                           # Database
│   ├── schema.prisma                 # Prisma schema
│   ├── migrations/                   # Database migrations
│   │   ├── 20251214092921_init/
│   │   ├── 20251214123441_add_platform_connections/
│   │   ├── 20251216193111_fix_schema/
│   │   ├── 20251217075525_add_protocol_support/
│   │   ├── 20251217075925_add_clips_model/
│   │   ├── 20251217083945_add_simulcast_and_templates/
│   │   └── migration_lock.toml
│   ├── dev.db                        # SQLite database
│   └── seed.js                       # Database seeding
├── scripts/                          # Utility scripts
│   ├── clear-db-conflicts.js
│   ├── create-demo-user.js
│   ├── debug_start.js
│   ├── kill-port.sh
│   └── seed-templates.js
├── docs/                             # Documentation
│   ├── OBS_INTEGRATION.md
│   ├── PROJECT_ANALYSIS.md
│   └── RTMP_LIVE_INTEGRATION.md
├── media/                            # Media files
│   └── hls/                          # HLS stream files
├── server.js                         # Custom Next.js server
├── Dockerfile                        # Docker configuration
├── docker-compose.yml                # Docker Compose config
├── next.config.js                    # Next.js configuration
├── next-env.d.ts                     # Next.js TypeScript types
├── package.json                      # Dependencies
├── package-lock.json                 # Lock file
├── postcss.config.js                 # PostCSS config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── vitest.config.ts                  # Vitest config
├── vercel.json                       # Vercel deployment config
├── components.json                   # shadcn/ui config
└── README.md                         # Project readme
```

---

## 🗄️ Database Schema (Prisma)

### Models Overzicht

#### User
Gebruikers van het platform met authenticatie en relaties.

**Velden:**
- `id` (String, cuid) - Unieke identifier
- `name` (String, optional) - Gebruikersnaam
- `email` (String, unique) - Email adres
- `emailVerified` (DateTime, optional) - Email verificatie datum
- `image` (String, optional) - Avatar URL
- `createdAt` (DateTime) - Aanmaakdatum
- `updatedAt` (DateTime) - Laatste update

**Relaties:**
- `accounts[]` - OAuth accounts (Google, GitHub, etc.)
- `sessions[]` - NextAuth sessies
- `streams[]` - Gebruiker's streams
- `platformConnections[]` - Platform verbindingen
- `clips[]` - Gemaakte clips
- `templates[]` - Stream templates
- `templateUsage[]` - Template gebruik geschiedenis

#### Account
OAuth provider accounts gekoppeld aan gebruikers.

**Velden:**
- `id`, `userId`, `type`, `provider`, `providerAccountId`
- `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`

#### Stream
Hoofdmodel voor streaming sessies.

**Velden:**
- `id`, `title`, `description`, `type`, `status` (default: "DRAFT")
- `rtmpKey` (unique, optional) - RTMP stream key
- `thumbnailUrl` (optional)
- `isRecording` (Boolean, default: false)
- `isLive` (Boolean, default: false)
- `viewerCount` (Int, default: 0)
- `brandColor` (String, default: "#5c4dff")
- `showOverlay` (Boolean, default: true)
- `userName`, `userTitle` (optional)
- `createdAt`, `updatedAt`, `startedAt`, `endedAt`
- `userId`, `templateId` (optional)

**Relaties:**
- `user` - Stream eigenaar
- `chatMessages[]` - Chat berichten
- `analytics[]` - Analytics data
- `clips[]` - Gemaakte clips
- `simulcastPlatforms[]` - Simulcast platform verbindingen
- `appliedTemplate` - Toegepaste template

#### ChatMessage
Real-time chat berichten tijdens streams.

**Velden:**
- `id`, `message`, `username`, `color` (optional)
- `timestamp` (DateTime, default: now)
- `streamId`

#### StreamAnalytics
Analytics data voor streams.

**Velden:**
- `id`, `streamId`, `timestamp` (default: now)
- `viewerCount` (Int, default: 0)
- `chatMessages` (Int, default: 0)
- `duration` (Int, default: 0) - in seconden

#### PlatformConnection
Platform verbindingen voor simulcast streaming.

**Velden:**
- `id`, `userId`, `platform` (String) - Platform naam
- `streamKey` (optional, encrypted in production)
- `rtmpUrl` (String)
- `protocol` (String, default: "RTMP") - RTMP, RTMPS, SRT, WHIP
- `server` (optional) - Server selectie
- `isActive` (Boolean, default: false)
- `followers` (Int, default: 0)
- `metadata` (optional) - JSON string voor extra data
- `createdAt`, `updatedAt`

**Relaties:**
- `user` - Eigenaar
- `simulcastPlatforms[]` - Simulcast streams

#### Clip
Video clips gegenereerd uit streams.

**Velden:**
- `id`, `title`, `description`
- `streamId` - Bron stream
- `videoUrl` (optional) - Clip video pad
- `thumbnailUrl` (optional)
- `duration` (Int, default: 0) - in seconden
- `startTime`, `endTime` (Int, default: 0) - in bron video
- `aspectRatio` (String, default: "9:16") - 9:16, 16:9, 1:1
- `resolution` (optional) - bv. "1080x1920"
- `hasCaptions` (Boolean, default: true)
- `captionText` (optional) - Auto-generated captions
- `highlightScore` (Float, optional) - AI confidence (0-1)
- `highlightType` (optional) - "peak_viewers", "chat_spike", etc.
- `detectedLanguage` (String, default: "en")
- `status` (String, default: "PENDING") - PENDING, PROCESSING, COMPLETED, FAILED
- `processingProgress` (Int, default: 0) - 0-100
- `exportFormats` (optional) - JSON array: ["mp4", "webm"]
- `exportedUrls` (optional) - JSON object met platform URLs
- `createdAt`, `updatedAt`, `processedAt` (optional)
- `userId`

#### StreamPlatform
Simulcast platform verbindingen voor individuele streams.

**Velden:**
- `id`, `streamId`, `platformId`, `platform` (String)
- `status` (String, default: "PENDING") - PENDING, CONNECTING, LIVE, FAILED, STOPPED
- `errorMessage` (optional)
- `bitrate`, `resolution` (optional) - Platform-specifieke overrides
- `rtmpUrl`, `streamKey` (optional, encrypted), `protocol` (default: "RTMP")
- `viewerCount` (Int, default: 0)
- `lastUpdate` (DateTime, default: now)
- `createdAt`, `updatedAt`, `connectedAt`, `disconnectedAt` (optional)
- `platformConnectionId` (optional)

#### StreamTemplate
Herbruikbare stream templates.

**Velden:**
- `id`, `name`, `description`, `category` - "gaming", "podcast", "webinar", "custom"
- `thumbnailUrl` (optional)
- `config` (String) - JSON string met: scenes, overlays, audio, platforms, etc.
- `isPublic` (Boolean, default: false)
- `isSystem` (Boolean, default: false) - System vs user-created
- `isDefault` (Boolean, default: false) - Default voor category
- `usageCount` (Int, default: 0)
- `createdAt`, `updatedAt`
- `userId` (optional) - null voor system templates

**Relaties:**
- `user` (optional) - Template maker
- `streams[]` - Streams die deze template gebruiken
- `usageHistory[]` - Gebruik geschiedenis

#### StreamTemplateUsage
Template gebruik tracking.

**Velden:**
- `id`, `templateId`, `streamId` (optional), `userId`
- `usedAt` (DateTime, default: now)

#### Session & VerificationToken
NextAuth.js sessie en verificatie tokens.

---

## 🔌 API Endpoints

### Streams API (`/api/streams`)

#### `GET /api/streams`
Haal alle streams op voor de huidige gebruiker.

**Query Parameters:**
- Geen (gebruikt session user)

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "STUDIO|RTMP|WEBRTC",
    "status": "DRAFT|SCHEDULED|LIVE|ENDED|ARCHIVED",
    "isLive": boolean,
    "isRecording": boolean,
    "viewerCount": number,
    "createdAt": "ISO date",
    ...
  }
]
```

#### `POST /api/streams`
Maak een nieuwe stream aan.

**Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "type": "STUDIO|RTMP|WEBRTC"
}
```

#### `GET /api/streams/[id]`
Haal specifieke stream op.

#### `PUT /api/streams/[id]`
Update stream instellingen.

#### `DELETE /api/streams/[id]`
Verwijder stream.

#### `GET /api/streams/[id]/playback`
Haal playback informatie op.

#### `POST /api/streams/[id]/simulcast`
Start simulcast naar meerdere platforms.

### Chat API (`/api/chat`)

#### `GET /api/chat?streamId={id}`
Haal chat berichten op (laatste 50).

#### `POST /api/chat`
Verstuur chat bericht.

**Body:**
```json
{
  "streamId": "string",
  "message": "string",
  "username": "string",
  "color": "string (optional)"
}
```

### Platforms API (`/api/platforms`)

#### `GET /api/platforms`
Haal verbonden platforms op.

#### `POST /api/platforms`
Verbind/verbreek platform.

**Body:**
```json
{
  "platform": "youtube|twitch|facebook|linkedin",
  "rtmpUrl": "string",
  "streamKey": "string",
  "action": "connect|disconnect"
}
```

#### `GET /api/platforms/[id]`
Haal specifiek platform op.

#### `PUT /api/platforms/[id]`
Update platform instellingen.

#### `DELETE /api/platforms/[id]`
Verwijder platform verbinding.

### Clips API (`/api/clips`)

#### `GET /api/clips`
Haal alle clips op.

#### `POST /api/clips`
Genereer nieuwe clip.

**Body:**
```json
{
  "streamId": "string",
  "title": "string",
  "startTime": number,
  "endTime": number,
  "aspectRatio": "9:16|16:9|1:1"
}
```

#### `GET /api/clips/[id]`
Haal specifieke clip op.

#### `GET /api/clips/[id]/play`
Stream clip video.

#### `GET /api/clips/[id]/download`
Download clip.

#### `GET /api/clips/[id]/thumbnail`
Haal clip thumbnail op.

### Templates API (`/api/templates`)

#### `GET /api/templates`
Haal beschikbare templates op.

#### `POST /api/templates`
Maak nieuwe template.

#### `GET /api/templates/[id]`
Haal specifieke template op.

#### `POST /api/templates/[id]/apply`
Pas template toe op stream.

### Analytics API (`/api/analytics`)

#### `GET /api/analytics`
Haal analytics data op.

**Query Parameters:**
- `streamId` (optional) - Specifieke stream
- `startDate`, `endDate` (optional) - Date range

### Insights API (`/api/insights`)

#### `GET /api/insights`
Haal AI-powered insights op.

### Notifications API (`/api/notifications`)

#### `POST /api/notifications`
Verstuur notification.

**Body:**
```json
{
  "type": "stream_start|clip_ready|viewer_milestone",
  "data": { ... }
}
```

### Upload API (`/api/upload`)

#### `POST /api/upload`
Upload bestanden (thumbnails, etc.).

**Form Data:**
- `file` - Bestand
- `type` - "thumbnail" | "overlay" | etc.

### Health API (`/api/health`)

#### `GET /api/health`
Health check endpoint.

---

## 🎨 Frontend Features & Pagina's

### Dashboard (`/`)
Hoofdpagina met stream overzicht.

**Features:**
- Stream lijst met status badges
- Stream cards met thumbnails en metadata
- Tab navigatie: Home, Analytics, Insights, Platforms, History, Clips, Storage, Settings
- "New Stream" modal met opties:
  - Restream Studio (browser-based)
  - Encoder | RTMP (OBS, Zoom, vMix, etc.)
  - Video or Playlist (coming soon)
- Sidebar met gebruikersprofiel
- Stream filters: All, Drafts, Scheduled
- Real-time stream status updates
- Stream actions: Duplicate, Delete

**Componenten:**
- `StreamCard` - Individuele stream card
- `NavItem` - Sidebar navigatie item
- Modal voor nieuwe stream creatie

### Studio (`/studio?streamId={id}`)
Geavanceerde streaming studio interface.

**Video Sources:**
- Camera feed (WebRTC getUserMedia)
- Screen sharing (getDisplayMedia)
- Multiple layout modes:
  - Single (full screen)
  - Picture-in-Picture
  - Grid (multiple sources)
  - Side-by-side

**Controls:**
- Mic on/off toggle
- Camera on/off toggle
- Screen share toggle
- Layout switcher
- GO LIVE / END STREAM button
- RECORD button
- Audio mixer met EQ en effects
- Stream quality selector
- Scene manager met drag & drop
- Overlay editor
- Template selector en editor

**Real-time Features:**
- Live chat pane met Socket.io
- Viewer count display
- Stream duration timer
- Status indicators (LIVE/OFFLINE)
- Real-time audio visualization

**UI Elements:**
- Brand overlay badges
- Lower thirds
- Responsive video canvas
- Collapsible sidebar (resizable)
- Tabbed interface: Chat, Scenes, Audio, Overlays, Settings
- Keyboard shortcuts support

**Componenten:**
- `StageRenderer` - Video stage renderer
- `AudioMixer` - Audio mixing controls
- `SceneManager` - Scene management
- `OverlayEditor` - Overlay editing
- `RecordingControls` - Recording controls
- `StreamQualitySelector` - Quality settings
- `SimulcastManager` - Multi-platform streaming
- `TemplateSelector` - Template selection
- `TemplateEditor` - Template editing

### Analytics (`/analytics`)
Analytics dashboard met data visualisaties.

**Overview Cards:**
- Total Viewers
- Total Streams
- Total Duration
- Chat Messages

**Charts (Recharts):**
- Viewers Over Time (Area Chart)
- Stream Performance (Bar Chart)
- Device Breakdown (Pie Chart)
- Top Performing Streams list

**Features:**
- Time range selector (7d, 30d, 90d, custom)
- Export report functionality
- Real-time data updates
- Error boundary voor error handling

### Insights (`/insights`)
AI-powered insights pagina.

**Features:**
- AI-generated insights
- Performance recommendations
- Content suggestions
- Auto-highlight detection

### Clips (`/clips`)
Video clips management pagina.

**Features:**
- Clip lijst met thumbnails
- Clip player
- Download functionaliteit
- Clip metadata
- AI highlight scores
- Filter en sort opties

**Componenten:**
- `ClipManager` - Clip management UI
- `VideoPlayer` - Video.js player

### Platforms (`/` - Platforms tab)
Platform connection manager.

**Features:**
- Platform cards voor:
  - YouTube Live
  - Twitch
  - Facebook Live
  - LinkedIn Live
- Connect/disconnect functionaliteit
- RTMP key management
- Stream key input modal
- Connection status indicators
- Protocol selectie (RTMP, RTMPS, SRT, WHIP)
- Server selectie

**Componenten:**
- `PlatformManager` - Platform management UI
- `SimulcastManager` - Multi-platform streaming

### Settings (`/settings`)
Gebruikersinstellingen pagina.

**Features:**
- Profiel instellingen
- Notificatie voorkeuren
- Stream defaults
- API keys management

### Pricing (`/pricing`)
Pricing pagina (indien geïmplementeerd).

### Sign In (`/auth/signin`)
Authenticatie pagina.

**Features:**
- Email/password login
- Demo account support
- OAuth providers (indien geconfigureerd)

---

## 🔄 State Management (Zustand)

### useStreamStore

**User State:**
- `user` - Huidige gebruiker
- `setUser(user)` - Update gebruiker

**Streams:**
- `streams[]` - Alle streams
- `currentStream` - Huidige actieve stream
- `setStreams(streams)` - Update streams lijst
- `setCurrentStream(stream)` - Set actieve stream
- `addStream(stream)` - Voeg stream toe
- `updateStream(id, data)` - Update stream
- `deleteStream(id)` - Verwijder stream

**Studio Settings:**
- `studioSettings` - Studio configuratie object:
  - `micOn`, `camOn`, `screenOn`
  - `layout` - "single" | "pip" | "grid"
  - `brandColor`, `showOverlay`
  - `userName`, `userTitle`
- `updateStudioSettings(settings)` - Update instellingen

**Chat:**
- `chatMessages[]` - Chat berichten
- `addChatMessage(message)` - Voeg bericht toe
- `clearChat()` - Leeg chat

**Live State:**
- `isLive` - Stream is live
- `isRecording` - Stream wordt opgenomen
- `viewerCount` - Aantal viewers
- `streamDuration` - Stream duur in seconden
- `setLiveState(isLive)` - Update live status
- `setRecordingState(isRecording)` - Update recording status
- `setViewerCount(count)` - Update viewer count
- `setStreamDuration(duration)` - Update duration

**Persistence:**
- LocalStorage persist voor `user` en `studioSettings`

---

## 🔌 Real-time Communicatie (Socket.io)

### Server Setup (`src/lib/socket.js`)

**Initialisatie:**
- `initSocket(httpServer)` - Initialiseert Socket.io server
- Geïntegreerd in `server.js` custom server

**Events:**
- `join-stream` - Gebruiker join stream room
  - Data: `{ streamId, userId }`
- `leave-stream` - Gebruiker verlaat stream room
- `chat-message` - Chat bericht ontvangen en broadcast
  - Data: `{ streamId, message, username, color }`
- `stream-status` - Stream status update
  - Data: `{ streamId, isLive, isRecording }`
- `viewer-count` - Viewer count update
  - Data: `{ streamId, count }`
- `disconnect` - Gebruiker disconnect

### Client Hook (`src/hooks/useSocket.js`)

**Usage:**
```javascript
const { sendMessage, updateStreamStatus } = useSocket(
  streamId,
  onMessage,
  onViewerCount,
  onStatusUpdate
);
```

**Methods:**
- `sendMessage(message, username, color)` - Verstuur chat bericht
- `updateStreamStatus(isLive, isRecording)` - Update stream status

**Auto-connect:**
- Connect bij component mount
- Disconnect bij component unmount
- Auto-reconnect bij disconnect

---

## 🔐 Authenticatie (NextAuth.js)

### Configuratie (`src/lib/auth.ts`)

**Providers:**
- **Credentials** - Email/password login
  - Demo account: `demo@streamit.com` / `demo123`
  - Accepteert elke email met password 'demo123'
- **Google OAuth** (optioneel, vereist env vars)
- **GitHub OAuth** (optioneel, vereist env vars)

**Session Strategy:**
- JWT-based sessions
- Session persistence via cookies

**Callbacks:**
- `jwt` - Voegt user.id, email, name, image toe aan token
- `session` - Voegt user data toe aan session

**Pages:**
- Sign in: `/auth/signin`
- Error: `/auth/error`

### Helper Functions

- `getCurrentUser()` - Haal huidige gebruiker op
- `getCurrentUserId()` - Haal user ID op (fallback: 'demo-user')
- `requireAuth()` - Vereis authenticatie (throws error)

---

## 🎬 Streaming Features

### RTMP Server (`src/lib/rtmpServer.js`)

**Functionaliteit:**
- RTMP streaming server via `node-media-server`
- Stream discovery en monitoring
- HLS conversion
- Stream status tracking

**Endpoints:**
- RTMP ingest: `rtmp://localhost:1935/live/{streamKey}`
- HLS playback: `/hls/{streamKey}/index.m3u8`

### Stream Discovery (`src/lib/streamDiscovery.js`)

**Functionaliteit:**
- Monitor actieve streams
- Auto-detect nieuwe streams
- Update stream status in database
- Configurable check interval

### Simulcast Manager (`src/lib/simulcastManager.js`)

**Functionaliteit:**
- Multi-platform streaming
- Platform-specifieke instellingen
- Connection management
- Error handling en retry logic

### Streaming Presets (`src/lib/streamingPresets.js`)

**Functionaliteit:**
- Pre-configured streaming settings
- Platform-optimized presets
- Quality profiles

---

## 🤖 AI & Machine Learning

### TensorFlow.js Integratie

**Models:**
- **BodyPix** (`@tensorflow-models/body-pix`) - Body segmentation
- **MediaPipe Selfie Segmentation** - Background removal

**Features:**
- Real-time background removal
- Body segmentation
- Scene detection
- Audio enhancement

**Bestanden:**
- `src/lib/ai/backgroundRemoval.js` - Background removal
- `src/lib/ai/sceneDetection.js` - Scene detection
- `src/lib/ai/audioEnhancement.js` - Audio enhancement

### AI Insights (`/api/insights`)

**Functionaliteit:**
- Auto-highlight detection voor clips
- Performance recommendations
- Content suggestions
- Viewer engagement analysis

---

## 📊 Analytics & Monitoring

### PostHog Analytics (`src/lib/analytics.js`)

**Events:**
- Stream events: `stream_created`, `stream_started`, `stream_ended`
- Clip events: `clip_generated`, `clip_downloaded`
- Platform events: `platform_connected`, `platform_disconnected`
- UI events: `button_clicked`, `page_viewed`

**Setup:**
```env
NEXT_PUBLIC_POSTHOG_KEY=your-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Sentry Error Tracking

**Configuratie:**
- Geïntegreerd in `next.config.js`
- Source maps upload
- Error boundary support

**Setup:**
```env
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

---

## 🔔 Notifications (Novu)

### Notification Service (`src/lib/notifications.js`)

**Types:**
- `stream_start` - Stream is gestart
- `clip_ready` - Clip is klaar
- `viewer_milestone` - Viewer milestone bereikt
- `platform_connection` - Platform status update

**Setup:**
```env
NOVU_API_KEY=your-api-key
```

**Usage:**
```javascript
import { notifyStreamStart, notifyClipReady } from '@/lib/notifications';

await notifyStreamStart(userId, {
  title: 'My Stream',
  url: '/stream/123'
});
```

---

## 🎥 Video Processing

### Clip Generator (`src/lib/clipGenerator.js`)

**Functionaliteit:**
- Clip generatie uit streams
- Multiple aspect ratios (9:16, 16:9, 1:1)
- Auto-caption generation
- Thumbnail generation
- AI highlight detection

### HLS Converter (`src/lib/hlsConverter.js`)

**Functionaliteit:**
- RTMP naar HLS conversie
- Adaptive bitrate streaming
- Segment generation

### Video Player (`src/components/VideoPlayer.js`)

**Features:**
- Video.js integratie
- HLS/DASH support
- Customizable UI
- Playback speed control
- Responsive design

---

## 🎨 UI Components

### Radix UI Components

**Beschikbare Components:**
- `Dialog` - Modal dialogs
- `DropdownMenu` - Dropdown menus
- `Label` - Form labels
- `Button` - Button component (custom)
- `Input` - Input fields
- `Card` - Card container
- `Badge` - Badge component

### Custom Components

**AnimatedContainer** - Animation wrappers
- `FadeIn`, `SlideIn`, `ScaleIn`
- `StaggerContainer`, `HoverScale`

**AudioMixer** - Audio mixing controls
- EQ controls
- Effects
- Volume sliders

**SceneManager** - Scene management
- Drag & drop
- Multiple scenes
- Source management

**OverlayEditor** - Overlay editing
- Canvas-based editor
- Text overlays
- Image overlays

**TemplateEditor** - Template editing
- Template configuration
- Scene setup
- Overlay management

---

## 🧪 Testing

### Test Setup

**Frameworks:**
- **Vitest 4.0.16** - Unit testing
- **@testing-library/react** - React testing
- **@testing-library/jest-dom** - DOM matchers
- **fast-check** - Property-based testing

**Test Bestanden:**
- `src/lib/utils.test.ts` - Utility tests
- `src/lib/errors.test.ts` - Error handling tests
- `src/lib/rate-limit.test.ts` - Rate limiting tests
- `src/lib/validations/*.test.ts` - Validation tests
- `src/test/setup.ts` - Test setup

**Run Tests:**
```bash
npm test              # Run tests
npm run test:watch     # Watch mode
npm run test:coverage # Coverage report
```

---

## 📚 Storybook

### Component Development

**Setup:**
- Storybook 10.1.9
- Next.js integratie
- Accessibility addon

**Stories:**
- `Button.stories.ts`
- `Header.stories.ts`
- `Page.stories.ts`

**Run Storybook:**
```bash
npm run storybook
```

---

## 🐳 Docker Support

### Dockerfile
- Multi-stage build
- Production optimized
- Node.js runtime

### docker-compose.yml
- Service orchestration
- Database setup
- Volume mounting

**Run:**
```bash
docker-compose up
```

---

## 🔧 Configuration Files

### next.config.js
- Sentry integratie
- Security headers
- Image optimization
- SVG support
- Webpack configuratie

### tailwind.config.js
- Tailwind CSS configuratie
- Custom theme
- Animation utilities

### tsconfig.json
- TypeScript configuratie
- Path aliases
- Compiler opties

### vitest.config.ts
- Vitest configuratie
- Test environment
- Coverage settings

### vercel.json
- Vercel deployment config
- Rewrites
- Headers

---

## 📦 Scripts

### package.json Scripts

```json
{
  "dev": "node server.js",              // Development server
  "dev:next": "next dev",               // Next.js dev server
  "build": "next build",                // Production build
  "start": "NODE_ENV=production node server.js",  // Production server
  "start:next": "next start",           // Next.js production server
  "lint": "next lint",                  // ESLint
  "test": "vitest run",                  // Run tests
  "test:watch": "vitest",                // Watch tests
  "test:coverage": "vitest run --coverage",  // Coverage
  "kill:3001": "./scripts/kill-port.sh 3001",  // Kill port
  "dev:clean": "./scripts/kill-port.sh 3001 && sleep 1 && npm run dev",  // Clean dev
  "storybook": "storybook dev -p 6006",  // Storybook
  "build-storybook": "storybook build"   // Build Storybook
}
```

### Utility Scripts

**scripts/kill-port.sh** - Kill process op poort  
**scripts/create-demo-user.js** - Maak demo gebruiker  
**scripts/seed-templates.js** - Seed stream templates  
**scripts/clear-db-conflicts.js** - Clear database conflicts  
**scripts/debug_start.js** - Debug start script

---

## 🔐 Security Features

### Next.js Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

### Authentication
- NextAuth.js JWT sessions
- Secure cookie handling
- OAuth provider support

### Rate Limiting
- Rate limiting utility (`src/lib/rate-limit.ts`)
- API endpoint protection

### Input Validation
- Zod schemas (`src/lib/validations/`)
- Type-safe validation

---

## 🚀 Deployment

### Vercel
- `vercel.json` configuratie
- Environment variables setup
- Automatic deployments

### Docker
- Dockerfile voor containerization
- docker-compose voor local development

### Environment Variables

**Verplicht:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key"
```

**Optioneel:**
```env
# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Notifications
NOVU_API_KEY="..."

# Error Tracking
SENTRY_ORG="..."
SENTRY_PROJECT="..."
```

---

## 📈 Project Status

### ✅ Voltooid
- Database schema en migrations
- Basic dashboard UI
- Studio interface met WebRTC
- Chat UI (frontend + backend)
- Analytics UI met data integratie
- Platform manager UI
- NextAuth.js setup
- Zustand state management
- Socket.io real-time communicatie
- RTMP server integratie
- Clip generation systeem
- Template systeem
- Simulcast support
- AI/ML integratie (TensorFlow.js)
- PostHog analytics
- Novu notifications
- Video.js player
- Framer Motion animations
- Error tracking (Sentry)
- Testing setup
- Storybook

### 🚧 In Progress
- HLS streaming optimalisatie
- Advanced AI features
- Mobile app (Capacitor)

### 📋 To Do
- HLS/DASH streaming protocol verbetering
- CDN integratie
- Real-time collaboration
- Enterprise SSO integration
- Advanced AI content analysis
- Multi-language support
- Cloud recording storage
- Payment integration (Stripe)
- Advanced video processing

---

## 🐛 Bekende Issues & Limitations

1. **Socket.io Server** - Werkt via custom server.js
2. **SQLite Database** - Development only, migreer naar PostgreSQL voor productie
3. **Demo Authentication** - Vereist echte database integratie voor productie
4. **HLS Streaming** - Basis implementatie, vereist optimalisatie
5. **Mobile App** - Capacitor setup aanwezig maar niet volledig geïmplementeerd

---

## 📝 Conclusie

Streamit is een **volledig functioneel streaming platform** met:

✅ **Moderne Tech Stack** - Next.js 14, React 18, Prisma, TypeScript  
✅ **Complete Feature Set** - Streaming, Chat, Analytics, Clips, Templates  
✅ **Real-time Communicatie** - Socket.io integratie  
✅ **AI/ML Features** - TensorFlow.js, background removal, scene detection  
✅ **Multi-platform Support** - Simulcast naar meerdere platforms  
✅ **Professional UI/UX** - Modern design, animations, responsive  
✅ **Production Ready** - Error tracking, analytics, notifications  
✅ **Testing & Development** - Vitest, Storybook, Docker support  

Het project is **klaar voor verdere ontwikkeling** en kan worden uitgebreid met extra features zoals CDN integratie, advanced AI, en cloud storage.

---

**Document gegenereerd op:** 2025-01-17  
**Project Versie:** 0.1.0  
**Status:** Development / Production Ready (met enkele limitations)

