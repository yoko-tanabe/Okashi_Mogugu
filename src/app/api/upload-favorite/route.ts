import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const userId = formData.get('userId') as string | null;

  if (!files.length || !userId) {
    return NextResponse.json({ error: 'files and userId are required' }, { status: 400 });
  }

  const dir = path.join(process.cwd(), 'img', 'user_favorite');
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}_${i}_${Date.now()}.${ext}`;
    const filePath = path.join(dir, fileName);
    await writeFile(filePath, buffer);
    urls.push(`/api/favorite-image/${fileName}`);
  }

  return NextResponse.json({ imageUrls: urls });
}
