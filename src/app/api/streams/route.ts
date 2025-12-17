import { NextRequest, NextResponse } from 'next/server';

// Mock streams data
const mockStreams = [
    {
        id: '1',
        title: 'My First Stream',
        type: 'STUDIO',
        status: 'DRAFT',
        userId: 'demo-user',
        rtmpKey: null,
        brandColor: '#5c4dff',
        userName: 'Demo User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { chatMessages: 0 }
    },
    {
        id: '2',
        title: 'Gaming Stream',
        type: 'RTMP',
        status: 'DRAFT',
        userId: 'demo-user',
        rtmpKey: 'rtmp_demo_key_123',
        brandColor: '#5c4dff',
        userName: 'Demo User',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        _count: { chatMessages: 5 }
    }
];

// GET /api/streams - Fetch user's streams
export async function GET(_request: NextRequest) {
    try {
        return NextResponse.json(mockStreams);
    } catch (error) {
        console.error('Error fetching streams:', error);
        return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
    }
}

// POST /api/streams - Create new stream
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, type } = body;

        // Generate RTMP key for RTMP streams
        const rtmpKey = type === 'RTMP' ? `rtmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

        const newStream = {
            id: Date.now().toString(),
            title: title || `New ${type} Stream`,
            type: type?.toUpperCase() || 'STUDIO',
            status: 'DRAFT',
            userId: 'demo-user',
            rtmpKey,
            brandColor: '#5c4dff',
            userName: 'Demo User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { chatMessages: 0 }
        };

        mockStreams.unshift(newStream);

        return NextResponse.json(newStream, { status: 201 });
    } catch (error) {
        console.error('Error creating stream:', error);
        return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 });
    }
}
