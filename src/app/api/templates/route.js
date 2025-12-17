import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { validateTemplateConfig, parseTemplateConfig } from '../../../lib/templateEngine';
import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

// GET /api/templates - List templates
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includePublic = searchParams.get('public') === 'true';

    // Build query
    const where = {};
    
    if (category) {
      where.category = category;
    }

    // Include public templates or user's own templates
    if (includePublic) {
      where.OR = [
        { isPublic: true },
        ...(session?.user?.id ? [{ userId: session.user.id }] : [])
      ];
    } else if (session?.user?.id) {
      where.OR = [
        { userId: session.user.id },
        { isSystem: true }
      ];
    } else {
      where.isSystem = true;
    }

    const templates = await prisma.streamTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' },
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
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

    // Parse configs and return
    const parsedTemplates = templates.map(template => {
      let config = null;
      try {
        const parsed = parseTemplateConfig(template.config);
        config = parsed.config;
      } catch (error) {
        logger.warn(`Failed to parse template ${template.id}`, error);
      }

      return {
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
      };
    });

    return NextResponse.json(parsedTemplates);
  } catch (error) {
    logger.error('Error fetching templates', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create template
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, config, thumbnailUrl, isPublic } = body;

    if (!name || !category || !config) {
      return NextResponse.json(
        { error: 'name, category, and config are required' },
        { status: 400 }
      );
    }

    // Validate template config
    const validation = validateTemplateConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid template configuration',
          details: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Create template
    const template = await prisma.streamTemplate.create({
      data: {
        name,
        description: description || null,
        category,
        config: JSON.stringify(config),
        thumbnailUrl: thumbnailUrl || null,
        isPublic: isPublic || false,
        isSystem: false,
        userId: session.user.id
      },
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

    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      thumbnailUrl: template.thumbnailUrl,
      isPublic: template.isPublic,
      createdAt: template.createdAt,
      user: template.user
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating template', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

