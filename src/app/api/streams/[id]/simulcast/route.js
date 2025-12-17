import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { startSimulcast, stopSimulcast, getSimulcastStatus } from '@/lib/simulcastManager';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// GET /api/streams/[id]/simulcast - Get simulcast status
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: streamId } = params;

    // Verify stream ownership
    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id
      },
      include: {
        simulcastPlatforms: {
          include: {
            platformConnection: true
          }
        }
      }
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Get real-time status from simulcast manager
    const realTimeStatus = stream.rtmpKey ? getSimulcastStatus(stream.rtmpKey) : null;

    // Combine database and real-time status
    const platforms = stream.simulcastPlatforms.map(sp => {
      const realTime = realTimeStatus?.platforms.find(p => p.platformId === sp.platformId);
      return {
        id: sp.id,
        platform: sp.platform,
        platformId: sp.platformId,
        status: realTime?.status || sp.status,
        errorMessage: realTime?.error || sp.errorMessage,
        viewerCount: sp.viewerCount,
        connectedAt: sp.connectedAt,
        lastUpdate: sp.lastUpdate
      };
    });

    return NextResponse.json({
      streamId,
      isActive: !!realTimeStatus,
      platforms,
      startTime: realTimeStatus?.startTime
    });
  } catch (error) {
    logger.error('Error fetching simulcast status', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/streams/[id]/simulcast - Start simulcasting
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: streamId } = params;
    const body = await request.json();
    const { platformIds } = body; // Array of PlatformConnection IDs

    if (!platformIds || !Array.isArray(platformIds) || platformIds.length === 0) {
      return NextResponse.json(
        { error: 'platformIds array is required' },
        { status: 400 }
      );
    }

    // Verify stream ownership
    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id
      }
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (!stream.rtmpKey) {
      return NextResponse.json(
        { error: 'Stream must have an RTMP key to simulcast' },
        { status: 400 }
      );
    }

    // Get platform connections
    const platformConnections = await prisma.platformConnection.findMany({
      where: {
        id: { in: platformIds },
        userId: session.user.id,
        isActive: true
      }
    });

    if (platformConnections.length === 0) {
      return NextResponse.json(
        { error: 'No valid platform connections found' },
        { status: 400 }
      );
    }

    // Prepare platform configs for simulcast
    const platformConfigs = platformConnections.map(pc => ({
      platform: pc.platform,
      platformId: pc.id,
      rtmpUrl: pc.rtmpUrl,
      streamKey: pc.streamKey,
      protocol: pc.protocol
    }));

    // Start simulcast
    try {
      const simulcastInstance = await startSimulcast(stream.rtmpKey, platformConfigs);

      // Create/update StreamPlatform records in database
      for (const platformConfig of platformConfigs) {
        await prisma.streamPlatform.upsert({
          where: {
            streamId_platformId: {
              streamId,
              platformId: platformConfig.platformId
            }
          },
          update: {
            status: 'CONNECTING',
            rtmpUrl: platformConfig.rtmpUrl,
            streamKey: platformConfig.streamKey,
            protocol: platformConfig.protocol,
            platform: platformConfig.platform,
            lastUpdate: new Date()
          },
          create: {
            streamId,
            platformId: platformConfig.platformId,
            platform: platformConfig.platform,
            status: 'CONNECTING',
            rtmpUrl: platformConfig.rtmpUrl,
            streamKey: platformConfig.streamKey,
            protocol: platformConfig.protocol,
            platformConnectionId: platformConfig.platformId
          }
        });
      }

      // Update stream status
      await prisma.stream.update({
        where: { id: streamId },
        data: { isLive: true }
      });

      return NextResponse.json({
        message: `Simulcasting to ${platformConfigs.length} platforms`,
        simulcast: {
          streamKey: stream.rtmpKey,
          platforms: simulcastInstance.platforms.map(p => ({
            platform: p.platform,
            status: p.status
          }))
        }
      });
    } catch (error) {
      logger.error('Error starting simulcast', error);
      return NextResponse.json(
        { error: `Failed to start simulcast: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error in simulcast POST', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/streams/[id]/simulcast - Update simulcast (add/remove platforms)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: streamId } = params;
    const body = await request.json();
    const { action, platformId } = body; // action: 'add' | 'remove', platformId

    if (!action || !platformId) {
      return NextResponse.json(
        { error: 'action and platformId are required' },
        { status: 400 }
      );
    }

    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id
      }
    });

    if (!stream || !stream.rtmpKey) {
      return NextResponse.json(
        { error: 'Stream not found or not ready for simulcast' },
        { status: 404 }
      );
    }

    if (action === 'remove') {
      // Remove platform from simulcast
      await prisma.streamPlatform.deleteMany({
        where: {
          streamId,
          platformId
        }
      });

      // Note: FFmpeg process will need to be restarted to remove platform
      // For now, we'll stop and restart simulcast
      const remainingPlatforms = await prisma.streamPlatform.findMany({
        where: { streamId }
      });

      if (remainingPlatforms.length > 0) {
        // Restart with remaining platforms
        await stopSimulcast(stream.rtmpKey);
        // Re-start will be handled by client calling POST again
      } else {
        await stopSimulcast(stream.rtmpKey);
      }

      return NextResponse.json({ message: 'Platform removed from simulcast' });
    }

    // Add platform (similar to POST but for single platform)
    const platformConnection = await prisma.platformConnection.findFirst({
      where: {
        id: platformId,
        userId: session.user.id,
        isActive: true
      }
    });

    if (!platformConnection) {
      return NextResponse.json(
        { error: 'Platform connection not found' },
        { status: 404 }
      );
    }

    // This would require restarting simulcast with new platform
    // For simplicity, return instruction to restart
    return NextResponse.json({
      message: 'To add a platform, restart simulcast with all desired platforms',
      requiresRestart: true
    });
  } catch (error) {
    logger.error('Error updating simulcast', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/streams/[id]/simulcast - Stop simulcasting
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: streamId } = params;

    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id
      }
    });

    if (!stream || !stream.rtmpKey) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Stop simulcast
    await stopSimulcast(stream.rtmpKey);

    // Update database records
    await prisma.streamPlatform.updateMany({
      where: { streamId },
      data: {
        status: 'STOPPED',
        disconnectedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Simulcast stopped' });
  } catch (error) {
    logger.error('Error stopping simulcast', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

