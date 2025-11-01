
import { Button } from './ui/button';

interface StripeCheckoutButtonProps {
  bookingData: any;
  disabled?: boolean;
}

export function StripeCheckoutButton({ bookingData, disabled }: StripeCheckoutButtonProps) {
  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/stripe/create-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: bookingData.pricing.totalPrice, 
          currency: bookingData.pricing.currency, 
          bookingData 
        }),
      });

      if (response.ok) {
        const { url, bookingId } = await response.json();
        if (bookingId) localStorage.setItem('pending-booking-id', String(bookingId));
        window.location.href = url;
      } else {
        console.error('Failed to create Stripe checkout session');
      }
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
    }
  };

  return <Button onClick={handleCheckout} disabled={disabled}>Pay with Card</Button>;
}
