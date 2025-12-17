/**
 * Analytics Service - PostHog Integration
 * Tracks user events and behavior
 */

let posthog = null;

// Initialize PostHog on client-side
if (typeof window !== 'undefined') {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
    try {
      const posthogLib = require('posthog-js');
      posthog = posthogLib.default;
      
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: () => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('PostHog initialized');
          }
        },
        capture_pageview: true,
        capture_pageleave: true,
      });
    } catch (error) {
      console.warn('PostHog initialization failed:', error);
    }
  }
}

/**
 * Identify user
 */
export function identifyUser(userId, properties = {}) {
  if (posthog && userId) {
    posthog.identify(userId, properties);
  }
}

/**
 * Track event
 */
export function trackEvent(eventName, properties = {}) {
  if (posthog) {
    posthog.capture(eventName, properties);
  } else if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Event tracked:', eventName, properties);
  }
}

/**
 * Track stream events
 */
export const streamEvents = {
  streamCreated: (streamId, streamType) => {
    trackEvent('stream_created', {
      stream_id: streamId,
      stream_type: streamType,
    });
  },
  
  streamStarted: (streamId) => {
    trackEvent('stream_started', {
      stream_id: streamId,
    });
  },
  
  streamEnded: (streamId, duration) => {
    trackEvent('stream_ended', {
      stream_id: streamId,
      duration,
    });
  },
  
  streamViewed: (streamId) => {
    trackEvent('stream_viewed', {
      stream_id: streamId,
    });
  },
};

/**
 * Track clip events
 */
export const clipEvents = {
  clipGenerated: (clipId, streamId) => {
    trackEvent('clip_generated', {
      clip_id: clipId,
      stream_id: streamId,
    });
  },
  
  clipDownloaded: (clipId) => {
    trackEvent('clip_downloaded', {
      clip_id: clipId,
    });
  },
  
  clipShared: (clipId, platform) => {
    trackEvent('clip_shared', {
      clip_id: clipId,
      platform,
    });
  },
};

/**
 * Track platform events
 */
export const platformEvents = {
  platformConnected: (platform) => {
    trackEvent('platform_connected', {
      platform,
    });
  },
  
  platformDisconnected: (platform) => {
    trackEvent('platform_disconnected', {
      platform,
    });
  },
};

/**
 * Track UI events
 */
export const uiEvents = {
  buttonClicked: (buttonName, location) => {
    trackEvent('button_clicked', {
      button_name: buttonName,
      location,
    });
  },
  
  pageViewed: (pageName) => {
    trackEvent('page_viewed', {
      page_name: pageName,
    });
  },
  
  featureUsed: (featureName) => {
    trackEvent('feature_used', {
      feature_name: featureName,
    });
  },
};

/**
 * Reset user session (on logout)
 */
export function resetSession() {
  if (posthog) {
    posthog.reset();
  }
}

