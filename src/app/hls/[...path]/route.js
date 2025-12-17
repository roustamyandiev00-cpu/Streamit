/**
 * HLS File Serving Route
 * Serveert HLS manifesten en segments voor video playback
 * GET /hls/[streamKey]/index.m3u8
 * GET /hls/[streamKey]/segment_001.ts
 */
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { HLS_OUTPUT_DIR } from '../../../lib/hlsConverter';

export async function GET(request, { params }) {
  try {
    const { path: pathSegments } = params;
    const filePath = Array.isArray(pathSegments)
      ? path.join(HLS_OUTPUT_DIR, ...pathSegments)
      : path.join(HLS_OUTPUT_DIR, pathSegments);

    // Security: prevent path traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(HLS_OUTPUT_DIR);

    if (!resolvedPath.startsWith(resolvedBase)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file
    const fileContent = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (ext === '.m3u8') {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (ext === '.ts') {
      contentType = 'video/mp2t';
    }

    // Set CORS headers for video playback
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return new NextResponse(fileContent, {
      status: 200,
      headers
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error serving HLS file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}


