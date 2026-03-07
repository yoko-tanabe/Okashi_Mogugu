import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, latitude, longitude } = await req.json();

  if (!userId || latitude === undefined || longitude === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();
  await prisma.locationLog.create({
    data: { userId, latitude, longitude },
  });

  return NextResponse.json({ ok: true });
}
