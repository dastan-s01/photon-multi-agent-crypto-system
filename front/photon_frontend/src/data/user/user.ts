'use server'

import { serverApiClient } from '@/lib/api-client-server';
import { getServerAccessToken, getServerRefreshToken } from '@/utils/jwt-tokens.server';

export async function getLoggedInUserId(): Promise<string> {
  const token = await getServerAccessToken();
  if (!token) {
    throw new Error('User not logged in');
  }

  try {
    const user = await serverApiClient.getCurrentUser();
    if (!user) {
      const refreshToken = await getServerRefreshToken();
      if (refreshToken) {
        const { refreshTokenAction } = await import('@/data/auth/auth');
        await refreshTokenAction();
        const retryUser = await serverApiClient.getCurrentUser();
        if (retryUser) {
          return String(retryUser.id);
        }
      }
      throw new Error('User not logged in');
    }
    return String(user.id);
  } catch (error) {
    throw new Error('User not logged in');
  }
}

export async function getCurrentUser() {
  const token = await getServerAccessToken();
  if (!token) {
    return null;
  }

  try {
    const user = await serverApiClient.getCurrentUser();
    return user;
  } catch {
    const refreshToken = await getServerRefreshToken();
    if (refreshToken) {
      try {
        const { refreshTokenAction } = await import('@/data/auth/auth');
        await refreshTokenAction();
        return await serverApiClient.getCurrentUser();
      } catch {
        return null;
      }
    }
    return null;
  }
}
