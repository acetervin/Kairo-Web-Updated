import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property } from '@boo-back/shared/schema';
import { apiUrl } from '@/utils/apiConfig';

export default function PropertyForm() {
  const [, params] = useRoute('/admin/properties/edit/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!params?.id;

  console.log('PropertyForm render - isEditMode:', isEditMode, 'params:', params);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    category: 'apartments',
    price_per_night: '',
    max_guests: '',
    bedrooms: '',
    bathrooms: '',
    image_url: '',
    map_url: '',
    amenities: [] as string[],
    featured: false,
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('exterior');

  // Fetch property data if editing
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['property', params?.id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`/api/properties/${params?.id}`));
      if (!response.ok) throw new Error('Failed to fetch property');
      return response.json();
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (!isEditMode || !params?.id) return;
    if (!property) {
      console.log('Waiting for property data to load...');
      return;
    }
    
    console.log('Loading property data:', property);
    const newFormData = {
      name: property.name || '',
      description: property.description || '',
      location: property.location || '',
      category: property.category || 'apartments',
      price_per_night: property.price_per_night?.toString() || '',
      max_guests: property.max_guests?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      image_url: (property.main_image_url || property.image_url) || '',
      map_url: property.map_url || '',
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      featured: property.featured || false,
    };
    console.log('Setting form data to:', newFormData);
    setFormData(newFormData);
  }, [property, isEditMode, params?.id]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditMode
        ? `/api/admin/properties/${params?.id}`
        : '/api/admin/properties';
      
      const token = localStorage.getItem('admin-token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const response = await fetch(apiUrl(url), {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `Failed to ${isEditMode ? 'update' : 'create'} property`;
        throw new Error(errorMessage);
      }
      
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: 'Success',
        description: `Property ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      setLocation('/admin/properties');
    },
    onError: (error: any) => {
      console.error('Property save error:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} property`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Property name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.location?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.description?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.image_url?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Main image URL is required',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate numeric fields
    const price = parseFloat(formData.price_per_night);
    const guests = parseInt(formData.max_guests);
    const bedroomsNum = parseInt(formData.bedrooms);
    const bathroomsNum = parseInt(formData.bathrooms);
    
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid price per night',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(guests) || guests <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid number of guests',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(bedroomsNum) || bedroomsNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid number of bedrooms',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(bathroomsNum) || bathroomsNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid number of bathrooms',
        variant: 'destructive',
      });
      return;
    }
    
    const dataToSend = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      category: formData.category,
      price_per_night: price,
      max_guests: guests,
      bedrooms: bedroomsNum,
      bathrooms: bathroomsNum,
      main_image_url: formData.image_url.trim(),
      map_url: formData.map_url?.trim() || null,
      amenities: formData.amenities.filter(a => a.trim()),
      featured: formData.featured || false,
    };

    console.log('Submitting property data:', dataToSend);
    saveMutation.mutate(dataToSend);
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  // Images (edit mode only)
  const { data: imagesData, refetch: refetchImages } = useQuery<{ images: any[] }>({
    queryKey: ['property-images', params?.id],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/admin/properties/${params?.id}/images`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin-token')}` },
      });
      if (!res.ok) throw new Error('Failed to load images');
      return res.json();
    },
    enabled: isEditMode,
  });

  const addImage = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`/api/admin/properties/${params?.id}/images`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('admin-token')}` },
        body: JSON.stringify({ url: newImageUrl.trim(), category: newImageCategory }),
      });
      if (!res.ok) throw new Error('Failed to add image');
      return res.json();
    },
    onSuccess: () => {
      setNewImageUrl('');
      refetchImages();
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: number) => {
      const res = await fetch(apiUrl(`/api/admin/properties/${params?.id}/images/${imageId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin-token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete image');
      return res.json();
    },
    onSuccess: () => refetchImages(),
  });

  console.log('isLoading:', isLoading, 'property:', property, 'formData.name:', formData.name);

  // Show loading spinner while fetching property data in edit mode
  if (isEditMode && (isLoading || !property)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground mt-4">Loading property...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/admin/properties')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Update property details' : 'Fill in the property information'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" key={property?.id || 'new'}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Luxury Villa in Karen"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartments">Apartments</SelectItem>
                      <SelectItem value="villas">Villas</SelectItem>
                      <SelectItem value="houses">Houses</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="cottage">Cottage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Karen, Nairobi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your property..."
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Night (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_night: e.target.value })
                    }
                    placeholder="e.g., 25000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Max Guests *</Label>
                  <Input
                    id="guests"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) =>
                      setFormData({ ...formData, max_guests: e.target.value })
                    }
                    placeholder="e.g., 6"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    placeholder="e.g., 3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    placeholder="e.g., 2"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Main Image URL *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="map_url">Google Maps Embed URL</Label>
                <Input
                  id="map_url"
                  value={formData.map_url}
                  onChange={(e) =>
                    setFormData({ ...formData, map_url: e.target.value })
                  }
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery Images</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add images organized by category (Exterior, Interior, Bathroom, Kitchen, Bedroom, etc.)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditMode && (
                <p className="text-sm text-muted-foreground">
                  Save the property first, then add gallery images.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image_url_input">Image URL</Label>
                  <Input
                    id="image_url_input"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={!isEditMode}
                    onKeyPress={(e) => e.key === 'Enter' && isEditMode && (e.preventDefault(), addImage.mutate())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_category">Category</Label>
                  <Select
                    value={newImageCategory}
                    onValueChange={setNewImageCategory}
                  >
                    <SelectTrigger id="image_category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exterior">Exterior</SelectItem>
                      <SelectItem value="interior">Interior</SelectItem>
                      <SelectItem value="bedroom">Bedroom</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="living_room">Living Room</SelectItem>
                      <SelectItem value="dining">Dining Area</SelectItem>
                      <SelectItem value="pool">Pool</SelectItem>
                      <SelectItem value="garden">Garden</SelectItem>
                      <SelectItem value="amenities">Amenities</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="button" onClick={() => addImage.mutate()} disabled={!isEditMode || !newImageUrl} variant="secondary" className="w-full">
                Add Image
              </Button>

              {/* Images by Category */}
              {isEditMode && imagesData?.images?.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium text-sm">Added Images ({imagesData.images.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagesData.images.map((image: any) => (
                      <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || image.category}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => deleteImage.mutate(image.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-2 bg-background border-t">
                          <span className="text-xs font-medium capitalize">
                            {(image.category || '').replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add amenity (e.g., Wi-Fi)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                />
                <Button type="button" onClick={handleAddAmenity} variant="secondary">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{amenity}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured Property</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this property in featured sections
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isEditMode ? 'Update Property' : 'Create Property'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setLocation('/admin/properties')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

