import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const userId = formData.get('userId') as string | null;

  if (!file || !userId) {
    return NextResponse.json({ error: 'file and userId are required' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const dir = path.join(process.cwd(), 'public', 'user_photo');
  await mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${userId}.jpg`);
  await writeFile(filePath, buffer);

  return NextResponse.json({ avatarUrl: `/user_photo/${userId}.jpg` });
}
