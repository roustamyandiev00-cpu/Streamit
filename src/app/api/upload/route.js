import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const type = data.get('type') || 'thumbnail';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = join(uploadsDir, filename);

    if (type === 'thumbnail' && file.type.startsWith('image/')) {
      // Process image with Sharp for thumbnails
      await sharp(buffer)
        .resize(320, 180, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(filepath.replace(/\.[^/.]+$/, '.jpg'));
      
      const publicUrl = `/uploads/${type}/${filename.replace(/\.[^/.]+$/, '.jpg')}`;
      return NextResponse.json({ 
        success: true, 
        url: publicUrl,
        filename: filename.replace(/\.[^/.]+$/, '.jpg')
      });
    } else {
      // Save file as-is for other types
      await writeFile(filepath, buffer);
      const publicUrl = `/uploads/${type}/${filename}`;
      return NextResponse.json({ 
        success: true, 
        url: publicUrl,
        filename 
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}