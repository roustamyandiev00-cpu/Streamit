# 🚀 Yjs Quick Start Guide

## Wat is Yjs?

Yjs is een **CRDT (Conflict-free Replicated Data Type)** library die je kunt gebruiken voor **real-time collaborative editing** zonder conflicten. Perfect voor Streamit om meerdere gebruikers tegelijk te laten werken aan scenes, overlays, templates, etc.

## Waarom Yjs?

✅ **Geen conflicten** - CRDT algoritme lost automatisch conflicten op  
✅ **Offline support** - Werkt offline en sync automatisch wanneer online  
✅ **Real-time sync** - Wijzigingen verschijnen direct bij alle gebruikers  
✅ **Efficiënt** - Alleen verschillen worden gesynchroniseerd  
✅ **Betrouwbaar** - Wiskundig bewezen correct (formal proof)  

## Installatie

```bash
# Installeer Yjs en providers
npm install yjs y-websocket y-indexeddb

# Optioneel: voor awareness (wie is online, cursors)
npm install y-protocols
```

## Basis Gebruik

### 1. Maak een Yjs Document

```javascript
import * as Y from 'yjs'

const ydoc = new Y.Doc()
```

### 2. Gebruik Yjs Types

```javascript
// Voor objecten (scenes, overlays, settings)
const scenesMap = ydoc.getMap('scenes')

// Voor arrays (lijsten)
const scenesArray = ydoc.getArray('scenes')

// Voor tekst (notities, scripts)
const notesText = ydoc.getText('notes')
```

### 3. Werken met Data

```javascript
// Map: object data
scenesMap.set('scene1', { name: 'Scene 1', sources: [] })
const scene = scenesMap.get('scene1')

// Array: lijst data
scenesArray.push([{ id: '1', name: 'Scene 1' }])
const scenes = scenesArray.toArray()

// Text: tekst data
notesText.insert(0, 'Hello World')
const text = notesText.toString()
```

### 4. Luisteren naar Wijzigingen

```javascript
// Observeer wijzigingen
scenesArray.observe((event) => {
  console.log('Scenes changed:', scenesArray.toArray())
})

// Cleanup
scenesArray.unobserve()
```

## React Integratie

### Gebruik de Custom Hook

```javascript
import { useYjsCollaboration, useYjsState } from '@/hooks/useYjsCollaboration'

function MyComponent({ streamId, userId }) {
  // Initialize Yjs
  const { ydoc, connected, getArray, transact } = useYjsCollaboration(
    streamId, 
    userId
  )
  
  // Get Yjs array
  const scenesArray = getArray('scenes')
  
  // Sync met React state
  const scenes = useYjsState(scenesArray)
  
  // Update data
  const addScene = () => {
    transact(() => {
      scenesArray.push([{ id: 'new', name: 'New Scene' }])
    })
  }
  
  return (
    <div>
      {connected && <p>Connected!</p>}
      {scenes.map(scene => (
        <div key={scene.id}>{scene.name}</div>
      ))}
      <button onClick={addScene}>Add Scene</button>
    </div>
  )
}
```

## WebSocket Server Setup

### Optie 1: Yjs WebSocket Server (Aanbevolen)

```bash
npm install y-websocket
```

```javascript
// server.js
const { setupWSConnection } = require('y-websocket/bin/utils')
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 1234 })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})
```

### Optie 2: Integratie met Socket.io

Zie `YJS_INTEGRATION_PLAN.md` voor volledige implementatie.

## Voorbeeld: Collaborative Scene Manager

Zie `src/components/CollaborativeSceneManager.example.js` voor een volledig werkend voorbeeld.

## Veelvoorkomende Patronen

### Atomic Updates (Transacties)

```javascript
// Gebruik transact() voor atomic updates
transact(() => {
  scenesArray.push([newScene])
  scenesMap.set('activeScene', newScene.id)
  // Alle updates gebeuren atomisch
})
```

### Offline Support

```javascript
import { IndexeddbPersistence } from 'y-indexeddb'

const indexeddbProvider = new IndexeddbPersistence(roomId, ydoc)

indexeddbProvider.on('synced', () => {
  console.log('Data loaded from IndexedDB')
})
```

### State Synchronisatie

```javascript
// Export state voor backup
const state = Y.encodeStateAsUpdate(ydoc)

// Import state van backup
Y.applyUpdate(ydoc, state)
```

## Best Practices

1. **Gebruik transacties** voor meerdere gerelateerde updates
2. **Cleanup observers** in useEffect cleanup
3. **Gebruik aparte Y.Doc instances** per feature (scenes, overlays, etc.)
4. **Valideer data** voordat je het in Yjs zet
5. **Test met meerdere tabs** om sync te testen

## Troubleshooting

### Data sync niet?
- Check WebSocket verbinding
- Check room ID is hetzelfde
- Check Yjs document is geïnitialiseerd

### Performance problemen?
- Gebruik aparte Y.Doc instances per feature
- Limiteer document grootte
- Gebruik garbage collection

### Conflicten?
- Yjs lost automatisch conflicten op
- Als je conflicten ziet, check je implementatie
- Gebruik transacties voor atomic updates

## Volgende Stappen

1. Lees `YJS_INTEGRATION_PLAN.md` voor volledige implementatie
2. Bekijk `CollaborativeSceneManager.example.js` voor voorbeeld
3. Test met meerdere browser tabs
4. Integreer in je bestaande componenten

## Resources

- [Yjs Documentation](https://docs.yjs.dev/)
- [Yjs Examples](https://github.com/yjs/yjs#examples)
- [CRDT Explained](https://crdt.tech/)

---

**Vragen?** Open een issue of bekijk de documentatie!

