import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const prisma = getPrisma();
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) return NextResponse.json(null);

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const prisma = getPrisma();
  const profile = await prisma.profile.upsert({
    where: { id },
    update: data,
    create: { id, ...data },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const prisma = getPrisma();
  const profile = await prisma.profile.update({
    where: { id },
    data,
  });

  return NextResponse.json(profile);
}
