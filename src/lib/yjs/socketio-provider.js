/**
 * Yjs Socket.io Provider
 * 
 * Deze provider integreert Yjs met Socket.io voor real-time synchronisatie.
 * Gebruikt de bestaande Socket.io server voor Yjs updates.
 */

import * as Y from 'yjs';
import { io } from 'socket.io-client';

export class SocketIOProvider {
  constructor(roomId, ydoc, socketUrl = null) {
    this.roomId = roomId;
    this.ydoc = ydoc;
    this.synced = false;
    this.socket = null;
    this.updateHandler = null;
    
    // Initialize socket connection
    this.socket = io(socketUrl || '', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    
    this.setupSocketListeners();
  }
  
  setupSocketListeners() {
    // Listen for Yjs updates from server
    this.socket.on('connect', () => {
      console.log('[Yjs] Socket connected, joining room:', this.roomId);
      this.socket.emit('yjs-join', this.roomId);
      this.sync();
    });
    
    this.socket.on('disconnect', () => {
      console.log('[Yjs] Socket disconnected');
      this.synced = false;
    });
    
    // Listen for Yjs updates from other clients
    this.socket.on('yjs-update', ({ roomId, update, origin }) => {
      if (roomId === this.roomId && origin !== this.socket.id) {
        try {
          Y.applyUpdate(this.ydoc, new Uint8Array(update), this);
          if (!this.synced) {
            this.synced = true;
            console.log('[Yjs] Synced with server');
          }
        } catch (error) {
          console.error('[Yjs] Error applying update:', error);
        }
      }
    });
    
    // Listen for sync response
    this.socket.on('yjs-sync-response', ({ roomId, update }) => {
      if (roomId === this.roomId) {
        try {
          Y.applyUpdate(this.ydoc, new Uint8Array(update), this);
          this.synced = true;
          console.log('[Yjs] Initial sync complete');
        } catch (error) {
          console.error('[Yjs] Error applying sync update:', error);
        }
      }
    });
    
    // Listen for document state
    this.socket.on('yjs-state', ({ roomId, state }) => {
      if (roomId === this.roomId) {
        try {
          Y.applyUpdate(this.ydoc, new Uint8Array(state), this);
          this.synced = true;
          console.log('[Yjs] Document state loaded');
        } catch (error) {
          console.error('[Yjs] Error applying state:', error);
        }
      }
    });
    
    // Listen for Yjs document updates and broadcast them
    this.updateHandler = (update, origin) => {
      // Don't broadcast updates that came from the server
      if (origin !== this && this.synced) {
        const updateArray = Array.from(update);
        this.socket.emit('yjs-update', {
          roomId: this.roomId,
          update: updateArray,
          origin: this.socket.id
        });
      }
    };
    
    this.ydoc.on('update', this.updateHandler);
  }
  
  /**
   * Sync document state with server
   */
  sync() {
    if (!this.socket.connected) {
      console.warn('[Yjs] Socket not connected, cannot sync');
      return;
    }
    
    try {
      const stateVector = Y.encodeStateVector(this.ydoc);
      const stateVectorArray = Array.from(stateVector);
      
      this.socket.emit('yjs-sync', {
        roomId: this.roomId,
        stateVector: stateVectorArray
      });
    } catch (error) {
      console.error('[Yjs] Error syncing:', error);
    }
  }
  
  /**
   * Get document state for persistence
   */
  getState() {
    return Y.encodeStateAsUpdate(this.ydoc);
  }
  
  /**
   * Apply document state
   */
  applyState(state) {
    Y.applyUpdate(this.ydoc, new Uint8Array(state), this);
  }
  
  /**
   * Destroy provider and cleanup
   */
  destroy() {
    if (this.updateHandler) {
      this.ydoc.off('update', this.updateHandler);
    }
    
    if (this.socket) {
      this.socket.emit('yjs-leave', this.roomId);
      this.socket.off('yjs-update');
      this.socket.off('yjs-sync-response');
      this.socket.off('yjs-state');
      this.socket.disconnect();
    }
    
    this.synced = false;
  }
  
  /**
   * Check if provider is connected and synced
   */
  isConnected() {
    return this.socket?.connected && this.synced;
  }
}

