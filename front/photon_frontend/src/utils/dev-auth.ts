import { cookies } from 'next/headers';

const DEV_SESSION_COOKIE = 'dev-session';
const DEV_USER_ID = 'dev-user-id';

/**
 * Checks if dev auth mode is enabled.
 * Sync function, no 'use server' needed.
 * Always false - we use Django API.
 */
export function isDevAuthEnabled(): boolean {
  return false;
}

/**
 * Creates dev session (dev mode only, no Supabase).
 * Server Action - works with cookies.
 */
export async function createDevSession(userId: string = DEV_USER_ID) {
  'use server';
  if (!isDevAuthEnabled()) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(DEV_SESSION_COOKIE, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  cookieStore.set('dev-user-id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return true;
}

/**
 * Deletes dev session.
 * Server Action - works with cookies.
 */
export async function deleteDevSession() {
  'use server';
  if (!isDevAuthEnabled()) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
  cookieStore.delete('dev-user-id');

  return true;
}

/**
 * Gets user ID from dev session.
 * Server Action - works with cookies.
 */
export async function getDevUserId(): Promise<string | null> {
  'use server';
  if (!isDevAuthEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(DEV_SESSION_COOKIE);
  const userId = cookieStore.get('dev-user-id');

  if (session?.value === 'true' && userId?.value) {
    return userId.value;
  }

  return null;
}

/**
 * Checks if there is an active dev session.
 * Server Action - works with cookies.
 */
export async function hasDevSession(): Promise<boolean> {
  'use server';
  if (!isDevAuthEnabled()) {
    return false;
  }

  const userId = await getDevUserId();
  return userId !== null;
}

