import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Bed, 
  Calendar as CalendarIcon, 
  Info, 
  MapPin,
  MessageCircle,
  CreditCard,
  Smartphone,
  Shield,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, differenceInCalendarDays, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import BookingPageSkeleton from "@/components/skeletons/BookingPageSkeleton";
import GuestSelectionPopover from "@/components/GuestSelectionPopover";
import type { Property } from "@boo-back/shared/schema";
import { getProperty } from "@/data/properties";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/utils/apiConfig";

let unavailableDatesStatic: Date[] = [];

// Format price in KES
const formatPrice = (price: number): string => {
  return `KES ${Math.round(price).toLocaleString('en-KE')}`;
};

export default function BookingPage() {
  const [, params] = useRoute("/booking/:id");
  const propertyId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();

  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: Dates, 2: Guest Info, 3: Payment

  // Date selection
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSelectionAvailable, setIsSelectionAvailable] = useState(true);
  const [externalBlockedDates, setExternalBlockedDates] = useState<Date[]>([]);

  // Guest information
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'contact' | 'online'>('online');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'stripe' | 'contact'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const prop = await getProperty(propertyId as number);
        setProperty(prop);
      } catch (e) {
        setError(e as Error);
      }
      setIsLoading(false);
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  // Load blocked dates from server for this property
  useEffect(() => {
    let mounted = true;
    async function loadBlocked() {
      if (!propertyId) return;
      try {
        const res = await fetch(apiUrl(`/api/properties/${propertyId}/blocked-dates`));
        if (!res.ok) return;
        const data = await res.json();
        const dates: Date[] = [];
        (data.blocked || []).forEach((b: any) => {
          const s = new Date(b.startDate);
          const e = new Date(b.endDate);
          // Treat endDate as checkout-day exclusive: block up to day before end
          const loopTo = new Date(e);
          loopTo.setDate(loopTo.getDate() - 1);
          for (let d = new Date(s); d <= loopTo; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
          }
        });
        if (mounted) setExternalBlockedDates(dates);
      } catch (err) {
        console.error('failed to load blocked dates', err);
      }
    }
    loadBlocked();
    return () => { mounted = false };
  }, [propertyId]);

  useEffect(() => {
    if (date?.from) {
      if (date.to) {
        let isUnavailable = false;
        // Treat checkout day as exclusive for availability checks
        const loopTo = new Date(date.to);
        loopTo.setDate(loopTo.getDate() - 1);
        const disabledSource = externalBlockedDates.length ? externalBlockedDates : unavailableDatesStatic;
        for (let d = new Date(date.from); d <= loopTo; d.setDate(d.getDate() + 1)) {
          // block past dates
          const today = new Date();
          today.setHours(0,0,0,0);
          if (d < today) {
            isUnavailable = true;
            break;
          }

          if (disabledSource.some((ud: Date) => isSameDay(ud, d))) {
            isUnavailable = true;
            break;
          }
        }
        setIsSelectionAvailable(!isUnavailable);
      } else {
        const disabledSource = externalBlockedDates.length ? externalBlockedDates : unavailableDatesStatic;
        const today = new Date();
        today.setHours(0,0,0,0);
        const isUnavailable = (date.from! < today) || disabledSource.some((ud: Date) => isSameDay(ud, date.from!));
        setIsSelectionAvailable(!isUnavailable);
      }
    } else {
      setIsSelectionAvailable(true);
    }
  }, [date]);

  if (isLoading) {
    return <BookingPageSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Property not found</h1>
        <p className="text-muted-foreground">
          {propertyId ? `Property ID ${propertyId} doesn't exist.` : "The property you're looking for doesn't exist."}
        </p>
        <Button asChild>
          <Link href="/properties">View All Properties</Link>
        </Button>
      </div>
    );
  }

  const totalNights = date?.from && date?.to ? differenceInCalendarDays(date.to, date.from) : 0;
  const basePrice = Number(property.price_per_night);
  const subtotal = basePrice * totalNights;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const canProceedToGuestInfo = date?.from && date?.to && isSelectionAvailable && totalNights > 0;
  const canProceedToPayment = canProceedToGuestInfo && formData.firstName && formData.lastName && formData.email && formData.phone;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactOwner = () => {
    if (!canProceedToPayment) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all required fields first.',
        variant: 'destructive'
      });
      return;
    }

    const message = `Hi! I'd like to book ${property.name} from ${format(date.from!, 'MMM dd, yyyy')} to ${format(date.to!, 'MMM dd, yyyy')} for ${adults + children} guests.

Guest Details:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- Phone: ${formData.phone}

Special Requests: ${formData.specialRequests || 'None'}

Please let me know availability and next steps. Thank you!`;

    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOnlinePayment = async () => {
    if (!canProceedToPayment) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all required fields first.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    const bookingData = {
      propertyId: propertyId,
      property,
      checkIn: date.from!.toISOString(),
      checkOut: date.to!.toISOString(),
      guests: adults + children,
      adults,
      children,
      totalNights,
      ...formData,
      pricing: {
        subtotal,
        serviceFee,
        total,
        currency: 'KES',
        nights: totalNights,
      }
    };

    try {
      if (selectedPaymentType === 'stripe') {
        const response = await fetch(apiUrl('/api/stripe/create-booking-checkout'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, currency: 'KES', bookingData }),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Checkout session request failed: ${response.status} ${text}`);
        }
        // Try to parse JSON; if server returned HTML (e.g. dev error page), show it
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text();
          // Check if we got HTML (likely due to misconfigured API URL or routing issue)
          if (contentType.includes('text/html')) {
            const apiBaseUrl = apiUrl('/');
            throw new Error(
              `API endpoint returned HTML instead of JSON. This usually means:\n` +
              `1. VITE_API_URL is not configured in your Vercel environment variables, OR\n` +
              `2. The API request is being routed incorrectly.\n` +
              `Current API base URL: ${apiBaseUrl || '(empty - using relative paths)'}\n` +
              `Please configure VITE_API_URL in Vercel project settings.`
            );
          }
          throw new Error(`Invalid response content-type: ${contentType}`);
        }
        const result = await response.json();
        if (result.url) {
          // store bookingId locally so we can show confirmation after return
          if (result.bookingId) localStorage.setItem('pending-booking-id', String(result.bookingId));
          window.location.href = result.url;
        } else {
          throw new Error(result.error || 'Failed to create checkout session');
        }
      } else {
        // contact owner path
        toast({ title: 'Contact Owner', description: 'Please contact the owner to complete booking.' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[300px]">
        <img 
          src={property.main_image_url || property.image_url} 
          alt={property.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              {property.name}
            </h1>
            <p className="text-white/90 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-2" />
              {property.location}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/properties/${propertyId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Property Details
              </Link>
            </Button>

            {/* Step 1: Date & Guest Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Select Dates & Guests</span>
                  <Badge variant={currentStep >= 1 ? "default" : "secondary"}>1</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dates">Select dates</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          id="dates" 
                          variant="outline" 
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick dates</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        {!isSelectionAvailable && (
                          <div className="p-4">
                            <Alert variant="destructive">
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                Some selected dates are unavailable. Please choose different dates.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-red-500 rounded-sm inline-block" />
                              <span className="text-sm text-muted-foreground">Booked / External</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-gray-300 rounded-sm inline-block" />
                              <span className="text-sm text-muted-foreground">Unavailable / Past</span>
                            </div>
                          </div>
                        </div>
                        <Calendar 
                          initialFocus 
                          mode="range" 
                          defaultMonth={date?.from} 
                          selected={date} 
                          onSelect={setDate} 
                          numberOfMonths={2} 
                          disabled={[(day: Date) => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            if (day < today) return true;
                            const disabledSource = externalBlockedDates.length ? externalBlockedDates : unavailableDatesStatic;
                            const isBlocked = disabledSource.some((ud: Date) => isSameDay(ud, day));
                            // Allow selecting a checkout day that coincides with a blocked night (start of next booking)
                            if (date?.from && !date?.to) {
                              const candidateCheckout = day;
                              if (isSameDay(candidateCheckout, addDays(date.from, 1))) {
                                return false;
                              }
                            }
                            return isBlocked;
                          }]}
                        />
                        <div className="flex justify-end gap-2 p-4 border-t border-border">
                          <Button variant="ghost" onClick={() => setDate(undefined)}>Reset</Button>
                          <Button onClick={() => setIsCalendarOpen(false)}>Done</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Guests</Label>
                    <GuestSelectionPopover
                      adults={adults}
                      children={children}
                      maxGuests={property.max_guests}
                      onAdultsChange={setAdults}
                      onChildrenChange={setChildren}
                    />
                  </div>
                </div>

                {canProceedToGuestInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-4"
                  >
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      className="w-full"
                      disabled={!isSelectionAvailable}
                    >
                      Continue to Guest Information
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Guest Information */}
            <AnimatePresence>
              {currentStep >= 2 && paymentMethod && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Guest Information</span>
                        <Badge variant={currentStep >= 2 ? "default" : "secondary"}>2</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Enter last name"
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
                          placeholder="Any special requests..."
                          rows={3}
                        />
                      </div>

                      {canProceedToPayment && paymentMethod && (
                        <Button 
                          onClick={() => setCurrentStep(3)} 
                          className="w-full"
                        >
                          Continue to Payment Options
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Payment Options */}
            <AnimatePresence>
              {currentStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Choose Payment Method</span>
                        <Badge variant={currentStep >= 3 ? "default" : "secondary"}>3</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value="online" id="online" />
                            <div className="flex-1">
                              <Label htmlFor="online" className="font-medium cursor-pointer">
                                Secure Online Payment
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Pay instantly with Stripe
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value="contact" id="contact" />
                            <div className="flex-1">
                              <Label htmlFor="contact" className="font-medium cursor-pointer">
                                Contact via WhatsApp
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Speak directly with property owner for flexible arrangements
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>

                      {paymentMethod === 'online' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-4"
                        >
                          <Label>Select Payment Type</Label>
                          <RadioGroup value={selectedPaymentType} onValueChange={(value) => setSelectedPaymentType(value as any)}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                <RadioGroupItem value="stripe" id="stripe" />
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <Label htmlFor="stripe" className="cursor-pointer">Stripe</Label>
                                <Badge variant="secondary" className="ml-auto">Online</Badge>
                              </div>
                              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                <RadioGroupItem value="contact" id="contact" />
                                <Smartphone className="h-5 w-5 text-green-600" />
                                <Label htmlFor="contact" className="cursor-pointer">Contact Owner</Label>
                                <Badge variant="secondary" className="ml-auto">Manual</Badge>
                              </div>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        {paymentMethod === 'contact' ? (
                          <Button 
                            onClick={handleContactOwner}
                            size="lg" 
                            className="w-full"
                            disabled={!canProceedToPayment}
                          >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Contact via WhatsApp
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleOnlinePayment}
                            size="lg" 
                            className="w-full"
                            disabled={!canProceedToPayment || isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                {selectedPaymentType === 'stripe' ? (
                                  <CreditCard className="mr-2 h-5 w-5" />
                                ) : (
                                  <Smartphone className="mr-2 h-5 w-5" />
                                )}
                                Pay {formatPrice(total)}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">{property.max_guests} guests max</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Bed className="h-4 w-4 text-primary" />
                  <span className="text-sm">{property.bedrooms} bedrooms</span>
                </div>

                <Separator />

                {date?.from && date?.to && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Check-in:</span>
                        <span>{format(date.from, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Check-out:</span>
                        <span>{format(date.to, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Guests:</span>
                        <span>{adults + children}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Nights:</span>
                        <span>{totalNights}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatPrice(basePrice)} × {totalNights} nights</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>{formatPrice(serviceFee)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </>
                )}

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Secure booking with free cancellation up to 24 hours before check-in.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}