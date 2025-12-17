/**
 * GET /api/streams/[id]/playback
 * Get playback information for a stream (geïnspireerd op rtmp-live API)
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';
import { getStreamPlaybackInfo } from '../../../../../lib/streamDiscovery';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get stream from database
    const stream = await prisma.stream.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Get playback info from discovery service
    const playbackInfo = await getStreamPlaybackInfo(stream.rtmpKey || id);

    if (!playbackInfo) {
      return NextResponse.json({
        error: 'Stream is not currently live',
        stream: {
          id: stream.id,
          title: stream.title,
          status: stream.status
        }
      }, { status: 404 });
    }

    // Combine database info with playback info
    return NextResponse.json({
      ...playbackInfo,
      stream: {
        id: stream.id,
        title: stream.title,
        status: 'LIVE'
      },
      playbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}${playbackInfo.manifestUrl}`
    });
  } catch (error) {
    console.error('Error getting playback info:', error);
    return NextResponse.json({ error: 'Failed to get playback info' }, { status: 500 });
  }
}

