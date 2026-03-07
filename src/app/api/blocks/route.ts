import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const blockerId = req.nextUrl.searchParams.get('blockerId');
  if (!blockerId) return NextResponse.json({ error: 'blockerId required' }, { status: 400 });

  const prisma = getPrisma();
  const blocks = await prisma.block.findMany({
    where: { blockerId },
    select: { blockedId: true },
  });

  return NextResponse.json(blocks.map(b => b.blockedId));
}

export async function POST(req: NextRequest) {
  const { blockerId, blockedId } = await req.json();

  if (!blockerId || !blockedId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();
  await prisma.block.create({ data: { blockerId, blockedId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const blockerId = req.nextUrl.searchParams.get('blockerId');
  const blockedId = req.nextUrl.searchParams.get('blockedId');

  if (!blockerId || !blockedId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prisma = getPrisma();
  await prisma.block.delete({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });

  return NextResponse.json({ ok: true });
}
