import { cookies } from 'next/headers';
import { API_URL_SERVER } from './api-base';

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  date_joined: string;
}

class ServerApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL_SERVER) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        const refreshToken = cookieStore.get('refresh_token')?.value;
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${this.baseURL}/auth/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              cookieStore.set('access_token', refreshData.access, {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 30,
              });
              headers['Authorization'] = `Bearer ${refreshData.access}`;
              const retryResponse = await fetch(url, config);
              if (retryResponse.ok) {
                return await retryResponse.json();
              }
            }
          } catch (refreshError) {
            cookieStore.delete('access_token');
            cookieStore.delete('refresh_token');
            throw new Error('Session expired');
          }
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.detail || errorData.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async getCurrentUser(): Promise<UserResponse | null> {
    try {
      return await this.request<UserResponse>('/auth/me/');
    } catch {
      return null;
    }
  }
}

export const serverApiClient = new ServerApiClient();

