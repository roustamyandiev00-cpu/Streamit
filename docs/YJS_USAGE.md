# 🚀 Yjs Gebruik in Streamit

## ✅ Installatie Voltooid

Yjs is nu volledig geïntegreerd in Streamit! Je kunt nu collaborative editing gebruiken voor:
- Scene Management
- Overlay Editor
- Template Editor
- Stream Notes
- Stream Settings

## 📖 Basis Gebruik

### Optie 1: Direct Hook Gebruik

```javascript
import { useYjsCollaboration, useYjsState } from '@/hooks/useYjsCollaboration';

function MyComponent({ streamId, userId }) {
  // Initialize Yjs
  const { ydoc, connected, getArray, transact } = useYjsCollaboration(
    streamId, 
    userId
  );
  
  // Get Yjs array
  const scenesArray = getArray('scenes');
  
  // Sync met React state
  const scenes = useYjsState(scenesArray);
  
  // Update data
  const addScene = () => {
    transact(() => {
      scenesArray.push([{ id: 'new', name: 'New Scene' }]);
    });
  };
  
  return (
    <div>
      {connected && <p>✅ Connected!</p>}
      {scenes?.map(scene => (
        <div key={scene.id}>{scene.name}</div>
      ))}
      <button onClick={addScene}>Add Scene</button>
    </div>
  );
}
```

### Optie 2: Met YjsProvider (Aanbevolen)

```javascript
import { YjsProvider, useYjs, useYjsType, useYjsState } from '@/components/YjsProvider';

// Wrap je component met provider
function StudioPage({ streamId, userId }) {
  return (
    <YjsProvider roomId={streamId} userId={userId}>
      <SceneManager />
      <OverlayEditor />
    </YjsProvider>
  );
}

// Gebruik in child componenten
function SceneManager() {
  const { getArray, transact, connected } = useYjs();
  const scenesArray = useYjsType('array', 'scenes');
  const scenes = useYjsState(scenesArray);
  
  // ... rest van component
}
```

## 🎯 Voorbeelden per Feature

### Collaborative Scene Management

```javascript
import { useYjsCollaboration, useYjsState } from '@/hooks/useYjsCollaboration';

function CollaborativeSceneManager({ streamId, userId }) {
  const { getArray, transact, connected } = useYjsCollaboration(streamId, userId);
  const scenesArray = getArray('scenes');
  const scenes = useYjsState(scenesArray);
  
  const addScene = () => {
    transact(() => {
      scenesArray.push([{
        id: `scene-${Date.now()}`,
        name: `Scene ${scenesArray.length + 1}`,
        sources: []
      }]);
    });
  };
  
  const updateScene = (sceneId, updates) => {
    transact(() => {
      const index = scenes.findIndex(s => s.id === sceneId);
      if (index !== -1) {
        const scene = scenesArray.get(index);
        if (scene instanceof Y.Map) {
          Object.entries(updates).forEach(([key, value]) => {
            scene.set(key, value);
          });
        }
      }
    });
  };
  
  return (
    <div>
      <div>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      {/* ... rest van UI */}
    </div>
  );
}
```

### Collaborative Overlay Editor

```javascript
function CollaborativeOverlayEditor({ streamId, userId }) {
  const { getArray, transact } = useYjsCollaboration(streamId, userId);
  const overlaysArray = getArray('overlays');
  const overlays = useYjsState(overlaysArray);
  
  const updateOverlayPosition = (overlayId, x, y) => {
    transact(() => {
      const index = overlays.findIndex(o => o.id === overlayId);
      if (index !== -1) {
        const overlay = overlaysArray.get(index);
        if (overlay instanceof Y.Map) {
          overlay.set('x', x);
          overlay.set('y', y);
        }
      }
    });
  };
  
  // ... rest van component
}
```

### Collaborative Stream Notes

```javascript
function CollaborativeStreamNotes({ streamId, userId }) {
  const { getText } = useYjsCollaboration(streamId, userId);
  const notesText = getText('notes');
  const notes = useYjsState(notesText);
  
  return (
    <textarea
      value={notes || ''}
      onChange={(e) => {
        // Y.Text updates worden automatisch gesynchroniseerd
        notesText.delete(0, notesText.length);
        notesText.insert(0, e.target.value);
      }}
    />
  );
}
```

## 🔧 Geavanceerde Features

### Offline Support

Yjs ondersteunt automatisch offline editing via IndexedDB. Data wordt automatisch opgeslagen en gesynchroniseerd wanneer je weer online bent.

```javascript
// Offline support is automatisch ingeschakeld
const { synced } = useYjsCollaboration(streamId, userId, {
  enableOffline: true // default: true
});
```

### Atomic Updates (Transacties)

Gebruik `transact()` voor meerdere gerelateerde updates die atomisch moeten zijn:

```javascript
transact(() => {
  scenesArray.push([newScene]);
  activeSceneMap.set('id', newScene.id);
  // Alle updates gebeuren atomisch
});
```

### Connection Status

```javascript
const { connected, synced } = useYjsCollaboration(streamId, userId);

if (!connected) {
  return <div>Connecting to collaborative session...</div>;
}

if (!synced) {
  return <div>Syncing data...</div>;
}
```

## 🧪 Testen

1. **Start de server:**
   ```bash
   npm run dev
   ```

2. **Open meerdere browser tabs/windows:**
   - Navigeer naar `/studio?streamId=test123`
   - Maak wijzigingen in één tab
   - Zie ze real-time verschijnen in andere tabs

3. **Test offline:**
   - Maak wijzigingen
   - Disconnect internet
   - Maak meer wijzigingen
   - Reconnect internet
   - Zie dat alles gesynchroniseerd wordt

## 📝 Best Practices

1. **Gebruik transacties** voor meerdere gerelateerde updates
2. **Cleanup observers** in useEffect cleanup
3. **Gebruik aparte Y.Doc instances** per feature (scenes, overlays, etc.)
4. **Valideer data** voordat je het in Yjs zet
5. **Test met meerdere tabs** om sync te testen

## 🐛 Troubleshooting

### Data sync niet?
- Check of Socket.io verbinding werkt
- Check of room ID hetzelfde is
- Check browser console voor errors
- Check server logs voor Yjs events

### Performance problemen?
- Gebruik aparte Y.Doc instances per feature
- Limiteer document grootte
- Gebruik garbage collection (automatisch ingeschakeld)

### Conflicten?
- Yjs lost automatisch conflicten op met CRDT
- Als je conflicten ziet, check je implementatie
- Gebruik transacties voor atomic updates

## 📚 Meer Informatie

- [Yjs Quick Start Guide](./YJS_QUICK_START.md)
- [Yjs Integration Plan](./YJS_INTEGRATION_PLAN.md)
- [Yjs Documentation](https://docs.yjs.dev/)

---

**Klaar om te gebruiken!** 🎉

