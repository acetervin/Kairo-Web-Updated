import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Users,
  Bed,
  Wifi,
  Car,
  Coffee,
  Waves,
  Play,
  Star,
  Heart,
  Share2,
  ImageIcon,
  Video,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import CompactGallery from "../components/CompactGallery";
import { BookingForm } from "@/components/BookingForm";
import type { Property } from "@shared/schema";
import { motion } from "framer-motion";
import { getProperty } from "@/data/properties";
import PropertyDetailSkeleton from "@/components/skeletons/PropertyDetailSkeleton";
// Remove leaflet/react-leaflet imports

// Icon mapping object
const iconMap: Record<string, any> = {
  "Wi-Fi": Wifi,
  Parking: Car,
  Kitchen: Coffee,
  Pool: Waves,
  "Beach Access": Waves,
  AC: undefined,
  Fireplace: undefined,
  Safari: undefined,
  "Mountain View": undefined,
  "City View": undefined,
  "Game View": undefined,
  Fishing: undefined,
  "Game Drives": undefined,
  "Boat Dock": undefined,
  "Gym Access": undefined,
  "24/7 Security": undefined,
  "Cultural Tours": undefined,
  Snorkeling: undefined,
  Garden: undefined,
  "All Meals": undefined,
  "Safari Guides": undefined,
  Hiking: undefined,
};

export default function PropertyDetail() {
  const [match, params] = useRoute("/properties/:id");
  const propertyId = params?.id ? parseInt(params.id) : null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

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

  // Sample video URLs - in real implementation these could come from property data or be configurable
  const propertyVideos = property
    ? [
        {
          id: 1,
          title: "Property Tour",
          thumbnail:
            property.main_image_url || property.image_url || "/placeholder.jpg",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video URLs
        },
        {
          id: 2,
          title: "Neighborhood Overview",
          thumbnail: property.image_url || "/placeholder.jpg",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video URLs
        },
      ]
    : [];

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Property not found
        </h1>
        <p className="text-muted-foreground">
          The property you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/properties">View All Properties</Link>
        </Button>
      </div>
    );
  }

  // Get all images for the enhanced gallery (only if property exists)
  const allImages = property
    ? (() => {
        const images = Array.isArray(property.categorized_images)
          ? property.categorized_images.flatMap((cat: any) => cat.images || [])
          : [];

        // Add main image if not in categorized images
        if (
          property.main_image_url &&
          !images.includes(property.main_image_url)
        ) {
          images.unshift(property.main_image_url);
        }
        return images;
      })()
    : [];

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    setShowVideoModal(true);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Simplified Hero Section - No Carousel */}
      <div className="relative h-[60vh] overflow-hidden bg-black">
        {/* Static Hero Image */}
        <div className="relative h-full">
        <motion.img
          src={property.main_image_url || property.image_url}
          alt={property.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Quick Actions Bar */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white text-gray-800 rounded-full h-10 w-10 backdrop-blur-sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white text-red-500 rounded-full h-10 w-10 backdrop-blur-sm"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Property Header Overlay - Reduced Font Sizes */}
        <div className="absolute bottom-0 left-0 right-0 pb-6 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {property.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-0 px-2.5 py-0.5 text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                <Badge className="bg-white/95 text-gray-900 border-0 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                  Premium
                </Badge>
                <Badge className="bg-primary/90 text-primary-foreground border-0 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                  {property.category}
                </Badge>
              </div>

              {/* Title - Reduced Size */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white tracking-tight drop-shadow-2xl">
                {property.name}
              </h1>

              {/* Property Stats - Reduced Size */}
              <div className="flex flex-wrap items-center gap-3 text-white/95 text-sm md:text-base">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{property.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5">
                  <Users className="h-4 w-4" />
                  <span>{property.max_guests} Guests</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 rounded-full px-4 py-1.5 font-semibold">
                  <span className="text-lg">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                    }).format(Number(property.price_per_night))}
                  </span>
                  <span className="text-xs opacity-90">/ night</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
            {/* Property Highlights - NEW */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Property Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Up to {property.max_guests} Guests</div>
                        <div className="text-sm text-muted-foreground">Perfect for families & groups</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bed className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{property.bedrooms} Spacious Bedrooms</div>
                        <div className="text-sm text-muted-foreground">Comfortable sleeping arrangements</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Prime Location</div>
                        <div className="text-sm text-muted-foreground">{property.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Premium Amenities</div>
                        <div className="text-sm text-muted-foreground">{property.amenities.length}+ luxury features</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Property Overview */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">📖</span>
                    About This Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    {property.description
                      .split("\n")
                      .map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-muted-foreground leading-relaxed text-base mb-4"
                        >
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>


            {/* Enhanced Media Section */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Gallery & Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="gallery" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="gallery"
                        className="flex items-center"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Photo Gallery
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Virtual Tours
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gallery" className="mt-6">
                      {/* Compact Gallery with Categories */}
                      <CompactGallery
                        categories={
                          (() => {
                            const cats = property.categorized_images;
                            if (!cats) return [];
                            
                            // If it's already an array with correct format
                            if (Array.isArray(cats) && cats.length > 0) {
                              // Validate structure
                              return cats.filter((cat: any) => 
                                cat && 
                                typeof cat === 'object' && 
                                cat.category && 
                                Array.isArray(cat.images) && 
                                cat.images.length > 0
                              );
                            }
                            
                            // If it's an object, convert to array
                            if (typeof cats === 'object' && !Array.isArray(cats)) {
                              return Object.entries(cats)
                                .filter(([_, images]) => Array.isArray(images) && images.length > 0)
                                .map(([category, images]) => ({
                                  category,
                                  images: images as string[]
                                }));
                            }
                            
                            return [];
                          })()
                        }
                      />
                    </TabsContent>

                    <TabsContent value="videos" className="mt-6">
                      {/* Video Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {propertyVideos.map((video) => (
                          <motion.div
                            key={video.id}
                            whileHover={{ scale: 1.05 }}
                            className="relative group cursor-pointer rounded-lg overflow-hidden"
                            onClick={() => openVideoModal(video.url)}
                          >
                            <div className="aspect-video relative">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform">
                                  <Play className="h-8 w-8 text-white fill-white" />
                                </div>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                              <h3 className="text-white font-semibold">
                                {video.title}
                              </h3>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Enhanced Image/Video Modal */}
                      {showVideoModal && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                          onClick={() => setShowVideoModal(false)}
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{
                              type: "spring",
                              damping: 25,
                              stiffness: 300,
                            }}
                            className="relative max-w-5xl w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {selectedVideoUrl ? (
                              // Video content
                              <div className="bg-black rounded-xl overflow-hidden">
                                <div className="aspect-video">
                                  <iframe
                                    src={selectedVideoUrl}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Property Video"
                                  />
                                </div>
                              </div>
                            ) : (
                              // Image content with navigation
                              <div className="relative">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                                  <motion.img
                                    key={activeImageIndex}
                                    src={allImages[activeImageIndex]}
                                    alt={`${property.name} view ${activeImageIndex + 1}`}
                                    className="w-full h-full object-contain"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>

                                {/* Navigation arrows */}
                                {allImages.length > 1 && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="lg"
                                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                                      onClick={() =>
                                        setActiveImageIndex(
                                          (prev) =>
                                            (prev - 1 + allImages.length) %
                                            allImages.length,
                                        )
                                      }
                                    >
                                      <ArrowLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="lg"
                                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                                      onClick={() =>
                                        setActiveImageIndex(
                                          (prev) =>
                                            (prev + 1) % allImages.length,
                                        )
                                      }
                                    >
                                      <ArrowRight className="h-6 w-6" />
                                    </Button>
                                  </>
                                )}

                                {/* Image counter */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
                                  <span className="text-white text-sm font-medium">
                                    {activeImageIndex + 1} / {allImages.length}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Close button */}
                            <Button
                              variant="ghost"
                              size="lg"
                              className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-full p-2"
                              onClick={() => setShowVideoModal(false)}
                            >
                              <X className="h-6 w-6" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Amenities */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">🌟</span>
                    Amenities & Features
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Everything you need for a great stay
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => {
                      const Icon = iconMap[amenity] || null;
                      return (
                        <motion.div
                          key={amenity}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                          className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 hover:from-primary/10 hover:to-primary/5 border border-transparent hover:border-primary/20 transition-all duration-300 cursor-default"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          {typeof Icon === "string" ? (
                              <span className="text-xl">{Icon}</span>
                          ) : Icon ? (
                              <Icon className="h-5 w-5 text-primary" />
                          ) : (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          </div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {amenity}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Guest Reviews - NEW */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    Guest Reviews
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      4.9 out of 5 (127 reviews)
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Sample Reviews */}
                    {[
                      {
                        name: "Sarah Johnson",
                        date: "October 2024",
                        rating: 5,
                        comment: "Absolutely stunning property! The views were breathtaking and the amenities exceeded our expectations. Perfect for a family getaway."
                      },
                      {
                        name: "Michael Chen",
                        date: "September 2024",
                        rating: 5,
                        comment: "Best vacation rental we've ever stayed at. The location is perfect, and the property is even more beautiful in person. Highly recommend!"
                      },
                      {
                        name: "Emma Williams",
                        date: "August 2024",
                        rating: 4,
                        comment: "Wonderful experience overall. The property was immaculate and well-maintained. Great communication from the host."
                      }
                    ].map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-border last:border-0 pb-6 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-foreground">{review.name}</div>
                            <div className="text-sm text-muted-foreground">{review.date}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">
                    View All Reviews
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Location & Nearby Attractions */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    Location & Nearby
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Map */}
                    <div className="flex flex-col gap-4">
                      {property.map_url ? (
                        <div className="rounded-2xl overflow-hidden h-80 w-full shadow-lg border-2 border-primary/10">
                          <iframe
                            src={property.map_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map for ${property.name}`}
                          ></iframe>
                        </div>
                      ) : (
                        <div className="flex items-center text-lg font-semibold p-6 bg-muted rounded-xl">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      {property.location}
                        </div>
                      )}
                    </div>

                    {/* Location Description */}
                    <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-xl border border-primary/10">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {property.location}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                      Experience the best of Kenya from this prime location.
                        Whether you're here for business or leisure, you'll find everything you need within reach.
                    </p>
                    </div>

                    {/* Nearby Attractions */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        What's Nearby
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: "Shopping Centers", distance: "2.5 km", icon: "🛍️" },
                          { name: "Restaurants & Cafes", distance: "1.2 km", icon: "🍽️" },
                          { name: "National Parks", distance: "15 km", icon: "🌲" },
                          { name: "Beach/Waterfront", distance: "5 km", icon: "🏖️" },
                          { name: "Airport", distance: "25 km", icon: "✈️" },
                          { name: "City Center", distance: "8 km", icon: "🏙️" },
                        ].map((attraction, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{attraction.icon}</span>
                              <span className="font-medium">{attraction.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{attraction.distance}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Booking Form Sidebar - Visible on all screens */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="sticky top-8"
            >
              <BookingForm
                pricePerNight={Number(property.price_per_night)}
                propertyId={property.id}
                maxGuests={property.max_guests}
                bedrooms={property.bedrooms}
              />
            </motion.div>
          </div>
        </div>
      </div>
      {/* Floating WhatsApp chat */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <a href={`https://wa.me/254700000000?text=I'm%20interested%20in%20${encodeURIComponent(property.name)}`} target="_blank"
          rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 p-4 rounded-full shadow-lg flex items-center justify-center animate-bounce">
          <svg viewBox="0 0 32 32" width={28} height={28} fill="white"><path d="M16 2.938c-7.2 0-13.063 5.863-13.063 13.063 0 2.36.645 4.664 1.868 6.68l-2.006 7.354a1 1 0 0 0 1.232 1.233l7.357-2.008A13 13 0 0 0 16 29.063c7.2 0 13.063-5.863 13.063-13.063S23.2 2.937 16 2.937zm0 2c6.106 0 11.063 4.957 11.063 11.063A11.07 11.07 0 0 1 16 27.063c-1.947 0-3.893-.496-5.584-1.439a1 1 0 0 0-.682-.093l-5.599 1.528 1.528-5.595a1 1 0 0 0-.092-.682A11.064 11.064 0 0 1 4.937 16C4.937 9.895 9.895 4.938 16 4.938zm-3.094 6.406c-.379 0-.865.276-1.09.848-.621 1.563-1.253 4.065.486 6.554 1.263 1.824 3.343 3.802 6.595 4.446 1.587.312 2.525.099 3.11-.304.38-.267.597-.732.463-1.104s-.58-.916-.905-1.249c-.214-.219-.568-.346-.83-.22l-1.153.554a.68.68 0 0 1-.687-.064c-.595-.42-2.392-2.032-2.834-2.699a.677.677 0 0 1-.064-.686l.552-1.152a.916.916 0 0 0-.217-.833c-.333-.326-.807-.775-1.246-.905a.991.991 0 0 0-.291-.045z"/></svg>
        </a>
      </div>
    </div>
  );
}