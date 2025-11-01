import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface BookingSummaryProps {
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalNights: number;
  onBook: () => void;
}

const BookingSummary = ({
  checkInDate,
  checkOutDate,
  guestCount,
  totalNights,
  onBook,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Check-in:</span>
          <span>{checkInDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Check-out:</span>
          <span>{checkOutDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Guests:</span>
          <span>{guestCount}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total Nights:</span>
          <span>{totalNights}</span>
        </div>
        <Button onClick={onBook} className="w-full">
          Book
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookingSummary;
