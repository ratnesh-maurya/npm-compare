import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://pkg.go.dev/search?q=${encodeURIComponent(q.trim())}&m=package`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const html = await res.text();

    // Extract main search result links: <a href="/..." data-gtmc="search result" ...>
    const linkRegex = /href="\/([^"?#]+)"\s+data-gtmc="search result"/g;
    const synopsisRegex = /class="SearchSnippet-synopsis"[^>]*>\s*([\s\S]*?)\s*<\/p>/g;

    const paths: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(html)) !== null) {
      paths.push(match[1]);
    }

    const synopses: string[] = [];
    while ((match = synopsisRegex.exec(html)) !== null) {
      synopses.push(match[1].trim().replace(/\s+/g, ' '));
    }

    const results = paths.slice(0, 20).map((path, i) => ({
      path,
      synopsis: synopses[i] ?? '',
      version: '',
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
