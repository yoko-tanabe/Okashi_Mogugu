import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lon = req.nextUrl.searchParams.get('lon');
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'Accept-Language': 'ja', 'User-Agent': 'OkashiMoguguApp/1.0' } }
    );
    if (!res.ok) {
      return NextResponse.json({});
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({});
  }
}
