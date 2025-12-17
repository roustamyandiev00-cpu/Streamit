'use client';

/**
 * React Hook voor Yjs Collaborative Editing
 * 
 * Deze hook maakt het makkelijk om Yjs te gebruiken in React componenten
 * voor real-time collaborative editing.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { createYjsDoc, getYMap, getYArray, getYText } from '../lib/yjs/setup';
import { SocketIOProvider } from '../lib/yjs/socketio-provider';
import { IndexeddbPersistence } from 'y-indexeddb';

/**
 * Hook voor collaborative editing met Yjs
 * 
 * @param {string} roomId - Unieke room identifier (bijv. streamId)
 * @param {string} userId - Huidige gebruiker ID
 * @param {Object} options - Configuratie opties
 * @param {Function} options.onConnect - Callback wanneer verbonden
 * @param {Function} options.onDisconnect - Callback wanneer verbroken
 * @param {Function} options.onUpdate - Callback bij updates
 * @param {boolean} options.enableOffline - Enable IndexedDB persistence (default: true)
 * @returns {Object} Yjs document en helper functies
 */
export function useYjsCollaboration(roomId, userId, options = {}) {
  const { onConnect, onDisconnect, onUpdate, enableOffline = true } = options;
  
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const indexeddbProviderRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  
  // Initialize Yjs document and providers
  useEffect(() => {
    if (!roomId) return;
    
    // Create Yjs document
    ydocRef.current = createYjsDoc(roomId);
    
    // Setup Socket.io provider for real-time sync
    providerRef.current = new SocketIOProvider(roomId, ydocRef.current);
    
    // Setup IndexedDB provider for offline support
    if (enableOffline && typeof window !== 'undefined') {
      try {
        indexeddbProviderRef.current = new IndexeddbPersistence(
          `streamit-${roomId}`,
          ydocRef.current
        );
        
        indexeddbProviderRef.current.on('synced', () => {
          // IndexedDB synced
        });
      } catch (error) {
        console.warn('[Yjs] IndexedDB not available:', error);
      }
    }
    
    // Listen for connection status
    const checkConnection = () => {
      const isConnected = providerRef.current?.isConnected() || false;
      if (isConnected !== connected) {
        setConnected(isConnected);
        if (isConnected) {
          setSynced(true);
          if (onConnect) onConnect();
        } else {
          if (onDisconnect) onDisconnect();
        }
      }
    };
    
    // Check connection periodically
    const connectionInterval = setInterval(checkConnection, 1000);
    
    // Listen for updates
    const handleUpdate = (update, origin) => {
      if (origin !== providerRef.current && onUpdate) {
        onUpdate(update, origin);
      }
    };
    
    ydocRef.current.on('update', handleUpdate);
    
    // Initial connection check
    checkConnection();
    
    return () => {
      clearInterval(connectionInterval);
      
      if (ydocRef.current) {
        ydocRef.current.off('update', handleUpdate);
      }
      
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      
      if (indexeddbProviderRef.current) {
        indexeddbProviderRef.current.destroy();
      }
      
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
      
      setConnected(false);
      setSynced(false);
    };
  }, [roomId, userId, onConnect, onDisconnect, onUpdate, enableOffline, connected]);
  
  // Helper functions
  const getMap = useCallback((name) => {
    if (!ydocRef.current) return null;
    return getYMap(ydocRef.current, name);
  }, []);
  
  const getArray = useCallback((name) => {
    if (!ydocRef.current) return null;
    return getYArray(ydocRef.current, name);
  }, []);
  
  const getText = useCallback((name) => {
    if (!ydocRef.current) return null;
    return getYText(ydocRef.current, name);
  }, []);
  
  // Transact helper voor atomic updates
  const transact = useCallback((callback) => {
    if (!ydocRef.current) return;
    ydocRef.current.transact(callback, userId);
  }, [userId]);
  
  return {
    ydoc: ydocRef.current,
    connected,
    synced,
    getMap,
    getArray,
    getText,
    transact
  };
}

/**
 * Hook voor syncing Yjs data met React state
 * 
 * @param {Y.Map|Y.Array|Y.Text} ytype - Yjs type (Map, Array, of Text)
 * @param {Function} transform - Transform functie voor Yjs data naar React state
 * @returns {any} React state gesynchroniseerd met Yjs
 */
export function useYjsState(ytype, transform = (data) => data) {
  const [state, setState] = useState(() => {
    if (!ytype) return null;
    
    if (ytype instanceof Y.Map) {
      return transform(ytype.toJSON());
    } else if (ytype instanceof Y.Array) {
      return transform(ytype.toArray());
    } else if (ytype instanceof Y.Text) {
      return transform(ytype.toString());
    }
    return null;
  });
  
  useEffect(() => {
    if (!ytype) return;
    
    const updateState = () => {
      if (ytype instanceof Y.Map) {
        setState(transform(ytype.toJSON()));
      } else if (ytype instanceof Y.Array) {
        setState(transform(ytype.toArray()));
      } else if (ytype instanceof Y.Text) {
        setState(transform(ytype.toString()));
      }
    };
    
    // Initial state
    updateState();
    
    // Observe changes
    ytype.observe(updateState);
    
    return () => {
      ytype.unobserve(updateState);
    };
  }, [ytype, transform]);
  
  return state;
}

/**
 * Hook voor collaborative awareness (wie is online, cursors, etc.)
 * 
 * @param {Y.Doc} ydoc - Yjs document
 * @param {string} userId - Huidige gebruiker ID
 * @param {Object} userInfo - Gebruiker informatie (name, color, etc.)
 * @returns {Object} Awareness data en helper functies
 */
export function useYjsAwareness(ydoc, userId, userInfo = {}) {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    if (!ydoc) return;
    
    // Note: Awareness requires y-protocols/awareness
    // This is a simplified version
    // For full implementation, install: npm install y-protocols
    
    const updateUsers = () => {
      // Simplified - in real implementation, use Awareness protocol
      setUsers([{ id: userId, ...userInfo }]);
    };
    
    updateUsers();
    
    return () => {
      // Cleanup
    };
  }, [ydoc, userId, userInfo]);
  
  const setLocalState = useCallback((_state) => {
    // Set local awareness state
    // In full implementation, use awareness.setLocalState
  }, []);
  
  return {
    users,
    setLocalState
  };
}

