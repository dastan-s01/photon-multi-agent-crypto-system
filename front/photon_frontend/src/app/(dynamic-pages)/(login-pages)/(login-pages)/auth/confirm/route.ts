import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get('next') ?? '/dashboard';

  return NextResponse.redirect(new URL(`/${next.slice(1)}`, req.url));
}
