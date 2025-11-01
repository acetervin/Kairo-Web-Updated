
import { Home, Building2, Castle, MapPin, Palmtree, Waves } from "lucide-react";
import { Property } from '@shared/schema';

// Property categories with icons for navigation and filtering
export const propertyCategories = [
  { id: 'all', name: 'All Properties', icon: Home },
  { id: 'apartments', name: 'Apartments', icon: Building2 },
  { id: 'villas', name: 'Villas', icon: Castle },
  { id: 'houses', name: 'House Rentals', icon: Home },
  { id: 'nairobi', name: 'Nairobi', icon: MapPin },
  { id: 'diani', name: 'Diani Beach', icon: Palmtree },
  { id: 'kilifi', name: 'Kilifi Coast', icon: Waves },
];

export async function getProperties(category?: string, featured?: boolean): Promise<Property[]> {
  const res = await fetch('/api/properties');
  if (!res.ok) return [];
  const data = await res.json();
  let list: any[] = (data.properties || []).filter((p: any) => p.is_active);
  if (category) list = list.filter(p => p.category === category);
  if (featured) list = list.filter((p: any) => p.featured);
  return list as Property[];
}

export async function getProperty(id: number): Promise<Property | undefined> {
  const res = await fetch(`/api/properties/${id}`);
  if (!res.ok) return undefined;
  const property = await res.json();
  if (!property || property.is_active === false) return undefined;
  return property as Property;
}
