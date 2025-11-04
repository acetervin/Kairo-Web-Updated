/**
 * Token refresh utility functions
 * Automatically refreshes JWT tokens before they expire
 */

import { apiUrl } from './apiConfig';

// Check token expiration and refresh if needed (within 1 hour of expiry)
export async function checkAndRefreshToken(): Promise<boolean> {
  const token = localStorage.getItem('admin-token');
  
  if (!token) {
    return false;
  }

  try {
    // Decode token to check expiration (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Refresh if token expires within 1 hour (3600000 ms)
    // This prevents the token from expiring during active sessions
    if (timeUntilExpiry < 3600000) {
      return await refreshToken();
    }
    
    return true; // Token is still valid, no refresh needed
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If we can't decode the token, try refreshing anyway
    return await refreshToken();
  }
}

// Refresh the token
export async function refreshToken(): Promise<boolean> {
  const token = localStorage.getItem('admin-token');
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(apiUrl('/api/admin/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('admin-token', data.token);
      if (data.user) {
        localStorage.setItem('admin-user', JSON.stringify(data.user));
      }
      console.log('[TOKEN_REFRESH] Token refreshed successfully');
      return true;
    }
    
    console.warn('[TOKEN_REFRESH] Token refresh failed:', response.status);
    return false;
  } catch (error) {
    console.error('[TOKEN_REFRESH] Token refresh error:', error);
    return false;
  }
}

// Set up automatic token refresh on an interval (check every 30 minutes)
let refreshInterval: NodeJS.Timeout | null = null;

export function startAutoTokenRefresh(): void {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Check and refresh token immediately
  checkAndRefreshToken();

  // Then check every 30 minutes
  refreshInterval = setInterval(() => {
    checkAndRefreshToken();
  }, 30 * 60 * 1000); // 30 minutes
}

export function stopAutoTokenRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

