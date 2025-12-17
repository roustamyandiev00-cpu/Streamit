import { NextResponse } from 'next/server';

// DELETE /api/platforms/[id] - Disconnect platform
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        // Mock response - in production this would update the database
        return NextResponse.json({ 
            message: 'Platform disconnected', 
            platform: id,
            success: true 
        });
    } catch (error) {
        console.error('Error disconnecting platform:', error);
        return NextResponse.json({ error: 'Failed to disconnect platform' }, { status: 500 });
    }
}
