import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { validateTemplateConfig } from '../../../../lib/templateEngine';
import { logger } from '../../../../lib/logger';

const prisma = new PrismaClient();

// GET /api/templates/[id] - Get single template
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const template = await prisma.streamTemplate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user can access this template
    const session = await getServerSession(authOptions);
    if (!template.isPublic && !template.isSystem && template.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let config = null;
    try {
      config = JSON.parse(template.config);
    } catch (error) {
      logger.warn(`Failed to parse template ${id} config`, error);
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      thumbnailUrl: template.thumbnailUrl,
      isPublic: template.isPublic,
      isSystem: template.isSystem,
      isDefault: template.isDefault,
      usageCount: template.usageCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      user: template.user,
      config
    });
  } catch (error) {
    logger.error('Error fetching template', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update template
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verify ownership
    const template = await prisma.streamTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.userId !== session.user.id && !template.isSystem) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate config if provided
    if (body.config) {
      const validation = validateTemplateConfig(body.config);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid template configuration',
            details: validation.errors
          },
          { status: 400 }
        );
      }
    }

    // Update template
    const updated = await prisma.streamTemplate.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.config && { config: JSON.stringify(body.config) }),
        ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic })
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      category: updated.category,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    logger.error('Error updating template', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const template = await prisma.streamTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (template.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system templates' },
        { status: 400 }
      );
    }

    await prisma.streamTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Template deleted' });
  } catch (error) {
    logger.error('Error deleting template', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

