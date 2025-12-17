'use client';

/**
 * Yjs Provider Component
 * 
 * React Context Provider voor Yjs collaborative editing.
 * Maakt Yjs beschikbaar voor alle child componenten.
 */

import { createContext, useContext, useMemo } from 'react';
import { useYjsCollaboration } from '../hooks/useYjsCollaboration';

const YjsContext = createContext(null);

/**
 * YjsProvider - Maakt Yjs beschikbaar voor child componenten
 * 
 * @param {Object} props
 * @param {string} props.roomId - Room identifier (bijv. streamId)
 * @param {string} props.userId - Huidige gebruiker ID
 * @param {Object} props.options - Yjs configuratie opties
 * @param {React.ReactNode} props.children - Child componenten
 */
export function YjsProvider({ roomId, userId, options = {}, children }) {
  const yjs = useYjsCollaboration(roomId, userId, options);
  
  const value = useMemo(() => yjs, [yjs]);
  
  return (
    <YjsContext.Provider value={value}>
      {children}
    </YjsContext.Provider>
  );
}

/**
 * Hook om Yjs context te gebruiken
 * 
 * @returns {Object} Yjs document en helper functies
 */
export function useYjs() {
  const context = useContext(YjsContext);
  
  if (!context) {
    throw new Error('useYjs must be used within YjsProvider');
  }
  
  return context;
}

/**
 * Hook voor specifieke Yjs types
 * 
 * @param {string} type - Type naam ('map', 'array', 'text')
 * @param {string} name - Type identifier
 * @returns {Y.Map|Y.Array|Y.Text|null} Yjs type instance
 */
export function useYjsType(type, name) {
  const { getMap, getArray, getText } = useYjs();
  
  return useMemo(() => {
    if (!name) return null;
    
    switch (type) {
      case 'map':
        return getMap(name);
      case 'array':
        return getArray(name);
      case 'text':
        return getText(name);
      default:
        return null;
    }
  }, [type, name, getMap, getArray, getText]);
}

