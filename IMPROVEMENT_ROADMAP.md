# StreamIt - Verbeteringsplan 🚀

**Datum:** 2025-12-16  
**Doel:** Van werkende code naar production-ready enterprise applicatie

---

## 🎯 Quick Wins (Deze Week)

### 1. **Error Logging & Monitoring** ⭐⭐⭐
**Waarom:** Productie errors kunnen nu onopgemerkt blijven  
**Impact:** Hoog - Essentieel voor productie

**Implementatie:**
```bash
# Installeer Sentry voor error tracking
npm install @sentry/nextjs

# Of gebruik LogRocket voor session replay
npm install logrocket logrocket-react
```

**Setup Sentry:**
```javascript
// src/lib/logger.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const logger = {
  error: (message, error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    }
    Sentry.captureException(error, { extra: { message } });
  },
  warn: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, data);
    }
    Sentry.captureMessage(message, { level: 'warning', extra: data });
  },
  info: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data);
    }
    Sentry.captureMessage(message, { level: 'info', extra: data });
  }
};
```

**Vervang alle console statements:**
```javascript
// Voor
console.error('Failed to load streams:', error);

// Na
import { logger } from '@/lib/logger';
logger.error('Failed to load streams', error);
```

---

### 2. **TypeScript Migratie** ⭐⭐⭐
**Waarom:** Type safety voorkomt runtime errors  
**Impact:** Hoog - Betere developer experience en minder bugs

**Stap-voor-stap:**
```bash
# 1. Installeer TypeScript
npm install --save-dev typescript @types/react @types/node

# 2. Maak tsconfig.json
npx tsc --init

# 3. Hernoem bestanden gradueel
# .js -> .tsx (voor React components)
# .js -> .ts (voor utilities)
```

**Start met kritieke bestanden:**
1. `src/lib/auth.js` → `src/lib/auth.ts`
2. `src/store/useStreamStore.js` → `src/store/useStreamStore.ts`
3. `src/lib/socket.js` → `src/lib/socket.ts`

**Voorbeeld conversie:**
```typescript
// src/lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface User {
  id: string;
  email: string;
  name: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    logger.error('Error getting current user', error);
    return null;
  }
}
```

---

### 3. **Environment Variables Validatie** ⭐⭐
**Waarom:** Voorkom runtime crashes door missende env vars  
**Impact:** Medium - Betere developer experience

```bash
npm install zod
```

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  RTMP_PORT: z.string().default('1935'),
  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

---

## 🔧 Code Kwaliteit (Deze Maand)

### 4. **Unit & Integration Tests** ⭐⭐⭐
**Waarom:** Voorkom regressies en verhoog confidence bij changes  
**Impact:** Hoog - Essentieel voor lange termijn onderhoud

```bash
# Installeer testing tools
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

**Configuratie:**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

**Voorbeeld tests:**
```typescript
// src/components/__tests__/PlatformManager.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlatformManager from '../PlatformManager';

describe('PlatformManager', () => {
  it('loads and displays platforms', async () => {
    render(<PlatformManager />);
    
    await waitFor(() => {
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });
  });

  it('toggles platform connection', async () => {
    const user = userEvent.setup();
    render(<PlatformManager />);
    
    const connectButton = screen.getByRole('button', { name: /connect/i });
    await user.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });
});
```

**Test Coverage Goals:**
- Utilities: 80%+
- Components: 60%+
- API Routes: 70%+

---

### 5. **Code Formatting & Linting** ⭐⭐
**Waarom:** Consistente code style in team  
**Impact:** Medium - Betere samenwerking

```bash
# Installeer Prettier
npm install --save-dev prettier eslint-config-prettier

# Installeer husky voor pre-commit hooks
npm install --save-dev husky lint-staged
npx husky install
```

**Configuratie:**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

### 6. **Performance Optimalisatie** ⭐⭐
**Waarom:** Betere user experience en SEO  
**Impact:** Medium-Hoog

**Acties:**

**A. Image Optimization:**
```typescript
// Vervang alle <img> door Next.js Image
import Image from 'next/image';

// Voor
<img src={preview} className="w-full" />

// Na
<Image 
  src={preview} 
  alt="Preview"
  width={800}
  height={600}
  className="w-full"
  priority={false}
  loading="lazy"
/>
```

**B. Code Splitting:**
```typescript
// Lazy load zware components
import dynamic from 'next/dynamic';

const AudioMixer = dynamic(() => import('@/components/AudioMixer'), {
  loading: () => <div>Loading mixer...</div>,
  ssr: false
});

const OverlayEditor = dynamic(() => import('@/components/OverlayEditor'), {
  ssr: false
});
```

**C. React Query voor Data Fetching:**
```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useStreams.ts
import { useQuery } from '@tanstack/react-query';

export function useStreams() {
  return useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      const res = await fetch('/api/streams');
      if (!res.ok) throw new Error('Failed to fetch streams');
      return res.json();
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
```

---

## 🏗️ Architectuur (Volgende Sprint)

### 7. **Database Migraties & Seeding** ⭐⭐⭐
**Waarom:** Reproduceerbare database setup  
**Impact:** Hoog

```bash
# Prisma migraties
npx prisma migrate dev --name init

# Seed script
npx prisma db seed
```

**Verbeter seed script:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@streamit.com' },
    update: {},
    create: {
      email: 'test@streamit.com',
      name: 'Test User',
    },
  });

  // Create platforms
  const platforms = ['youtube', 'twitch', 'facebook'];
  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { id: platform },
      update: {},
      create: {
        id: platform,
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        userId: user.id,
        isConnected: false,
      },
    });
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### 8. **API Validatie met Zod** ⭐⭐
**Waarom:** Type-safe API endpoints  
**Impact:** Medium-Hoog

```typescript
// src/lib/validations/stream.ts
import { z } from 'zod';

export const createStreamSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  scheduledFor: z.string().datetime().optional(),
  thumbnail: z.string().url().optional(),
});

export type CreateStreamInput = z.infer<typeof createStreamSchema>;
```

```typescript
// src/app/api/streams/route.ts
import { createStreamSchema } from '@/lib/validations/stream';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createStreamSchema.parse(body); // Validatie!
    
    // ... rest of logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    // ... error handling
  }
}
```

---

### 9. **Rate Limiting & Security** ⭐⭐⭐
**Waarom:** Bescherm tegen abuse en attacks  
**Impact:** Hoog

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});
```

```typescript
// src/app/api/streams/route.ts
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... rest of logic
}
```

**Security Headers:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## 📱 Features (Volgende Maand)

### 10. **Real-time Updates met WebSockets** ⭐⭐
**Waarom:** Betere UX voor live streaming app  
**Impact:** Medium

```typescript
// Verbeter Socket.io implementatie
// src/lib/socket.ts
import { Server } from 'socket.io';

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id });

    socket.on('join-stream', (streamId) => {
      socket.join(`stream:${streamId}`);
      logger.info('Client joined stream', { streamId, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });

  return io;
}
```

---

### 11. **Analytics Dashboard Verbetering** ⭐⭐
**Waarom:** Betere insights voor gebruikers  
**Impact:** Medium

**Voeg toe:**
- Real-time viewer count
- Engagement metrics (likes, comments, shares)
- Revenue tracking (indien van toepassing)
- Export naar CSV/PDF
- Vergelijkingen tussen streams

```typescript
// src/components/AnalyticsDashboard.tsx
import { AreaChart, BarChart } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

export function AnalyticsDashboard({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Viewers Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]">
            <AreaChart data={data.viewerHistory}>
              <Area dataKey="viewers" stroke="#3b82f6" fill="#3b82f6" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* More charts... */}
    </div>
  );
}
```

---

### 12. **Multi-language Support (i18n)** ⭐
**Waarom:** Bereik internationale gebruikers  
**Impact:** Low-Medium (afhankelijk van doelgroep)

```bash
npm install next-intl
```

```typescript
// src/i18n/messages/nl.json
{
  "dashboard": {
    "title": "Dashboard",
    "createStream": "Nieuwe Stream",
    "myStreams": "Mijn Streams"
  }
}

// src/i18n/messages/en.json
{
  "dashboard": {
    "title": "Dashboard",
    "createStream": "Create Stream",
    "myStreams": "My Streams"
  }
}
```

---

## 🚀 DevOps & Deployment

### 13. **CI/CD Pipeline** ⭐⭐⭐
**Waarom:** Geautomatiseerde testing en deployment  
**Impact:** Hoog

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

### 14. **Docker Setup** ⭐⭐
**Waarom:** Consistente development en production environment  
**Impact:** Medium

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/streamit
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: streamit
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📊 Prioriteiten Matrix

| Prioriteit | Taak | Impact | Effort | ROI |
|-----------|------|--------|--------|-----|
| 🔴 P0 | Error Logging | Hoog | Low | ⭐⭐⭐⭐⭐ |
| 🔴 P0 | TypeScript | Hoog | High | ⭐⭐⭐⭐ |
| 🟡 P1 | Unit Tests | Hoog | High | ⭐⭐⭐⭐ |
| 🟡 P1 | Rate Limiting | Hoog | Medium | ⭐⭐⭐⭐ |
| 🟡 P1 | CI/CD | Hoog | Medium | ⭐⭐⭐⭐ |
| 🟢 P2 | Performance | Medium | Medium | ⭐⭐⭐ |
| 🟢 P2 | API Validatie | Medium | Low | ⭐⭐⭐ |
| 🔵 P3 | i18n | Low | Medium | ⭐⭐ |
| 🔵 P3 | Docker | Low | Low | ⭐⭐ |

---

## 🎯 2-Week Sprint Plan

### Week 1:
- ✅ Dag 1-2: Sentry setup + vervang console statements
- ✅ Dag 3-4: TypeScript setup + converteer 5 belangrijkste bestanden
- ✅ Dag 5: Environment validatie + CI/CD setup

### Week 2:
- ✅ Dag 1-2: Unit tests voor utilities en hooks
- ✅ Dag 3-4: API validatie met Zod
- ✅ Dag 5: Rate limiting + security headers

---

## 📞 Hulp Nodig?

Wil je dat ik een van deze verbeteringen implementeer? Zeg het maar! Ik kan:
- ✅ Complete TypeScript conversie doen
- ✅ Test suite opzetten
- ✅ CI/CD pipeline maken
- ✅ Performance optimalisaties implementeren
- ✅ Elk ander onderdeel uit dit plan

**Vraag gewoon:** "Implementeer [nummer] uit het verbeteringsplan"

---

**Gemaakt door:** Kombai Code Assistant  
**Laatste Update:** 2025-12-16