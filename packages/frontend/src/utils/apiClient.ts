/**
 * API client with automatic token refresh
 * Intercepts 401 responses and attempts to refresh the token
 */

import { refreshToken } from './tokenRefresh';
import { apiUrl } from './apiConfig';

// Store original fetch for interceptor
const originalFetch = window.fetch;

// Enhanced fetch that handles token refresh
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('admin-token');
  
  // Convert relative URLs to absolute if needed
  const fullUrl = url.startsWith('http') ? url : apiUrl(url);
  
  // Add authorization header if token exists
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Make the request
  let response = await originalFetch(fullUrl, {
    ...options,
    headers,
  });

  // If we got a 401 and have a token, try to refresh it
  if (response.status === 401 && token && url.includes('/api/admin')) {
    const refreshed = await refreshToken();
    
    if (refreshed) {
      // Retry the request with the new token
      const newToken = localStorage.getItem('admin-token');
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await originalFetch(fullUrl, {
          ...options,
          headers,
        });
      }
    }
  }

  return response;
}

