import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from "wouter";
import { MessageCircle, Users, Bed } from 'lucide-react';

interface BookingFormProps {
  pricePerNight: number;
  propertyId: number;
  maxGuests: number;
  bedrooms: number;
}

export function BookingForm({
  pricePerNight,
  propertyId,
  maxGuests,
  bedrooms,
}: BookingFormProps) {
  const [, setLocation] = useLocation();

  // Format price in KES
  const formatPrice = (price: number): string => {
    return `KES ${Math.round(price).toLocaleString('en-KE')}`;
  };

  // TODO: Replace with actual WhatsApp number and property details in the message
  const whatsappUrl = `https://wa.me/254123456789?text=${encodeURIComponent(
    "I'm interested in booking a stay at your property."
  )}`;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>
          <span className="text-2xl font-bold">{formatPrice(pricePerNight)}</span>
          <span className="text-base font-normal text-muted-foreground"> / night</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-around items-center p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{maxGuests} guests</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bed className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{bedrooms} bedrooms</span>
            </div>
          </div>
          <Button onClick={() => setLocation(`/booking/${propertyId}`)} size="lg" className="w-full bg-primary hover:bg-primary/90">
            Proceed to Booking
          </Button>

          <div className="flex flex-col space-y-2 mt-4">
            <a
              href="tel:+254700000000"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              +254 700 000 000
            </a>
            <a
              href="mailto:info@kenyaluxuryvillas.com"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              info@kenyaluxuryvillas.com
            </a>
          </div>

          <div className="flex items-start space-x-2 text-sm text-muted-foreground mt-4">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              className="mt-0.5 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C6.64551 8.02928 6.75 8.16993 6.75 8.33333V10.0354C6.75 10.5171 6.4331 10.9403 5.97324 11.0783L2.87087 11.9687C2.11825 12.1823 1.58333 12.8785 1.58333 13.6667V14.125H13.4167V13.6667C13.4167 12.8785 12.8817 12.1823 12.1291 11.9687L9.02676 11.0783C8.5669 10.9403 8.25 10.5171 8.25 10.0354V8.33333C8.25 8.16993 8.35449 8.02928 8.50627 7.98351C10.0188 7.54738 11.125 6.15288 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875Z"
                fill="currentColor"
              />
            </svg>
            <p>Book with confidence. All payments are secured and your data is protected.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
