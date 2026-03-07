import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get('matchId');
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const prisma = getPrisma();
  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(
    messages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      timestamp: m.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const { matchId, senderId, text } = await req.json();

  if (!matchId || !senderId || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();
  const message = await prisma.message.create({
    data: { matchId, senderId, text },
  });

  return NextResponse.json({
    id: message.id,
    senderId: message.senderId,
    text: message.text,
    timestamp: message.createdAt.toISOString(),
  });
}
