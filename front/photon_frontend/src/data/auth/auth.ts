'use server';
import { API_URL_SERVER } from '@/lib/api-base';
import { actionClient } from '@/lib/safe-action';
import { setServerAuthTokens } from '@/utils/jwt-tokens.server';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
});

/**
 * Signs up a new user with email and password using Django API.
 * @param {Object} params - The parameters for sign up.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password (minimum 8 characters).
 * @param {string} [params.fullName] - The user's full name.
 * @returns {Promise<Object>} The data returned from the sign-up process.
 * @throws {Error} If there's an error during sign up.
 */
export const signUpAction = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput: { email, password, fullName } }) => {
    try {
      const response = await fetch(`${API_URL_SERVER}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      await setServerAuthTokens(data.access, data.refresh);

      return {
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  });

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * Signs in a user with email and password using Django API.
 * @param {Object} params - The parameters for sign in.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<Object>} The user data and tokens.
 * @throws {Error} If there's an error during sign in.
 */
export const signInWithPasswordAction = actionClient
  .schema(signInSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      const response = await fetch(`${API_URL_SERVER}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      await setServerAuthTokens(data.access, data.refresh);

      return {
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  });

/**
 * Refreshes the access token using the refresh token.
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If there's an error refreshing the token.
 */
export const refreshTokenAction = actionClient.action(async () => {
  const { getServerRefreshToken, setServerAuthTokens } = await import('@/utils/jwt-tokens.server');
  
  const refreshToken = await getServerRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_URL_SERVER}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const currentRefreshToken = await getServerRefreshToken();
    if (currentRefreshToken) {
      await setServerAuthTokens(data.access, currentRefreshToken);
    }

    return { access: data.access };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Token refresh failed');
  }
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

/**
 * Sends a password reset link to the user's email address.
 * @param {Object} params - The parameters for password reset.
 * @param {string} params.email - The user's email address.
 * @returns {Promise<Object>} Success confirmation.
 * @throws {Error} If there's an error sending the password reset link.
 */
export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      const response = await fetch(`${API_URL_SERVER}/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.detail || errorData.message || 'Failed to send password reset link');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to send password reset link');
    }
  });
