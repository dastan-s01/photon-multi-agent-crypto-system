'use server';
import { API_BASE_URL } from '@/lib/api-base';
import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  password: z.string().min(4),
});

export const updatePasswordAction = authActionClient
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput: { password } }) => {
    const { getServerAccessToken } = await import('@/utils/jwt-tokens.server');
    
    const token = await getServerAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-change/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.detail || errorData.message || 'Failed to update password');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update password');
    }
  });
