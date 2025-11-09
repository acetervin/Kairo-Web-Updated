
import { useState } from 'react';
import { Button } from './ui/button';
import { apiUrl } from '@/utils/apiConfig';

interface StripeCheckoutButtonProps {
  bookingData: any;
  disabled?: boolean;
}

export function StripeCheckoutButton({ bookingData, disabled }: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const amount = bookingData?.pricing?.total ?? bookingData?.pricing?.totalPrice ?? bookingData?.amount;
      const currency = bookingData?.pricing?.currency ?? 'KES';

      const response = await fetch(apiUrl('/api/stripe/create-booking-checkout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          bookingData,
        }),
      });

      if (!response.ok) {
        // try to surface server error details
        let text = '';
        try { text = await response.text(); } catch (e) { /* ignore */ }
        console.error('Failed to create Stripe checkout session', response.status, text);
        alert('Failed to initiate payment. Please try again or contact support.');
        return;
      }

      const json = await response.json();
      const { url, bookingId, error } = json;
      if (error) {
        console.error('Server error creating checkout:', error);
        alert(error || 'Failed to create checkout session');
        return;
      }

      if (bookingId) localStorage.setItem('pending-booking-id', String(bookingId));
      if (url) {
        // redirect to Stripe-hosted Checkout
        window.location.href = url;
      } else {
        console.error('Unexpected response creating checkout session', json);
        alert('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      alert('Network error while initiating payment. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={disabled || loading}>
      {loading ? 'Processing…' : 'Pay with Card'}
    </Button>
  );
}
