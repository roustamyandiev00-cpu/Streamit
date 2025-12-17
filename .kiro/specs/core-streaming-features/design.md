# Design Document: Core Streaming Features

## Overview

Dit document beschrijft de technische architectuur voor drie core features: multi-platform streaming, audio/video kwaliteit management, en een pricing/subscription systeem. De focus ligt op een schaalbare, betrouwbare implementatie.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Studio Page    │  Pricing Page   │  Platform Settings      │
│  - WebRTC       │  - Plan Cards   │  - OAuth Connect        │
│  - Audio Mixer  │  - Stripe UI    │  - Stream Keys          │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  /api/stream/*   │  /api/billing/*  │  /api/platforms/*     │
│  - Start/Stop    │  - Checkout      │  - Connect OAuth      │
│  - Quality       │  - Webhooks      │  - Store Keys         │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
├─────────────────────────────────────────────────────────────┤
│  RTMP Server     │  Stripe Service  │  Platform Service     │
│  - Ingest        │  - Subscriptions │  - YouTube API        │
│  - Restream      │  - Invoices      │  - Twitch API         │
│  - Transcode     │  - Webhooks      │  - Facebook API       │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (SQLite/PostgreSQL)            │
├─────────────────────────────────────────────────────────────┤
│  Users  │  Subscriptions  │  PlatformConnections  │ Streams │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Multi-Platform Streaming Service

```typescript
interface PlatformConnection {
  id: string;
  userId: string;
  platform: 'YOUTUBE' | 'TWITCH' | 'FACEBOOK';
  accessToken: string;      // Encrypted
  refreshToken: string;     // Encrypted
  streamKey: string;        // Encrypted
  rtmpUrl: string;
  isActive: boolean;
  connectedAt: Date;
}

interface StreamSession {
  id: string;
  userId: string;
  status: 'STARTING' | 'LIVE' | 'ENDING' | 'ENDED' | 'ERROR';
  platforms: PlatformStreamStatus[];
  startedAt: Date;
  endedAt?: Date;
}

interface PlatformStreamStatus {
  platform: string;
  status: 'CONNECTING' | 'LIVE' | 'ERROR' | 'DISCONNECTED';
  viewerCount: number;
  errorMessage?: string;
}
```

### 2. Quality Management Service

```typescript
interface QualityPreset {
  name: string;
  resolution: { width: number; height: number };
  fps: number;
  videoBitrate: number;    // kbps
  audioBitrate: number;    // kbps
  minBandwidth: number;    // Required bandwidth in kbps
}

const QUALITY_PRESETS: QualityPreset[] = [
  { name: '720p', resolution: { width: 1280, height: 720 }, fps: 30, videoBitrate: 2500, audioBitrate: 128, minBandwidth: 3000 },
  { name: '1080p', resolution: { width: 1920, height: 1080 }, fps: 30, videoBitrate: 4500, audioBitrate: 160, minBandwidth: 5500 },
  { name: '1080p60', resolution: { width: 1920, height: 1080 }, fps: 60, videoBitrate: 6000, audioBitrate: 160, minBandwidth: 7500 }
];

interface AudioSettings {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  sampleRate: number;
}
```

### 3. Subscription Service

```typescript
interface Subscription {
  id: string;
  userId: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  currentPeriodEnd: Date;
}

interface PlanLimits {
  maxPlatforms: number;
  maxQuality: string;
  maxStreamDuration: number;  // minutes, -1 = unlimited
  storageGB: number;
  removeBranding: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: { maxPlatforms: 1, maxQuality: '720p', maxStreamDuration: 120, storageGB: 1, removeBranding: false },
  PRO: { maxPlatforms: 3, maxQuality: '1080p', maxStreamDuration: -1, storageGB: 25, removeBranding: true },
  BUSINESS: { maxPlatforms: -1, maxQuality: '1080p60', maxStreamDuration: -1, storageGB: 100, removeBranding: true }
};
```

## Data Models

### Database Schema Updates

```prisma
model PlatformConnection {
  id           String   @id @default(cuid())
  userId       String
  platform     Platform
  accessToken  String   // Encrypted
  refreshToken String?  // Encrypted
  streamKey    String   // Encrypted
  rtmpUrl      String
  channelName  String?
  isActive     Boolean  @default(true)
  connectedAt  DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, platform])
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  plan                 Plan     @default(FREE)
  stripeCustomerId     String?
  stripeSubscriptionId String?
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodStart   DateTime @default(now())
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  user                 User     @relation(fields: [userId], references: [id])
}

enum Platform {
  YOUTUBE
  TWITCH
  FACEBOOK
}

enum Plan {
  FREE
  PRO
  BUSINESS
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Platform Connection Security
*For any* platform connection, the stored stream key and access tokens must be encrypted and never exposed in API responses or logs.
**Validates: Requirements 1.1**

### Property 2: Multi-Platform Broadcast Consistency
*For any* stream session with N connected platforms, starting the stream must initiate exactly N RTMP connections, one per platform.
**Validates: Requirements 1.2**

### Property 3: Stream Resilience
*For any* active stream session, if one platform connection fails, all other platform connections must remain active and unaffected.
**Validates: Requirements 1.3**

### Property 4: Platform Disconnect Cleanup
*For any* platform disconnect operation, the stream key and tokens must be removed from the database within the same transaction.
**Validates: Requirements 1.4**

### Property 5: Audio Constraints Application
*For any* audio stream request, the getUserMedia constraints must include noiseSuppression and echoCancellation set to true.
**Validates: Requirements 2.3**

### Property 6: Adaptive Bitrate Selection
*For any* measured bandwidth value, the selected quality preset must have a minBandwidth less than or equal to the measured bandwidth.
**Validates: Requirements 2.4, 2.6**

### Property 7: Plan Limit Enforcement
*For any* user action that would exceed their plan limits, the system must reject the action and return an upgrade prompt.
**Validates: Requirements 3.2**

### Property 8: Subscription Upgrade Atomicity
*For any* successful Stripe webhook for subscription creation, the user's plan must be updated in the same database transaction.
**Validates: Requirements 3.4**

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| OAuth token expired | Auto-refresh using refresh token, prompt re-auth if fails |
| Platform RTMP connection fails | Retry 3x with exponential backoff, then mark as error |
| Stripe webhook fails | Return 500 to trigger Stripe retry, log for monitoring |
| Bandwidth drops below minimum | Downgrade quality, notify user via toast |
| Stream key invalid | Show error, prompt user to reconnect platform |

## Testing Strategy

### Unit Tests
- Platform connection encryption/decryption
- Quality preset selection logic
- Plan limit checking functions
- Stripe webhook signature verification

### Property-Based Tests (using fast-check)
- **Property 1**: Generate random tokens, verify they are encrypted before storage
- **Property 2**: Generate random platform counts, verify correct number of connections
- **Property 3**: Simulate random platform failures, verify other streams continue
- **Property 6**: Generate random bandwidth values, verify correct quality selection
- **Property 7**: Generate random user actions, verify limit enforcement
- **Property 8**: Generate random webhook payloads, verify atomic updates

### Integration Tests
- Full OAuth flow with mock providers
- End-to-end stream start/stop
- Stripe checkout and webhook flow
