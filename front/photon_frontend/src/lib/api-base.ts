const DEFAULT_REMOTE_API = 'http://91.147.104.165:666/api';

/**
 * URL for client (browser) - resolves on user machine.
 * Used in api-client.ts, all fetch from browser.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_REMOTE_API;

/**
 * URL for server (Next.js SSR) - when running in Docker, container must
 * reach backend. API_URL_SERVER used only in api-client-server.ts.
 */
export const API_URL_SERVER =
  process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL || DEFAULT_REMOTE_API;

export const getApiBaseUrl = () => API_BASE_URL;
