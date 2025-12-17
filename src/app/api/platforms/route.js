import { NextResponse } from 'next/server';

// Mock data for connected platforms
const connectedPlatforms = [
  {
    id: '1',
    platformId: 'youtube',
    connected: true,
    username: 'MyChannel',
    connectedAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    return NextResponse.json(connectedPlatforms);
  } catch (error) {
    console.error('Failed to get platforms:', error);
    return NextResponse.json({ error: 'Failed to get platforms' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { platformId, connected } = body;

    // Check if platform already exists
    const existingIndex = connectedPlatforms.findIndex(p => p.platformId === platformId);

    if (existingIndex >= 0) {
      // Update existing
      connectedPlatforms[existingIndex] = {
        ...connectedPlatforms[existingIndex],
        connected,
        connectedAt: new Date().toISOString()
      };
    } else {
      // Add new
      const newPlatform = {
        id: Date.now().toString(),
        platformId,
        connected,
        username: `User_${platformId}`,
        connectedAt: new Date().toISOString()
      };
      connectedPlatforms.push(newPlatform);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to connect platform:', error);
    return NextResponse.json({ error: 'Failed to connect platform' }, { status: 500 });
  }
}
