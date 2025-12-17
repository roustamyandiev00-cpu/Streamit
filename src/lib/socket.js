const { Server } = require('socket.io');
const Y = require('yjs');

let io = null;
// Store Yjs document states per room
const yjsRooms = new Map();

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : "http://localhost:3001",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join stream room
    socket.on('join-stream', (streamId) => {
      socket.join(`stream-${streamId}`);
      console.log(`User ${socket.id} joined stream ${streamId}`);
      
      // Send current viewer count
      const room = io.sockets.adapter.rooms.get(`stream-${streamId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`stream-${streamId}`).emit('viewer-count', viewerCount);
    });

    // Leave stream room
    socket.on('leave-stream', (streamId) => {
      socket.leave(`stream-${streamId}`);
      console.log(`User ${socket.id} left stream ${streamId}`);
      
      // Send updated viewer count
      const room = io.sockets.adapter.rooms.get(`stream-${streamId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`stream-${streamId}`).emit('viewer-count', viewerCount);
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { streamId, message, username, color } = data;
      
      const chatMessage = {
        id: Date.now(),
        message,
        username,
        color,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all users in the stream room
      io.to(`stream-${streamId}`).emit('new-message', chatMessage);
      console.log(`Chat message in stream ${streamId}:`, chatMessage);
    });

    // Handle stream status updates
    socket.on('stream-status', (data) => {
      const { streamId, isLive, isRecording } = data;
      
      const statusUpdate = {
        isLive,
        isRecording,
        timestamp: new Date().toISOString()
      };

      // Broadcast status to all users in the stream room
      io.to(`stream-${streamId}`).emit('status-update', statusUpdate);
      console.log(`Stream ${streamId} status update:`, statusUpdate);
    });

    // ===== Yjs Collaborative Editing Handlers =====
    
    // Join Yjs room
    socket.on('yjs-join', (roomId) => {
      socket.join(`yjs-${roomId}`);
      console.log(`[Yjs] User ${socket.id} joined Yjs room: ${roomId}`);
      
      // Initialize room if it doesn't exist
      if (!yjsRooms.has(roomId)) {
        yjsRooms.set(roomId, {
          ydoc: new Y.Doc(),
          clients: new Set()
        });
      }
      
      const room = yjsRooms.get(roomId);
      room.clients.add(socket.id);
      
      // Send current document state to new client
      const state = Y.encodeStateAsUpdate(room.ydoc);
      socket.emit('yjs-state', {
        roomId,
        state: Array.from(state)
      });
    });
    
    // Leave Yjs room
    socket.on('yjs-leave', (roomId) => {
      socket.leave(`yjs-${roomId}`);
      console.log(`[Yjs] User ${socket.id} left Yjs room: ${roomId}`);
      
      const room = yjsRooms.get(roomId);
      if (room) {
        room.clients.delete(socket.id);
        
        // Cleanup room if no clients
        if (room.clients.size === 0) {
          room.ydoc.destroy();
          yjsRooms.delete(roomId);
          console.log(`[Yjs] Cleaned up room: ${roomId}`);
        }
      }
    });
    
    // Handle Yjs sync request
    socket.on('yjs-sync', ({ roomId, stateVector }) => {
      const room = yjsRooms.get(roomId);
      if (!room) {
        console.warn(`[Yjs] Room ${roomId} not found for sync`);
        return;
      }
      
      try {
        // Compute diff between client state and server state
        const update = Y.encodeStateAsUpdate(room.ydoc, new Uint8Array(stateVector));
        socket.emit('yjs-sync-response', {
          roomId,
          update: Array.from(update)
        });
      } catch (error) {
        console.error(`[Yjs] Error syncing room ${roomId}:`, error);
      }
    });
    
    // Handle Yjs updates from client
    socket.on('yjs-update', ({ roomId, update, origin }) => {
      const room = yjsRooms.get(roomId);
      if (!room) {
        console.warn(`[Yjs] Room ${roomId} not found for update`);
        return;
      }
      
      try {
        // Apply update to server document
        Y.applyUpdate(room.ydoc, new Uint8Array(update), socket);
        
        // Broadcast to all other clients in the room
        socket.to(`yjs-${roomId}`).emit('yjs-update', {
          roomId,
          update,
          origin
        });
      } catch (error) {
        console.error(`[Yjs] Error applying update to room ${roomId}:`, error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Cleanup Yjs rooms
      for (const [roomId, room] of yjsRooms.entries()) {
        if (room.clients.has(socket.id)) {
          room.clients.delete(socket.id);
          
          if (room.clients.size === 0) {
            room.ydoc.destroy();
            yjsRooms.delete(roomId);
            console.log(`[Yjs] Cleaned up room ${roomId} after disconnect`);
          }
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIO };