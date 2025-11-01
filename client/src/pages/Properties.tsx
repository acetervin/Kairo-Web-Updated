import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import PropertyCard from "@/components/PropertyCard";
import PropertySkeleton from "@/components/ui/PropertySkeleton";
import PropertiesSkeleton from "@/components/skeletons/PropertiesSkeleton";
import { propertyCategories } from "@/data/properties";
import type { Property } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";
import { getProperties } from "@/data/properties";

export default function Properties() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialCategory = urlParams.get('category') || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Additional filters
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [sortBy, setSortBy] = useState<string>('recommended');

  // Use React Query for better caching and performance
  const { data: allProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties', 'all'],
    queryFn: () => getProperties(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Filter properties by category
  const properties = useMemo(() => {
    if (selectedCategory === 'all') return allProperties;
    return allProperties.filter(p => p.category === selectedCategory);
  }, [allProperties, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Update URL without navigation
    const newUrl = category === 'all' ? '/properties' : `/properties?category=${category}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-20 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-space-grotesk text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Premium Properties
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From modern Nairobi apartments to coastal villas, discover luxury accommodations across Kenya
          </p>
        </div>

        {/* Property Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {propertyCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.icon && (
                <category.icon className="h-4 w-4 mr-2" />
              )}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border p-4 md:p-6 bg-card">
          <div className="md:col-span-4">
            <Label htmlFor="q" className="sr-only">Search</Label>
            <Input id="q" placeholder="Search by name or location" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {Array.from(new Set(properties.map(p => (p as any).location))).filter(Boolean).map((loc) => (
                  <SelectItem key={String(loc)} value={String(loc)}>{String(loc)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={String(guestCount)} onValueChange={(v) => setGuestCount(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Guests" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} guest{n>1?'s':''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-6 md:order-2 flex flex-col gap-2">
            <Label>Price per night</Label>
            <Slider value={priceRange as unknown as number[]} onValueChange={(v:any)=>setPriceRange(v as [number,number])} max={200000} step={1000} />
            <div className="text-xs text-muted-foreground">KES {priceRange[0].toLocaleString()} – KES {priceRange[1].toLocaleString()}</div>
          </div>
          <div className="md:col-span-3 md:order-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters summary */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">{properties.length} results</Badge>
          {query && <Badge variant="outline">Search: {query}</Badge>}
          {locationFilter !== 'all' && <Badge variant="outline">{locationFilter}</Badge>}
          {guestCount > 1 && <Badge variant="outline">{guestCount} guests</Badge>}
          {(priceRange[0] > 0 || priceRange[1] < 200000) && (
            <Badge variant="outline">KES {priceRange[0].toLocaleString()}–{priceRange[1].toLocaleString()}</Badge>
          )}
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <PropertiesSkeleton />
        ) : (() => {
          let list = [...properties];
          if (query) {
            const q = query.toLowerCase();
            list = list.filter(p => String((p as any).name).toLowerCase().includes(q) || String((p as any).location || '').toLowerCase().includes(q));
          }
          if (locationFilter !== 'all') {
            list = list.filter(p => String((p as any).location) === locationFilter);
          }
          if (guestCount > 1) {
            list = list.filter(p => {
              const cap = Number((p as any).max_guests || (p as any).maxGuests || 1);
              return cap >= guestCount;
            });
          }
          list = list.filter(p => {
            const price = Number((p as any).price_per_night || (p as any).pricePerNight || 0);
            return price >= priceRange[0] && price <= priceRange[1];
          });
          switch (sortBy) {
            case 'price-asc':
              list.sort((a,b)=> Number((a as any).price_per_night || 0) - Number((b as any).price_per_night || 0));
              break;
            case 'price-desc':
              list.sort((a,b)=> Number((b as any).price_per_night || 0) - Number((a as any).price_per_night || 0));
              break;
            case 'newest':
              list.sort((a,b)=> Number((b as any).id) - Number((a as any).id));
              break;
          }
          return list.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No properties match your filters.</p>
              <Button variant="outline" onClick={() => { setQuery(''); setLocationFilter('all'); setGuestCount(1); setPriceRange([0,200000]); setSortBy('recommended'); handleCategoryChange('all'); }}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}
