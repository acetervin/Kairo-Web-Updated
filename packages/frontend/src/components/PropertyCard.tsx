import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, MessageCircle } from "lucide-react";
import type { Property } from "@boo-back/shared/schema";
import { useTheme } from "@/hooks/use-theme";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { theme } = useTheme();
  
  // Format price in KES
  const formatPrice = (price: number): string => {
    return `KES ${Math.round(price).toLocaleString('en-KE')}`;
  };
  
  const handleWhatsAppClick = () => {
    const message = `Hi, I'm interested in ${property.name}`;
    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="bg-card rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden border-border hover:scale-[1.02] group">
      <div className="relative">
        <img 
          src={property.main_image_url || property.image_url} 
          alt={property.name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {property.featured && (
          <Badge variant="default" className="absolute top-4 right-4">
            Featured
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-space-grotesk text-xl font-semibold text-foreground leading-tight">
            {property.name}
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-4 flex items-center">
          <MapPin className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
          {property.location}
        </p>
        
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(Number(property.price_per_night))}
          </span>
          <span className="text-muted-foreground text-sm">per night</span>
        </div>

        <div className="flex items-center gap-4 mb-6 text-muted-foreground">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {property.max_guests} guests
          </span>
          <span className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {property.bedrooms} beds
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="default" asChild className="flex-1">
            <Link href={`/properties/${property.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" onClick={handleWhatsAppClick} className="flex-grow-0">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
