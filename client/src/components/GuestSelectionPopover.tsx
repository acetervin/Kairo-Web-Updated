import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface GuestSelectionPopoverProps {
  adults: number;
  children: number;
  maxGuests: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
}

export default function GuestSelectionPopover({
  adults,
  children,
  maxGuests,
  onAdultsChange,
  onChildrenChange,
}: GuestSelectionPopoverProps) {
  const [open, setOpen] = useState(false);
  const totalGuests = adults + children;

  const handleAdultsChange = (increment: number) => {
    const newValue = adults + increment;
    if (newValue >= 1 && newValue + children <= maxGuests) {
      onAdultsChange(newValue);
    }
  };

  const handleChildrenChange = (increment: number) => {
    const newValue = children + increment;
    if (newValue >= 0 && adults + newValue <= maxGuests) {
      onChildrenChange(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Users className="mr-2 h-4 w-4" />
          {totalGuests} Guest{totalGuests !== 1 && "s"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Guests</h4>
            <p className="text-sm text-muted-foreground">
              Select the number of adults and children.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <p className="text-sm text-muted-foreground">Ages 13 or more</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleAdultsChange(-1)}
                  disabled={adults <= 1}
                >
                  -
                </Button>
                <Input
                  id="adults"
                  type="number"
                  className="w-16 text-center px-2"
                  value={adults}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleAdultsChange(1)}
                  disabled={totalGuests >= maxGuests}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="children">Children</Label>
                <p className="text-sm text-muted-foreground">Ages 2 - 12</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleChildrenChange(-1)}
                  disabled={children <= 0}
                >
                  -
                </Button>
                <Input
                  id="children"
                  type="number"
                  className="w-16 text-center px-2"
                  value={children}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleChildrenChange(1)}
                  disabled={totalGuests >= maxGuests}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={() => setOpen(false)} className="w-full">Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
