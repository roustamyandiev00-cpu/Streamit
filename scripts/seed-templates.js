/**
 * Seed pre-built templates into database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default templates (inline to avoid import issues)
function getDefaultTemplate(category) {
  const defaults = {
    gaming: {
      version: '1.0',
      category: 'gaming',
      name: 'Gaming Stream',
      description: 'Optimized for game streaming with webcam PiP',
      scenes: [
        {
          id: 'game',
          name: 'Game Scene',
          sources: [
            {
              id: 'game_capture',
              type: 'screen',
              name: 'Game Capture',
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              visible: true,
              zIndex: 1
            },
            {
              id: 'webcam',
              type: 'camera',
              name: 'Webcam',
              x: 1600,
              y: 800,
              width: 300,
              height: 200,
              visible: true,
              zIndex: 2
            }
          ]
        }
      ],
      audio: {
        bitrate: 160,
        sampleRate: 48000,
        channels: 'stereo',
        noiseGate: true,
        compression: true
      },
      video: {
        resolution: '1920x1080',
        fps: 60,
        bitrate: 6000
      },
      overlays: [
        {
          type: 'alert',
          position: 'top-right',
          enabled: true
        }
      ],
      branding: {
        brandColor: '#9146FF',
        showOverlay: true
      },
      platforms: ['twitch', 'youtube']
    },
    
    podcast: {
      version: '1.0',
      category: 'podcast',
      name: 'Podcast Template',
      description: 'Professional podcast setup with multi-guest layout',
      scenes: [
        {
          id: 'podcast',
          name: 'Podcast Scene',
          sources: [
            {
              id: 'host',
              type: 'camera',
              name: 'Host',
              x: 0,
              y: 0,
              width: 960,
              height: 1080,
              visible: true,
              zIndex: 1
            },
            {
              id: 'guest1',
              type: 'camera',
              name: 'Guest 1',
              x: 960,
              y: 0,
              width: 960,
              height: 540,
              visible: true,
              zIndex: 1
            },
            {
              id: 'guest2',
              type: 'camera',
              name: 'Guest 2',
              x: 960,
              y: 540,
              width: 960,
              height: 540,
              visible: true,
              zIndex: 1
            }
          ]
        }
      ],
      audio: {
        bitrate: 128,
        sampleRate: 48000,
        channels: 'stereo',
        voiceIsolation: true,
        autoGain: true
      },
      video: {
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4000
      },
      branding: {
        brandColor: '#5c4dff',
        showOverlay: false,
        showLowerThird: true
      },
      platforms: ['youtube', 'linkedin']
    },
    
    webinar: {
      version: '1.0',
      category: 'webinar',
      name: 'Webinar Template',
      description: 'Professional webinar with screen share and presenter',
      scenes: [
        {
          id: 'webinar',
          name: 'Webinar Scene',
          sources: [
            {
              id: 'screen',
              type: 'screen',
              name: 'Screen Share',
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              visible: true,
              zIndex: 1
            },
            {
              id: 'presenter',
              type: 'camera',
              name: 'Presenter',
              x: 1600,
              y: 800,
              width: 300,
              height: 200,
              visible: true,
              zIndex: 2
            }
          ]
        }
      ],
      audio: {
        bitrate: 128,
        sampleRate: 48000,
        channels: 'stereo',
        clearVoice: true
      },
      video: {
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4500
      },
      overlays: [
        {
          type: 'lowerThird',
          position: 'bottom-left',
          enabled: true
        },
        {
          type: 'logo',
          position: 'top-left',
          enabled: true
        }
      ],
      branding: {
        brandColor: '#1877F2',
        showOverlay: true,
        showLowerThird: true
      },
      platforms: ['youtube', 'linkedin', 'facebook']
    }
  };

  return defaults[category] || null;
}

async function seedTemplates() {
  console.log('Seeding templates...');

  const categories = ['gaming', 'podcast', 'webinar'];

  for (const category of categories) {
    const templateConfig = getDefaultTemplate(category);
    
    if (!templateConfig) {
      console.warn(`No default template found for category: ${category}`);
      continue;
    }

    // Check if template already exists
    const existing = await prisma.streamTemplate.findFirst({
      where: {
        category,
        isSystem: true,
        isDefault: true
      }
    });

    if (existing) {
      console.log(`Template for ${category} already exists, skipping...`);
      continue;
    }

    // Create template
    await prisma.streamTemplate.create({
      data: {
        name: templateConfig.name,
        description: templateConfig.description,
        category: templateConfig.category,
        config: JSON.stringify(templateConfig),
        isSystem: true,
        isDefault: true,
        isPublic: true,
        userId: null // System templates have no user
      }
    });

    console.log(`✓ Created ${category} template`);
  }

  console.log('Template seeding complete!');
}

seedTemplates()
  .catch((error) => {
    console.error('Error seeding templates:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

