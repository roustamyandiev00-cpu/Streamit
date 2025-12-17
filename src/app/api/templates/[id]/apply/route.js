import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { applyTemplate } from '../../../../../lib/templateEngine';
import { logger } from '../../../../../lib/logger';

const prisma = new PrismaClient();

// POST /api/templates/[id]/apply - Apply template to stream
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = params;
    const body = await request.json();
    const { streamId } = body;

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Get template
    const template = await prisma.streamTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check access
    if (!template.isPublic && !template.isSystem && template.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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

    // Parse and apply template
    let templateConfig;
    try {
      templateConfig = JSON.parse(template.config);
    } catch (error) {
      logger.error('Failed to parse template config', error);
      return NextResponse.json(
        { error: 'Invalid template configuration' },
        { status: 400 }
      );
    }

    // Get current stream settings (if any)
    // For now, we'll just apply the template
    const appliedSettings = applyTemplate(templateConfig);

    // Update stream with template reference
    await prisma.stream.update({
      where: { id: streamId },
      data: {
        templateId: templateId
      }
    });

    // Track template usage
    await prisma.streamTemplateUsage.create({
      data: {
        templateId,
        streamId,
        userId: session.user.id
      }
    });

    // Increment usage count
    await prisma.streamTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      message: 'Template applied successfully',
      streamId,
      templateId,
      settings: appliedSettings
    });
  } catch (error) {
    logger.error('Error applying template', error);
    return NextResponse.json(
      { error: `Failed to apply template: ${error.message}` },
      { status: 500 }
    );
  }
}

