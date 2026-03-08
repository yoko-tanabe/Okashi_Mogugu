import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Prevent directory traversal
  if (filename.includes('..') || filename.includes('/')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'img', 'user_favorite', filename);

  try {
    const buffer = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png' ? 'image/png' :
      ext === 'gif' ? 'image/gif' :
      ext === 'webp' ? 'image/webp' :
      'image/jpeg';

    return new NextResponse(buffer, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
