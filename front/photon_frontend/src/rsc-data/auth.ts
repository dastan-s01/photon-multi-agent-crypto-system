import { API_URL_SERVER } from '@/lib/api-base';
import { serverApiClient } from '@/lib/api-client-server';
import { getServerAccessToken, getServerRefreshToken } from '@/utils/jwt-tokens.server';
import { cache } from 'react';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  date_joined?: string;
}

export const getCachedLoggedInVerifiedUser = cache(async () => {
  const token = await getServerAccessToken();
  if (!token) {
    throw new Error('No user found');
  }

  try {
    const user = await serverApiClient.getCurrentUser();
    if (!user) {
      throw new Error('No user found');
    }
    return {
      user: {
        id: String(user.id),
        email: user.email,
        full_name: user.full_name,
      },
    };
  } catch (error) {
    const refreshToken = await getServerRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL_SERVER}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const { setServerAuthTokens } = await import('@/utils/jwt-tokens.server');
          await setServerAuthTokens(refreshData.access, refreshToken);
          const retryUser = await serverApiClient.getCurrentUser();
          if (retryUser) {
            return {
              user: {
                id: String(retryUser.id),
                email: retryUser.email,
                full_name: retryUser.full_name,
              },
            };
          }
        }
      } catch {
        throw new Error('No user found');
      }
    }
    throw new Error('No user found');
  }
});

export const getCachedLoggedInUser = cache(async () => {
  const token = await getServerAccessToken();
  if (!token) {
    throw new Error('No user found');
  }

  try {
    const user = await serverApiClient.getCurrentUser();
    if (!user) {
      throw new Error('No user found');
    }
    return {
      id: String(user.id),
      email: user.email,
      full_name: user.full_name,
    } as any;
  } catch {
    throw new Error('No user found');
  }
});

export const getCachedLoggedInUserClaims = cache(async () => {
  const token = await getServerAccessToken();
  if (!token) {
    throw new Error('No claims found');
  }

  try {
    const user = await serverApiClient.getCurrentUser();
    if (!user) {
      throw new Error('No claims found');
    }
    return {
      sub: String(user.id),
      email: user.email,
    };
  } catch {
    throw new Error('No claims found');
  }
});

export const getCachedIsUserLoggedIn = cache(async () => {
  const token = await getServerAccessToken();
  if (!token) {
    return false;
  }

  try {
    const user = await serverApiClient.getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
});

export const getCachedLoggedInUserId = cache(async () => {
  try {
    const claims = await getCachedLoggedInUserClaims();
    return claims.sub;
  } catch (error) {
    return null;
  }
});

