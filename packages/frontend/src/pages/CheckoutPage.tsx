import { useState, useEffect } from 'react';
import { useRoute, Link } from "wouter";
import { getProperty } from "@/data/properties";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  CreditCard, 
  Smartphone,
  Clock,
  Shield,
  CheckCircle
} from 'lucide-react';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@boo-back/shared/schema';
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton';
import CheckoutPageSkeleton from '@/components/skeletons/CheckoutPageSkeleton';

// Format price in KES
const formatPrice = (price: number): string => {
  return `KES ${Math.round(price).toLocaleString('en-KE')}`;
};

export default function CheckoutPage() {
  const [, params] = useRoute('/checkout/:id');
  const propertyId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  
  // Get booking details from URL params or localStorage
  const [bookingDetails] = useState(() => {
    const stored = localStorage.getItem('booking-details');
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedOption, setSelectedOption] = useState<'contact' | 'checkout'>('checkout');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const prop = getProperty(propertyId as number);
      setProperty(prop);
    } catch (e) {
      setError(e as Error);
    }
    setIsLoading(false);
  }, [propertyId]);

  useEffect(() => {
    if (!bookingDetails) {
      // Redirect back to booking page if no details
      window.location.href = propertyId ? `/booking/${propertyId}` : '/properties';
    }
  }, [bookingDetails, propertyId]);

  if (isLoading || !bookingDetails || !property) {
    return <CheckoutPageSkeleton />;
  }

  const checkIn = parseISO(bookingDetails.checkIn);
  const checkOut = parseISO(bookingDetails.checkOut);
  const nights = differenceInCalendarDays(checkOut, checkIn);
  const basePrice = Number(property.price_per_night);
  const subtotal = basePrice * nights;
  const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
  const total = subtotal + serviceFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactOwner = () => {
    const message = `Hi! I'd like to book ${property.name} from ${format(checkIn, 'MMM dd, yyyy')} to ${format(checkOut, 'MMM dd, yyyy')} for ${bookingDetails.guests} guests.

Guest Details:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- Phone: ${formData.phone}

Special Requests: ${formData.specialRequests || 'None'}

Please let me know availability and next steps. Thank you!`;

    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };



  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Booking</h1>
          <p className="text-muted-foreground">Choose how you'd like to proceed with your reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Booking Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Info */}
                <div>
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img 
                      src={property.main_image_url || property.image_url} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <p className="text-muted-foreground flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </p>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span className="font-medium">{format(checkIn, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span className="font-medium">{format(checkOut, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {bookingDetails.guests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nights:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{formatPrice(basePrice)} × {nights} nights</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Option Selection */}
            <Card>
              <CardHeader>
                <CardTitle>How would you like to proceed?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedOption} onValueChange={(value) => setSelectedOption(value as any)}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="checkout" id="checkout" />
                      <div className="flex-1">
                        <Label htmlFor="checkout" className="font-medium flex items-center cursor-pointer">
                          <CreditCard className="h-5 w-5 mr-2 text-primary" />
                          Secure Online Payment
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay securely online (Stripe Checkout) and get instant confirmation
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Secure
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Instant
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="contact" id="contact" />
                      <div className="flex-1">
                        <Label htmlFor="contact" className="font-medium flex items-center cursor-pointer">
                          <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                          Contact Property Owner
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Speak directly with the property owner via WhatsApp for flexible arrangements
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Direct Contact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Personal Service
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Please provide your contact details for the booking
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+254 700 000 000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or requirements..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your personal information is secured and will only be used for booking purposes. 
                We use industry-standard encryption to protect your data.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {selectedOption === 'contact' ? (
                <Button 
                  onClick={handleContactOwner}
                  size="lg" 
                  className="w-full sm:flex-1"
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contact Owner via WhatsApp
                </Button>
              ) : (
                <StripeCheckoutButton bookingData={{
                  ...formData,
                  bookingDetails,
                  property: {
                    id: property.id,
                    name: property.name,
                    pricePerNight: basePrice,
                  },
                  pricing: {
                    subtotal,
                    serviceFee,
                    totalPrice: total,
                    currency: 'KES',
                    nights,
                  }
                }} disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone} />
              )}
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                asChild
              >
                <Link href={`/booking/${propertyId}`}>
                  Back to Booking
                </Link>
              </Button>
            </div>

            {/* Additional Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <h4 className="font-medium">Free Cancellation</h4>
                    <p className="text-sm text-muted-foreground">Cancel up to 24 hours before check-in</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="h-8 w-8 text-blue-500 mb-2" />
                    <h4 className="font-medium">Secure Payments</h4>
                    <p className="text-sm text-muted-foreground">Your payment information is encrypted</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Phone className="h-8 w-8 text-purple-500 mb-2" />
                    <h4 className="font-medium">24/7 Support</h4>
                    <p className="text-sm text-muted-foreground">We're here to help anytime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
