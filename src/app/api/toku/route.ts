import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const prisma = getPrisma();
  const history = await prisma.tokuHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    history.map(t => ({
      id: t.id,
      action: t.action,
      points: t.points,
      date: t.createdAt.toISOString().split('T')[0],
    }))
  );
}

export async function POST(req: NextRequest) {
  const { userId, action, points } = await req.json();

  if (!userId || !action || points === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();

  // Create history entry and update profile points in a transaction
  const [entry] = await prisma.$transaction([
    prisma.tokuHistory.create({
      data: { userId, action, points },
    }),
    prisma.profile.update({
      where: { id: userId },
      data: { tokuPoints: { increment: points } },
    }),
  ]);

  return NextResponse.json({
    id: entry.id,
    action: entry.action,
    points: entry.points,
    date: entry.createdAt.toISOString().split('T')[0],
  });
}
