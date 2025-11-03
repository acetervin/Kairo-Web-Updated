import { useState } from 'react';
import { Link } from 'wouter';
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
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@boo-back/shared/schema';

export default function AdminProperties() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      // API returns { properties: [...] } so we need to extract the array
      return data.properties || data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete property');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProperties = properties?.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number): string => {
    return `KES ${Math.round(price).toLocaleString('en-KE')}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground mt-1">
              Manage your property listings
            </p>
          </div>
          <Link href="/admin/properties/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </Card>

        {/* Properties Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        <span className="text-muted-foreground">Loading properties...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProperties?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {searchQuery
                          ? 'No properties found matching your search'
                          : 'No properties yet. Add your first property!'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties?.map((property, index) => (
                    <tr
                      key={property.id}
                      className="group hover:bg-muted/50"
                    >
                      <TableCell>
                        <img
                          src={property.main_image_url || property.image_url}
                          alt={property.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {property.location || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(Number(property.price_per_night))}
                      </TableCell>
                      <TableCell>{property.max_guests}</TableCell>
                      <TableCell>
                        <Badge
                          variant={property.featured ? 'default' : 'secondary'}
                        >
                          {property.featured ? 'Featured' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/properties/${property.id}`} target="_blank">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/admin/properties/edit/${property.id}`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(property.id, property.name)
                                }
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
      </div>
    </AdminLayout>
  );
}

