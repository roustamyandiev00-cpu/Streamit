import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(streamId, onMessage, onViewerCount, onStatusUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!streamId) return;

    // Initialize socket connection
    // Use relative path to connect to the same host/port as the web page
    socketRef.current = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Socket connected:', socket.id);
      }
      socket.emit('join-stream', streamId);
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Socket disconnected');
      }
    });

    // Stream events
    socket.on('new-message', (message) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('New message received:', message);
      }
      onMessage?.(message);
    });

    socket.on('viewer-count', (count) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Viewer count updated:', count);
      }
      onViewerCount?.(count);
    });

    socket.on('status-update', (status) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Status updated:', status);
      }
      onStatusUpdate?.(status);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave-stream', streamId);
        socket.disconnect();
      }
    };
  }, [streamId, onMessage, onViewerCount, onStatusUpdate]);

  const sendMessage = (message, username, color) => {
    if (socketRef.current && streamId) {
      const messageData = {
        streamId,
        message,
        username,
        color: color || '#5c4dff'
      };
      socketRef.current.emit('chat-message', messageData);
    }
  };

  const updateStreamStatus = (isLive, isRecording) => {
    if (socketRef.current && streamId) {
      const statusData = {
        streamId,
        isLive,
        isRecording
      };
      socketRef.current.emit('stream-status', statusData);
    }
  };

  return { sendMessage, updateStreamStatus };
}