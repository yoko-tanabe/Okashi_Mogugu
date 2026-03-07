import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const prisma = getPrisma();
  const stamps = await prisma.stamp.findMany({
    where: { ownerId: userId },
    orderBy: { stampedAt: 'desc' },
  });

  return NextResponse.json(
    stamps.map(s => ({
      id: s.id,
      nationality: s.nationality,
      flag: getFlagEmoji(s.nationality),
      userName: s.userName,
      date: s.stampedAt.toISOString().split('T')[0],
      location: s.location,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { ownerId, metUserId, nationality, userName, location } = await req.json();

  if (!ownerId || !nationality || !userName) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();
  const stamp = await prisma.stamp.create({
    data: { ownerId, metUserId, nationality, userName, location: location ?? '' },
  });

  return NextResponse.json({
    id: stamp.id,
    nationality: stamp.nationality,
    flag: getFlagEmoji(stamp.nationality),
    userName: stamp.userName,
    date: stamp.stampedAt.toISOString().split('T')[0],
    location: stamp.location,
  });
}

function getFlagEmoji(code: string): string {
  const flags: Record<string, string> = {
    JP: '\u{1F1EF}\u{1F1F5}', US: '\u{1F1FA}\u{1F1F8}', GB: '\u{1F1EC}\u{1F1E7}',
    FR: '\u{1F1EB}\u{1F1F7}', DE: '\u{1F1E9}\u{1F1EA}', KR: '\u{1F1F0}\u{1F1F7}',
    CN: '\u{1F1E8}\u{1F1F3}', TW: '\u{1F1F9}\u{1F1FC}', TH: '\u{1F1F9}\u{1F1ED}',
    AU: '\u{1F1E6}\u{1F1FA}', BR: '\u{1F1E7}\u{1F1F7}', IN: '\u{1F1EE}\u{1F1F3}',
    ES: '\u{1F1EA}\u{1F1F8}', IT: '\u{1F1EE}\u{1F1F9}',
  };
  return flags[code] || '\u{1F3F3}\u{FE0F}';
}
