
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Calendar, MapPin } from 'lucide-react';
import PaymentSuccessSkeleton from '@/components/skeletons/PaymentSuccessSkeleton';
import { apiUrl } from '@/utils/apiConfig';

export default function PaymentSuccessPage() {
  const [location] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = searchParams.get('session_id');
    setSessionId(sessionIdFromUrl);

    // Try to load the booking created before redirecting to Stripe
    const pendingId = localStorage.getItem('pending-booking-id');

    if (!pendingId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // Poll the backend briefly to allow webhook to confirm the booking
    const start = Date.now();
    const timeoutMs = 15000; // up to 15s
    const intervalMs = 1500;

    const fetchOnce = async () => {
      try {
        const res = await fetch(apiUrl(`/api/bookings/${pendingId}`));
        if (!res.ok) throw new Error('Failed to load booking');
        const data = await res.json();

        if (cancelled) return;

        // When confirmed, save and stop polling
        if (data && (data.payment_status === 'completed' || data.status === 'confirmed')) {
          setBooking(data);
          setIsLoading(false);
          // Clear temporary storage once confirmed
          localStorage.removeItem('pending-booking-id');
          localStorage.removeItem('booking-details');
          return;
        }

        // Continue polling until timeout
        if (Date.now() - start < timeoutMs) {
          setTimeout(fetchOnce, intervalMs);
        } else {
          // Timed out – show whatever we have and allow user to continue
          setBooking(data);
          setIsLoading(false);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Could not verify booking.');
        setIsLoading(false);
      }
    };

    fetchOnce();

    return () => {
      cancelled = true;
    };
  }, [location]);

  // When we have a booking, load the property name for display
  useEffect(() => {
    const loadProperty = async () => {
      if (!booking?.property_id) return;
      try {
        const res = await fetch(apiUrl(`/api/properties/${booking.property_id}`));
        if (!res.ok) return;
        const prop = await res.json();
        if (prop && prop.name) setPropertyName(prop.name);
      } catch (_e) {
        // ignore – fallback to id shown if name not available
      }
    };
    loadProperty();
  }, [booking]);

  if (isLoading) {
    return <PaymentSuccessSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>Your booking is being finalized. This may take a moment.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {sessionId && (
            <div className="text-xs text-muted-foreground">
              <span className="opacity-70">Session:</span>{' '}
              <span className="font-mono break-all">{sessionId}</span>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Booking summary when available */}
          {booking && (
            <div className="text-left bg-muted/30 rounded-md p-4">
              <div className="font-medium mb-2">Booking Confirmed</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{propertyName ? `Property: ${propertyName}` : `Property ID: ${booking.property_id}`}</span>
                </div>
                <div>
                  <span className="opacity-70">Total:</span>{' '}
                  <span className="font-semibold">{booking.total_amount} {booking.currency}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-col gap-3">
            <Button asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" /> Go to Homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
