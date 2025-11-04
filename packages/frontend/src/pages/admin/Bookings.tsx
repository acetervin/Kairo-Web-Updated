import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  CreditCard,
  Users,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/utils/apiConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Booking {
  id: number;
  property_id: number;
  property_name: string;
  property_location: string;
  property_image_url: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_amount: string;
  currency: string;
  payment_method: string;
  payment_status: string;
  payment_intent_id?: string | null;
  status: string;
  guest_count: number;
  adults: number;
  children: number;
  created_at: string;
}

interface DateConflict {
  booking_id: number;
  guest_name: string;
  start_date: string;
  end_date: string;
}

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    payment_status: '',
    payment_intent_id: '',
  });
  const [dateConflicts, setDateConflicts] = useState<DateConflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/api/admin/bookings'), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(apiUrl(`/api/admin/bookings/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Handle conflict errors with specific messages
        if (response.status === 409) {
          // Update conflicts if provided in the error response
          if (responseData.conflicts && Array.isArray(responseData.conflicts)) {
            setDateConflicts(responseData.conflicts);
          }
          const error = new Error(responseData.error || 'Booking conflict detected');
          (error as any).conflicts = responseData.conflicts;
          throw error;
        }
        throw new Error(responseData.message || responseData.error || 'Failed to update booking');
      }
      
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setIsDialogOpen(false);
      setSelectedBooking(null);
      setDateConflicts([]);
      toast({
        title: 'Success',
        description: 'Booking updated successfully',
      });
    },
    onError: (error: any) => {
      // If conflicts are in the error, they're already set in the state
      toast({
        title: 'Error',
        description: error.message || 'Failed to update booking',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(apiUrl(`/api/admin/bookings/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    },
  });

  const handleUpdate = async (booking: Booking) => {
    setSelectedBooking(booking);
    setUpdateData({
      status: booking.status || '',
      payment_status: booking.payment_status || '',
      payment_intent_id: booking.payment_intent_id || '',
    });
    setIsDialogOpen(true);
    
    // Check for date conflicts when opening the dialog
    setIsCheckingConflicts(true);
    try {
      const response = await fetch(apiUrl(`/api/admin/bookings/${booking.id}/check-conflicts`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDateConflicts(data.conflicts || []);
      } else {
        setDateConflicts([]);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setDateConflicts([]);
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  const handleSaveUpdate = () => {
    if (!selectedBooking) return;
    
    // Validate payment_intent_id is provided when marking payment as completed
    if (updateData.payment_status === 'completed' && !updateData.payment_intent_id?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Payment Intent ID is required when marking payment as completed',
        variant: 'destructive',
      });
      return;
    }
    
    // Warn about cancelling a confirmed booking (will unblock dates)
    const wasConfirmed = selectedBooking.status === 'confirmed' && selectedBooking.payment_status === 'completed';
    const isCancelling = updateData.status === 'cancelled';
    
    if (isCancelling && wasConfirmed) {
      if (!confirm('Cancelling this confirmed booking will unblock the dates. Are you sure you want to proceed?')) {
        return;
      }
    }
    
    // Prevent update if there are date conflicts and trying to confirm
    if (dateConflicts.length > 0 && updateData.status === 'confirmed' && updateData.payment_status === 'completed') {
      toast({
        title: 'Cannot Update',
        description: 'Date conflicts detected. Please resolve conflicts before confirming this booking.',
        variant: 'destructive',
      });
      return;
    }
    
    updateMutation.mutate({
      id: selectedBooking.id,
      data: updateData,
    });
  };

  const handleDelete = (id: number, guestName: string) => {
    if (confirm(`Are you sure you want to cancel booking for "${guestName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: string, currency: string = 'KES'): string => {
    return `${currency} ${Math.round(parseFloat(price)).toLocaleString('en-KE')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Manage all property bookings and payments
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, email, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Bookings Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        <span className="text-muted-foreground">Loading bookings...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {searchQuery || statusFilter !== 'all'
                          ? 'No bookings found matching your filters'
                          : 'No bookings yet'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings?.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-muted/50">
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.guest_name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {booking.guest_email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {booking.guest_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.property_image_url && (
                            <img
                              src={booking.property_image_url}
                              alt={booking.property_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{booking.property_name}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {booking.property_location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(booking.check_in)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span>→</span>
                            {formatDate(booking.check_out)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.guest_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(booking.total_amount, booking.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getPaymentStatusBadgeVariant(booking.payment_status)}>
                            {booking.payment_status || 'pending'}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {booking.payment_method}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdate(booking)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View & Update
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(booking.id, booking.guest_name)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Booking Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setDateConflicts([]);
            setSelectedBooking(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Booking Details - #{selectedBooking?.id}</DialogTitle>
              <DialogDescription>
                View and update booking information
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6 py-4">
                {/* Guest Information */}
                <div>
                  <h3 className="font-semibold mb-3">Guest Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <div className="text-sm mt-1">{selectedBooking.guest_name}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="text-sm mt-1">{selectedBooking.guest_email}</div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="text-sm mt-1">{selectedBooking.guest_phone}</div>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div>
                  <h3 className="font-semibold mb-3">Property Information</h3>
                  <div>
                    <Label>Property</Label>
                    <div className="text-sm mt-1">{selectedBooking.property_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedBooking.property_location}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="font-semibold mb-3">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Check-in</Label>
                      <div className="text-sm mt-1">{formatDate(selectedBooking.check_in)}</div>
                    </div>
                    <div>
                      <Label>Check-out</Label>
                      <div className="text-sm mt-1">{formatDate(selectedBooking.check_out)}</div>
                    </div>
                    <div>
                      <Label>Total Guests</Label>
                      <div className="text-sm mt-1">
                        {selectedBooking.guest_count} ({selectedBooking.adults} adults, {selectedBooking.children} children)
                      </div>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <div className="text-sm mt-1 font-semibold">
                        {formatPrice(selectedBooking.total_amount, selectedBooking.currency)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Date Conflict Warning */}
                  <div className="mt-4 flex items-start justify-between gap-2">
                    {isCheckingConflicts ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        Checking for date conflicts...
                      </div>
                    ) : dateConflicts.length > 0 ? (
                      <Alert variant="destructive" className="flex-1">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Date Conflicts Detected</AlertTitle>
                        <AlertDescription className="mt-2">
                          <p className="font-semibold mb-2">These dates overlap with existing confirmed bookings:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {dateConflicts.map((conflict) => (
                              <li key={conflict.booking_id} className="text-sm">
                                Booking #{conflict.booking_id} for {conflict.guest_name} ({formatDate(conflict.start_date)} - {formatDate(conflict.end_date)})
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-sm font-semibold">
                            Cannot update booking and payment status to confirmed/completed while conflicts exist.
                          </p>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        No date conflicts detected
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!selectedBooking) return;
                        setIsCheckingConflicts(true);
                        try {
                          const response = await fetch(`/api/admin/bookings/${selectedBooking.id}/check-conflicts`, {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
                            },
                          });
                          if (response.ok) {
                            const data = await response.json();
                            setDateConflicts(data.conflicts || []);
                          } else {
                            setDateConflicts([]);
                          }
                        } catch (error) {
                          console.error('Error checking conflicts:', error);
                          setDateConflicts([]);
                        } finally {
                          setIsCheckingConflicts(false);
                        }
                      }}
                      disabled={isCheckingConflicts || !selectedBooking}
                      className="h-8"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isCheckingConflicts ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select
                        value={updateData.payment_status}
                        onValueChange={(value) =>
                          setUpdateData({ ...updateData, payment_status: value })
                        }
                      >
                        <SelectTrigger id="payment_status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Booking Status</Label>
                      <Select
                        value={updateData.status}
                        onValueChange={(value) =>
                          setUpdateData({ ...updateData, status: value })
                        }
                        disabled={dateConflicts.length > 0 && updateData.payment_status === 'completed'}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <div className="text-sm mt-1">{selectedBooking.payment_method}</div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="payment_intent_id">
                        Payment Intent ID
                        {updateData.payment_status === 'completed' && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id="payment_intent_id"
                        value={updateData.payment_intent_id}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, payment_intent_id: e.target.value })
                        }
                        placeholder="Enter payment intent ID (e.g., pi_1234567890)"
                        className={
                          updateData.payment_status === 'completed' && !updateData.payment_intent_id?.trim()
                            ? 'border-destructive'
                            : updateData.payment_intent_id && !updateData.payment_intent_id.startsWith('pi_') && !updateData.payment_intent_id.startsWith('pi_test_')
                            ? 'border-yellow-500'
                            : ''
                        }
                      />
                      {selectedBooking.payment_intent_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: {selectedBooking.payment_intent_id}
                        </p>
                      )}
                      {updateData.payment_intent_id && 
                       !updateData.payment_intent_id.startsWith('pi_') && 
                       !updateData.payment_intent_id.startsWith('pi_test_') && (
                        <p className="text-xs text-yellow-600 mt-1">
                          ⚠️ Stripe payment intent IDs typically start with "pi_"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveUpdate}>Save Changes</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

