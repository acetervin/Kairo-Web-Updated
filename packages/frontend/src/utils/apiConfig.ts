/**
 * API configuration for frontend
 * Handles API base URL for both development and production
 */

/**
 * Get the API base URL
 * In production (Vercel), this will use VITE_API_URL or VITE_BACKEND_URL
 * In development, returns empty string to use relative paths (handled by Vite proxy)
 */
export function getApiBaseUrl(): string {
  // In production, use the environment variable if set
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
  }
  // In development, return empty to use relative paths (Vite proxy handles it)
  return '';
}

/**
 * Build a full API URL from a path
 * @param path - API path (e.g., '/api/properties' or 'api/properties')
 */
export function apiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (baseUrl) {
    // Remove trailing slash from base URL if present
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}${cleanPath}`;
  }
  
  return cleanPath;
}

