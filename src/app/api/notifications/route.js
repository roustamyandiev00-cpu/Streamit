import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import {
  sendNotification,
  notifyStreamStart,
  notifyClipReady,
  notifyViewerMilestone,
  notifyPlatformStatus
} from '../../../lib/notifications';

// POST /api/notifications - Send notification
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    let result;

    switch (type) {
      case 'stream_start':
        result = await notifyStreamStart(session.user.id, data);
        break;

      case 'clip_ready':
        result = await notifyClipReady(session.user.id, data);
        break;

      case 'viewer_milestone':
        result = await notifyViewerMilestone(session.user.id, data.streamId, data.milestone);
        break;

      case 'platform_status':
        result = await notifyPlatformStatus(session.user.id, data.platform, data.status);
        break;

      default:
        // Generic notification
        result = await sendNotification(session.user.id, data.templateId, data.payload);
    }

    if (result.success) {
      return NextResponse.json({ message: 'Notification sent', data: result.data });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    const { logger } = require('../../../lib/logger');
    logger.error('Error sending notification', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

