import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStreamStore = create(
  persist(
    (set, _get) => ({
      // Current user
      user: null,
      setUser: (user) => set({ user }),

      // Streams
      streams: [],
      currentStream: null,
      setStreams: (streams) => set({ streams }),
      setCurrentStream: (stream) => set({ currentStream: stream }),
      
      addStream: (stream) => set((state) => ({ 
        streams: [stream, ...state.streams] 
      })),
      
      updateStream: (id, updates) => set((state) => ({
        streams: state.streams.map(stream => 
          stream.id === id ? { ...stream, ...updates } : stream
        ),
        currentStream: state.currentStream?.id === id 
          ? { ...state.currentStream, ...updates } 
          : state.currentStream
      })),

      deleteStream: (id) => set((state) => ({
        streams: state.streams.filter(stream => stream.id !== id),
        currentStream: state.currentStream?.id === id ? null : state.currentStream
      })),

      // Studio state
      studioSettings: {
        micOn: false,
        camOn: false,
        layout: 'pip',
        brandColor: '#5c4dff',
        showOverlay: true,
        showLowerThird: true,
        userName: 'You',
        userTitle: 'Live Streamer',
        logoPosition: 'top-left',
        streamQuality: null // Will store quality preset settings
      },
      
      updateStudioSettings: (settings) => set((state) => ({
        studioSettings: { ...state.studioSettings, ...settings }
      })),

      // Chat messages
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages.slice(-50), message]
      })),
      clearChat: () => set({ chatMessages: [] }),

      // Live state
      isLive: false,
      isRecording: false,
      viewerCount: 0,
      streamDuration: 0,
      
      setLiveState: (isLive) => set({ isLive }),
      setRecordingState: (isRecording) => set({ isRecording }),
      setViewerCount: (count) => set({ viewerCount: count }),
      setStreamDuration: (duration) => set({ streamDuration: duration }),

      // Reset functions
      resetStudio: () => set({
        isLive: false,
        isRecording: false,
        viewerCount: 0,
        streamDuration: 0,
        chatMessages: []
      })
    }),
    {
      name: 'streamit-storage',
      partialize: (state) => ({
        user: state.user,
        studioSettings: state.studioSettings
      })
    }
  )
);