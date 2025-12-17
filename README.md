# 🎬 Streamit - Professional Streaming Platform

Een complete, moderne streaming platform gebouwd met Next.js, Prisma, en real-time technologieën.

## ✨ Features

### 🔐 **Authenticatie & Gebruikersbeheer**
- **NextAuth.js** integratie met Google, GitHub, en demo accounts
- Veilige sessie management
- Gebruikersprofielen en avatars

### 📊 **Database & Persistentie**
- **Prisma ORM** met SQLite database
- Complete data modellen voor streams, chat, analytics
- Real-time data synchronisatie
- Automatische migraties

### 🎥 **Advanced Streaming Studio**
- **WebRTC** camera en microfoon toegang
- **Screen sharing** functionaliteit
- Real-time video preview met multiple layouts
- Live streaming controls (start/stop/record)
- Branding overlays en lower thirds
- **Advanced Scene Management** met drag & drop
- **Professional Audio Mixer** met EQ en effects

### 💬 **Real-time Chat**
- **Socket.io** powered live chat
- Persistent chat geschiedenis
- Kleurgecodeerde gebruikers
- Real-time viewer count
- **AI-powered chat moderation**

### 📈 **Analytics Dashboard**
- **Recharts** powered visualisaties
- Stream performance metrics
- Viewer engagement analytics
- Device breakdown statistieken
- Exporteerbare rapporten

### 🤖 **AI-Powered Insights**
- **TensorFlow.js** machine learning
- Voice command recognition
- Auto scene detection en optimalisatie
- Smart content recommendations
- Performance optimization suggestions
- Auto-highlight detection voor clips

### 🌐 **Multi-platform Streaming**
- YouTube Live integratie
- Twitch streaming support
- Facebook Live connectie
- LinkedIn Live ondersteuning
- RTMP key management

### 🎬 **Advanced Video Processing**
- **FFmpeg.js** video processing
- Real-time video filters en effects
- Automatic thumbnail generation
- Video compression en optimization
- Custom overlay editor met canvas

### 📱 **Mobile Support**
- **Capacitor** mobile app framework
- Touch-optimized controls
- Mobile streaming interface
- Device orientation support
- Battery en connection monitoring

### 📁 **File Management**
- **Sharp** image processing
- Thumbnail uploads en optimalisatie
- Automatische bestandscompressie
- Veilige file storage

### 🎨 **Modern UI/UX**
- **Responsive design** voor alle devices
- Dark theme met gradient accents
- Smooth animaties en transities
- Professional dashboard interface

## 🚀 Quick Start

### Installatie
```bash
# Clone het project
git clone <repository-url>
cd streamit

# Installeer dependencies
npm install

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

### Environment Setup
Maak een `.env` bestand aan:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (Optioneel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## 📱 Gebruik

### 1. **Inloggen**
- Ga naar `http://localhost:3001`
- Gebruik demo account: `demo@streamit.com` / `demo123`
- Of verbind met Google/GitHub

### 2. **Stream Aanmaken**
- Klik op "New Stream" in het dashboard
- Kies tussen RTMP of Studio streaming
- Configureer je stream instellingen

### 3. **Live Gaan**
- Open de Studio pagina
- Configureer camera en microfoon
- Klik "GO LIVE" om te beginnen
- Monitor chat en viewer count real-time

### 4. **Analytics Bekijken**
- Ga naar Analytics sectie
- Bekijk performance metrics
- Exporteer rapporten voor analyse

### 5. **Platforms Verbinden**
- Open Platforms sectie
- Voeg je streaming platform keys toe
- Stream naar meerdere platforms tegelijk

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **Lucide React** - Icon library
- **Recharts** - Data visualisatie
- **Socket.io Client** - Real-time communicatie

### Backend
- **Next.js API Routes** - Server-side logic
- **Prisma** - Database ORM
- **SQLite** - Development database
- **NextAuth.js** - Authenticatie
- **Socket.io** - WebSocket server

### AI & Machine Learning
- **TensorFlow.js** - Client-side ML
- **Speech Commands** - Voice recognition
- **OpenAI API** - Content generation
- **Custom AI models** - Scene detection

### Media & Files
- **WebRTC** - Video/audio streaming
- **FFmpeg.js** - Video processing
- **Sharp** - Image processing
- **Multer** - File uploads
- **RecordRTC** - Advanced recording

### Mobile & Cross-platform
- **Capacitor** - Mobile app framework
- **PWA** - Progressive Web App
- **Touch gestures** - Mobile interactions

### State Management
- **Zustand** - Global state management
- **React Hooks** - Local state

## 📂 Project Structure

```
streamit/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── analytics/         # Analytics dashboard
│   │   └── studio/            # Streaming studio
│   ├── components/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   └── store/                 # State management
├── prisma/                    # Database schema & migrations
├── public/                    # Static assets
└── uploads/                   # User uploaded files
```

## 🔧 API Endpoints

### Streams
- `GET /api/streams` - Fetch user streams
- `POST /api/streams` - Create new stream
- `PUT /api/streams/[id]` - Update stream
- `DELETE /api/streams/[id]` - Delete stream

### Chat
- `GET /api/chat` - Get chat messages
- `POST /api/chat` - Send chat message

### Platforms
- `GET /api/platforms` - Get connected platforms
- `POST /api/platforms` - Connect/disconnect platform

### Upload
- `POST /api/upload` - Upload files (thumbnails, etc.)

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

## 🎯 Roadmap

### Korte Termijn
- [x] WebRTC peer-to-peer streaming
- [x] Advanced chat moderation
- [x] AI-powered insights
- [x] Mobile responsive studio
- [x] Advanced video processing
- [x] Scene management system
- [x] Professional audio mixer

### Lange Termijn
- [ ] HLS/DASH streaming protocol
- [ ] CDN integratie
- [ ] Real-time collaboration
- [ ] Enterprise SSO integration
- [ ] Advanced AI content analysis
- [ ] Multi-language support
- [ ] Cloud recording storage

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🙏 Acknowledgments

- **Next.js** team voor het geweldige framework
- **Prisma** voor de database tooling
- **Socket.io** voor real-time functionaliteit
- **Vercel** voor deployment platform

---

**Gemaakt met ❤️ door het Streamit team**

Voor vragen of support, open een issue op GitHub of contact ons via [email](mailto:support@streamit.com).