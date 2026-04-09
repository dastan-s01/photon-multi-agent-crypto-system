import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next');

  revalidatePath('/', 'layout');

  let redirectTo = new URL('/dashboard', requestUrl.origin);

  if (next) {
    const decodedNext = decodeURIComponent(next);
    redirectTo = new URL(decodedNext, requestUrl.origin);
  }

  return NextResponse.redirect(redirectTo);
}
