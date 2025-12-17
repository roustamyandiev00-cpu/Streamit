import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import * as clipGenerator from '../../../lib/clipGenerator';
const { detectHighlights, generateClip, generateCaptions, generateThumbnail } = clipGenerator;
import { clipEvents } from '../../../lib/analytics';
import { notifyClipReady } from '../../../lib/notifications';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// GET /api/clips - Haal clips op voor gebruiker of stream
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const status = searchParams.get('status');

    const where = {
      userId: session.user.id,
      ...(streamId && { streamId }),
      ...(status && { status })
    };

    const clips = await prisma.clip.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        stream: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true
          }
        }
      }
    });

    return NextResponse.json(clips);
  } catch (error) {
    const { logger } = require('../../../lib/logger');
    logger.error('Error fetching clips', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/clips - Genereer nieuwe clips
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { streamId, videoPath, options = {} } = body;

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Verifieer dat de stream van de gebruiker is
    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id
      }
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Als videoPath niet is opgegeven, gebruik HLS of mock path
    const sourceVideoPath = videoPath || path.join(process.cwd(), 'media', 'hls', stream.rtmpKey || 'default', 'index.m3u8');

    // Detecteer highlights
    const highlights = await detectHighlights(sourceVideoPath, {
      count: options.count || 5,
      minDuration: options.minDuration || 15,
      maxDuration: options.maxDuration || 60,
      language: options.language || 'en'
    });

    if (highlights.length === 0) {
      return NextResponse.json(
        { error: 'No highlights detected in video' },
        { status: 400 }
      );
    }

    // Genereer clips voor elke highlight
    const generatedClips = [];

    for (const highlight of highlights) {
      // Maak clip record in database
      const clip = await prisma.clip.create({
        data: {
          title: highlight.title,
          description: highlight.description,
          streamId,
          userId: session.user.id,
          startTime: highlight.startTime,
          endTime: highlight.endTime,
          duration: highlight.duration,
          highlightScore: highlight.score,
          highlightType: highlight.type,
          status: 'PROCESSING',
          aspectRatio: options.aspectRatio || '9:16',
          hasCaptions: options.addCaptions !== false,
          detectedLanguage: options.language || 'en'
        }
      });

      // Track analytics
      clipEvents.clipGenerated(clip.id, streamId);

      // Start async processing (in productie: gebruik queue zoals Bull)
      processClipAsync(clip, sourceVideoPath, highlight, options).catch(error => {
        const { logger } = require('../../../lib/logger');
        logger.error(`Error processing clip ${clip.id}`, error);
        prisma.clip.update({
          where: { id: clip.id },
          data: { status: 'FAILED' }
        }).catch((err) => logger.error('Failed to update clip status', err));
      });

      generatedClips.push(clip);
    }

    return NextResponse.json({
      message: `Generating ${generatedClips.length} clips`,
      clips: generatedClips
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating clips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Async functie om clip te verwerken
async function processClipAsync(clip, sourceVideoPath, highlight, options) {
  try {
    // Update progress
    await prisma.clip.update({
      where: { id: clip.id },
      data: { processingProgress: 10 }
    });

    // Genereer clip video
    const clipResult = await generateClip(sourceVideoPath, {
      startTime: highlight.startTime,
      endTime: highlight.endTime,
      aspectRatio: options.aspectRatio || '9:16',
      resolution: options.resolution,
      addCaptions: options.addCaptions !== false
    });

    await prisma.clip.update({
      where: { id: clip.id },
      data: { processingProgress: 50 }
    });

    // Genereer thumbnail
    const thumbnailPath = path.join(clipResult.outputDir, 'thumbnail.jpg');
    await generateThumbnail(clipResult.outputPath, thumbnailPath);

    // Genereer captions
    let captionText = null;
    if (options.addCaptions !== false) {
      captionText = await generateCaptions(clipResult.outputPath, options.language || 'en');
    }

    await prisma.clip.update({
      where: { id: clip.id },
      data: { processingProgress: 90 }
    });

    // Update clip met resultaten
    const relativeVideoPath = path.relative(process.cwd(), clipResult.outputPath);
    const relativeThumbnailPath = path.relative(process.cwd(), thumbnailPath);

    const updatedClip = await prisma.clip.update({
      where: { id: clip.id },
      data: {
        videoUrl: relativeVideoPath,
        thumbnailUrl: relativeThumbnailPath,
        captionText,
        resolution: clipResult.resolution,
        status: 'COMPLETED',
        processingProgress: 100,
        processedAt: new Date()
      }
    });

    // Send notification
    try {
      await notifyClipReady(clip.userId, {
        title: updatedClip.title,
        url: `/clips?clipId=${clip.id}`,
        thumbnailUrl: relativeThumbnailPath,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  } catch (error) {
    console.error(`Error processing clip ${clip.id}:`, error);
    await prisma.clip.update({
      where: { id: clip.id },
      data: { status: 'FAILED' }
    });
    throw error;
  }
}

// DELETE /api/clips - Verwijder clip
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clipId = searchParams.get('id');

    if (!clipId) {
      return NextResponse.json(
        { error: 'Clip ID is required' },
        { status: 400 }
      );
    }

    // Verifieer ownership
    const clip = await prisma.clip.findFirst({
      where: {
        id: clipId,
        userId: session.user.id
      }
    });

    if (!clip) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      );
    }

    // Verwijder bestanden
    if (clip.videoUrl) {
      try {
        const videoPath = path.join(process.cwd(), clip.videoUrl);
        await fs.unlink(videoPath);
      } catch (error) {
        console.error('Error deleting video file:', error);
      }
    }

    if (clip.thumbnailUrl) {
      try {
        const thumbPath = path.join(process.cwd(), clip.thumbnailUrl);
        await fs.unlink(thumbPath);
      } catch (error) {
        console.error('Error deleting thumbnail file:', error);
      }
    }

    // Verwijder uit database
    await prisma.clip.delete({
      where: { id: clipId }
    });

    return NextResponse.json({ message: 'Clip deleted successfully' });
  } catch (error) {
    console.error('Error deleting clip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

