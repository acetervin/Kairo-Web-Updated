import { useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import LoadingScreen from '@/components/LoadingScreen';
import { refreshToken } from '@/utils/tokenRefresh';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin-token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Verify token is valid by making a request to a protected endpoint
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // Token might be expired, try to refresh it
          const refreshed = await refreshToken();
          if (refreshed) {
            // Try the request again with the new token
            const newToken = localStorage.getItem('admin-token');
            const retryResponse = await fetch('/api/admin/stats', {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            
            if (retryResponse.ok) {
              setIsAuthenticated(true);
            } else {
              // Refresh failed, clear everything
              localStorage.removeItem('admin-token');
              localStorage.removeItem('admin-user');
              setIsAuthenticated(false);
            }
          } else {
            // Token refresh failed
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin-user');
            setIsAuthenticated(false);
          }
        } else {
          // Other error
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated (handled by useEffect, but also return null for safety)
  if (isAuthenticated === false) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}

