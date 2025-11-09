import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, User, Mail, Phone, Hash } from 'lucide-react';

export default function BookingReceipt({ booking, propertyName }: { booking: any; propertyName: string }) {
  return (
    <div id="receipt" className="p-8 bg-white text-black">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Booking Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Property Details</h3>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5" />
                <span>{propertyName}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5" />
                <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5" />
                <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-5 w-5" />
                <span>Status: {booking.status} ({booking.payment_status})</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5" />
              <span>{booking.guest_name}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5" />
              <span>{booking.guest_email}</span>
            </div>
            {booking.guest_phone && (
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-5 w-5" />
                <span>{booking.guest_phone}</span>
              </div>
            )}
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
            <div className="flex justify-between items-center mb-2">
              <span>Total Amount:</span>
              <span className="font-bold">{booking.total_amount} {booking.currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Payment ID:</span>
              <span className="font-mono text-sm">{booking.payment_intent_id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
