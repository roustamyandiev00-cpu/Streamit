import { NextResponse } from 'next/server';

// Simple health check
export async function GET(_request) {
  return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
