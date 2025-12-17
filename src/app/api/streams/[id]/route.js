import { NextResponse } from 'next/server';

// Mock stream data
const mockStreamData = {
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
  chatMessages: []
};

// GET /api/streams/[id] - Get specific stream
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Return mock data with the requested ID
    return NextResponse.json({
      ...mockStreamData,
      id,
      chatMessages: []
    });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}

// PUT /api/streams/[id] - Update stream
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Return updated mock data
    return NextResponse.json({
      ...mockStreamData,
      ...body,
      id,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 });
  }
}

// DELETE /api/streams/[id] - Delete stream
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    return NextResponse.json({ 
      message: 'Stream deleted successfully',
      deletedId: id 
    });
  } catch (error) {
    console.error('Error deleting stream:', error);
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}
