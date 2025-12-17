import { NextResponse } from 'next/server';

// Mock chat messages
const mockMessages = [];

// GET /api/chat - Get chat messages for a stream
export async function GET(_request) {
  try {
    return NextResponse.json(mockMessages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/chat - Add new chat message
export async function POST(request) {
  try {
    const body = await request.json();
    const { streamId, message, username, color } = body;

    if (!streamId || !message || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chatMessage = {
      id: Date.now().toString(),
      streamId,
      message,
      username,
      color: color || `hsl(${Math.random() * 360}, 70%, 60%)`,
      timestamp: new Date().toISOString()
    };

    mockMessages.push(chatMessage);

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}