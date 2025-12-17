/**
 * Yjs Setup en Configuration
 * 
 * Deze module configureert Yjs voor collaborative editing in Streamit.
 * Yjs gebruikt CRDT (Conflict-free Replicated Data Types) voor
 * real-time synchronisatie zonder conflicten.
 */

import * as Y from 'yjs';

/**
 * Maakt een nieuwe Yjs document instance aan
 * @param {string} _roomId - Unieke room identifier (bijv. streamId)
 * @returns {Y.Doc} Yjs document instance
 */
export function createYjsDoc(_roomId) {
  const ydoc = new Y.Doc();
  
  // Enable garbage collection voor performance
  ydoc.gc = true;
  
  return ydoc;
}

/**
 * Maakt een Y.Map voor object data synchronisatie
 * @param {Y.Doc} ydoc - Yjs document
 * @param {string} name - Map naam
 * @returns {Y.Map} Y.Map instance
 */
export function getYMap(ydoc, name) {
  return ydoc.getMap(name);
}

/**
 * Maakt een Y.Array voor array data synchronisatie
 * @param {Y.Doc} ydoc - Yjs document
 * @param {string} name - Array naam
 * @returns {Y.Array} Y.Array instance
 */
export function getYArray(ydoc, name) {
  return ydoc.getArray(name);
}

/**
 * Maakt een Y.Text voor text synchronisatie
 * @param {Y.Doc} ydoc - Yjs document
 * @param {string} name - Text naam
 * @returns {Y.Text} Y.Text instance
 */
export function getYText(ydoc, name) {
  return ydoc.getText(name);
}

/**
 * Exporteert document state voor backup/persistence
 * @param {Y.Doc} ydoc - Yjs document
 * @returns {Uint8Array} Encoded document state
 */
export function exportYjsState(ydoc) {
  return Y.encodeStateAsUpdate(ydoc);
}

/**
 * Importeert document state van backup/persistence
 * @param {Y.Doc} ydoc - Yjs document
 * @param {Uint8Array} state - Encoded document state
 */
export function importYjsState(ydoc, state) {
  Y.applyUpdate(ydoc, state);
}

/**
 * Maakt een state vector voor efficient syncing
 * @param {Y.Doc} ydoc - Yjs document
 * @returns {Uint8Array} State vector
 */
export function getStateVector(ydoc) {
  return Y.encodeStateVector(ydoc);
}

/**
 * Compute diff tussen twee document states
 * @param {Y.Doc} ydoc - Yjs document
 * @param {Uint8Array} stateVector - State vector van remote client
 * @returns {Uint8Array} Update met alleen de verschillen
 */
export function computeDiff(ydoc, stateVector) {
  return Y.encodeStateAsUpdate(ydoc, stateVector);
}

