import { NextRequest, NextResponse } from 'next/server';

interface HexPackage {
  name: string;
  meta?: { description?: string };
  latest_version?: string;
  downloads?: { all?: number; recent?: number };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://hex.pm/api/packages?search=${encodeURIComponent(q.trim())}&sort=downloads&page=1`,
      {
        headers: { 'User-Agent': 'npm-compare-tool/1.0' },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data: HexPackage[] = await res.json();
    const results = data.slice(0, 20).map((pkg) => ({
      name: pkg.name,
      description: pkg.meta?.description ?? '',
      version: pkg.latest_version ?? '',
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
