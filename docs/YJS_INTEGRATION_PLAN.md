# 🚀 Yjs Integratie Plan voor Streamit

## Overzicht

Yjs is een CRDT (Conflict-free Replicated Data Type) library die perfect geschikt is voor real-time collaborative editing in Streamit. Dit document beschrijft hoe we Yjs kunnen integreren voor verschillende collaborative features.

## 🎯 Use Cases

### 1. Collaborative Scene Management
**Doel:** Meerdere producers kunnen tegelijk scenes bewerken tijdens een live stream.

**Voordelen:**
- Real-time synchronisatie van scene wijzigingen
- Geen conflicten door CRDT algoritme
- Offline support met automatische sync
- Geschiedenis tracking

**Implementatie:**
- Gebruik `Y.Map` voor scene configuratie
- `Y.Array` voor scene lijst
- `Y.Text` voor scene namen en beschrijvingen

### 2. Collaborative Overlay Editor
**Doel:** Teamleden kunnen samen overlays maken en positioneren.

**Voordelen:**
- Real-time positionering updates
- Gezamenlijke styling wijzigingen
- Live preview voor alle gebruikers
- Conflict-vrije editing

**Implementatie:**
- `Y.Map` voor overlay properties (x, y, width, height, color, etc.)
- `Y.Array` voor overlay lijst
- Custom bindings voor canvas synchronisatie

### 3. Collaborative Template Editor
**Doel:** Templates samen ontwikkelen en bewerken.

**Voordelen:**
- Real-time template configuratie updates
- Gezamenlijke template ontwikkeling
- Version control ingebouwd

**Implementatie:**
- `Y.Map` voor template configuratie
- `Y.Text` voor template metadata
- `Y.Array` voor template settings

### 4. Real-time Stream Notes/Scripts
**Doel:** Gedeelde notities en scripts tijdens streams.

**Voordelen:**
- Rich text editing met Y.Text
- Real-time updates
- Offline support
- Undo/redo functionaliteit

**Implementatie:**
- `Y.Text` voor rich text content
- `Y.Array` voor notitie lijst
- Integratie met markdown editor

### 5. Collaborative Stream Settings
**Doel:** Samen stream configuratie aanpassen.

**Voordelen:**
- Real-time settings synchronisatie
- Geen conflicten
- Live preview van wijzigingen

**Implementatie:**
- `Y.Map` voor stream settings
- Custom validators voor settings

## 📦 Technische Architectuur

### Yjs Provider Setup

```javascript
// src/lib/yjs/provider.js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

export function createYjsProvider(roomId, userId) {
  const ydoc = new Y.Doc()
  
  // WebSocket provider voor real-time sync
  const wsProvider = new WebsocketProvider(
    'ws://localhost:3001', // of je WebSocket server
    `streamit-${roomId}`,
    ydoc
  )
  
  // IndexedDB provider voor offline support
  const indexeddbProvider = new IndexeddbPersistence(
    `streamit-${roomId}`,
    ydoc
  )
  
  return { ydoc, wsProvider, indexeddbProvider }
}
```

### React Hooks

```javascript
// src/hooks/useYjs.js
import { useEffect, useState } from 'react'
import { useYjsProvider } from './useYjsProvider'

export function useYjs(roomId, userId) {
  const { ydoc, wsProvider } = useYjsProvider(roomId, userId)
  const [connected, setConnected] = useState(false)
  
  useEffect(() => {
    wsProvider.on('status', ({ status }) => {
      setConnected(status === 'connected')
    })
    
    return () => {
      wsProvider.destroy()
    }
  }, [wsProvider])
  
  return { ydoc, connected }
}
```

### Scene Manager Integratie

```javascript
// src/components/SceneManager.js (aangepast)
import { useYjs } from '../hooks/useYjs'
import * as Y from 'yjs'

export default function SceneManager({ streamId, ...props }) {
  const { ydoc, connected } = useYjs(streamId, userId)
  const [scenes, setScenes] = useState([])
  
  useEffect(() => {
    const scenesArray = ydoc.getArray('scenes')
    
    // Sync met Yjs
    scenesArray.observe(() => {
      setScenes(scenesArray.toArray())
    })
    
    // Initial load
    setScenes(scenesArray.toArray())
    
    return () => {
      scenesArray.unobserve()
    }
  }, [ydoc])
  
  const updateScene = (sceneId, updates) => {
    const scenesArray = ydoc.getArray('scenes')
    const index = scenesArray.toArray().findIndex(s => s.id === sceneId)
    
    if (index !== -1) {
      const sceneMap = scenesArray.get(index)
      Object.entries(updates).forEach(([key, value]) => {
        sceneMap.set(key, value)
      })
    }
  }
  
  // ... rest van component
}
```

## 🔌 WebSocket Server Setup

### Option 1: Yjs WebSocket Server (Aanbevolen)
```bash
npm install y-websocket
```

```javascript
// server.js (toevoegen)
const { setupWSConnection } = require('y-websocket/bin/utils')
const http = require('http')
const WebSocket = require('ws')

const wss = new WebSocket.Server({ 
  port: 1234,
  perMessageDeflate: false 
})

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})
```

### Option 2: Integratie met bestaande Socket.io
```javascript
// src/lib/yjs/socketio-provider.js
import * as Y from 'yjs'
import { io } from 'socket.io-client'

export class SocketIOProvider {
  constructor(roomId, ydoc) {
    this.roomId = roomId
    this.ydoc = ydoc
    this.socket = io()
    this.synced = false
    
    this.socket.on('connect', () => {
      this.socket.emit('yjs-join', roomId)
      this.sync()
    })
    
    this.ydoc.on('update', (update) => {
      if (this.synced) {
        this.socket.emit('yjs-update', { roomId, update })
      }
    })
    
    this.socket.on('yjs-update', ({ update }) => {
      Y.applyUpdate(this.ydoc, update)
    })
  }
  
  async sync() {
    const stateVector = Y.encodeStateVector(this.ydoc)
    this.socket.emit('yjs-sync', { roomId: this.roomId, stateVector })
  }
  
  destroy() {
    this.socket.emit('yjs-leave', this.roomId)
    this.socket.disconnect()
  }
}
```

## 📋 Implementatie Stappen

### Fase 1: Basis Setup (Week 1)
- [ ] Yjs installeren: `npm install yjs y-websocket y-indexeddb`
- [ ] WebSocket server opzetten
- [ ] Basis provider implementeren
- [ ] React hooks maken

### Fase 2: Scene Manager (Week 2)
- [ ] SceneManager component aanpassen voor Yjs
- [ ] Real-time scene synchronisatie
- [ ] Conflict resolution testen
- [ ] UI indicators voor connected users

### Fase 3: Overlay Editor (Week 3)
- [ ] OverlayEditor component aanpassen
- [ ] Canvas synchronisatie
- [ ] Real-time positionering
- [ ] Multi-user cursors (optioneel)

### Fase 4: Template Editor (Week 4)
- [ ] TemplateEditor component aanpassen
- [ ] Real-time template configuratie
- [ ] Version history

### Fase 5: Stream Notes (Week 5)
- [ ] Rich text editor integratie
- [ ] Markdown support
- [ ] Real-time updates

## 🎨 UI/UX Verbeteringen

### Connected Users Indicator
```javascript
// src/components/CollaborativeIndicator.js
export function CollaborativeIndicator({ connected, users }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm text-gray-400">
        {connected ? `${users.length} users online` : 'Disconnected'}
      </span>
    </div>
  )
}
```

### User Cursors (Advanced)
```javascript
// src/components/UserCursors.js
import { Awareness } from 'y-protocols/awareness'

export function UserCursors({ awareness, ydoc }) {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    awareness.on('change', () => {
      const states = awareness.getStates()
      setUsers(Array.from(states.values()))
    })
  }, [awareness])
  
  return (
    <div>
      {users.map(user => (
        <div 
          key={user.clientID}
          className="absolute"
          style={{ left: user.cursor?.x, top: user.cursor?.y }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  )
}
```

## 🔒 Security Overwegingen

1. **Room Access Control**
   - Verifieer gebruikers voordat ze joinen
   - Permissies per room (read/write)
   - Rate limiting

2. **Data Validation**
   - Valideer updates voordat ze worden toegepast
   - Sanitize user input
   - Schema validation

3. **Encryption**
   - End-to-end encryption voor gevoelige data
   - TLS voor WebSocket verbindingen

## 📊 Performance Overwegingen

1. **Document Size**
   - Gebruik aparte Y.Doc instances per feature
   - Garbage collection voor oude data
   - Compressie voor grote updates

2. **Update Frequency**
   - Debounce voor frequente updates
   - Batch updates waar mogelijk
   - Optimistic UI updates

3. **Memory Management**
   - Cleanup on unmount
   - Limit document history
   - IndexedDB cleanup

## 🧪 Testing

```javascript
// src/test/yjs.test.js
import { describe, it, expect } from 'vitest'
import * as Y from 'yjs'

describe('Yjs Scene Synchronization', () => {
  it('should sync scenes between multiple clients', () => {
    const doc1 = new Y.Doc()
    const doc2 = new Y.Doc()
    
    const scenes1 = doc1.getArray('scenes')
    const scenes2 = doc2.getArray('scenes')
    
    scenes1.push([{ id: '1', name: 'Scene 1' }])
    
    // Simulate sync
    const update = Y.encodeStateAsUpdate(doc1)
    Y.applyUpdate(doc2, update)
    
    expect(scenes2.toArray()).toEqual(scenes1.toArray())
  })
})
```

## 📚 Resources

- [Yjs Documentation](https://docs.yjs.dev/)
- [Yjs Examples](https://github.com/yjs/yjs#examples)
- [CRDT Explained](https://crdt.tech/)
- [Yjs Internals](https://github.com/yjs/yjs/blob/main/INTERNALS.md)

## 🚀 Quick Start

```bash
# Install dependencies
npm install yjs y-websocket y-indexeddb

# Start development server
npm run dev

# Test collaborative features
# Open multiple browser tabs/windows
# Navigate to studio page
# Make changes in one tab, see them sync in others
```

## ✅ Checklist voor Productie

- [ ] WebSocket server security
- [ ] Rate limiting geïmplementeerd
- [ ] Error handling en reconnection logic
- [ ] Performance monitoring
- [ ] User permissions systeem
- [ ] Data persistence strategy
- [ ] Backup en recovery
- [ ] Load testing
- [ ] Documentation voor developers

---

**Laatste Update:** 2025-01-17  
**Status:** Planning  
**Prioriteit:** Medium-High

