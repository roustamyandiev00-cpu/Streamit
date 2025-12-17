'use client';

/**
 * VOORBEELD: Collaborative Scene Manager met Yjs
 * 
 * Dit is een voorbeeld implementatie van hoe je Yjs kunt gebruiken
 * voor collaborative scene editing in Streamit.
 * 
 * Om dit te gebruiken:
 * 1. Installeer Yjs: npm install yjs y-websocket y-indexeddb
 * 2. Zet een WebSocket server op (zie YJS_INTEGRATION_PLAN.md)
 * 3. Vervang de huidige SceneManager met deze versie
 */

import { useState, useEffect } from 'react';
import { useYjsCollaboration, useYjsState } from '../hooks/useYjsCollaboration';
import { Users, Wifi, WifiOff } from 'lucide-react';

export default function CollaborativeSceneManager({ 
  streamId, 
  userId,
  onSceneChange 
}) {
  // Initialize Yjs collaboration
  const { 
    ydoc, 
    connected, 
    synced, 
    getArray, 
    transact 
  } = useYjsCollaboration(streamId, userId, {
    onConnect: () => console.log('Yjs connected'),
    onDisconnect: () => console.log('Yjs disconnected'),
    onUpdate: (update, origin) => {
      console.log('Yjs update received from:', origin);
    }
  });
  
  // Get scenes array from Yjs
  const scenesArray = getArray('scenes');
  
  // Sync Yjs array with React state
  const scenes = useYjsState(scenesArray, (data) => data || []);
  
  // Initialize default scenes if empty
  useEffect(() => {
    if (scenesArray && scenesArray.length === 0) {
      transact(() => {
        scenesArray.push([
          { id: 'scene1', name: 'Scene 1', sources: [] },
          { id: 'scene2', name: 'Scene 2', sources: [] }
        ]);
      });
    }
  }, [scenesArray, transact]);
  
  // Add new scene
  const addScene = () => {
    if (!scenesArray) return;
    
    const newScene = {
      id: `scene-${Date.now()}`,
      name: `Scene ${scenesArray.length + 1}`,
      sources: []
    };
    
    transact(() => {
      scenesArray.push([newScene]);
    });
  };
  
  // Update scene
  const updateScene = (sceneId, updates) => {
    if (!scenesArray) return;
    
    const index = scenes.findIndex(s => s.id === sceneId);
    if (index === -1) return;
    
    transact(() => {
      const scene = scenesArray.get(index);
      if (scene instanceof Y.Map) {
        Object.entries(updates).forEach(([key, value]) => {
          scene.set(key, value);
        });
      }
    });
  };
  
  // Delete scene
  const deleteScene = (sceneId) => {
    if (!scenesArray) return;
    
    const index = scenes.findIndex(s => s.id === sceneId);
    if (index === -1) return;
    
    transact(() => {
      scenesArray.delete(index, 1);
    });
  };
  
  // Reorder scenes
  const reorderScenes = (fromIndex, toIndex) => {
    if (!scenesArray) return;
    
    transact(() => {
      const scene = scenesArray.get(fromIndex);
      scenesArray.delete(fromIndex, 1);
      scenesArray.insert(toIndex, [scene]);
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-gray-300">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          {synced && (
            <span className="text-xs text-gray-500">• Synced</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {connected ? 'Collaborative' : 'Local only'}
          </span>
        </div>
      </div>
      
      {/* Scenes List */}
      <div className="space-y-2">
        {scenes && scenes.length > 0 ? (
          scenes.map((scene, index) => (
            <div
              key={scene.id}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{scene.name}</h3>
                  <p className="text-sm text-gray-400">
                    {scene.sources?.length || 0} sources
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSceneChange?.(scene.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => deleteScene(scene.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">
            No scenes yet. Add your first scene!
          </p>
        )}
      </div>
      
      {/* Add Scene Button */}
      <button
        onClick={addScene}
        disabled={!connected}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        Add Scene
      </button>
      
      {/* Info */}
      <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Collaborative Mode:</strong> Changes are synced in real-time
          with other users. All users see the same scenes and can edit them simultaneously.
        </p>
      </div>
    </div>
  );
}

/**
 * GEBRUIK INSTRUCTIES:
 * 
 * 1. Installeer dependencies:
 *    npm install yjs y-websocket y-indexeddb
 * 
 * 2. Zet WebSocket server op (zie YJS_INTEGRATION_PLAN.md)
 * 
 * 3. Importeer en gebruik in je Studio page:
 *    import CollaborativeSceneManager from '@/components/CollaborativeSceneManager.example';
 * 
 * 4. Vervang huidige SceneManager:
 *    <CollaborativeSceneManager 
 *      streamId={streamId} 
 *      userId={session?.user?.id}
 *      onSceneChange={handleSceneChange}
 *    />
 * 
 * 5. Test met meerdere browser tabs/windows open
 */

