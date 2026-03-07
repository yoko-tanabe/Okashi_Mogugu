import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { swiperId, targetId, encounterId, direction } = await req.json();

  if (!swiperId || !targetId || !encounterId || !direction) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();

  // Record swipe
  await prisma.swipe.create({
    data: { swiperId, targetId, encounterId, direction },
  });

  if (direction === 'left') {
    return NextResponse.json({ matched: false });
  }

  // Check for mutual swipe
  const reverseSwipe = await prisma.swipe.findFirst({
    where: { swiperId: targetId, targetId: swiperId, direction: 'right' },
  });

  if (reverseSwipe) {
    // Mutual match
    const [idA, idB] = swiperId < targetId ? [swiperId, targetId] : [targetId, swiperId];
    const match = await prisma.match.create({
      data: { userAId: idA, userBId: idB, status: 'matched', chatOpen: true },
    });
    return NextResponse.json({ matched: true, matchId: match.id });
  }

  // One-sided pending
  const match = await prisma.match.create({
    data: { userAId: swiperId, userBId: targetId, status: 'pending', chatOpen: false },
  });

  return NextResponse.json({ matched: false, matchId: match.id });
}
