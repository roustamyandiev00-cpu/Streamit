# Streamit - Cursor AI Agent Setup

## 🎯 Current Project Status

**Latest Development Focus:**
- Platform integration and multi-destination streaming
- AI-powered insights and analytics
- Visual editing tools for streams and overlays

## 🚀 Quick Reference

### Core Commands
```bash
# Development
npm run dev          # Start dev server (port 3001)
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes
npx prisma generate  # Generate Prisma client

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode
```

### Environment Setup
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# External APIs (Optional)
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key
```

## 🎨 Project Architecture

### Key Components
1. **Next.js App Router** - Modern React framework
2. **Prisma ORM** - Database management
3. **NextAuth.js** - Authentication
4. **Socket.io** - Real-time features
5. **WebRTC** - Video streaming
6. **TensorFlow.js** - AI/ML capabilities

### Main Features
- **Studio**: Live streaming studio with camera/mic controls
- **Analytics**: Performance dashboards and metrics
- **Platform Manager**: Multi-platform streaming (RTMP)
- **Chat System**: Real-time moderated chat
- **AI Insights**: Machine learning powered recommendations

## 🔧 Common Issues & Solutions

### Issue: Database Connection Failed
**Solution:**
```bash
npx prisma generate
npm install @prisma/client
```

### Issue: Socket.io Connection Issues
**Solution:**
Check if server is running on port 3001 and restart both server and client.

### Issue: WebRTC Permissions
**Solution:**
Ensure HTTPS or localhost, check browser permissions for camera/mic.

## 📝 Feature Development Notes

### API Routes
- `GET /api/streams` - Fetch user streams
- `POST /api/streams` - Create new stream
- `PUT /api/streams/[id]` - Update stream
- `DELETE /api/streams/[id]` - Delete stream

### Useful File Locations
- **Schema**: `prisma/schema.prisma`
- **Auth Config**: `src/lib/auth.js`
- **Socket Setup**: `src/lib/socket.js`
- **Global Store**: `src/store/useStreamStore.js`
- **API Routes**: `src/app/api/`

### TODO Notes in Codebase
```
// TODO: Implement adaptive bitrate streaming
// TODO: Add CDN integration
// TODO: Implement real-time transcription
// TODO: Add viewer analytics
// TODO: Implement stream recording
// TODO: Add custom RTMP destinations
```

## 🎯 Development Workflow

1. **Setup**: Ensure all dependencies are installed and database is migrated
2. **Development**: Start dev server and develop features
3. **Testing**: Test features in browser, check console for errors
4. **Database**: Use Prisma Studio to inspect data if needed
5. **Deployment**: Build and deploy when ready

## 📞 Demo Account
**Email**: `demo@streamit.com`
**Password**: `demo123`

## 🤖 AI Agent Capabilities
When working on this project, the AI agent can:
- Create/modify React components using the App Router pattern
- Implement API routes with proper error handling
- Update database schema and generate migrations
- Debug complex issues across the stack
- Optimize performance and implement new features
