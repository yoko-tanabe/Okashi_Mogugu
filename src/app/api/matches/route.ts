import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const prisma = getPrisma();
  const matches = await prisma.match.findMany({
    where: {
      status: { not: 'expired' },
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: true,
      userB: true,
    },
    orderBy: { matchedAt: 'desc' },
  });

  const result = matches.map(m => {
    const otherUser = m.userAId === userId ? m.userB : m.userA;

    let status: string;
    if (m.status === 'matched') {
      status = 'matched';
    } else if (m.userAId === userId) {
      status = 'pending_sent';
    } else {
      status = 'pending_received';
    }

    return {
      id: m.id,
      user: otherUser,
      matchedAt: m.matchedAt.toISOString(),
      status,
      chatOpen: m.chatOpen,
    };
  });

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const prisma = getPrisma();
  const match = await prisma.match.update({ where: { id }, data });
  return NextResponse.json(match);
}
