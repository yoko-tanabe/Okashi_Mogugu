import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const prisma = getPrisma();
  const encounters = await prisma.encounter.findMany({
    where: {
      expired: false,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: true,
      userB: true,
    },
    orderBy: { encounteredAt: 'desc' },
  });

  const result = encounters.map(e => {
    const otherUser = e.userAId === userId ? e.userB : e.userA;
    const now = Date.now();
    const encTime = new Date(e.encounteredAt).getTime();
    const minutesAgo = Math.floor((now - encTime) / 60000);

    return {
      id: e.id,
      user: otherUser,
      location: e.location,
      encounteredAt: e.encounteredAt.toISOString(),
      minutesAgo,
      matchingTags: [],
      matchingWords: [],
      distance: e.distanceMeters,
    };
  });

  return NextResponse.json(result);
}
