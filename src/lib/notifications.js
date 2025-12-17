/**
 * Notification Service - Novu Integration
 * Handles all notifications (email, SMS, push, in-app)
 */

// For server-side usage
let novuClient = null;

if (typeof window === 'undefined') {
  // Server-side
  try {
    const { Novu } = require('@novu/node');
    if (process.env.NOVU_API_KEY) {
      novuClient = new Novu(process.env.NOVU_API_KEY);
    }
  } catch (error) {
    console.warn('Novu not configured. Set NOVU_API_KEY in environment variables.');
  }
}

/**
 * Send notification to user
 * @param {string} userId - User identifier
 * @param {string} templateId - Novu template ID
 * @param {object} payload - Notification payload
 */
export async function sendNotification(userId, templateId, payload = {}) {
  if (!novuClient) {
    console.warn('Novu client not initialized');
    return { success: false, error: 'Novu not configured' };
  }

  try {
    const result = await novuClient.trigger(templateId, {
      to: {
        subscriberId: userId,
      },
      payload,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send stream start notification
 */
export async function notifyStreamStart(userId, streamData) {
  return sendNotification(userId, 'stream-started', {
    streamTitle: streamData.title,
    streamUrl: streamData.url,
    startTime: new Date().toISOString(),
  });
}

/**
 * Send clip ready notification
 */
export async function notifyClipReady(userId, clipData) {
  return sendNotification(userId, 'clip-ready', {
    clipTitle: clipData.title,
    clipUrl: clipData.url,
    thumbnailUrl: clipData.thumbnailUrl,
  });
}

/**
 * Send viewer milestone notification
 */
export async function notifyViewerMilestone(userId, streamId, milestone) {
  return sendNotification(userId, 'viewer-milestone', {
    milestone,
    streamId,
    message: `Congratulations! You reached ${milestone} viewers!`,
  });
}

/**
 * Send platform connection status
 */
export async function notifyPlatformStatus(userId, platform, status) {
  return sendNotification(userId, 'platform-status', {
    platform,
    status,
    message: `${platform} connection ${status}`,
  });
}

// Client-side notification hook
export function useNotifications() {
  if (typeof window === 'undefined') {
    return { notifications: [], markAsRead: () => {}, markAllAsRead: () => {} };
  }

  // In a real implementation, you'd use @novu/react hooks here
  // For now, return a simple implementation
  return {
    notifications: [],
    markAsRead: (id) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Mark as read:', id);
      }
    },
    markAllAsRead: () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Mark all as read');
      }
    },
  };
}

