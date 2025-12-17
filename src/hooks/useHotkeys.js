'use client';

import { useEffect, useCallback } from 'react';

export function useHotkeys(hotkeys, dependencies = []) {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger hotkeys when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Create key combination string
    let combination = '';
    if (ctrl) combination += 'ctrl+';
    if (shift) combination += 'shift+';
    if (alt) combination += 'alt+';
    combination += key;

    // Find matching hotkey
    const hotkey = hotkeys.find(h => h.key === combination);
    if (hotkey) {
      event.preventDefault();
      hotkey.action();
    }
  }, dependencies);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const defaultStudioHotkeys = [
  {
    key: 'space',
    description: 'Toggle Recording',
    category: 'Recording'
  },
  {
    key: 'ctrl+shift+r',
    description: 'Start/Stop Recording',
    category: 'Recording'
  },
  {
    key: 'ctrl+shift+s',
    description: 'Start/Stop Streaming',
    category: 'Streaming'
  },
  {
    key: 'ctrl+m',
    description: 'Toggle Microphone',
    category: 'Audio'
  },
  {
    key: 'ctrl+shift+m',
    description: 'Toggle Camera',
    category: 'Video'
  },
  {
    key: 'ctrl+d',
    description: 'Toggle Screen Share',
    category: 'Video'
  },
  {
    key: 'f11',
    description: 'Toggle Fullscreen',
    category: 'View'
  },
  {
    key: 'ctrl+1',
    description: 'Switch to Scene 1',
    category: 'Scenes'
  },
  {
    key: 'ctrl+2',
    description: 'Switch to Scene 2',
    category: 'Scenes'
  },
  {
    key: 'ctrl+3',
    description: 'Switch to Scene 3',
    category: 'Scenes'
  },
  {
    key: 'ctrl+shift+c',
    description: 'Open Chat',
    category: 'Interface'
  },
  {
    key: 'ctrl+shift+a',
    description: 'Open Audio Mixer',
    category: 'Interface'
  },
  {
    key: 'ctrl+shift+o',
    description: 'Open Overlays',
    category: 'Interface'
  },
  {
    key: 'escape',
    description: 'Close Modal/Cancel',
    category: 'Interface'
  }
];