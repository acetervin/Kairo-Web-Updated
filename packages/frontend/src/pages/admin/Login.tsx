import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, MapPin, AlertCircle, Clock } from 'lucide-react';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      // Verify token is still valid
      fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            setLocation('/admin/dashboard');
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin-user');
          }
        })
        .catch(() => {
          // Network error, clear token to be safe
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
        });
    }
  }, [setLocation]);

  // Countdown timer for account lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingTime('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const lockoutDate = new Date(lockoutUntil);
      
      // Validate the date
      if (isNaN(lockoutDate.getTime())) {
        console.error('Invalid lockoutUntil date:', lockoutUntil);
        setRemainingTime('');
        return;
      }
      
      const diff = lockoutDate.getTime() - now.getTime();

      if (diff <= 0) {
        setLockoutUntil(null);
        setRemainingTime('');
        setRemainingAttempts(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Calculate immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Clear lockout state on successful login
        setLockoutUntil(null);
        setRemainingAttempts(null);
        
        localStorage.setItem('admin-token', data.token);
        localStorage.setItem('admin-user', JSON.stringify(data.user));
        
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in to admin dashboard.',
        });
        
        setLocation('/admin/dashboard');
      } else {
        const error = await response.json().catch(() => ({}));
        
        // Check for lockout info in response headers (for rate-limited requests)
        const accountLockedHeader = response.headers.get('X-Account-Locked');
        const lockedUntilHeader = response.headers.get('X-Account-Locked-Until');
        
        // Get lockedUntil from error body or headers
        const lockedUntilValue = error.lockedUntil || lockedUntilHeader;
        
        // Handle account lockout (423 status OR lockout in 429 response)
        if ((response.status === 423 && lockedUntilValue) || 
            (response.status === 429 && (error.accountLocked || accountLockedHeader === 'true') && lockedUntilValue)) {
          
          // Parse the lockout date
          const lockoutDate = new Date(lockedUntilValue);
          
          // Validate the date is valid
          if (!isNaN(lockoutDate.getTime())) {
            setLockoutUntil(lockoutDate);
            setRemainingAttempts(0);
            
            // Calculate initial time remaining for toast
            const now = new Date();
            const diff = lockoutDate.getTime() - now.getTime();
            const minutes = Math.floor(diff / 60000);
            
            toast({
              title: 'Account Locked',
              description: `Too many failed login attempts. Account locked for ${minutes} minutes.`,
              variant: 'destructive',
            });
          }
        } else if (response.status === 429) {
          // Rate limited but account not locked
          if (error.remainingAttempts !== undefined) {
            setRemainingAttempts(error.remainingAttempts);
          }
          
          toast({
            title: 'Too Many Requests',
            description: error.message || 'Please wait before trying again.',
            variant: 'destructive',
          });
        } else {
          // Handle failed login with remaining attempts
          if (error.remainingAttempts !== undefined) {
            setRemainingAttempts(error.remainingAttempts);
          }
          
          toast({
            title: 'Login failed',
            description: error.message || 'Invalid credentials',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Login exception:', error);
      
      toast({
        title: 'Error',
        description: `Something went wrong: ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
                  <MapPin className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-base mt-2">
                Kairo Kenya Property Management
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* Account Lockout Alert */}
            {lockoutUntil && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>Account Temporarily Locked</strong>
                    <p className="text-sm mt-1">
                      Too many failed login attempts. Please try again later.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-mono font-bold">
                    <Clock className="h-5 w-5" />
                    {remainingTime || 'Calculating...'}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Remaining Attempts Warning */}
            {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 5 && !lockoutUntil && (
              <Alert variant="default" className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Invalid credentials</strong>
                  <p className="text-sm mt-1">
                    {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining before account lockout.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({ ...credentials, username: e.target.value })
                    }
                    className="pl-10"
                    required
                    disabled={!!lockoutUntil}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    className="pl-10"
                    required
                    disabled={!!lockoutUntil}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !!lockoutUntil}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                    Signing in...
                  </>
                ) : lockoutUntil ? (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    Account Locked ({remainingTime})
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Protected area - Authorized personnel only</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

